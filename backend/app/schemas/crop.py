from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field
from app.models.crop import CropCategory, CropGrade, ListingStatus, InquiryStatus

# Crop Listing Schemas
class CropListingBase(BaseModel):
    crop_name: str
    category: CropCategory
    variety: Optional[str] = None
    quantity_available: float
    unit: str = "kg"
    price_per_kg: float
    min_order_quantity: Optional[float] = None
    grade: Optional[CropGrade] = None
    harvest_date: Optional[datetime] = None
    expiry_date: Optional[datetime] = None
    description: Optional[str] = None
    images: Optional[List[str]] = []
    certifications: Optional[List[str]] = []
    storage_location: Optional[str] = None

class CropListingCreate(CropListingBase):
    pass

class CropListingUpdate(BaseModel):
    crop_name: Optional[str] = None
    category: Optional[CropCategory] = None
    variety: Optional[str] = None
    quantity_available: Optional[float] = None
    unit: Optional[str] = None
    price_per_kg: Optional[float] = None
    min_order_quantity: Optional[float] = None
    grade: Optional[CropGrade] = None
    harvest_date: Optional[datetime] = None
    expiry_date: Optional[datetime] = None
    description: Optional[str] = None
    images: Optional[List[str]] = None
    certifications: Optional[List[str]] = None
    storage_location: Optional[str] = None
    status: Optional[ListingStatus] = None

class CropListingResponse(CropListingBase):
    id: str = Field(alias="_id")
    farmer_id: str
    status: ListingStatus
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        populate_by_name = True

# Inquiry Schemas
class InquiryBase(BaseModel):
    quantity_requested: float
    proposed_price: Optional[float] = None
    message: Optional[str] = None
    delivery_location: Optional[str] = None
    preferred_delivery_date: Optional[datetime] = None

class InquiryCreate(InquiryBase):
    listing_id: str

class InquiryUpdate(BaseModel):
    quantity_requested: Optional[float] = None
    proposed_price: Optional[float] = None
    message: Optional[str] = None
    delivery_location: Optional[str] = None
    preferred_delivery_date: Optional[datetime] = None

class InquiryResponse(InquiryBase):
    id: str = Field(alias="_id")
    listing_id: str
    buyer_id: str
    farmer_id: str
    status: InquiryStatus
    farmer_response: Optional[str] = None
    counter_price: Optional[float] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        populate_by_name = True

# Search and Filter Schemas
class CropSearchFilters(BaseModel):
    crop_name: Optional[str] = None
    category: Optional[CropCategory] = None
    state: Optional[str] = None
    city: Optional[str] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    min_quantity: Optional[float] = None
    max_quantity: Optional[float] = None
    grade: Optional[CropGrade] = None
    
class PaginationParams(BaseModel):
    skip: int = Field(0, ge=0)
    limit: int = Field(20, ge=1, le=100)
    sort_by: str = "created_at"
    sort_order: str = "desc"

# Market Price Schemas
class MarketPriceBase(BaseModel):
    crop_name: str
    market_name: str
    state: str
    district: Optional[str] = None
    min_price: float
    max_price: float
    average_price: float
    currency: str = "INR"
    unit: str = "per quintal"
    arrivals: Optional[float] = None
    date: datetime
    source: str = "manual"
    source_url: Optional[str] = None

class MarketPriceCreate(MarketPriceBase):
    pass

class MarketPriceResponse(MarketPriceBase):
    id: str = Field(alias="_id")
    created_at: datetime
    
    class Config:
        populate_by_name = True

# Farmer Response Schemas (for inquiries)
class FarmerInquiryResponse(BaseModel):
    status: InquiryStatus
    farmer_response: Optional[str] = None
    counter_price: Optional[float] = None
    proposed_delivery_date: Optional[datetime] = None
