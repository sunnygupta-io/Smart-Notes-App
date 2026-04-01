import logging
from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.schemas import UserLogin, UserRegister, UserResponse, MessageResponse, UserRole, Token, ChangePasswordRequest, RefreshTokenRequest
from app.models.models import User
from app.utils.auth import get_password_hash, verify_password,  get_current_user, verify_refresh_token, create_token_pair
import httpx
from app.core.config import settings
from fastapi.responses import RedirectResponse
from urllib.parse import urlencode
from app.services.user_service import UserService


logger = logging.getLogger(__name__)
router = APIRouter()


def get_user_service(db:Session  = Depends(get_db))-> UserService:
      return UserService(db)

# register user api
@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def registere_user(
     payload: UserRegister, 
         # db:Session= Depends(get_db), 
     service: UserService=Depends(get_user_service)):
    logger.info("Registration attempt for email: {payload.email}")
    # existing_user = db.query(User).filter(User.email == payload.email).first()
    # if existing_user: 
    #     raise HTTPException(
    #         status_code = status.HTTP_400_BAD_REQUEST,
    #         detail="Email already exists"
    #     )
    # admin_exists = db.query(User).filter(User.role =="admin").first()
    # assigned_role = UserRole.USER if admin_exists else "admin"
    # hashed = get_password_hash(payload.password)
    # new_user = User(
    #     email = payload.email,
    #     password_hash= hashed,
    #     role = assigned_role,
    #     is_active = True
    # )
    # db.add(new_user)
    # db.commit()
    # db.refresh(new_user)
    # logger.info(f"New user registered: id= {new_user.id} email= {new_user.email}")
    # return new_user

    return service.register_user(payload)


# login user api
@router.post("/login", response_model=MessageResponse, status_code=status.HTTP_200_OK)
def login_user(
     payload: UserLogin, 
     response: Response, 
         # db:Session= Depends(get_db), 
     service:UserService=Depends(get_user_service)):

    logger.info(f"Login attempt by {payload.email}")
    
    # user= db.query(User).filter(User.email == payload.email).first()
    # if not user or not verify_password(payload.password,user.password_hash):
    #     raise HTTPException(
    #         status_code=status.HTTP_401_UNAUTHORIZED,
    #         detail="Incorrect email or password",
    #         headers ={"WWW-Authenticate": "Bearer"}
    #     )
    
    # if not user.is_active:
    #     raise HTTPException(
    #         status_code=status.HTTP_403_FORBIDDEN,
    #         detail="Your account has been deactivated"
    #     )
    
    # token = create_token_pair(user,db)
    # response.set_cookie(key="access_token", value = token.access_token, httponly= True, secure=False, samesite="lax")
    # response.set_cookie(key="refresh_token", value = token.refresh_token, httponly= True, secure=False, samesite="lax")
    user, tokens = service.login_user(payload)
    response.set_cookie(key="access_token", value = tokens.access_token , httponly= True, secure=False, samesite="lax")
    response.set_cookie(key="refresh_token", value = tokens.refresh_token, httponly= True, secure=False, samesite="lax")
    logger.info(f"Login successful: id={user.id}")
    return MessageResponse(message="User login successfully")
    
        


# refresh token
@router.post("/refresh", response_model=MessageResponse)
def refresh_token(
      request: Request,
      response: Response,
          # db:Session= Depends(get_db), 
      service:UserService=Depends(get_user_service)
):
      refresh_token= request.cookies.get("refresh_token")
    #   if not refresh_token: 
    #         raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No refresh token found")
    #   users_with_tokens = db.query(User).filter(
    #         User.refresh_token !=None,
    #         User.is_active == True
    #   ).all()

    #   matched_user = None
    #   for user in users_with_tokens: 
    #         if verify_refresh_token(refresh_token, user.refresh_token):
    #               matched_user = user
    #               break
            
    #   if matched_user is None:
    #     raise HTTPException(
    #         status_code=status.HTTP_401_UNAUTHORIZED,
    #         detail="Invalid or expired refresh token — please log in again",
    #         headers={"WWW-Authenticate": "Bearer"},
    #     )
      
    #   tokens = create_token_pair(matched_user, db)
    #   response.set_cookie(key="access_token", value = tokens.access_token, httponly= True, secure=False, samesite="lax")
    #   response.set_cookie(key="refresh_token", value = tokens.refresh_token, httponly= True, secure=False, samesite="lax")
   
      tokens = service.refresh_token(refresh_token)  
      response.set_cookie(key="access_token", value = tokens.access_token, httponly= True, secure=False, samesite="lax")
      response.set_cookie(key="refresh_token", value = tokens.refresh_token, httponly= True, secure=False, samesite="lax")
      return MessageResponse(message="Tokens refreshed")      

# get me api
@router.get("/me", response_model=UserResponse)
def get_me(current_user: User= Depends(get_current_user)):
    return current_user



# update user password api
@router.put("/me/password", response_model=MessageResponse)
def change_password(payload: ChangePasswordRequest,    
                        # db:Session= Depends(get_db), 
                    service:UserService=Depends(get_user_service), 
                    current_user: User = Depends(get_current_user)):
#     if not current_user.password_hash:
#             raise HTTPException(
#             status_code=status.HTTP_400_BAD_REQUEST,
#             detail="This account uses Google login — no password to change",
#         )
#     if not verify_password(payload.current_password, current_user.password_hash):
#             raise HTTPException(
#             status_code=status.HTTP_400_BAD_REQUEST,
#             detail="Current password is incorrect",
#         )
#     if verify_password(payload.new_password, current_user.password_hash):
#          raise HTTPException(
#               status_code=status.HTTP_400_BAD_REQUEST,
#               detail="New Password must be different from current password"
#          )
#     current_user.password_hash = get_password_hash(payload.new_password)
#     current_user.refresh_token= None
#     db.commit()
    service.change_password(current_user, payload)
    return MessageResponse(message = "Password Changed Successfully")



# logout api
@router.post("/logout", response_model=MessageResponse)
def logout_user(
     response: Response,
     current_user: User  = Depends(get_current_user),
         # db:Session= Depends(get_db),  
     service: UserService=Depends(get_user_service)):
#      current_user.refresh_token = None
#      db.commit()
     service.logout_user(current_user)
     response.delete_cookie("access_token")
     response.delete_cookie("refresh_token")    
#      logger.info(f"User logged out: id={current_user.id}")
     return MessageResponse(message="Logged out successfully")


# google login api
@router.get("/google/login")
def google_login(
         # db:Session= Depends(get_db), 
     service: UserService=Depends(get_user_service)):
#      params = {
#           "client_id": settings.GOOGLE_CLIENT_ID,
#           "redirect_uri": settings.REDIRECT_URI,
#           "response_type": "code",
#           "scope": "openid email profile",
#           "access_type": "online"
#      }

    #  query_string = "&".join(f"{k}={v}" for k, v in params.items()) # not safe for space and i used best alternative for that which is urlencode
#      query_string = urlencode(params) # convert dict into url safe format best form to use
#      google_url = f"{settings.GOOGLE_AUTH_URL}?{query_string}"
     google_url = service.google_login_service()
     return RedirectResponse(url=google_url) #go to google login page


# google callback api
@router.get("/google/callback")
async def google_callback(
    code: str,
        # db:Session= Depends(get_db), 
    service: UserService=Depends(get_user_service) ):
     
#      async with httpx.AsyncClient(timeout=10.0) as client:
#           token_response = await client.post(
#                settings.GOOGLE_TOKEN_URL,
#                data = {
#                     "code": code,
#                     "client_id": settings.GOOGLE_CLIENT_ID,
#                     "client_secret": settings.GOOGLE_CLIENT_SECRET,
#                     "redirect_uri": settings.REDIRECT_URI,
#                     "grant_type": "authorization_code"
#                }
#           )

#      if token_response.status_code  != 200:
#                logger.error(f"Google token exchange failed: {token_response.text}")
#                raise HTTPException(status_code= status.HTTP_400_BAD_REQUEST, detail="Failed to exchange Google code for token")
         
#      google_tokens = token_response.json()
#      logger.info(google_tokens)
#      access_token = google_tokens.get("access_token")
#      logger.info(access_token)

#      if not access_token:
#                raise HTTPException(
#                     status_code=status.HTTP_400_BAD_REQUEST,
#                     detail="No access token receive from google"
#                )
          
#      async with httpx.AsyncClient() as client:
#                userinfo_response = await client.get(
#                     settings.GOOGLE_USERINFO_URL,
#                     headers = {"Authorization": f"Bearer {access_token}"}
#                )
#      if userinfo_response.status_code != 200:
#                 raise HTTPException(
#                         status_code=status.HTTP_400_BAD_REQUEST,
#                         detail="Failed to fetch user info from Google"
#                 )
                    
#      google_user =  userinfo_response.json()
#      logger.info(google_user)

#      email = google_user.get("email")
#      if not email: 
#            raise HTTPException(
#                  status_code=status.HTTP_400_BAD_REQUEST,
#                  detail= "Could not get email from google"
#            )
           
#      if not google_user.get("verified_email", False):
#            raise HTTPException(
#                  status_code=status.HTTP_400_BAD_REQUEST,
#                  detail= "Google email is not verified"
#            )
           
#      user = db.query(User).filter(User.email == email).first()

#      if user is None: 
#            user = User(
#                  email = email,
#                  password_hash = None,
#                  role = UserRole.USER,
#                  is_active= True
#            )
#            db.add(user)
#            db.commit()
#            db.refresh(user)
#            logger.info(f"New user via Google Oauth: id={user.id} email={email}")
#      else: 
#            if not user.is_active: 
#                  raise HTTPException(
#                        status_code=status.HTTP_403_FORBIDDEN,
#                        detail="Your account has been deactivated"
#                  )
#            logger.info(f"Existing user via Google oauth: id={user.id}")
#      tokens =create_token_pair(user,db)
#      frontend_url = "http://localhost:5173/auth/google/callback" 
#      response = RedirectResponse(url=frontend_url)
#      response.set_cookie(key="access_token", value = tokens.access_token, httponly= True, secure=False, samesite="lax")
#      response.set_cookie(key="refresh_token", value = tokens.refresh_token, httponly= True, secure=False, samesite="lax")
#      return response

    frontend_url, tokens = await service.process_google_callback(code)
    response = RedirectResponse(url=frontend_url)
    response.set_cookie(key="access_token", value=tokens.access_token, httponly=True, secure=False, samesite="lax")
    response.set_cookie(key="refresh_token", value=tokens.refresh_token, httponly=True, secure=False, samesite="lax")
    
    return response