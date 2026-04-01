import logging 
from fastapi import HTTPException, status, APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.models import Tag, Note, User
from app.schemas.schemas import TagCreate, TagResponse, NoteResponse, MessageResponse
from app.utils.auth import get_current_user
from app.utils.helper import get_note_or_404, require_owner
from app.services.tag_service import TagService

logger = logging.getLogger(__name__)
router = APIRouter()

def get_tag_service(db: Session= Depends(get_db))-> TagService:
     return TagService(db)

# create tag api
@router.post("/", response_model=TagResponse, status_code=status.HTTP_201_CREATED)
def create_tag(
    payload:TagCreate,
    current_user: User = Depends(get_current_user),
        # db:Session= Depends(get_db), 
    service: TagService = Depends(get_tag_service)
    
):
    # existing = db.query(Tag).filter(Tag.name == payload.name).first()
    # if existing: 
    #     logger.info(f"Tag already exists: '{payload.name}'  id={existing.id}")
    #     return existing
    
    # new_tag = Tag(name = payload.name)
    # db.add(new_tag)
    # db.commit()
    # db.refresh(new_tag)

    # logger.info(f"Tag created: '{new_tag.name}'  id={new_tag.id}")
    # return new_tag
    return service.create_tag_service(payload)


# get all tags api
@router.get("/", response_model=list[TagResponse])
def list_tags(
    current_user: User = Depends(get_current_user),
        # db:Session= Depends(get_db), 
    service: TagService = Depends(get_tag_service)
):
    # tags = db.query(Tag).order_by(Tag.name).all()
    # return tags
    return service.list_tags_service()


# get tag by id api
@router.get("/{tag_id}", response_model=TagResponse)
def get_tag(
    tag_id: int, 
    current_user: User = Depends(get_current_user),
        # db:Session= Depends(get_db), 
    service: TagService = Depends(get_tag_service)
):
    # tag= db.query(Tag).filter(Tag.id == tag_id).first()
    # if not tag:
    #     raise HTTPException(
    #         status_code= status.HTTP_404_NOT_FOUND,
    #         detail= f"Tag {tag_id} not found"
    #     )
    # return tag
    return service.get_tag_service(tag_id)

# delete tag by id
@router.delete("/{tag_id}", response_model=MessageResponse)
def delete_tag(
    tag_id: int,
    current_user: User = Depends(get_current_user),
        # db:Session= Depends(get_db), 
    service: TagService = Depends(get_tag_service)
    
):
    # tag = db.query(Tag).filter(Tag.id == tag_id).first()

    # if not tag:
    #         raise HTTPException(
    #         status_code= status.HTTP_404_NOT_FOUND,
    #         detail= f"Tag {tag_id} not found"
    #         )
    # db.delete(tag)
    # db.commit()

    # logger.info(f"Tag deleted: id={tag_id} by user_id={current_user.id}")
    tag = service.delete_tag(tag_id, current_user)
    return MessageResponse(message=f"Tag '{tag.name}' deleted")


# add tag on a specific note
@router.post("/notes/{note_id}/tags/{tag_id}", response_model=NoteResponse)
def add_tag_to_note(
     note_id: int,
     tag_id: int,
     current_user: User = Depends(get_current_user),
         # db:Session= Depends(get_db), 
    service: TagService = Depends(get_tag_service)
):
    #  note = get_note_or_404(note_id, db)
    #  require_owner(note, current_user) # only note owner can add tag to note
    #  tag = get_tag(tag_id, db, current_user) 

    #  if tag in note.tags:
    #       logger.info(f"Tag {tag_id} already on note {note_id}")
    #       return note
     
    #  note.tags.append(tag)
    #  db.commit()
    #  db.refresh(note)

    #  logger.info(f"Tag '{tag.name}' added to note {note_id}")
    #  return note
       return service.add_tag_to_note_service(note_id, tag_id, current_user)

# remove tag from note
@router.delete("/notes/{note_id}/tags/{tag_id}", response_model=NoteResponse)
def remove_tag_from_note(
     note_id: int,
     tag_id: int,
     current_user: User = Depends(get_current_user),
         # db:Session= Depends(get_db), 
     service: TagService= Depends(get_tag_service)
):
    #  note = get_note_or_404(note_id, db)
    #  require_owner(note, current_user) # only note owner can add tag to note
    #  tag = get_tag(tag_id, db, current_user)
     
    #  if tag not in note.tags:
    #       raise HTTPException(
    #            status_code=status.HTTP_404_NOT_FOUND,
    #            detail=f"Tag '{tag.name}' is not on this note"
    #       )
    #  note.tags.remove(tag)
    #  db.commit()
    #  db.refresh(note)

    #  logger.info(f"Tag '{tag.name}' removed from note {note_id} ")
    #  return note
    return service.remove_tag_from_note_service(note_id, tag_id, current_user)

# get notes by tag id 
@router.get("/{tag_id}/notes", response_model=list[NoteResponse])
def get_notes_by_tag(
     tag_id: int,
     current_user: User = Depends(get_current_user),
         # db:Session= Depends(get_db), 
     service: TagService = Depends(get_tag_service)
):
    #  tag = get_tag(tag_id, db, current_user)
    #  user_notes=[
    #       note for note in tag.notes
    #       if note.owner_id == current_user.id
    #  ]

    #  logger.info(f"Notes with tag '{tag.name}': "
    #               f"{len(user_notes)} found for user_id:{current_user.id}")
    #  return user_notes
    return service.get_notes_by_tag(tag_id, current_user)
