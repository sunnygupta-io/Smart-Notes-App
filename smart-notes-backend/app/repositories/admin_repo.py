from sqlalchemy.orm import Session, Query
from app.models.models import User, Note, Tag, SharedNote, Notification

class AdminRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_users_query(self) -> Query:
        return self.db.query(User)

    def filter_by_active_status(self, query: Query, is_active: bool) -> Query:
        return query.filter(User.is_active == is_active)

    def filter_by_role(self, query: Query, role: str) -> Query:
        return query.filter(User.role == role)

    def get_count(self, query: Query) -> int:
        return query.count()

    def paginate_users(self, query: Query, page: int, page_size: int) -> list[User]:
        offset = (page - 1) * page_size
        return query.order_by(User.created_at.desc()).offset(offset).limit(page_size).all()

    def get_user_by_id(self, user_id: int) -> User | None:
        return self.db.query(User).filter(User.id == user_id).first()

    def get_user_notes(self, user_id: int, page: int, page_size: int) -> list[Note]:
        offset = (page - 1) * page_size
        return (
            self.db.query(Note)
            .filter(Note.owner_id == user_id)
            .order_by(Note.created_at.desc())
            .offset(offset)
            .limit(page_size)
            .all()
        )

    def delete_user(self, user: User) -> None:
        self.db.delete(user)
        self.db.commit()

    def save_changes(self) -> None:
        self.db.commit()

    def get_platform_stats_data(self) -> dict:
        total_users = self.db.query(User).count()
        active_users = self.db.query(User).filter(User.is_active == True).count()
        inactive_users = self.db.query(User).filter(User.is_active == False).count()
        
        total_notes = self.db.query(Note).count()
        archived_notes = self.db.query(Note).filter(Note.is_archived == True).count()
        
        total_tags = self.db.query(Tag).count()
        total_shares = self.db.query(SharedNote).count()
        unread_notifs = self.db.query(Notification).filter(Notification.is_read == False).count()

        return {
            "users_total": total_users,
            "users_active": active_users,
            "users_inactive": inactive_users,
            "notes_total": total_notes,
            "notes_archived": archived_notes,
            "notes_active": total_notes - archived_notes,
            "tags_total": total_tags,
            "shares_total": total_shares,
            "notifications_unread": unread_notifs
        }