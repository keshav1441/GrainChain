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

class DocumentVerificationStatus(str, enum.Enum):
    NOT_SUBMITTED = "not_submitted"
    SUBMITTED = "submitted"
    UNDER_REVIEW = "under_review"
    APPROVED = "approved"
    REJECTED = "rejected"

class VerificationDocument(BaseModel):
    file_url: str
    file_name: str
    uploaded_at: datetime = Field(default_factory=datetime.utcnow)
    status: DocumentVerificationStatus = DocumentVerificationStatus.SUBMITTED
    rejection_reason: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    reviewed_by: Optional[str] = None

class Farmer(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    user_id: str
    
    # Farm details
    farm_name: Optional[str] = None
    farm_size_acres: Optional[float] = None
    farming_experience_years: Optional[int] = None
    primary_crops: Optional[str] = None
    farming_methods: Optional[str] = None
    annual_income: Optional[float] = None
    
    # Banking details
    bank_account_number: Optional[str] = None
    ifsc_code: Optional[str] = None
    
    # Verification documents for farmers
    land_ownership_doc: Optional[VerificationDocument] = None
    land_photo_with_farmer: Optional[VerificationDocument] = None
    address_proof: Optional[VerificationDocument] = None
    aadhar_card: Optional[VerificationDocument] = None
    pan_card: Optional[VerificationDocument] = None
    
    # Old document fields (for backward compatibility)
    land_ownership_doc_url: Optional[str] = None
    farmer_id_doc: Optional[str] = None
    bank_account_doc: Optional[str] = None
    
    # Verification status
    verification_submitted_at: Optional[datetime] = None
    verification_completed_at: Optional[datetime] = None
    
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
    institution_name: Optional[str] = None
    institution_type: Optional[str] = None  # bank, nbfc, cooperative, fintech
    license_number: Optional[str] = None
    registration_number: Optional[str] = None
    
    # Contact details
    contact_person_name: Optional[str] = None
    contact_person_designation: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    contact_phone: Optional[str] = None
    
    # Business details
    years_in_operation: Optional[int] = None
    total_assets: Optional[float] = None
    lending_portfolio_size: Optional[float] = None
    interest_rate_range: Optional[str] = None
    
    # Verification documents for finance partners
    aadhar_card: Optional[VerificationDocument] = None
    pan_card: Optional[VerificationDocument] = None
    company_id_docs: Optional[List[VerificationDocument]] = None
    
    # Old document fields (for backward compatibility)
    license_doc: Optional[str] = None
    registration_doc: Optional[str] = None
    financial_statements_doc: Optional[str] = None
    
    # Verification status
    verification_submitted_at: Optional[datetime] = None
    verification_completed_at: Optional[datetime] = None
    
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
