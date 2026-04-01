from sqlalchemy.orm import Session
from app.models.models import Notification

class NotificationRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_notifications(self, user_id: int, unread_only: bool, page: int, page_size: int) -> list[Notification]:
        query = self.db.query(Notification).filter(Notification.user_id == user_id)
        
        if unread_only:
            query = query.filter(Notification.is_read == False)
            
        offset = (page - 1) * page_size
        return query.order_by(Notification.created_at.desc()).offset(offset).limit(page_size).all()

    def get_unread_count(self, user_id: int) -> int:
        return self.db.query(Notification).filter(
            Notification.user_id == user_id,
            Notification.is_read == False
        ).count()

    def get_notification_by_id(self, notification_id: int, user_id: int) -> Notification | None:
        return self.db.query(Notification).filter(
            Notification.id == notification_id,
            Notification.user_id == user_id
        ).first()

    def mark_all_as_read(self, user_id: int) -> int:
        update_count = self.db.query(Notification).filter(
            Notification.user_id == user_id,
            Notification.is_read == False
        ).update({"is_read": True})
        
        self.db.commit()
        return update_count

    def clear_all(self, user_id: int) -> int:
        delete_count = self.db.query(Notification).filter(
            Notification.user_id == user_id
        ).delete()
        
        self.db.commit()
        return delete_count

    def delete_notification(self, notification: Notification) -> None:
        self.db.delete(notification)
        self.db.commit()

    def save_changes(self) -> None:
        self.db.commit()