from sqlalchemy.orm import Session
from app.models.models import Note, User
from fastapi import HTTPException, status


# to get note
def get_note_or_404(note_id: int, db:Session)->  Note:
    note = db.query(Note).filter(Note.id == note_id).first()
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Note {note_id} not found"
        )
    return note

# ownership check
def require_owner(note: Note, current_user: User):
    if note.owner_id != current_user.id:
        raise HTTPException(
            status_code= status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to modify this note"
        )
    
# get user
def get_user_or_404(user_id: int, db:Session)-> User:
    user = db.query(User).filter(User.id == user_id).first()
    if not user: 
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User {user_id} not found"
        )
    return user