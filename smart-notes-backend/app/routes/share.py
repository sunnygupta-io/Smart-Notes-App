import logging 
from fastapi import HTTPException, APIRouter, status, Depends, Body
from sqlalchemy.orm import Session, joinedload
from app.db.database import get_db
from app.models.models import Note, User, SharedNote
from app.schemas.schemas import SharedNoteResponse, ShareNoteRequest, NoteResponse, MessageResponse, NoteWithPermission, UpdatePermissionRequest
from app.utils.auth import get_current_user
from app.utils.helper import get_note_or_404, require_owner
from app.services.notification_service import notify_note_shared
from app.services.share_service import ShareService

logger = logging.getLogger(__name__)
router = APIRouter()

def get_share_service(db: Session= Depends(get_db))-> ShareService:
     return ShareService(db)


# share note api
@router.post("/{note_id}", response_model=SharedNoteResponse, status_code=status.HTTP_201_CREATED)
def share_note(
    note_id :int,
    payload: ShareNoteRequest,
    current_user: User= Depends(get_current_user),
        # db:Session= Depends(get_db), 
    service: ShareService = Depends(get_share_service)
):
    # note = get_note_or_404(note_id, db) # find note
    # require_owner(note, current_user)   # check owner 

    # target_user = db.query(User).filter(User.email == payload.shared_with_email).first()
    # if not target_user: 
    #     raise HTTPException(
    #         status_code=status.HTTP_404_NOT_FOUND,
    #         detail=f"No user found with this email: {payload.shared_with_email}"
    #     )
    
    # if target_user.id == current_user.id:
    #     raise HTTPException(
    #         status_code=status.HTTP_400_BAD_REQUEST,
    #         detail="You cannot share a note yourself"
    #     )
    # if target_user.role == 'admin':
    #     raise HTTPException(
    #         status_code=status.HTTP_403_FORBIDDEN,
    #         detail= "You cannot share it with admin"
    #     )
    # if already share then we have to update the permission
    # existing_share = db.query(SharedNote).filter(
    #     SharedNote.note_id == note_id, 
    #     SharedNote.shared_with_user_id == target_user.id
    #     ).first()
#     if existing_share:
#         existing_share.permission = payload.permission
#         db.commit()
#         db.refresh(existing_share)
#         existing_share = db.query(SharedNote).options(
#       joinedload(SharedNote.shared_with)
#      ).filter(SharedNote.id == existing_share.id).first()

#         logger.info(
#             f"Share updated: note_id={note_id} "
#             f"with user_id={target_user.id} "
#             f"permission={payload.permission}"
#         )
#         return SharedNoteResponse.from_share(existing_share)
    

#     share = SharedNote(
#         note_id = note_id,
#         shared_with_user_id = target_user.id,
#         permission = payload.permission,
#     )

#     db.add(share)
#     db.commit()
#     db.refresh(share)
#     share = db.query(SharedNote).options(
#     joinedload(SharedNote.shared_with)
# ).filter(SharedNote.id == share.id).first()
    

#     # notification
#     try: 
#        notify_note_shared(
#            note =note,
#            shared_with=target_user,
#            shared_by=current_user,
#            permission=payload.permission,
#            db=db
#        )
#     except Exception as e:
#         logger.error(f"Failed to send share notification: {e}")

#     logger.info(
#         f"Note shared: note_id={note_id} "
#         f"by user_id:{current_user.id} "
#         f"with user_id={target_user.id} "
#         f"permission={payload.permission} "
#     )
#     return SharedNoteResponse.from_share(share)
      return service.share_note_service(note_id, payload, current_user)





# get all users in which this note shared
@router.get("/{note_id}/users", response_model=list[SharedNoteResponse])
def list_note_shares(
    note_id: int,
    current_user: User = Depends(get_current_user),
        # db:Session= Depends(get_db), 
    service : ShareService= Depends(get_share_service)
):
    # note = get_note_or_404(note_id, db)
    # require_owner(note, current_user)

    # shares = db.query(SharedNote).options(
    #     joinedload(SharedNote.shared_with)
    # ).filter(SharedNote.note_id == note_id).all()
    # return [SharedNoteResponse.from_share(share) for share in shares]
      return service.list_note_shares(note_id, current_user)

# notes shared with me by other user
@router.get("/me/notes", response_model=list[NoteWithPermission])
def list_notes_shared_with_me(
    current_user: User = Depends(get_current_user),
        # db:Session= Depends(get_db), 
    service: ShareService= Depends(get_share_service)
):
    # shares  = db.query(SharedNote).filter(
    #     SharedNote.shared_with_user_id == current_user.id
    # ).all()
    
    # results = [
    #     {"note": share.note, "permission": share.permission} 
    #     for share in shares if not share.note.is_archived
    # ]

    # logger.info(
    #     f"Shared notes for user_id={current_user.id} "
    #     f"{len(results)} found"
    # )
    # return results
    return service.list_notes_shared_with_me(current_user)


#  update shared notes permissions api
@router.patch("/{note_id}/users/{user_id}", response_model=SharedNoteResponse)
def update_share_permission(
    note_id: int,
    user_id: int,
    payload: UpdatePermissionRequest,
    current_user : User = Depends(get_current_user),
        # db:Session= Depends(get_db), 
    service: ShareService= Depends(get_share_service)
):
    # note = get_note_or_404(note_id, db)
    # require_owner(note, current_user)
    
    # share = db.query(SharedNote).filter(
    #     SharedNote.note_id == note_id,
    #     SharedNote.shared_with_user_id == user_id
    # # ).first()

    # if not share: 
    #     raise HTTPException(
    #         status_code=status.HTTP_404_NOT_FOUND,
    #         detail="This note is not shared with that user"
    #     )
    
    # share.permission = payload.permission.value
    # db.commit()
    # db.refresh(share)
    # logger.info(
    #     f"Share permission updated: note_id={note_id}"
    #     f"user_id={user_id} new_permission={payload}"
    # )
    # return SharedNoteResponse.from_share(share)
    return service.update_share_permission(note_id,user_id, payload, current_user)


# delete shares 
@router.delete("/{note_id}/users/{user_id}", response_model=MessageResponse)
def revoke_share(
    note_id: int,
    user_id: int, 
    current_user: User = Depends(get_current_user),
        # db:Session= Depends(get_db), 
    service: ShareService = Depends(get_share_service)
):
    # note = get_note_or_404(note_id, db)
    # is_owner = (note.owner_id == current_user.id)
    # is_self_removing = (user_id== current_user.id)

    # if not is_owner and not is_self_removing:
    #     raise HTTPException(
    #         status_code=status.HTTP_403_FORBIDDEN,
    #         detail="You can only revoke your own access or shares you created"
    #     )
    
    # share = db.query(SharedNote).filter(
    # SharedNote.note_id == note_id,
    # SharedNote.shared_with_user_id == user_id
    # ).first()
    
    # if not share: 
    #     raise HTTPException(
    #         status_code=status.HTTP_404_NOT_FOUND,
    #         detail="This note is not shared with that user"
    #     )
    
    # db.delete(share)
    # db.commit()
    service.revoke_share_service(note_id, user_id, current_user)
    return MessageResponse(
        message = f"Access revoked for user {user_id} on note {note_id}"
    )
