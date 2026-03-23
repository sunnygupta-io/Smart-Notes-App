import logging
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from app.core.config import settings


logger = logging.getLogger(__name__)

engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(
    autocommit = False,
    autoflush=False,
    bind=engine
)

class Base(DeclarativeBase):
    pass

def get_db():
   db = SessionLocal()
   try:
       yield db
   finally:
       db.close()


def test_connection():
    try: 
        with SessionLocal() as session:
            session.execute(text("SELECT 1"))
        logger.info("Databased connected Successfully")
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
        raise