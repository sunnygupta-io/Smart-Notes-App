from fastapi import HTTPException, status, Query
import logging 
from app.models.models import User, Note, Tag, Notification, SharedNote
from app.schemas.schemas import AdminUserResponse, NoteResponse, MessageResponse, PaginatedUsersResponse
from app.utils.helper import get_user_or_404
from app.repositories.admin_repo import AdminRepository

logger = logging.getLogger(__name__)

class AdminService:
    def __init__(self,db):
        self.repo = AdminRepository(db)
        self.db = db

    def list_all_users_service(
            self, 
            page: int,
            page_size: int,
            is_active: bool | None,
            role: str | None,
            current_admin: User
    )-> PaginatedUsersResponse:
        query = self.repo.get_users_query()

        if is_active is not None:
            query = self.repo.filter_by_active_status(query,is_active)

        if role is not None: 
            if role not in("user", "admin"):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Role must be 'user' or 'admin'"
                )
            query = self.repo.filter_by_role(query, role)
        
        total = self.repo.get_count(query)

        users = self.repo.paginate_users(query, page, page_size)
        total_pages = (total + page_size-1)//page_size if total> 0 else 0
        logger.info(
                f"Admin {current_admin.email} listed users: total={total} page={page}" 
            )
        return {
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": total_pages,
            "items": users
            }
        
    
    def get_user_detail_service(
            self,
            user_id:int,
            current_admin: User
    )-> AdminUserResponse:
        user = self.repo.get_user_by_id(user_id)
        if not user: 
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User {user_id} not found"
            )
        logger.info(
            f"Admin {current_admin.email} viewed user: id={user_id} email={user.email}"
        )
        return user
    

    def deactivate_user (
            self,
            user_id: int,
            current_admin: User
    )-> AdminUserResponse:
        user = self.repo.get_user_by_id(user_id)
        if not user: 
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User {user_id} not found"
            )
        
        if user.id == current_admin.id: 
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You cannot deactivate your account"
            )
        
        if user.role == "admin": 
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Admin account cannot be deactivated"
            )
        if not user.is_active: 
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User is already deactivated"
            )   
        user.is_active = False
        self.repo.save_changes()
        self.db.refresh(user)
        logger.info(
            f"Admin {current_admin.email} deactivated the User: id={user_id} email={user.email}"
            )
        return user
    
    def reactivate_user(
            self,
            user_id: int,
            current_admin: User
    )-> AdminUserResponse:
        user = self.repo.get_user_by_id(user_id)
        if not user: 
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User {user_id} not found"
            )
        if user.is_active: 
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User is already active"
            )   
        user.is_active = True
        self.repo.save_changes()
        self.db.refresh(user)

        logger.info(
            f"Admin {current_admin.email} reactivated the User: id={user_id} email={user.email}"
            )
        return user
        

    def get_user_notes(
                self,
                user_id: int,
                page: int,
                page_size: int,
                current_admin: User
    )-> list[NoteResponse]:
        if user_id== current_admin.id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Admin do not have any notes"
                )
            
        offset = (page-1) * page_size
        user = self.repo.get_user_by_id(user_id)
        if not user: 
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User {user_id} not found"
            )
        notes = self.repo.get_user_notes(user_id, page, page_size)
        logger.info(
            f"Admin viewed notes of User: id={user_id} email={user.email} notes={len(notes)}"
        )
        return notes
    

    def delete_user(
            self,
            user_id: int,
            current_admin: User
    )-> str:
        user = self.repo.get_user_by_id(user_id)
        if not user: 
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User {user_id} not found"
            )
        if user.role =="admin":
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Admin account cannot be deleted"
                )
            
        email = user.email
        self.repo.delete_user(user)
        logger.info(f"Admin deleted User: id={user.id} email={user.email}")
        return email
    
    def get_platform_stats_service(self) -> dict:
        stats = self.repo.get_platform_stats_data()
        
        logger.info("Admin viewed platform stats")
        
        return {
            "users": {
                "total": stats["users_total"],
                "active": stats["users_active"],
                "inactive": stats["users_inactive"]
            },
            "notes":{
                "total": stats["notes_total"],
                "archived": stats["notes_archived"],
                "active": stats["notes_active"]
            },
            "tags": stats["tags_total"],
            "active_shares": stats["shares_total"],
            "unread_notifications": stats["notifications_unread"]
        }
    
    



        
        
        
