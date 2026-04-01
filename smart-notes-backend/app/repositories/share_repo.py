from sqlalchemy.orm import Session, joinedload
from app.models.models import SharedNote, User

class ShareRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_user_by_email(self, email: str) -> User | None:
        return self.db.query(User).filter(User.email == email).first()

    def get_share(self, note_id: int, user_id: int) -> SharedNote | None:
        return self.db.query(SharedNote).filter(
            SharedNote.note_id == note_id,
            SharedNote.shared_with_user_id == user_id
        ).first()

    def get_share_with_user_details(self, share_id: int) -> SharedNote | None:
        return self.db.query(SharedNote).options(
            joinedload(SharedNote.shared_with)
        ).filter(SharedNote.id == share_id).first()

    def create_share(self, share: SharedNote) -> SharedNote:
        self.db.add(share)
        self.db.commit()
        self.db.refresh(share)
        return share

    def get_all_shares_for_note(self, note_id: int) -> list[SharedNote]:
        return self.db.query(SharedNote).options(
            joinedload(SharedNote.shared_with)
        ).filter(SharedNote.note_id == note_id).all()

    def get_notes_shared_with_user(self, user_id: int) -> list[SharedNote]:
        return self.db.query(SharedNote).filter(
            SharedNote.shared_with_user_id == user_id
        ).all()

    def delete_share(self, share: SharedNote) -> None:
        self.db.delete(share)
        self.db.commit()

    def save_changes(self) -> None:
        self.db.commit()