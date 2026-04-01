from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.repositories.tag_repo import TagRepository
from app.schemas.schemas import TagCreate, TagResponse, NoteResponse
from app.models.models import User, Tag, Note
from app.utils.helper import require_owner, get_note_or_404
import logging

logger = logging.getLogger(__name__)

class TagService:
    def __init__(self, db:Session):
        self.repo = TagRepository(db)
        self.db = db


    
    def create_tag_service(
            self,
            payload: TagCreate
    )-> TagResponse:
        existing = self.repo.get_tag_by_name(payload.name)
        if existing: 
            logger.info(f"Tag already exists: '{payload.name}'  id={existing.id}")
            return existing
        new_tag = Tag(
            name = payload.name
        )
        created_tag = self.repo.create_tag(new_tag)
        logger.info(f"Tag created: '{created_tag.name}'  id={new_tag.id}")
        return created_tag
    

    def list_tags_service(self)->list[TagResponse]:
        tags = self.repo.get_all_tags()
        return tags
            
    
    def get_tag_service(self, tag_id: int)-> TagResponse:
        tag = self.repo.get_tag_by_id(tag_id)
        if not tag:
            raise HTTPException(
                status_code= status.HTTP_404_NOT_FOUND,
                detail= f"Tag {tag_id} not found"
            )
        return tag
    

    def delete_tag(self, tag_id: int, current_user: User)-> Tag:
        tag = self.repo.get_tag_by_id(tag_id)
        if not tag:
            raise HTTPException(
            status_code= status.HTTP_404_NOT_FOUND,
            detail= f"Tag {tag_id} not found"
            )
        self.repo.delete_tag(tag)
        logger.info(f"Tag deleted: id={tag_id} by user_id={current_user.id}")
        return tag
    

    def add_tag_to_note_service(
            self, 
            note_id: int,
            tag_id: int,
            current_user: User
    )-> NoteResponse:
         note = get_note_or_404(note_id, self.db)
         require_owner(note, current_user) # only note owner can add tag to note
         tag= self.repo.get_tag_by_id(tag_id)
         if tag in note.tags:
            logger.info(f"Tag {tag_id} already on note {note_id}")
            return note
         
         note.tags.append(tag)
         self.repo.save_changes()
         self.db.refresh(note)
         logger.info(f"Tag '{tag.name}' added to note {note_id}")
         return note
    
    def remove_tag_from_note_service(
            self,
            note_id: int,
            tag_id: int,
            current_user: User
    )-> NoteResponse:
     note = get_note_or_404(note_id, self.db)
     require_owner(note, current_user) 
     tag= self.repo.get_tag_by_id(tag_id)
     if tag not in note.tags:
          raise HTTPException(
               status_code=status.HTTP_404_NOT_FOUND,
               detail=f"Tag '{tag.name}' is not on this note"
          )
     note.tags.remove(tag)
     self.repo.save_changes()
     self.db.refresh(note)
     logger.info(f"Tag '{tag.name}' removed from note {note_id}")
     return note
    

    def get_notes_by_tag(
            self,
            tag_id: int,
            current_user: User
    )-> list[NoteResponse]:
        tag= self.repo.get_tag_by_id(tag_id)
        user_notes=[
          note for note in tag.notes
          if note.owner_id == current_user.id
         ]
        logger.info(f"Notes with tag '{tag.name}': "
                  f"{len(user_notes)} found for user_id:{current_user.id}")
        return user_notes
        
      
    



            
