from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.repositories.share_repo import ShareRepository
from app.schemas.schemas import SharedNote,UpdatePermissionRequest, SharedNoteResponse,NoteWithPermission, ShareNoteRequest
from app.models.models import SharedNote, User, Note
from app.utils.helper import require_owner, get_note_or_404
from app.services.notification_service import notify_note_shared
import logging



logger = logging.getLogger(__name__)

class ShareService: 
        def __init__(self, db:Session):
            self.repo = ShareRepository(db)
            self.db = db


        def share_note_service(
                    self,
                    note_id: int,
                    payload: ShareNoteRequest,
                    current_user: User
        )-> SharedNoteResponse:
            note = get_note_or_404(note_id, self.db) # find note
            require_owner(note, current_user)   # check owner 
            target_user = self.repo.get_user_by_email(payload.shared_with_email)
            if not target_user: 
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"No user found with this email: {payload.shared_with_email}"
                )
            
            if target_user.id == current_user.id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="You cannot share a note yourself"
                )
            
            if target_user.role == 'admin':
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail= "You cannot share it with admin"
                )
            
            existing_share = self.repo.get_share(note_id, target_user.id)
            if existing_share:
                existing_share.permission = payload.permission
                self.repo.save_changes()
                self.db.refresh(existing_share)
                existing_share = self.repo.get_share_with_user_details(existing_share.id)
                logger.info(
                    f"Share updated: note_id={note_id} "
                    f"with user_id={target_user.id} "
                    f"permission={payload.permission}"
                    )
                return SharedNoteResponse.from_share(existing_share)
            
            share = SharedNote(
                 note_id = note_id,
                 shared_with_user_id = target_user.id,
                 permission = payload.permission
            )

            share=self.repo.create_share(share)
            share =self.repo.get_share_with_user_details(share.id)
            try: 
                notify_note_shared(
                    note =note  ,
                    shared_with=target_user,
                    shared_by=current_user,
                    permission=payload.permission,
                    db=self.db
                )
            except Exception as e:
                     logger.error(f"Failed to send share notification: {e}")

            logger.info(
                f"Note shared: note_id={note_id} "
                f"by user_id:{current_user.id} "
                f"with user_id={target_user.id} "
                f"permission={payload.permission} "
            )
            return SharedNoteResponse.from_share(share)

        def list_note_shares(
                  self,
                  note_id: int,
                  current_user: User
        )-> list[SharedNoteResponse]:
             note = get_note_or_404(note_id, self.db)
             require_owner(note, current_user)

             shares = self.repo.get_all_shares_for_note(note_id)
             return [SharedNoteResponse.from_share(share) for share in shares]
        
        def list_notes_shared_with_me(
                  self,
                  current_user: User
        )-> list[NoteWithPermission]:
             shares= self.repo.get_notes_shared_with_user(current_user.id)
             results = [
                {"note": share.note, "permission": share.permission} 
                for share in shares if not share.note.is_archived
                ]
             logger.info(
                    f"Shared notes for user_id={current_user.id} "
                    f"{len(results)} found"
                 )
             return results
        
        def update_share_permission(
                  self,
                  note_id: int,
                  user_id: int,
                  payload: UpdatePermissionRequest,
                  current_user : User
        )-> SharedNoteResponse:
             note = get_note_or_404(note_id, self.db)
             require_owner(note, current_user)

             share = self.repo.get_share(note_id, user_id)
             if not share: 
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="This note is not shared with that user"
                )
            
             share.permission = payload.permission.value
             self.repo.save_changes()
             self.db.refresh(share)
             logger.info(
                f"Share permission updated: note_id={note_id}"
                f"user_id={user_id} new_permission={payload}"
            )
             return SharedNoteResponse.from_share(share)

             
        def revoke_share_service(
                self, 
                note_id: int,
                user_id: int,
                current_user: User
        )-> None:
            note = get_note_or_404(note_id, self.db)
            is_owner = (note.owner_id == current_user.id)
            is_self_removing = (user_id== current_user.id)
            if not is_owner and not is_self_removing:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You can only revoke your own access or shares you created"
                )
            share = self.repo.get_share(note_id, user_id)
            if not share: 
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="This note is not shared with that user"
                )
            
            self.repo.delete_share(share)
            logger.info(
                    f"Share revoked: note_id={note_id} "
                    f"user_id={user_id} "
                    f"by user_id={current_user.id}"
                )

                    
