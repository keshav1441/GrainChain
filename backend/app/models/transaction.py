from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from bson import ObjectId
import enum

class TransactionStatus(str, enum.Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    IN_TRANSIT = "in_transit"
    DELIVERED = "delivered"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    DISPUTED = "disputed"

class PaymentStatus(str, enum.Enum):
    PENDING = "pending"
    PAID = "paid"
    PARTIAL = "partial"
    FAILED = "failed"
    REFUNDED = "refunded"

class PaymentMethod(str, enum.Enum):
    BANK_TRANSFER = "bank_transfer"
    UPI = "upi"
    CARD = "card"
    WALLET = "wallet"
    CASH = "cash"

class Transaction(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    transaction_id: str  # Generated unique ID
    
    # Parties involved
    buyer_id: str
    farmer_id: str
    listing_id: str
    
    # Transaction details
    quantity: float
    price_per_unit: float
    total_amount: float
    platform_commission: float = 0.0
    net_farmer_amount: float
    
    # Status tracking
    status: TransactionStatus = TransactionStatus.PENDING
    payment_status: PaymentStatus = PaymentStatus.PENDING
    payment_method: Optional[PaymentMethod] = None
    
    # Delivery details
    pickup_address: Optional[str] = None
    delivery_address: Optional[str] = None
    expected_delivery_date: Optional[datetime] = None
    actual_delivery_date: Optional[datetime] = None
    
    # Quality and inspection
    quality_check_required: bool = True
    quality_check_passed: Optional[bool] = None
    quality_notes: Optional[str] = None
    
    # Documents and proof
    contract_document: Optional[str] = None
    delivery_receipt: Optional[str] = None
    quality_certificate: Optional[str] = None
    
    # Payment tracking
    payment_gateway_id: Optional[str] = None
    payment_date: Optional[datetime] = None
    payment_reference: Optional[str] = None
    
    # Ratings and feedback
    buyer_rating: Optional[int] = None  # 1-5
    farmer_rating: Optional[int] = None  # 1-5
    buyer_feedback: Optional[str] = None
    farmer_feedback: Optional[str] = None
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    
    class Settings:
        name = "transactions"
        indexes = [
            [("transaction_id", 1)],
            [("buyer_id", 1)],
            [("farmer_id", 1)],
            [("listing_id", 1)],
            [("status", 1)],
            [("payment_status", 1)],
            [("created_at", -1)]
        ]

class Notification(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    user_id: str
    
    # Notification content
    title: str
    message: str
    notification_type: str  # price_alert, inquiry, transaction, etc.
    
    # Related entities
    related_entity_type: Optional[str] = None  # listing, transaction, inquiry
    related_entity_id: Optional[str] = None
    
    # Status
    is_read: bool = False
    is_sent: bool = False
    
    # Delivery channels
    send_email: bool = True
    send_sms: bool = False
    send_push: bool = True
    
    # Scheduling
    scheduled_at: Optional[datetime] = None
    sent_at: Optional[datetime] = None
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "notifications"
        indexes = [
            [("user_id", 1)],
            [("notification_type", 1)],
            [("is_read", 1)],
            [("is_sent", 1)],
            [("created_at", -1)]
        ]

class PriceAlert(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    user_id: str
    
    # Alert criteria
    crop_name: str
    crop_category: Optional[str] = None
    location_state: Optional[str] = None
    location_district: Optional[str] = None
    
    # Price thresholds
    target_price: float
    alert_type: str  # above, below, change_percent
    threshold_percentage: Optional[float] = None  # for percentage change alerts
    
    # Alert settings
    is_active: bool = True
    frequency: str = "immediate"  # immediate, daily, weekly
    last_triggered: Optional[datetime] = None
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
        name = "price_alerts"
        indexes = [
            [("user_id", 1)],
            [("crop_name", 1)],
            [("is_active", 1)],
            [("location_state", 1)]
        ]
