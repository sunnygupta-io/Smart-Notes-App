from datetime import datetime
from typing import Optional
import re
from pydantic import BaseModel, EmailStr , field_validator
from enum import Enum
from app.models.models import SharedNote

class UserRole(str, Enum):
    USER= "user"
    ADMIN= "admin"

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    role: Optional[UserRole]= UserRole.USER
    

    @field_validator("password")
    @classmethod
    def password_must_be_strong(cls, value):
        if len(value)< 8:
            raise ValueError("Password must be atleast 8 Characters")
        
        if not re.search(r"[A-Z]", value):
            raise ValueError("Password must contain at least one uppercase letter")

        if not re.search(r"[a-z]", value):
            raise ValueError("Password must contain at least one lowercase letter")

        if not re.search(r"[0-9]", value):
            raise ValueError("Password must contain at least one number")

        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", value):
            raise ValueError("Password must contain at least one special character")
        return value
    
class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def password_must_be_strong(cls, value):
        if len(value)< 8:
            raise ValueError("Password must be atleast 8 Characters")
        
        if not re.search(r"[A-Z]", value):
            raise ValueError("Password must contain at least one uppercase letter")

        if not re.search(r"[a-z]", value):
            raise ValueError("Password must contain at least one lowercase letter")

        if not re.search(r"[0-9]", value):
            raise ValueError("Password must contain at least one number")

        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", value):
            raise ValueError("Password must contain at least one special character")
        return value
    
class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int 
    email: str
    role: str
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}



class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type : str= "bearer"
    
class RefreshTokenRequest(BaseModel):
    refresh_token: str
    
class TokenData(BaseModel):
    user_id: Optional[int] = None


class TagResponse(BaseModel):
    id: int 
    name: str
    model_config = {"from_attributes": True}


class NoteCreate(BaseModel):
    title: str
    content : Optional[str]= None
    tag_ids : Optional[list[int]] = []

    @field_validator("title")
    @classmethod
    def title_must_not_be_empty(cls, value):
        if not value.strip():
            raise ValueError("Title cannot be empty")
        return value.strip()
    
class NoteUpdate(BaseModel):
    title: Optional[str]= None
    content: Optional[str]= None
    tag_ids: Optional[list[int]] = None

class  NoteResponse(BaseModel):
    id: int
    title : str
    content: Optional[str]
    owner_id: int
    is_archived: bool
    created_at : datetime
    updated_at : datetime
    tags: list[TagResponse] = []
    model_config  ={"from_attributes": True}


class NoteSearchResponse(BaseModel):
    total: int
    page: int
    page_size: int
    total_pages: int
    items: list[NoteResponse]

    model_config = {"from_attributes": True}

class TagCreate(BaseModel):
    name: str

    @field_validator("name")
    @classmethod
    def name_must_not_be_empty(cls, value):
        if not value.strip():
            raise ValueError("Name must be required")
        return value.strip().lower()
    
class Permission(str, Enum):
    VIEW= "view"
    EDIT= "edit"

class UpdatePermissionRequest(BaseModel):
    permission: Permission

class NoteWithPermission(BaseModel):
    note: NoteResponse
    permission: str

class ShareNoteRequest(BaseModel):
    shared_with_email: str
    permission: Permission = Permission.VIEW
    
class SharedNoteResponse(BaseModel):
    id: int
    note_id: int 
    shared_with_user_id: int 
    permission: str
    created_at : datetime

    shared_with_email: Optional[str] = None
    model_config = {"from_attributes": True}
    
    @classmethod
    def from_share(cls, share: "SharedNote") -> "SharedNoteResponse":
        return cls(
            id=share.id,
            note_id=share.note_id,
            shared_with_user_id=share.shared_with_user_id,
            permission=share.permission,
            created_at=share.created_at,
            shared_with_email=share.shared_with.email if share.shared_with else None,
        )

class NotificationResponse(BaseModel):
    id: int
    message: str
    is_read: bool
    created_at: datetime
    model_config=  {"from_attributes": True}

class AdminUserResponse(BaseModel):
    id: int
    email: str
    role: str
    is_active: bool
    created_at: datetime
    model_config = {"from_attributes": True}


class PaginatedResponse(BaseModel):
    total: int
    page: int
    page_size: int 
    items: list


class PaginatedUsersResponse(BaseModel):
    total: int
    page: int
    page_size: int
    total_pages: int
    items: list[AdminUserResponse]

    model_config = {"from_attributes": True}
class MessageResponse(BaseModel):
    message: str