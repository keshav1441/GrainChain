from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from app.models.cart import OrderStatus, PaymentStatus, PaymentMethod

# Cart Schemas
class CartItemCreate(BaseModel):
    crop_listing_id: str
    quantity: float

class CartItemUpdate(BaseModel):
    quantity: float

class CartItemResponse(BaseModel):
    id: str
    crop_listing_id: str
    crop_type: str
    farmer_id: str
    farmer_name: str
    price_per_kg: float
    location: str
    quantity: float
    max_quantity: float
    total_price: float
    added_at: datetime

class CartSummary(BaseModel):
    items: List[CartItemResponse]
    total_items: int
    subtotal: float
    platform_fee: float
    total_amount: float

# Order Schemas
class DeliveryAddressCreate(BaseModel):
    name: str
    phone: str
    address: str
    city: str
    state: str
    pincode: str
    landmark: Optional[str] = None

class OrderItemCreate(BaseModel):
    crop_listing_id: str
    quantity: float

class OrderCreate(BaseModel):
    items: List[OrderItemCreate]
    delivery_address: DeliveryAddressCreate
    payment_method: PaymentMethod
    order_notes: Optional[str] = None
    special_instructions: Optional[str] = None

class OrderItemResponse(BaseModel):
    crop_listing_id: str
    crop_type: str
    farmer_id: str
    farmer_name: str
    quantity: float
    price_per_kg: float
    total_price: float
    location: str

class DeliveryAddressResponse(BaseModel):
    name: str
    phone: str
    address: str
    city: str
    state: str
    pincode: str
    landmark: Optional[str] = None

class OrderResponse(BaseModel):
    id: str
    order_id: str
    user_id: str
    items: List[OrderItemResponse]
    subtotal: float
    platform_fee: float
    delivery_fee: float
    total_amount: float
    delivery_address: DeliveryAddressResponse
    status: OrderStatus
    payment_status: PaymentStatus
    payment_method: Optional[PaymentMethod] = None
    estimated_delivery_date: Optional[datetime] = None
    tracking_number: Optional[str] = None
    order_notes: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

class OrderListResponse(BaseModel):
    orders: List[OrderResponse]
    total_count: int
    page: int
    limit: int

class OrderStatusUpdate(BaseModel):
    status: OrderStatus
    notes: Optional[str] = None

# Payment Schemas
class PaymentCreate(BaseModel):
    order_id: str
    payment_method: PaymentMethod
    gateway_name: Optional[str] = None

class PaymentResponse(BaseModel):
    id: str
    payment_id: str
    order_id: str
    amount: float
    currency: str
    payment_method: PaymentMethod
    status: PaymentStatus
    gateway_payment_id: Optional[str] = None
    gateway_order_id: Optional[str] = None
    created_at: datetime

class PaymentVerification(BaseModel):
    payment_id: str
    gateway_payment_id: str
    gateway_order_id: str
    gateway_signature: str

class PaymentCallback(BaseModel):
    payment_id: str
    order_id: str
    status: str
    gateway_response: dict

# Statistics and Analytics
class OrderStats(BaseModel):
    total_orders: int
    pending_orders: int
    completed_orders: int
    cancelled_orders: int
    total_revenue: float
    average_order_value: float

class UserOrderHistory(BaseModel):
    orders: List[OrderResponse]
    stats: OrderStats
