"""
Finance API endpoints for GrainChain
Handles loan applications, payments, and financial services
"""

from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict, Any, Optional
import logging

from ....core.finance_service import finance_service
from ....api.deps import get_current_user, get_db
from ....models.user import User
from ....models.finance import LoanApplication, LoanStatus, LoanType, Payment, FinancialProduct as LoanProduct
from pydantic import BaseModel
from ....core.finance_service import FinanceService

logger = logging.getLogger(__name__)

router = APIRouter()

# Request/Response Models
class LoanApplicationRequest(BaseModel):
    loan_type: LoanType
    requested_amount: float
    loan_purpose: str
    repayment_period_months: int
    income_proof_doc: Optional[str] = None
    land_documents: Optional[str] = None
    bank_statements: Optional[str] = None
    crop_insurance_doc: Optional[str] = None
    other_documents: Optional[List[str]] = None

class LoanReviewRequest(BaseModel):
    decision: str  # "approve" or "reject"
    notes: Optional[str] = None

class PaymentRequest(BaseModel):
    payee_id: str
    amount: float
    payment_type: str
    description: Optional[str] = None

class LoanEligibilityResponse(BaseModel):
    farmer_id: str
    credit_score: int
    credit_range: str
    loan_eligible: bool
    max_loan_amount: float
    interest_rate_range: Dict[str, float]
    available_products: List[Dict[str, Any]]
    recommendations: List[str]
    risk_assessment: str

class DisbursementResponse(BaseModel):
    application_id: str
    payment_id: str
    amount: float
    status: str


@router.post("/loan-applications", response_model=LoanApplication)
async def create_loan_application(
    request: LoanApplicationRequest,
    current_user: User = Depends(get_current_user)
):
    """Create a new loan application"""
    try:
        # Only farmers can apply for loans
        if current_user.role != "farmer":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only farmers can apply for loans"
            )
        
        # Initialize finance service
        await finance_service.initialize()
        
        # Create loan application
        loan_app = await finance_service.create_loan_application(
            farmer_id=current_user.id,
            loan_data=request.dict()
        )
        
        return loan_app
        
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating loan application: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")


@router.post("/loan-applications/{application_id}/submit", response_model=LoanApplication)
async def submit_loan_application(
    application_id: str,
    current_user: User = Depends(get_current_user)
):
    """Submit loan application for review"""
    try:
        # Only farmers can submit their own applications
        if current_user.role != "farmer":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only farmers can submit loan applications"
            )
        
        await finance_service.initialize()
        
        # Submit application
        loan_app = await finance_service.submit_loan_application(application_id)
        
        # Verify ownership
        if loan_app.farmer_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only submit your own loan applications"
            )
        
        return loan_app
        
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Error submitting loan application: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")


@router.post("/loan-applications/{application_id}/review", response_model=LoanApplication)
async def review_loan_application(
    application_id: str,
    request: LoanReviewRequest,
    current_user: User = Depends(get_current_user)
):
    """Review loan application (financier only)"""
    try:
        # Only financiers can review applications
        if current_user.role != "financier":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only financiers can review loan applications"
            )
        
        await finance_service.initialize()
        
        # Review application
        loan_app = await finance_service.review_loan_application(
            application_id=application_id,
            financier_id=current_user.id,
            decision=request.decision,
            notes=request.notes
        )
        
        return loan_app
        
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Error reviewing loan application: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")


@router.post("/loan-applications/{application_id}/disburse", response_model=DisbursementResponse)
async def disburse_loan(
    application_id: str,
    current_user: User = Depends(get_current_user)
):
    """Disburse approved loan (financier only)"""
    try:
        # Only financiers can disburse loans
        if current_user.role != "financier":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only financiers can disburse loans"
            )
        
        await finance_service.initialize()
        
        # Disburse loan
        result = await finance_service.disburse_loan(application_id)
        
        return DisbursementResponse(**result)
        
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Error disbursing loan: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")


@router.get("/loan-applications", response_model=List[LoanApplication])
async def get_loan_applications(
    status_filter: Optional[str] = None,
    current_user: User = Depends(get_current_user),
) -> List[LoanApplication]:
    """Get loan applications based on user role"""
    try:
        await finance_service.initialize()

        farmer_id = None
        financier_id = None

        if current_user.role == "farmer":
            farmer_id = current_user.id
        elif current_user.role == "financier":
            financier_id = current_user.id

        status = LoanStatus(status_filter) if status_filter else None

        applications = await finance_service.get_loan_applications(
            farmer_id=farmer_id, 
            financier_id=financier_id,
            status=status
        )
        return applications
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid status filter: {status_filter}")
    except Exception as e:
        logger.error(f"Error getting loan applications: {e}")
        raise HTTPException(status_code=500, detail="Could not retrieve loan applications.")


@router.get("/loan-applications/{application_id}", response_model=LoanApplication)
async def get_loan_application(
    application_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get specific loan application"""
    try:
        await finance_service.initialize()
        
        # Get all applications for the user
        if current_user.role == "farmer":
            loan_apps = await finance_service.get_loan_applications(farmer_id=current_user.id)
        elif current_user.role == "financier":
            loan_apps = await finance_service.get_loan_applications(financier_id=current_user.id)
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        # Find the specific application
        loan_app = None
        for app in loan_apps:
            if app.application_id == application_id:
                loan_app = app
                break
        
        if not loan_app:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Loan application not found"
            )
        
        return loan_app
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting loan application: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")


@router.get("/eligibility", response_model=LoanEligibilityResponse)
async def get_loan_eligibility(
    current_user: User = Depends(get_current_user),
    db=Depends(get_db)
) -> LoanEligibilityResponse:
    """Get loan eligibility for current farmer"""
    if current_user.role != 'farmer':
        raise HTTPException(status_code=403, detail="Only farmers can check eligibility.")

    try:
        await finance_service.initialize()
        
        eligibility_data = await finance_service.get_loan_eligibility(current_user.id)
        
        return LoanEligibilityResponse(**eligibility_data)
        
    except Exception as e:
        logger.error(f"Error getting loan eligibility: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="Could not load eligibility data."
        )


@router.post("/payments", response_model=Dict[str, str])
async def create_payment(
    request: PaymentRequest,
    current_user: User = Depends(get_current_user)
):
    """Create a payment transaction"""
    try:
        await finance_service.initialize()
        
        # Process payment
        payment_id = await finance_service.process_payment(
            payer_id=current_user.id,
            payee_id=request.payee_id,
            amount=request.amount,
            payment_type=request.payment_type,
            description=request.description
        )
        
        return {"payment_id": payment_id, "status": "processing"}
        
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating payment: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")


@router.get("/payments", response_model=List[Payment])
async def get_payment_history(
    limit: int = 50,
    current_user: User = Depends(get_current_user)
):
    """Get payment history for current user"""
    try:
        await finance_service.initialize()
        
        # Get payment history
        payments = await finance_service.get_payment_history(
            user_id=current_user.id,
            limit=limit
        )
        
        return payments
        
    except Exception as e:
        logger.error(f"Error getting payment history: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")


@router.get("/loan-products", response_model=List[LoanProduct])
async def get_loan_products(db=Depends(get_db)):
    """Get all available loan products"""
    products_cursor = db.financial_products.find({"is_active": True})
    return [LoanProduct(**p) async for p in products_cursor]

@router.get("/payments/{payment_id}", response_model=Payment)
async def get_payment_details(
    payment_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get specific payment details"""
    try:
        await finance_service.initialize()
        
        # Get payment history and find the specific payment
        payments = await finance_service.get_payment_history(
            user_id=current_user.id,
            limit=1000  # Large limit to search through all payments
        )
        
        payment = None
        for p in payments:
            if p.payment_id == payment_id:
                payment = p
                break
        
        if not payment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Payment not found"
            )
        
        return payment
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting payment details: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")


# Admin endpoints (for future use)
@router.get("/admin/loan-applications", response_model=List[LoanApplication])
async def get_all_loan_applications(
    status_filter: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    """Get all loan applications (admin only)"""
    try:
        # Only admin can view all applications
        if current_user.role != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required"
            )
        
        await finance_service.initialize()
        
        # Parse status filter
        status_enum = None
        if status_filter:
            try:
                status_enum = LoanStatus(status_filter)
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid status: {status_filter}"
                )
        
        # Get all applications
        loan_apps = await finance_service.get_loan_applications(status=status_enum)
        
        return loan_apps
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting all loan applications: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")


@router.get("/admin/payments", response_model=List[Payment])
async def get_all_payments(
    limit: int = 100,
    current_user: User = Depends(get_current_user)
):
    """Get all payments (admin only)"""
    try:
        # Only admin can view all payments
        if current_user.role != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required"
            )
        
        await finance_service.initialize()
        
        # Get all payments (using system user ID)
        payments = await finance_service.get_payment_history(
            user_id="system",  # This would need to be modified in the service
            limit=limit
        )
        
        return payments
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting all payments: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")
