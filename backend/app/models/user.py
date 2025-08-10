from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime
from bson import ObjectId
import enum

class UserRole(str, enum.Enum):
    FARMER = "farmer"
    BUYER = "buyer"
    FINANCIER = "financier"
    ADMIN = "admin"

class VerificationStatus(str, enum.Enum):
    PENDING = "pending"
    VERIFIED = "verified"
    REJECTED = "rejected"

class User(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    email: EmailStr
    phone: str
    hashed_password: str
    full_name: str
    role: UserRole
    
    # Location data
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: str = "India"
    pincode: Optional[str] = None
    
    # Profile data
    profile_image_url: Optional[str] = None
    verification_status: VerificationStatus = VerificationStatus.PENDING
    is_active: bool = True
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None
    last_login: Optional[datetime] = None
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class Farmer(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    user_id: str
    
    # Farm details
    farm_name: Optional[str] = None
    farm_size_acres: float
    farming_experience_years: int
    primary_crops: Optional[str] = None
    farming_methods: Optional[str] = None
    annual_income: Optional[float] = None
    
    # Banking details
    bank_account_number: Optional[str] = None
    ifsc_code: Optional[str] = None
    
    # Document uploads
    land_ownership_doc: Optional[str] = None
    farmer_id_doc: Optional[str] = None
    bank_account_doc: Optional[str] = None
    
    # Platform metrics
    total_sales: float = 0.0
    successful_transactions: int = 0
    average_rating: float = 0.0
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class Buyer(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    user_id: str
    
    # Company details
    company_name: str
    company_type: Optional[str] = None
    gst_number: Optional[str] = None
    pan_number: Optional[str] = None
    annual_procurement_volume: Optional[float] = None
    procurement_categories: Optional[str] = None
    preferred_regions: Optional[str] = None
    
    # Document uploads
    company_registration_doc: Optional[str] = None
    gst_certificate_doc: Optional[str] = None
    trade_license_doc: Optional[str] = None
    
    # Platform metrics
    total_purchases: float = 0.0
    successful_transactions: int = 0
    average_rating: float = 0.0
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class Financier(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    user_id: str
    
    # Institution details
    institution_name: str
    institution_type: str  # bank, nbfc, cooperative, fintech
    license_number: Optional[str] = None
    registration_number: Optional[str] = None
    
    # Contact details
    contact_person_name: str
    contact_person_designation: str
    contact_email: EmailStr
    contact_phone: str
    
    # Business details
    years_in_operation: int
    total_assets: Optional[float] = None
    lending_portfolio_size: Optional[float] = None
    interest_rate_range: Optional[str] = None
    
    # Document uploads
    license_doc: Optional[str] = None
    registration_doc: Optional[str] = None
    financial_statements_doc: Optional[str] = None
    
    # Platform metrics
    total_loans_disbursed: float = 0.0
    active_loans: int = 0
    default_rate: float = 0.0
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
