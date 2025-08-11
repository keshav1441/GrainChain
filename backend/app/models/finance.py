from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from bson import ObjectId
import enum
from app.models.transaction import PaymentStatus, PaymentMethod

class LoanStatus(str, enum.Enum):
    DRAFT = "draft"
    SUBMITTED = "submitted"
    UNDER_REVIEW = "under_review"
    APPROVED = "approved"
    REJECTED = "rejected"
    DISBURSED = "disbursed"
    ACTIVE = "active"
    COMPLETED = "completed"
    DEFAULTED = "defaulted"

class LoanType(str, enum.Enum):
    CROP_LOAN = "crop_loan"
    EQUIPMENT_LOAN = "equipment_loan"
    WORKING_CAPITAL = "working_capital"
    TERM_LOAN = "term_loan"
    KISAN_CREDIT_CARD = "kisan_credit_card"

class CreditScoreRange(str, enum.Enum):
    EXCELLENT = "excellent"  # 750+
    GOOD = "good"           # 650-749
    FAIR = "fair"           # 550-649
    POOR = "poor"           # <550

class LoanApplication(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    application_id: str
    
    # Applicant details
    farmer_id: str
    financier_id: Optional[str] = None
    
    # Loan details
    loan_type: LoanType
    requested_amount: float
    loan_purpose: str
    repayment_period_months: int
    
    # Approved loan terms (filled after approval)
    approved_amount: Optional[float] = None
    interest_rate: Optional[float] = None
    processing_fee: Optional[float] = None
    
    # Status and workflow
    status: LoanStatus = LoanStatus.DRAFT
    application_date: Optional[datetime] = None
    review_date: Optional[datetime] = None
    approval_date: Optional[datetime] = None
    disbursement_date: Optional[datetime] = None
    
    # Credit assessment
    credit_score: Optional[int] = None
    credit_score_range: Optional[CreditScoreRange] = None
    risk_assessment: Optional[str] = None
    
    # Documents
    income_proof_doc: Optional[str] = None
    land_documents: Optional[str] = None
    bank_statements: Optional[str] = None
    crop_insurance_doc: Optional[str] = None
    other_documents: Optional[List[str]] = None  # List of document URLs
    
    # Financier notes
    review_notes: Optional[str] = None
    rejection_reason: Optional[str] = None
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
        name = "loan_applications"
        indexes = [
            [("application_id", 1)],
            [("farmer_id", 1)],
            [("financier_id", 1)],
            [("status", 1)],
            [("loan_type", 1)],
            [("created_at", -1)]
        ]

class CreditScore(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    farmer_id: str
    
    # Overall score
    total_score: int  # 300-850 range
    score_range: CreditScoreRange
    
    # Score components
    payment_history_score: int = 0  # 35% weightage
    transaction_volume_score: int = 0  # 25% weightage
    platform_activity_score: int = 0  # 20% weightage
    verification_score: int = 0  # 10% weightage
    diversification_score: int = 0  # 10% weightage
    
    # Platform-specific metrics
    successful_transactions: int = 0
    total_sales_volume: float = 0.0
    average_rating: float = 0.0
    account_age_days: int = 0
    profile_completeness: float = 0.0  # 0-100%
    
    # External factors
    external_credit_score: Optional[int] = None  # From CIBIL/other agencies
    loan_defaults: int = 0
    
    # Score history
    last_calculated: datetime
    calculation_version: str = "1.0"
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
        name = "credit_scores"
        indexes = [
            [("farmer_id", 1)],
            [("total_score", 1)],
            [("score_range", 1)],
            [("last_calculated", -1)]
        ]

class Payment(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    payment_id: str
    
    # Payment details
    transaction_id: Optional[str] = None
    loan_application_id: Optional[str] = None
    
    # Amount details
    amount: float
    currency: str = "INR"
    payment_type: str  # transaction, loan_processing, commission
    
    # Payment gateway details
    gateway_provider: Optional[str] = None  # razorpay, stripe, payu
    gateway_payment_id: Optional[str] = None
    gateway_order_id: Optional[str] = None
    
    # Status
    status: PaymentStatus = PaymentStatus.PENDING
    payment_method: Optional[PaymentMethod] = None
    
    # Parties
    payer_user_id: str
    payee_user_id: Optional[str] = None
    
    # Timestamps
    initiated_at: datetime
    completed_at: Optional[datetime] = None
    failed_at: Optional[datetime] = None
    
    # Additional info
    description: Optional[str] = None
    failure_reason: Optional[str] = None
    receipt_url: Optional[str] = None
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
        name = "payments"
        indexes = [
            [("payment_id", 1)],
            [("transaction_id", 1)],
            [("loan_application_id", 1)],
            [("payer_user_id", 1)],
            [("payee_user_id", 1)],
            [("status", 1)],
            [("created_at", -1)]
        ]

class FinancialProduct(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    financier_id: str
    
    # Product details
    product_name: str
    product_type: LoanType
    description: Optional[str] = None
    
    # Terms and conditions
    min_amount: float
    max_amount: float
    min_tenure_months: int
    max_tenure_months: int
    interest_rate_min: float
    interest_rate_max: float
    processing_fee_percentage: float = 0.0
    
    # Eligibility criteria
    min_farm_size: Optional[float] = None
    min_experience_years: Optional[int] = None
    min_annual_income: Optional[float] = None
    eligible_states: Optional[List[str]] = None  # List of states
    eligible_crops: Optional[List[str]] = None  # List of crops
    min_credit_score: Optional[int] = None # Minimum credit score required
    
    # Product status
    is_active: bool = True
    is_featured: bool = False
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
        name = "financial_products"
        indexes = [
            [("financier_id", 1)],
            [("product_type", 1)],
            [("is_active", 1)],
            [("is_featured", 1)],
            [("eligible_states", 1)]
        ]
