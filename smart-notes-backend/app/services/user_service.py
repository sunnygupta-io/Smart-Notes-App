from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.repositories.user_repo import UserRepository
from app.schemas.schemas import UserLogin,RefreshTokenRequest, UserRegister, UserRole, ChangePasswordRequest
from app.models.models import User
from app.utils.auth import get_password_hash, create_token_pair, verify_password, verify_refresh_token
from app.core.config import settings
import httpx
from urllib.parse import urlencode
import logging 


logger = logging.getLogger(__name__)

class UserService:
    def __init__(self, db:Session):
        self.repo = UserRepository(db)
        self.db = db
    
    def register_user(self, payload:UserRegister)-> User:
        if self.repo.get_user_by_email(payload.email):
            logger.warning(f"Registration failed email already exists - {payload.email}")
            raise HTTPException(
            status_code = status.HTTP_400_BAD_REQUEST,
            detail="Email already exists"
            )
        
        admin_exists = self.repo.check_admin_exist()
        assigned_role = UserRole.USER if admin_exists else UserRole.ADMIN

        hashed_password = get_password_hash(payload.password)
        new_user = User(
            email= payload.email,
            password_hash = hashed_password,
            role = assigned_role.value,
            is_active = True
        )
        created_user = self.repo.create_user(new_user)
        logger.info(f"New user registered: id={created_user.id} email={created_user.email}")
        return created_user
    
    def login_user(self, payload: UserLogin)-> tuple[User, dict]:
            user= self.repo.get_user_by_email(payload.email)
            if not user or not user.password_hash or not verify_password(payload.password,user.password_hash):
                raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers ={"WWW-Authenticate": "Bearer"}
                )
    
            if not user.is_active:
                raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your account has been deactivated"
                )
            
            tokens = create_token_pair(user, self.db)
            # logger.info(f"Login successful: id={user.id}")
            return user,tokens
    
    def refresh_token(self, refresh_token: RefreshTokenRequest)-> dict:
      if not refresh_token: 
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No refresh token found")
      users_with_tokens = self.repo.get_users_with_refresh_tokens()

      matched_user = None
      for user in users_with_tokens: 
            if verify_refresh_token(refresh_token, user.refresh_token):
                  matched_user = user
                  break
            
      if matched_user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token — please log in again",
            headers={"WWW-Authenticate": "Bearer"},
        )
      
      tokens = create_token_pair(matched_user, self.db)
      logger.info(f"Tokens refreshed: user_id={matched_user.id}")
      return tokens
    

    def change_password(self,current_user: User, payload: ChangePasswordRequest)-> None:
        if not current_user.password_hash:
            raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This account uses Google login — no password to change",
        )
        if not verify_password(payload.current_password, current_user.password_hash):
                raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is incorrect",
            )
        if verify_password(payload.new_password, current_user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="New Password must be different from current password"
            )
        current_user.password_hash = get_password_hash(payload.new_password)
        current_user.refresh_token= None

        self.repo.save_changes()
        logger.info(f"Password changed: user_id={current_user.id}")
    
    def logout_user(self, current_user: User)-> None:
          current_user.refresh_token = None
          self.repo.save_changes()
          logger.info(f"User logged out: id={current_user.id}")

    
    def google_login_service(self)-> str:
        params = {
          "client_id": settings.GOOGLE_CLIENT_ID,
          "redirect_uri": settings.REDIRECT_URI,
          "response_type": "code",
          "scope": "openid email profile",
          "access_type": "online"
               }
        query_string = urlencode(params) # convert dict into url safe format best form to use
        return f"{settings.GOOGLE_AUTH_URL}?{query_string}"
    
    async def process_google_callback(self, code: str) -> tuple[str, dict]:
        
        # Exchange the code for a Google access token
        async with httpx.AsyncClient(timeout=10.0) as client:
            token_response = await client.post(
                settings.GOOGLE_TOKEN_URL,
                data={
                    "code": code,
                    "client_id": settings.GOOGLE_CLIENT_ID,
                    "client_secret": settings.GOOGLE_CLIENT_SECRET,
                    "redirect_uri": settings.REDIRECT_URI,
                    "grant_type": "authorization_code"
                }
            )

        if token_response.status_code != 200:
            logger.error(f"Google token exchange failed: {token_response.text}")
            raise HTTPException(status_code=400, detail="Failed to exchange Google code for token")
            
        access_token = token_response.json().get("access_token")
        if not access_token:
            raise HTTPException(status_code=400, detail="No access token received from Google")
            
        # Fetch the user's profile info from Google
        async with httpx.AsyncClient() as client:
            userinfo_response = await client.get(
                settings.GOOGLE_USERINFO_URL,
                headers={"Authorization": f"Bearer {access_token}"}
            )
            
        if userinfo_response.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to fetch user info from Google")
            
        google_user = userinfo_response.json()
        email = google_user.get("email")
        
        if not email: 
            raise HTTPException(status_code=400, detail="Could not get email from Google")
        if not google_user.get("verified_email", False):
            raise HTTPException(status_code=400, detail="Google email is not verified")
            
        user = self.repo.get_user_by_email(email)

        if user is None: 
            new_user = User(
                email=email,
                password_hash=None, 
                role=UserRole.USER,
                is_active=True
            )
            user = self.repo.create_user(new_user)
            logger.info(f"New user via Google Oauth: id={user.id} email={email}")
        else: 
            if not user.is_active: 
                raise HTTPException(status_code=403, detail="Your account has been deactivated")
            logger.info(f"Existing user via Google oauth: id={user.id}")

        tokens = create_token_pair(user, self.db)
        
        # Return the frontend URL and the tokens
        frontend_url = "http://localhost:5173/auth/google/callback" 
        return frontend_url, tokens
    
