from fastapi import HTTPException, status
from typing import Optional
from sqlalchemy.orm import Session
from app.repositories.note_repo import NoteRepository
from app.schemas.schemas import NoteCreate, NoteResponse, NoteSearchResponse, NoteUpdate
from app.models.models import Note, User, Tag
from app.utils.helper import require_owner
from app.services.notification_service import notify_shared_users
from datetime import datetime
import logging


logger = logging.getLogger(__name__)

class NoteService: 
    def __init__(self, db:Session):
        self.repo= NoteRepository(db)
        self.db  = db
    

    def create_note_service(self, payload: NoteCreate, current_user: User)-> Note:
        logger.info(f"Create Note for user_id={current_user.id}")
        new_note = Note(
        title = payload.title,
        content = payload.content,
        owner_id = current_user.id,
        is_archived = False
       )
       
        if payload.tag_ids:
            tags = self.repo.get_tags(payload.tag_ids)
            if len(tags) != len(payload.tag_ids):
                found_ids = {t.id for t in tags}
                missing= set(payload.tag_ids) - found_ids
                logger.warning(f"Tag IDs not found: {missing}")
            
            new_note.tags = tags   

        created_note = self.repo.create_note(new_note)
        logger.info(f"Note created: id={created_note.id}")
        return created_note


    def list_notes_service(
        self,
        page: int,
        page_size: int,
        archived: Optional[bool],
        current_user: User
       ) -> list[NoteResponse]:

        query = self.repo.get_notes_query(current_user)
        query = self.repo.filter_archived(query, archived)
        query = self.repo.order_notes(query)
        query = self.repo.paginate(query, page, page_size)
        notes = self.repo.get_all(query)

        logger.info(
            f"Listed notes: user_id={current_user.id} "
            f"page={page} count={len(notes)}"
        )

        return notes
    
    def search_note_service(self,
                            q: Optional[str],
                            tag_id: Optional[int],
                            is_archived: Optional[bool],
                            date_from: Optional[datetime],
                            date_to: Optional[datetime],
                            page: int,
                            page_size: int,
                            current_user: User
                            )->NoteSearchResponse:
        query = self.repo.get_notes_query(current_user)
        if q and q.strip():
            query = self.repo.filter_by_search_term(query, q)
            logger.info(f"Search keyword: '{q}'")

        if tag_id:
            query= self.repo.filter_by_tag(query, tag_id)
            logger.info(f"Filter by Tag ID: {tag_id}")

        if is_archived is not None:
            query = self.repo.filter_archived(query, is_archived)
            logger.info(f"Filter by Archived: {is_archived}")

        if date_to or date_from:
            query = self.repo.filter_by_date(query, date_from, date_to)
            logger.info(f"Filter by Date_from: {date_from}")     
            logger.info(f"Filter by Date_to: {date_to}")

        total = self.repo.get_count(query)

        query = self.repo.order_notes(query)
        query= self.repo.paginate(query, page , page_size)
        notes = self.repo.get_all(query)
        total_pages = (total + page_size -1)// page_size if total> 0 else 0
        logger.info(
            f"Search result: user_id={current_user.id} "
            f"total={total} page={page}/{total_pages}"
        )
        return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
        "items": notes
        }
    

    def get_note_service(self, note_id: int, current_user: User)-> NoteResponse:
        note = self.repo.get_note(note_id)
        if not note:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Note not found"
            )
        is_owner = (note.owner_id == current_user.id)
        is_shared = any(
            s.shared_with_user_id == current_user.id
            for s in note.shares
        )
        if not is_owner and not is_shared:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have access to this note"
            )
        return note
    

    def update_note_service(self, note_id: int, payload:NoteUpdate, current_user:  User)-> NoteResponse:
        note = self.repo.get_note(note_id)
        if not note:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Note not found"
            )
        is_owner= (note.owner_id == current_user.id)
        has_edit_permission = any(
            s.shared_with_user_id == current_user.id and s.permission == "edit"
            for s in note.shares
        )

        if not is_owner and not has_edit_permission:
            raise HTTPException(
                status_code = status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to edit this note"
            )
        
        if payload.title is not None:
            note.title = payload.title

        if payload.content is not None:
            note.content = payload.content
        
        if payload.tag_ids is not None:
            tags = self.repo.get_tags(payload.tag_ids)
            note.tags = tags

        self.repo.save_changes()
        self.db.refresh(note)
        logger.info(f"Note updated: id={note.id} by user_id={current_user.id}")
        try:
            notify_shared_users(note, current_user, self.db)
        except Exception as e:
            logger.error(f"Failed to send edit notification: {e}")
        
        return note
    
    def toggle_archive(self, note_id: int, current_user: User)-> NoteResponse:
        note = self.repo.get_note(note_id)
        if not note:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Note not found"
            )
        require_owner(note, current_user)
        note.is_archived = not note.is_archived

        self.repo.save_changes()
        self.db.refresh(note)
        state = "archived" if note.is_archived else "unarchived"
        logger.info(f"Note {note.id} {state} by user_id={current_user.id}")
        return note
    

    def delete_note_service(self, note_id: int, current_user: User)-> None:
        note = self.repo.get_note(note_id)
        if not note:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Note not found"
            )
        require_owner(note, current_user)
        self.db.delete(note)
        self.repo.save_changes()
        logger.info(f"Note Deleted: id={note_id} by user_id={current_user.id}")

        











    
    

    