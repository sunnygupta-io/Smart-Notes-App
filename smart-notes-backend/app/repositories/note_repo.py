from  sqlalchemy.orm import Session
from app.models.models import Note, Tag, User
from typing import Optional
from sqlalchemy import or_
from fastapi import Query

class NoteRepository:
    def __init__(self, db:Session):
        self.db=db
    
    def create_note(self, new_note: Note)-> Note:
        self.db.add(new_note)
        self.db.commit()
        self.db.refresh(new_note)
        return new_note
    
    def get_note(self, note_id: int)->Note:
        return self.db.query(Note).filter(Note.id == note_id).first()  

    def get_tags(self, tag_ids: list[int])-> list[int]:
        return self.db.query(Tag).filter(Tag.id.in_(tag_ids)).all()    

    def save_changes(self)->None:
        self.db.commit()
    
    def get_notes_query(self, current_user: User):
        return self.db.query(Note).filter(Note.owner_id == current_user.id)

    def filter_archived(self, query, archived: Optional[bool]):
        if archived is not None:
            query = query.filter(Note.is_archived == archived)
        return query

    def order_notes(self, query):
        return query.order_by(Note.created_at.desc())

    def paginate(self, query, page: int, page_size: int):
        offset = (page - 1) * page_size
        return query.offset(offset).limit(page_size)

    def get_all(self, query):
        return query.all()
    
    def filter_by_search_term(self, query: Query, search_term: str)-> Query:
        formatted_term =f"%{search_term.strip()}%"
        return query.filter(
            or_(
                Note.title.ilike(formatted_term),
                Note.content.ilike(formatted_term)
            )
        )
    
    def filter_by_tag(self, query: Query, tag_id: int)-> Query:
        return query.filter(Note.tags.any(Tag.id == tag_id))
    
    def filter_by_date(self, query: Query, date_from: None, date_to: None)-> Query:
        if date_from:
            query = query.filter(Note.created_at >= date_from)
        if date_to:
            query = query.filter(Note.created_at <=date_to)
        return query
    
    def get_count(self, query: Query)-> int:
        return query.count()
