import logging
from sqlalchemy.orm import Session
from app.models.models import Notification, SharedNote, Note, User
from app.schemas.schemas import Permission

logger= logging.getLogger(__name__)

def notify_shared_users(
        note: Note,
        edited_by: User,
        db: Session
)-> None:
    
    notify_user_ids = set()

    if note.owner_id != edited_by.id:
        notify_user_ids.add(note.owner_id)

    shared_entries = db.query(SharedNote).filter(
        SharedNote.note_id != note.id
    ).all()

    for share in shared_entries:
        if share.shared_with_user_id != edited_by.id:
            notify_user_ids.add(share.shared_with_user_id)

    if not notify_user_ids:
        logger.info(f"No notifications needed for note_id={note.id}")
        return
    
    message = (
        f"Note '{note.title}' was edited by {edited_by.email}"
    )

    notifications = [
        Notification(
            user_id = user_id,
            message  = message,
            is_read = False
        )
        for user_id in notify_user_ids
    ]
    
    db.add_all(notifications)
    db.commit()

    logger.info(
        f"Notification created: note_id={note.id} "
        f"edited_by={edited_by.email} "
        f"notified_users={notify_user_ids}"
    )


def notify_note_shared(
        note: Note,
        shared_with: User,
        shared_by: User,
        permission: Permission,
        db: Session
)-> None:
    
    message = (
    f"{shared_by.email} shared note '{note.title}' "
    f"with you {permission} access"
    )

    notification =Notification(
        user_id = shared_with.id,
        message = message,
        is_read = False
    )

    db.add(notification)
    db.commit()

    logger.info(
        f"Share notification: note_id={note.id} "
        f"shared_with= {shared_with.email}"
    )


    



