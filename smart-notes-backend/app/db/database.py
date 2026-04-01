import logging
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from app.core.config import settings


logger = logging.getLogger(__name__)

engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True # check connection before using it
)

# temperory connection to database
SessionLocal = sessionmaker(
    autocommit = False, # manully save change
    autoflush=False, # changes won't auto send to DB
    bind=engine 
)

# used to create database tables
class Base(DeclarativeBase):
    pass

def get_db():
   db = SessionLocal() # create db session
   try:
       yield db # give it to api 
   finally:
       db.close() # when api finishes close the connection


# check if db is working or not
def test_connection():
    try: 
        with SessionLocal() as session:
            session.execute(text("SELECT 1"))
        logger.info("Databased connected Successfully")
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
        raise

