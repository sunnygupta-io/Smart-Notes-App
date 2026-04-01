import logging 
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.models import User, Notification
from app.schemas.schemas import MessageResponse, NotificationResponse
from app.utils.auth import get_current_user
from app.services.notification_service import NotificationService
logger = logging.getLogger(__name__)

router = APIRouter()

def get_notification_service(db: Session= Depends(get_db))-> NotificationService:
    return NotificationService(db)

# get notification
@router.get("/",response_model=list[NotificationResponse])
def list_notifications(
    unread_only: bool = Query(
        default=False,
        description="If true, return only unread notifications"
    ),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    # db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    service: NotificationService= Depends(get_notification_service)
):
    # query = db.query(Notification).filter(
    #     Notification.user_id == current_user.id
    # )

    # # only unread message
    # if unread_only: 
    #     query =query.filter(Notification.is_read == False)
    
    # # new notification first
    # query = query.order_by(Notification.created_at.desc())

    # offset= (page-1) * page_size
    # notifications= query.offset(offset).limit(page_size).all()

    # logger.info(
    #     f"Listed notifications: user_id={current_user.id} "
    #     f"count={len(notifications)} unread_only={unread_only}"

    # )
    # return notifications
    return service.list_notifications_service(unread_only,page, page_size,current_user)


# get unread message count
@router.get("/unread-count")
def get_unread_count(
    # db:Session= Depends(get_db),
    current_user : User = Depends(get_current_user),
    service: NotificationService = Depends(get_notification_service)
):
    # count = db.query(Notification).filter(
    #     Notification.user_id == current_user.id,
    #     Notification.is_read == False
    # ).count()
    # return {"unread_count": count}
    return service.get_unread_count(current_user)


# mark_as_read api
@router.patch("/{notification_id}/read", response_model=NotificationResponse)
def mark_as_read(
    notification_id: int,
    # db:Session= Depends(get_db),
    current_user: User= Depends(get_current_user),
    service: NotificationService= Depends(get_notification_service)
):
    # notification= db.query(Notification).filter(
    #     Notification.id == notification_id, 
    #     Notification.user_id == current_user.id
    # ).first()

    # if not notification:
    #     raise HTTPException(
    #         status_code=status.HTTP_404_NOT_FOUND,
    #         detail="Notification not found"
    #     )
    
    # if notification.is_read:
    #     return notification
    
    # notification.is_read = True
    # db.commit()
    # db.refresh(notification)

    # logger.info(
    #     f"Notification {notification_id} marked as read"
    # )

    # return notification
    return service.mark_as_read(notification_id, current_user)


# mark all notification as read
@router.patch("/read-all", response_model=MessageResponse)
def mark_all_as_read(
    # db:Session = Depends(get_db), 
    current_user: User = Depends(get_current_user),
    service: NotificationService= Depends(get_notification_service)
    ):
    # update_count = db.query(Notification).filter(
    #     Notification.user_id == current_user.id,
    #     Notification.is_read == False
    # ).update({"is_read": True})

    # db.commit()
    # logger.info(
    #     f"Marked all notifications as read: user_id={current_user.id} count={update_count} "
    # )
    update_count = service.mark_all_as_read(current_user)
    return MessageResponse(message=f"{update_count} marked as read")# clear all notification 

# clear notification api
@router.delete("/clear-all", response_model=MessageResponse)
def clear_all_notification(
    # db:Session= Depends(get_db), 
    current_user: User= Depends(get_current_user),
    service: NotificationService = Depends(get_notification_service)
    ):
    # delete_count= db.query(Notification).filter(
    #     Notification.user_id == current_user.id
    # ).delete()

    # db.commit()
    # logger.info(f"All notification cleared by user_id={current_user.id}\n Deleted count = {delete_count} ")
    delete_count = service.clear_all_notification(current_user)
    return MessageResponse(message=f"{delete_count} notifications cleared")


# delete one notification api
@router.delete("/{notification_id}", response_model=MessageResponse)
def delete_one_notification(
    notification_id: int,
    # db: Session = Depends(get_db),
    current_user : User = Depends(get_current_user),
    service: NotificationService = Depends(get_notification_service)
):
    # notification = db.query(Notification).filter(
    #     Notification.id == notification_id,
    #     Notification.user_id == current_user.id
    # ).first()

    # if not notification:
    #     raise HTTPException(
    #         status_code=status.HTTP_404_NOT_FOUND,
    #         detail="Notification not found"
    #     )
    
    # db.delete(notification)
    # db.commit()

    # logger.info(f"Notification={notification_id} deleted by user_id={current_user.id}")
    service.delete_one_notification(notification_id, current_user)
    return MessageResponse(message=f"Notification deleted successfully")
