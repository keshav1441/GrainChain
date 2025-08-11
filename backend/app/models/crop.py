from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from bson import ObjectId
import enum

class CropCategory(str, enum.Enum):
    CEREALS = "cereals"
    PULSES = "pulses"
    OILSEEDS = "oilseeds"
    SPICES = "spices"
    FRUITS = "fruits"
    VEGETABLES = "vegetables"
    CASH_CROPS = "cash_crops"

class CropGrade(str, enum.Enum):
    A_GRADE = "a_grade"
    B_GRADE = "b_grade"
    C_GRADE = "c_grade"
    PREMIUM = "premium"
    STANDARD = "standard"

class ListingStatus(str, enum.Enum):
    ACTIVE = "active"
    SOLD = "sold"
    EXPIRED = "expired"
    DRAFT = "draft"

class InquiryStatus(str, enum.Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    NEGOTIATING = "negotiating"
    COMPLETED = "completed"

class CropListing(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    farmer_id: str
    farmer_name: str
    
    # Crop details
    crop_name: str
    category: CropCategory
    variety: Optional[str] = None
    quantity_available: float  # in kg or tons
    unit: str = "kg"  # kg, tons, quintals
    price_per_unit: float  # per ton
    min_order_quantity: Optional[float] = None
    
    # Harvest details
    harvest_date: Optional[datetime] = None
    expected_harvest_date: Optional[datetime] = None
    organic_certified: bool = False
    harvest_date: Optional[datetime] = None
    expiry_date: Optional[datetime] = None
    
    # Pricing
    price_per_unit: float
    currency: str = "INR"
    price_negotiable: bool = True
    
    # Location
    farm_location: Optional[str] = None
    pickup_location: str
    delivery_available: bool = False
    delivery_radius_km: Optional[float] = None
    
    # Listing details
    title: str
    description: Optional[str] = None
    images: Optional[List[str]] = None  # List of image URLs
    
    # Status
    is_active: bool = True
    is_sold: bool = False
    views_count: int = 0
    inquiries_count: int = 0
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class Inquiry(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    buyer_id: str
    crop_listing_id: str
    farmer_id: str  # Denormalized for easier queries
    
    # Inquiry details
    message: str
    quantity_requested: float
    proposed_price: Optional[float] = None
    pickup_date: Optional[datetime] = None
    
    # Status
    status: InquiryStatus = InquiryStatus.PENDING
    
    # Response from farmer
    farmer_response: Optional[str] = None
    farmer_counter_price: Optional[float] = None
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None
    responded_at: Optional[datetime] = None
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class MarketPrice(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    # Crop identification
    crop_name: str
    market_name: str
    state: str
    district: Optional[str] = None
    
    # Price data
    min_price: float
    max_price: float
    average_price: float
    currency: str = "INR"
    unit: str = "per quintal"
    
    # Market data
    arrivals: Optional[float] = None  # Quantity arrived in market
    date: datetime
    
    # Data source
    source: str = "manual"  # manual, api, scraping
    source_url: Optional[str] = None
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
