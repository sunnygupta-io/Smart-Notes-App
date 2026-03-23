from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Table
from sqlalchemy.orm import relationship
from app.db.database import Base


note_tags = Table(
    "note_tags",
    Base.metadata,
    Column("note_id", Integer, ForeignKey("notes.id", ondelete = "CASCADE")),
    Column("tag_id", Integer, ForeignKey("tags.id", ondelete = "CASCADE")),
)



# User table 
class User(Base):
    __tablename__= "users"

    id = Column(Integer, primary_key=True, index = True)
    email  = Column(String, nullable=False, unique= True, index= True)
    password_hash = Column(String, nullable=True)
    role  = Column(String, default="user") # must be admin or user
    is_active = Column(Boolean, default=True) 
    created_at = Column(DateTime, default=datetime.now(timezone.utc)) 
    refresh_token = Column(String, nullable=True)

    notes = relationship("Note", back_populates="owner", cascade= "all, delete-orphan")
    notifications = relationship(
        "Notification",
        back_populates="user",
        cascade="all, delete-orphan"
    )

    shared_notes = relationship(
        "SharedNote",
        back_populates="shared_with",
        cascade="all, delete-orphan"
        
    ) 

class Note(Base):
    __tablename__ = "notes"

    id = Column(Integer, primary_key=True, index= True)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=True)
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    is_archived = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.now(timezone.utc)) 
    updated_at = Column(DateTime, default=datetime.now(timezone.utc), onupdate=datetime.now(timezone.utc)) 
    

    owner = relationship("User", back_populates="notes")
    tags = relationship("Tag", secondary=note_tags,back_populates= "notes")
    shares = relationship("SharedNote", back_populates="note",  cascade="all, delete-orphan" )

class Tag(Base):
    __tablename__ = "tags"


    id = Column(Integer, primary_key=True, index= True)
    name = Column(String, unique= True, nullable=False) # work, personal 
    
    notes = relationship("Note", secondary=note_tags, back_populates="tags")

class SharedNote(Base): 
     
     __tablename__ = "shared_notes"
     
     id = Column(Integer, primary_key=True, index=True)
     note_id = Column(Integer, ForeignKey("notes.id", ondelete="CASCADE"), nullable=False)
     shared_with_user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable= False)
     permission = Column(String, default="view") # view or edit
     created_at = Column(DateTime, default=datetime.now(timezone.utc)) 
     
     note= relationship("Note", back_populates="shares")
     shared_with = relationship("User", back_populates="shared_notes")


class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id  = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    message = Column(String, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.now(timezone.utc)) 
    
    user= relationship("User", back_populates="notifications")