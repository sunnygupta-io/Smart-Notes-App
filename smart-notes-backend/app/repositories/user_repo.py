from sqlalchemy.orm import Session
from app.models.models import User, Note, Tag
from sqlalchemy import or_
from fastapi import Query

class UserRepository:
    def __init__(self, db: Session):
        self.db = db
    

    def get_user_by_email(self, email:str)-> User | None:
        return self.db.query(User).filter(User.email == email).first()
    

    def check_admin_exist(self)-> bool:
        admin = self.db.query(User).filter(User.role == "admin").first()
        return admin is not None
    
    def create_user(self, new_user: User)->User:
        self.db.add(new_user)
        self.db.commit()
        self.db.refresh(new_user)
        return new_user
    
    def get_users_with_refresh_tokens(self)-> list[User]:
        return self.db.query(User).filter(
            User.refresh_token != None,
            User.is_active == True
        ).all()
    
    def save_changes(self)-> None:
        self.db.commit()


