"""
Notification schemas for GrainChain
"""
from datetime import datetime
from enum import Enum
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class NotificationType(str, Enum):
    """Types of notifications"""
    INFO = "info"
    SUCCESS = "success"
    WARNING = "warning"
    ERROR = "error"
    ORDER = "order"
    PAYMENT = "payment"
    SHIPMENT = "shipment"
    PROMOTION = "promotion"
    SYSTEM = "system"

class NotificationPriority(str, Enum):
    """Notification priority levels"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"

class NotificationBase(BaseModel):
    """Base notification schema"""
    user_id: str = Field(..., description="ID of the user receiving the notification")
    type: NotificationType = Field(..., description="Type of notification")
    title: str = Field(..., max_length=200, description="Notification title")
    message: str = Field(..., description="Notification message")
    priority: NotificationPriority = Field(
        default=NotificationPriority.MEDIUM, 
        description="Notification priority"
    )
    read: bool = Field(default=False, description="Whether the notification has been read")
    data: Optional[Dict[str, Any]] = Field(
        default_factory=dict, 
        description="Additional data related to the notification"
    )

class NotificationCreate(NotificationBase):
    """Schema for creating a new notification"""
    pass

class NotificationUpdate(BaseModel):
    """Schema for updating a notification"""
    read: Optional[bool] = None
    data: Optional[Dict[str, Any]] = None

class NotificationResponse(NotificationBase):
    """Notification response schema"""
    id: str = Field(..., alias="_id")
    created_at: datetime
    updated_at: Optional[datetime] = None
    read_at: Optional[datetime] = None

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None
        }
        schema_extra = {
            "example": {
                "id": "60d5f1b3f1b3f1b3f1b3f1b3",
                "user_id": "60d5f1b3f1b3f1b3f1b3f1b4",
                "type": "order",
                "title": "Order Confirmed",
                "message": "Your order #12345 has been confirmed",
                "priority": "high",
                "read": False,
                "data": {
                    "order_id": "60d5f1b3f1b3f1b3f1b3f1b5",
                    "amount": 99.99
                },
                "created_at": "2023-01-01T12:00:00Z",
                "updated_at": None,
                "read_at": None
            }
        }
