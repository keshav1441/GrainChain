from pydantic import BaseModel, EmailStr, validator
from typing import Optional, List
from datetime import datetime
from app.models.user import UserRole, VerificationStatus

# Base schemas
class UserBase(BaseModel):
    email: EmailStr
    phone: str
    full_name: str
    role: UserRole
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: str = "India"
    pincode: Optional[str] = None

class UserCreate(UserBase):
    password: str
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        return v

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    profile_image_url: Optional[str] = None

class UserResponse(UserBase):
    id: str
    verification_status: VerificationStatus
    is_active: bool
    profile_image_url: Optional[str] = None
    created_at: datetime
    last_login: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Farmer schemas
class FarmerBase(BaseModel):
    farm_name: Optional[str] = None
    farm_size_acres: float
    farming_experience_years: int
    primary_crops: Optional[str] = None
    farming_methods: Optional[str] = None
    annual_income: Optional[float] = None
    bank_account_number: Optional[str] = None
    ifsc_code: Optional[str] = None

class FarmerCreate(FarmerBase):
    pass

class FarmerUpdate(BaseModel):
    farm_name: Optional[str] = None
    farm_size_acres: Optional[float] = None
    farming_experience_years: Optional[int] = None
    primary_crops: Optional[str] = None
    farming_methods: Optional[str] = None
    annual_income: Optional[float] = None
    bank_account_number: Optional[str] = None
    ifsc_code: Optional[str] = None

class FarmerResponse(FarmerBase):
    id: str
    user_id: str
    land_ownership_doc: Optional[str] = None
    farmer_id_doc: Optional[str] = None
    bank_account_doc: Optional[str] = None
    total_sales: float
    successful_transactions: int
    average_rating: float
    created_at: datetime
    
    class Config:
        from_attributes = True

# Buyer schemas
class BuyerBase(BaseModel):
    company_name: str
    company_type: Optional[str] = None
    gst_number: Optional[str] = None
    pan_number: Optional[str] = None
    annual_procurement_volume: Optional[float] = None
    procurement_categories: Optional[str] = None
    preferred_regions: Optional[str] = None

class BuyerCreate(BuyerBase):
    pass

class BuyerUpdate(BaseModel):
    company_name: Optional[str] = None
    company_type: Optional[str] = None
    gst_number: Optional[str] = None
    pan_number: Optional[str] = None
    annual_procurement_volume: Optional[float] = None
    procurement_categories: Optional[str] = None
    preferred_regions: Optional[str] = None

class BuyerResponse(BuyerBase):
    id: str
    user_id: str
    company_registration_doc: Optional[str] = None
    gst_certificate_doc: Optional[str] = None
    trade_license_doc: Optional[str] = None
    total_purchases: float
    successful_transactions: int
    average_rating: float
    created_at: datetime
    
    class Config:
        from_attributes = True

# Financier schemas
class FinancierBase(BaseModel):
    institution_name: str
    institution_type: Optional[str] = None
    license_number: Optional[str] = None
    min_loan_amount: Optional[float] = None
    max_loan_amount: Optional[float] = None
    interest_rate_min: Optional[float] = None
    interest_rate_max: Optional[float] = None
    loan_tenure_months: Optional[int] = None
    service_states: Optional[str] = None
    loan_categories: Optional[str] = None

class FinancierCreate(FinancierBase):
    pass

class FinancierUpdate(BaseModel):
    institution_name: Optional[str] = None
    institution_type: Optional[str] = None
    license_number: Optional[str] = None
    min_loan_amount: Optional[float] = None
    max_loan_amount: Optional[float] = None
    interest_rate_min: Optional[float] = None
    interest_rate_max: Optional[float] = None
    loan_tenure_months: Optional[int] = None
    service_states: Optional[str] = None
    loan_categories: Optional[str] = None

class FinancierResponse(FinancierBase):
    id: int
    user_id: int
    institution_license_doc: Optional[str] = None
    rbi_certificate_doc: Optional[str] = None
    total_loans_disbursed: float
    active_loans_count: int
    average_rating: float
    created_at: datetime
    
    class Config:
        from_attributes = True

# Authentication schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class TokenData(BaseModel):
    user_id: Optional[str] = None
    role: Optional[str] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

# Complete user profile response
class UserProfileResponse(BaseModel):
    user: UserResponse
    farmer_profile: Optional[FarmerResponse] = None
    buyer_profile: Optional[BuyerResponse] = None
    financier_profile: Optional[FinancierResponse] = None
    
    class Config:
        from_attributes = True
