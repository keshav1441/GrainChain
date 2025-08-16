from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from bson import ObjectId
import enum

class OrderStatus(str, enum.Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"

class PaymentStatus(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"

class PaymentMethod(str, enum.Enum):
    UPI = "upi"
    CARD = "card"
    NETBANKING = "netbanking"
    WALLET = "wallet"
    COD = "cod"

class CartItem(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    user_id: str
    crop_listing_id: str
    
    # Product details (denormalized for performance)
    crop_type: str
    farmer_id: str
    farmer_name: str
    price_per_kg: float
    location: str
    
    # Cart specific
    quantity: float  # in kg
    max_quantity: float  # available quantity
    added_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
    
    class Settings:
        name = "cart_items"
        indexes = [
            [("user_id", 1)],
            [("crop_listing_id", 1)],
            [("added_at", -1)]
        ]

class DeliveryAddress(BaseModel):
    name: str
    phone: str
    address: str
    city: str
    state: str
    pincode: str
    landmark: Optional[str] = None

class OrderItem(BaseModel):
    crop_listing_id: str
    crop_type: str
    farmer_id: str
    farmer_name: str
    quantity: float  # in kg
    price_per_kg: float
    total_price: float
    location: str

class Order(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    order_id: str  # Generated unique order ID (e.g., GC1234567890)
    user_id: str
    
    # Order items
    items: List[OrderItem]
    
    # Pricing
    subtotal: float
    platform_fee: float
    delivery_fee: float = 0.0
    total_amount: float
    
    # Delivery details
    delivery_address: DeliveryAddress
    estimated_delivery_date: Optional[datetime] = None
    actual_delivery_date: Optional[datetime] = None
    
    # Status tracking
    status: OrderStatus = OrderStatus.PENDING
    payment_status: PaymentStatus = PaymentStatus.PENDING
    payment_method: Optional[PaymentMethod] = None
    
    # Payment details
    payment_id: Optional[str] = None
    payment_gateway_response: Optional[dict] = None
    payment_date: Optional[datetime] = None
    
    # Tracking
    tracking_number: Optional[str] = None
    carrier: Optional[str] = None
    
    # Notes and special instructions
    order_notes: Optional[str] = None
    special_instructions: Optional[str] = None
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None
    confirmed_at: Optional[datetime] = None
    shipped_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None
    
    # Cancellation details
    cancelled_at: Optional[datetime] = None
    cancellation_reason: Optional[str] = None
    cancelled_by: Optional[str] = None  # user_id who cancelled
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
    
    class Settings:
        name = "orders"
        indexes = [
            [("order_id", 1)],
            [("user_id", 1)],
            [("status", 1)],
            [("payment_status", 1)],
            [("created_at", -1)],
            [("updated_at", -1)]
        ]

class Payment(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    payment_id: str  # Generated unique payment ID
    order_id: str
    user_id: str
    
    # Payment details
    amount: float
    currency: str = "INR"
    payment_method: PaymentMethod
    status: PaymentStatus = PaymentStatus.PENDING
    
    # Gateway details
    gateway_name: Optional[str] = None  # razorpay, payu, etc.
    gateway_payment_id: Optional[str] = None
    gateway_order_id: Optional[str] = None
    gateway_signature: Optional[str] = None
    gateway_response: Optional[dict] = None
    
    # Transaction details
    transaction_id: Optional[str] = None
    reference_number: Optional[str] = None
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    failed_at: Optional[datetime] = None
    
    # Failure details
    failure_reason: Optional[str] = None
    failure_code: Optional[str] = None
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
    
    class Settings:
        name = "payments"
        indexes = [
            [("payment_id", 1)],
            [("order_id", 1)],
            [("user_id", 1)],
            [("status", 1)],
            [("created_at", -1)]
        ]

class OrderStatusHistory(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    order_id: str
    
    # Status change details
    from_status: Optional[OrderStatus] = None
    to_status: OrderStatus
    changed_by: Optional[str] = None  # user_id or system
    reason: Optional[str] = None
    notes: Optional[str] = None
    
    # Timestamp
    changed_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
    
    class Settings:
        name = "order_status_history"
        indexes = [
            [("order_id", 1)],
            [("changed_at", -1)]
        ]
