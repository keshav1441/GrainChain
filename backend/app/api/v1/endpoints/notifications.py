"""
Notifications endpoints for GrainChain
Handles user notifications and alerts
"""
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId

from app.core.database import get_db, get_collection
from app.api.deps import get_current_user, get_current_active_user
from app.models.user import User
from app.schemas.notification import NotificationCreate, NotificationResponse, NotificationUpdate

router = APIRouter()

@router.get("", response_model=List[NotificationResponse])
async def get_notifications(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=100, description="Number of records to return"),
    read: Optional[bool] = None,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get notifications for the current user.
    """
    notifications_collection = get_collection("notifications")
    
    # Build query
    query = {"user_id": current_user.id}
    if read is not None:
        query["read"] = read
    
    # Get notifications
    cursor = notifications_collection.find(query).sort("created_at", -1).skip(skip).limit(limit)
    
    notifications = []
    async for notification in cursor:
        notification["id"] = str(notification["_id"])
        notifications.append(notification)
    
    return notifications

@router.patch("/{notification_id}/read", response_model=NotificationResponse)
async def mark_notification_as_read(
    notification_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Mark a notification as read.
    """
    notifications_collection = get_collection("notifications")
    
    # Check if notification exists and belongs to the user
    notification = await notifications_collection.find_one({
        "_id": ObjectId(notification_id),
        "user_id": current_user.id
    })
    
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    
    # Update notification
    update_data = {
        "read": True,
        "read_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    }
    
    await notifications_collection.update_one(
        {"_id": ObjectId(notification_id)},
        {"$set": update_data}
    )
    
    # Get updated notification
    updated_notification = await notifications_collection.find_one({"_id": ObjectId(notification_id)})
    updated_notification["id"] = str(updated_notification["_id"])
    
    return updated_notification

@router.patch("/read-all", response_model=dict)
async def mark_all_notifications_as_read(
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Mark all notifications as read for the current user.
    """
    notifications_collection = get_collection("notifications")
    
    update_data = {
        "read": True,
        "read_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    }
    
    result = await notifications_collection.update_many(
        {"user_id": current_user.id, "read": False},
        {"$set": update_data}
    )
    
    return {"message": f"Marked {result.modified_count} notifications as read"}

@router.delete("/{notification_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_notification(
    notification_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Delete a notification.
    """
    notifications_collection = get_collection("notifications")
    
    # Check if notification exists and belongs to the user
    notification = await notifications_collection.find_one({
        "_id": ObjectId(notification_id),
        "user_id": current_user.id
    })
    
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    
    await notifications_collection.delete_one({"_id": ObjectId(notification_id)})
    
    return {"message": "Notification deleted successfully"}
