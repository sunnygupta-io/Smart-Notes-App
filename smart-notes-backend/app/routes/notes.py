import logging 
from datetime import datetime
from typing import Optional
from fastapi  import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.db.database import get_db
from app.models.models import Note, Tag, User
from app.schemas.schemas import NoteCreate, NoteResponse, NoteUpdate, MessageResponse, NoteSearchResponse
from app.utils.auth import get_current_user
from app.utils.helper import get_note_or_404, require_owner
from app.services.notification_service import notify_shared_users

logger = logging.getLogger(__name__)
router = APIRouter()


# create notes api
@router.post("/", response_model=NoteResponse, status_code=status.HTTP_201_CREATED)
def create_note(payload: NoteCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    logger.info(f"Create Note for user_id={current_user.id}")

    new_note = Note(
        title = payload.title,
        content = payload.content,
        owner_id = current_user.id,
        is_archived = False
    )

    if payload.tag_ids:
        tags = db.query(Tag).filter(Tag.id.in_(payload.tag_ids)).all()
        if len(tags) != len(payload.tag_ids):
            found_ids = {t.id for t in tags}
            missing= set(payload.tag_ids) - found_ids
            logger.warning(f"Tag IDs not found: {missing}")
        
        new_note.tags = tags

    db.add(new_note)
    db.commit()
    db.refresh(new_note)

    logger.info(f"Note created: id={new_note.id}")
    return new_note



# get all notes api
@router.get("/", response_model=list[NoteResponse])
def list_notes(
        page: int = Query(default=1, ge=1, description="Page number"),
        page_size: int = Query(default=10, ge=1, le=100, description="Items per page"),
        archived: Optional[bool] = Query(default=None, description="Filter by archived status"), 
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)    
        ):
    query = db.query(Note).filter(Note.owner_id == current_user.id)

    if archived is not None:
        query = query.filter(Note.is_archived== archived)

    query = query.order_by(Note.created_at.desc())

    offset = (page-1) * page_size
    notes = query.offset(offset).limit(page_size).all()

    logger.info(
        f"Listed notes: user_id={current_user.id} "
        f"page = {page}  count = {len(notes)}"
    )
    return notes

# search notes by title and content
@router.get("/search", response_model = NoteSearchResponse)
def search_note(

    # search by title and content
    q: Optional[str]= Query(
        default=None,
        description="Search in title and content"
    ),

    # by tag id
    tag_id: Optional[int] = Query(
        default= None,
        description="Filter notes that have this tag"
    ),

    # by is_archived -> true or false
    is_archived: Optional[bool]= Query(
        default=None,
        description="Filter by archived Status"
    ),

    # date range
    date_from: Optional[datetime] = Query(
        default = None,
        description="Notes created on or after this date"
    ),

    date_to: Optional[datetime] = Query(
        default=None,
        description="Notes created on or before this date"
    ),
    page: int = Query(default=1, ge=1, description="Page number"),
    page_size: int = Query(default=10, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)  
):
    query = db.query(Note).filter(Note.owner_id == current_user.id)
    
    # search keyword
    if q and q.strip():
        search_term = f"%{q.strip()}%"
        query = query.filter(
            or_(
                Note.title.ilike(search_term),
                Note.content.ilike(search_term)
            )
        )
        logger.info(f"Search keyword: '{q}'")
    

    # tag filter
    if tag_id is not None:
        query = query.filter(Note.tags.any(Tag.id == tag_id))
        logger.info(f"Filter by Tag ID: {tag_id}")

    # archived filter
    if is_archived is not None: 
        query = query.filter(Note.is_archived == is_archived)
        logger.info(f"Filter by Archived: {is_archived}")

    # date_from filter
    if date_from is not None:
        query = query.filter(Note.created_at >= date_from)
        logger.info(f"Filter by Date_from: {date_from}")

    # date_to filter
    if date_to is not None:
        query = query.filter(Note.created_at <= date_to)
        logger.info(f"Filter by Date_to: {date_to}")
    
    total = query.count()
    
    # ordering + pagination
    offset = (page -1) * page_size
    notes= (
        query
        .order_by(Note.created_at.desc())
        .offset(offset)
        .limit(page_size)
        .all()
    )


    total_pages = (total + page_size -1)
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


# get notes by id api
@router.get("/{note_id}", response_model=NoteResponse)
def get_note(note_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    note = get_note_or_404(note_id, db)

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

# update note api
@router.put("/{note_id}", response_model=NoteResponse)
def update_note(
    note_id: int,
    payload: NoteUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    
    note = get_note_or_404(note_id, db)

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
        tags = db.query(Tag).filter(Tag.id.in_(payload.tag_ids)).all()
        note.tags = tags

    db.commit()
    db.refresh(note)
    logger.info(f"Note updated: id={note.id} by user_id={current_user.id}")

    # notification service must be implemented here
    try:
        notify_shared_users(note, current_user, db)
    except Exception as e:
        logger.error(f"Failed to send edit notification: {e}")


    return note


# toggle note archived - true or false
@router.patch("/{note_id}/archive", response_model=NoteResponse)
def toggle_archive(
    note_id: int,
    db:Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    note = get_note_or_404(note_id, db)
    require_owner(note, current_user)

    note.is_archived = not note.is_archived

    db.commit()
    db.refresh(note)
    state = "archived" if note.is_archived else "unarchived"
    logger.info(f"Note {note.id} {state} by user_id={current_user.id}")
    return note


# delete note api
@router.delete("/{note_id}", response_model=MessageResponse)
def delete_note(
    note_id: int,
    db:Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    note = get_note_or_404(note_id, db)
    require_owner(note, current_user)

    db.delete(note)
    db.commit()

    logger.info(f"Note Deleted: id={note_id} by user_id={current_user.id}")
    return MessageResponse(message=f"Note {note_id} deleted successfully")