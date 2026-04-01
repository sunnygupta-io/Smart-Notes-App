import logging 
from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer
from jose import jwt, JWTError
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from app.core.config import settings
from app.db.database import get_db
from app.models.models import User
from app.schemas.schemas import TokenData, Token
import secrets

logger = logging.getLogger(__name__)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated= "auto") # If old/weak algorithm is used → automatically mark it outdated

def get_password_hash(password:str)-> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str)-> bool:
    return pwd_context.verify(plain_password, hashed_password)


def generate_refresh_token()-> str:
     return secrets.token_urlsafe(32)

def hash_refresh_token(token: str)-> str:
     return pwd_context.hash(token)


def verify_refresh_token(plain_token: str, hashed_token: str )-> bool:
     return pwd_context.verify(plain_token, hashed_token)

def create_token_pair(user: User, db: Session)-> Token:
     access_token = create_access_token(data={"sub": str(user.id)})
     plain_refresh_token = generate_refresh_token()
     user.refresh_token = hash_refresh_token(plain_refresh_token)
     db.commit()

     return Token(
          access_token=access_token,
          refresh_token=plain_refresh_token
     )

def create_access_token(data: dict)-> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt =jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str)-> Optional[TokenData]:
        try:
             payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
             user_id: int  =payload.get("sub")
             if user_id is None:
                  return None
             return TokenData(user_id = int(user_id))
        except JWTError:
             return None

bearer_scheme = HTTPBearer(auto_error=False)
        
def get_current_user( request: Request, db: Session = Depends(get_db)):
     credentials_exception = HTTPException(
          status_code=status.HTTP_401_UNAUTHORIZED,
          detail= "Could not validate credentials",
          headers={"WWW-Authenticate": "Bearer"}
     )
     
     token = request.cookies.get("access_token")
     if not token:
          raise credentials_exception
     
     token_data = decode_access_token(token)
     if token_data is None:
          raise credentials_exception
     
     user = db.query(User).filter(User.id == token_data.user_id).first()
     if user is None:
          raise credentials_exception
     if not user.is_active:
          raise HTTPException(
               status_code=status.HTTP_403_FORBIDDEN,
               detail="Your Account has been deactivated"
          )
     return user

def get_current_admin(current_user:User= Depends(get_current_user)):
     if current_user.role != "admin":
          raise HTTPException(
               status_code=status.HTTP_401_UNAUTHORIZED,
               detail="Admin access required"
          )
     return current_user

