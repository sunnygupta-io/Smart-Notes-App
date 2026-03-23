from pydantic_settings import BaseSettings

class Settings(BaseSettings):
  DATABASE_URL : str 
  SECRET_KEY: str
  ALGORITHM: str = "HS256" 
  ACCESS_TOKEN_EXPIRE_MINUTES: int = 20
  GOOGLE_CLIENT_ID: str = ""
  GOOGLE_CLIENT_SECRET: str = ""
  GOOGLE_AUTH_URL: str = ""
  GOOGLE_TOKEN_URL: str = ""
  GOOGLE_USERINFO_URL: str = ""
  REDIRECT_URI: str = ""
  REFRESH_TOKEN_EXPIRE_DAYS: int = 7


  

  class Config: 
    env_file = ".env"

settings = Settings()