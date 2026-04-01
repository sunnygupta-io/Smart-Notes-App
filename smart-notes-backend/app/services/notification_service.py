import logging
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.models import Notification, SharedNote, Note, User
from app.schemas.schemas import Permission, NotificationResponse
from app.repositories.noti_repo import NotificationRepository
logger= logging.getLogger(__name__)


# notify shared users on notes changes
def notify_shared_users(
        note: Note,
        edited_by: User,
        db: Session
)-> None:
    
    notify_user_ids = set()

    if note.owner_id != edited_by.id:
        notify_user_ids.add(note.owner_id)

    shared_entries = db.query(SharedNote).filter(
        SharedNote.note_id == note.id
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

# helper function to notify user that they recieved note
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


    
class NotificationService:
    def __init__(self, db:Session):
        self.repo = NotificationRepository(db)
        self.db = db


    def list_notifications_service(
            self,
            unread_only: bool,
            page: int,
            page_size: int,
            current_user: User
    )-> list[NotificationResponse]:
        notifications = self.repo.get_notifications(current_user.id, unread_only, page, page_size)
        logger.info(
        f"Listed notifications: user_id={current_user.id} "
        f"count={len(notifications)} unread_only={unread_only}"
        )
        return notifications
    
    def get_unread_count(
            self,
            current_user: User
    )-> dict:
        count = self.repo.get_unread_count(current_user.id)
        return {"unread": count}
    
    def mark_as_read(
            self,
            notification_id: int,
            current_user: User
    )-> NotificationResponse:
        notification = self.repo.get_notification_by_id(notification_id, current_user.id)
        if not notification:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Notification not found"
            )
        if notification.is_read:
            return notification
        notification.is_read = True
        self.repo.save_changes()
        self.db.refresh(notification)
        logger.info(
            f"Notification {notification_id} marked as read"
            )
        return notification
    
    def mark_all_as_read(
            self,
            current_user: User
    )-> int:
        update_count = self.repo.mark_all_as_read(current_user.id)
        self.repo.save_changes()
        logger.info(
            f"Marked all notifications as read: user_id={current_user.id} count={update_count} "
        )
        return update_count
    
    def clear_all_notification(
            self, 
            current_user: User
    )-> int : 
        delete_count = self.repo.clear_all(current_user.id)
        self.repo.save_changes()
        logger.info(f"All notification cleared by user_id={current_user.id}\n Deleted count = {delete_count} ")
        return delete_count
    
    def delete_one_notification (
            self,
            notification_id: int,
            current_user: User
    )-> None:
        notification = self.repo.get_notification_by_id(notification_id, current_user.id)
        if not notification:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Notification not found"
            )
        self.repo.delete_notification(notification)
        self.repo.save_changes()
        logger.info(f"Notification={notification_id} deleted by user_id={current_user.id}")
   











    


