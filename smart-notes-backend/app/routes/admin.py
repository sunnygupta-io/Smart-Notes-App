import logging 
from fastapi import HTTPException, APIRouter, Depends, status, Query
from sqlalchemy.orm import Session 

from app.models.models import User, Notification, Note, Tag, SharedNote
from app.db.database import get_db
from app.utils.auth import get_current_admin, get_current_user
from app.schemas.schemas import AdminUserResponse, NoteResponse, MessageResponse, PaginatedUsersResponse
from app.utils.helper import get_user_or_404
from app.services.admin_service import AdminService


logger = logging.getLogger(__name__)
router = APIRouter()

def get_admin_service(db: Session = Depends(get_db))-> AdminService:
    return AdminService(db)



# list all users api
@router.get("/users", response_model=PaginatedUsersResponse)
def list_all_users(
    page : int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    is_active: bool| None=Query(default=None, description="Filter by active/inactive status"),
    role: str| None = Query(
        default=None,
        description="Filter by role"
    ),
    current_admin:User =Depends(get_current_admin),
        # db:Session= Depends(get_db), 
    service: AdminService=Depends(get_admin_service)
):
    # query = db.query(User)
    # if is_active is not None: 
    #     query = query.filter(User.is_active == is_active)

    # if role is not None: 
    #     if role not in("user", "admin"):
    #         raise HTTPException(
    #             status_code=status.HTTP_400_BAD_REQUEST,
    #             detail="Role must be 'user' or 'admin'"
    #         )
    #     query =query.filter(User.role == role)

    # total = query.count()

    # offset = (page -1) * page_size
    # users = query.order_by(User.created_at.desc()).offset(offset).limit(page_size).all()
    # total_pages = (total + page_size-1)//page_size if total> 0 else 0

    # logger.info(
    #     f"Admin {current_admin.email} listed users: total={total} page={page}" 
    # )
    
    # return {
    #     "total": total,
    #     "page": page,
    #     "page_size": page_size,
    #     "total_pages": total_pages,
    #     "items": users
    #     }
    return service.list_all_users_service(page, page_size, is_active, role, current_admin)


# get user details
@router.get("/users/{user_id}", response_model=AdminUserResponse)
def get_user_detail(
    user_id: int,
    # db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
    service: AdminService= Depends(get_admin_service)
):
    # user = get_user_or_404(user_id, db)

    # logger.info(
    #     f"Admin {current_admin.email} viewed user: id={user_id} email={user.email}"
    # )
    # return user

    return service.get_user_detail_service(user_id, current_admin)


# deactive user api [user cannot login but their notes and data preserved]
@router.patch("/users/{user_id}/deactivate", response_model=AdminUserResponse)
def deactivate_user(
    user_id: int,
    # db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
    service: AdminService= Depends(get_admin_service)
):
    # user = get_user_or_404(user_id, db)

    # if user.id == current_admin.id:
    #     raise HTTPException(
    #         status_code=status.HTTP_400_BAD_REQUEST,
    #         detail="You cannot deactivate your account"
    #     )
    
    # if user.role == "admin":
    #     raise HTTPException(
    #         status_code=status.HTTP_400_BAD_REQUEST,
    #         detail="Admin account cannot be deactivated"
    #     )
    
    # if not user.is_active: 
    #     raise HTTPException(
    #         status_code=status.HTTP_400_BAD_REQUEST,
    #         detail="User is already deactivated"
    #     )   
    # user.is_active = False
    # db.commit()
    # db.refresh(user)

    # logger.info(
    #     f"Admin {current_admin.email} deactivated the User: id={user_id} email={user.email}"
    # )
    # return user
    return service.deactivate_user(user_id, current_admin)



# reactive user api [user can login not]
@router.patch("/users/{user_id}/reactivate", response_model=AdminUserResponse)
def reactivate_user(
    user_id: int,
    # db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
    service: AdminService= Depends(get_admin_service)
):
    # user = get_user_or_404(user_id, db)

    # if user.is_active: 
    #     raise HTTPException(
    #         status_code=status.HTTP_400_BAD_REQUEST,
    #         detail="User is already active"
    #     )   
    # user.is_active = True
    # db.commit()
    # db.refresh(user)

    # logger.info(
    #     f"Admin {current_admin.email} reactivated the User: id={user_id} email={user.email}"
    # )
    # return user
    return service.reactivate_user(user_id,current_admin)



# get user notes api
@router.get("/users/{user_id}/notes", response_model=list[NoteResponse])
def get_user_notes(
    user_id: int,
    page: int = Query(default=1 , ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    # db: Session = Depends(get_db),
    current_admin : User = Depends(get_current_admin),
    service: AdminService = Depends(get_admin_service)
):  
    # if user_id== current_admin.id:
    #     raise HTTPException(
    #         status_code=status.HTTP_400_BAD_REQUEST,
    #         detail="Admin do not have any notes"
    #     )
    # user = get_user_or_404(user_id, db)
    # offset = (page-1) * page_size
    # notes =(
    #     db.query(Note)
    #     .filter(Note.owner_id == user_id)
    #     .order_by(Note.created_at.desc())
    #     .offset(offset)
    #     .limit(page_size)
    #     .all()
    # )    

    # logger.info(
    #     f"Admin viewed notes of User: id={user_id} email={user.email} notes={len(notes)}"
    # )

    # return notes
    return service.get_user_notes(user_id, page, page_size, current_admin)



# delete user permanently
@router.delete("/users/{user_id}", response_model=MessageResponse)
def delete_user(
    user_id: int,
    # db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
    service: AdminService = Depends(get_admin_service)
):
    # user = get_user_or_404(user_id, db)

    # if user.id == current_admin.id:
    #     raise HTTPException(
    #         status_code=status.HTTP_400_BAD_REQUEST,
    #         detail="You cannot delete your own account"
    #     )
    
    # if user.role =="admin":
    #     raise HTTPException(
    #         status_code=status.HTTP_400_BAD_REQUEST,
    #         detail="Admin account cannot be deleted"
    #     )
    
    # email = user.email
    # db.delete(user)
    # db.commit()

    # logger.info(f"Admin deleted User: id={user.id} email={user.email}")
    email = service.delete_user(user_id, current_admin)
    return MessageResponse(message=f"User '{email}' permanently deleted")




# stats api
@router.get("/stats")
def get_platform_stats(
    # db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
    service : AdminService = Depends(get_admin_service)
):
    # total_users = db.query(User).count()
    # active_users=  db.query(User).filter(User.is_active==True).count()
    # inactive_users=  db.query(User).filter(User.is_active==False).count()
    # total_notes = db.query(Note).count()
    # archived_notes= db.query(Note).filter(Note.is_archived == True).count()
    # total_tags = db.query(Tag).count()
    # total_shares = db.query(SharedNote).count()
    # unread_notifs = db.query(Notification).filter(Notification.is_read == False).count()


    # logger.info(f"Admin viewed platform stats")
    # return {
    #     "users": {
    #         "total": total_users,
    #         "active": active_users,
    #         "inactive": inactive_users
    #     },
    #     "notes":{
    #         "total": total_notes,
    #         "archived": archived_notes,
    #         "active": total_notes - archived_notes
    #     },
    #     "tags":total_tags,
    #     "active_shares": total_shares,
    #     "unread_notifications": unread_notifs
    # }
      return service.get_platform_stats_service()
