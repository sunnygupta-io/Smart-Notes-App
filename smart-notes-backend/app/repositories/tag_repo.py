from sqlalchemy.orm import Session
from app.models.models import Tag, Note

class TagRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_tag_by_name(self, name: str )-> Tag | None:
        return self.db.query(Tag).filter(Tag.name == name).first()
    
    def get_tag_by_id(self, tag_id: int)-> Tag | None:
        return self.db.query(Tag).filter(Tag.id == tag_id).first()
    
    def get_all_tags(self)-> list[Tag]:
        return self.db.query(Tag).order_by(Tag.name).all()
    
    def create_tag(self, new_tag: Tag)-> Tag:
        self.db.add(new_tag)
        self.db.commit()
        self.db.refresh(new_tag)
        return new_tag
    
    def delete_tag(self, tag: Tag)-> None:
        self.db.delete(tag)
        self.db.commit()

    def get_user_notes_by_tag(self, tag_id: int, user_id: int)-> list[Note]:
        self.db.query(Note).filter(
            Note.owner_id == user_id, 
            Note.tags.any(Tag.id == tag_id)
            ).all()
        
    def save_changes(self)-> None:
        self.db.commit()



    