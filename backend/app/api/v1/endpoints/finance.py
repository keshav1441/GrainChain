"""
Finance API endpoints for GrainChain
Handles loan applications, payments, and financial services
"""
import os
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict, Any, Optional
import logging
from datetime import datetime
from ....core.finance_service import finance_service
from ....api.deps import get_current_user, get_db
from ....core.database import get_collection
from ....models.user import User
from ....models.finance import LoanApplication, LoanStatus, LoanType, Payment, FinancialProduct as LoanProduct
from pydantic import BaseModel
from ....core.finance_service import FinanceService
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

logger = logging.getLogger(__name__)

# Create the main router
router = APIRouter(prefix="/finance", tags=["finance"])

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


# Financier Dashboard Endpoints
class FinancierStatsResponse(BaseModel):
    active_loans_value: float
    active_loans_count: int
    loan_applications_count: int
    pending_applications_count: int
    active_farmers_count: int
    new_farmers_this_month: int
    default_rate: float
    default_rate_change: float

@router.get("/financier/dashboard/stats", response_model=FinancierStatsResponse)
async def get_financier_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db=Depends(get_db)
):
    """Get dashboard statistics for financier"""
    try:
        if current_user.role != "financier":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only financiers can access dashboard stats"
            )
        
        await finance_service.initialize()
        
        # Get all loan applications for this financier
        all_applications = await finance_service.get_loan_applications(financier_id=current_user.id)
        
        # Calculate stats
        active_loans = [app for app in all_applications if app.status == LoanStatus.DISBURSED]
        pending_applications = [app for app in all_applications if app.status in [LoanStatus.SUBMITTED, LoanStatus.UNDER_REVIEW]]
        
        active_loans_value = sum(app.requested_amount for app in active_loans)
        active_loans_count = len(active_loans)
        loan_applications_count = len(all_applications)
        pending_applications_count = len(pending_applications)
        
        # Get unique farmers count
        unique_farmers = set(app.farmer_id for app in all_applications)
        active_farmers_count = len(unique_farmers)
        
        # For demo purposes, calculate some mock values
        new_farmers_this_month = max(0, int(active_farmers_count * 0.1))
        default_rate = 2.1  # Mock default rate
        default_rate_change = -0.3  # Mock change
        
        return FinancierStatsResponse(
            active_loans_value=active_loans_value,
            active_loans_count=active_loans_count,
            loan_applications_count=loan_applications_count,
            pending_applications_count=pending_applications_count,
            active_farmers_count=active_farmers_count,
            new_farmers_this_month=new_farmers_this_month,
            default_rate=default_rate,
            default_rate_change=default_rate_change
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting financier dashboard stats: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")


@router.get("/financier/dashboard/pending-applications", response_model=List[LoanApplication])
async def get_pending_applications(
    limit: int = 10,
    current_user: User = Depends(get_current_user)
):
    """Get pending loan applications for financier dashboard"""
    try:
        if current_user.role != "financier":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only financiers can access pending applications"
            )
        
        await finance_service.initialize()
        
        # Get pending applications
        applications = await finance_service.get_loan_applications(
            financier_id=current_user.id,
            status=LoanStatus.SUBMITTED
        )
        
        # Also get under review applications
        under_review = await finance_service.get_loan_applications(
            financier_id=current_user.id,
            status=LoanStatus.UNDER_REVIEW
        )
        
        # Combine and sort by submission date
        all_pending = applications + under_review
        all_pending.sort(key=lambda x: x.created_at, reverse=True)
        
        return all_pending[:limit]
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting pending applications: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")


@router.get("/financier/dashboard/recent-disbursements", response_model=List[LoanApplication])
async def get_recent_disbursements(
    limit: int = 5,
    current_user: User = Depends(get_current_user)
):
    """Get recent loan disbursements for financier dashboard"""
    try:
        if current_user.role != "financier":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only financiers can access disbursements"
            )
        
        await finance_service.initialize()
        
        # Get disbursed loans
        disbursed_loans = await finance_service.get_loan_applications(
            financier_id=current_user.id,
            status=LoanStatus.DISBURSED
        )
        
        # Sort by disbursement date (using updated_at as proxy)
        disbursed_loans.sort(key=lambda x: x.updated_at, reverse=True)
        
        return disbursed_loans[:limit]
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting recent disbursements: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")


@router.get("/financier/farmers")
async def get_farmers_data(
    search: Optional[str] = None,
    location: Optional[str] = None,
    credit_score_min: Optional[int] = None,
    current_user: User = Depends(get_current_user)
):
    """Get farmers data for financier dashboard"""
    try:
        # Check if user is a financier
        if current_user.role != "financier":
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
        
        # Get collections
        users_collection = get_collection("users")
        loans_collection = get_collection("loan_applications")
        
        # Build match criteria for farmers
        match_criteria = {"role": "farmer"}
        if search:
            match_criteria["$or"] = [
                {"name": {"$regex": search, "$options": "i"}},
                {"email": {"$regex": search, "$options": "i"}}
            ]
        if location:
            match_criteria["location"] = {"$regex": location, "$options": "i"}
        
        # Get farmers with basic info
        farmers_cursor = users_collection.find(match_criteria)
        farmers = []
        
        async for farmer in farmers_cursor:
            # Get loan applications for this farmer
            loan_apps = await loans_collection.find({"farmer_id": str(farmer["_id"])}).to_list(None)
            
            # Calculate stats
            approved_loans = [app for app in loan_apps if app.get("status") == "approved"]
            total_loan_amount = sum(app.get("amount", 0) for app in approved_loans)
            credit_scores = [app.get("credit_score") for app in loan_apps if app.get("credit_score")]
            avg_credit_score = sum(credit_scores) / len(credit_scores) if credit_scores else 650
            
            # Apply credit score filter
            if credit_score_min and avg_credit_score < credit_score_min:
                continue
            
            # Get last application date
            last_app_date = None
            if loan_apps:
                last_app_date = max(app.get("created_at") for app in loan_apps if app.get("created_at"))
            
            farmers.append({
                "id": str(farmer["_id"]),
                "name": farmer.get("name", ""),
                "email": farmer.get("email", ""),
                "phone": farmer.get("phone"),
                "location": farmer.get("location", ""),
                "creditScore": int(avg_credit_score),
                "totalApplications": len(loan_apps),
                "approvedLoans": len(approved_loans),
                "totalLoanAmount": total_loan_amount,
                "lastApplicationDate": last_app_date.isoformat() if last_app_date else None
            })
        
        # Calculate summary stats
        total_farmers = len(farmers)
        active_borrowers = len([f for f in farmers if f["approvedLoans"] > 0])
        avg_credit_score = sum(f["creditScore"] for f in farmers) / len(farmers) if farmers else 650
        total_disbursed = sum(f["totalLoanAmount"] for f in farmers)
        
        return {
            "farmers": farmers,
            "stats": {
                "totalFarmers": total_farmers,
                "activeBorrowers": active_borrowers,
                "avgCreditScore": avg_credit_score,
                "totalDisbursed": total_disbursed
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting farmers data: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")


@router.get("/financier/analytics")
async def get_analytics_data(
    period: Optional[str] = "12months",
    current_user: User = Depends(get_current_user)
):
    """Get analytics data for financier dashboard"""
    try:
        # Check if user is a financier
        if current_user.role != "financier":
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
        
        # Get loan applications collection
        loans_collection = get_collection("loan_applications")
        
        # Get all loan applications (for demo, we'll use all data)
        all_loans = await loans_collection.find({}).to_list(None)
        
        # Calculate portfolio stats
        total_applications = len(all_loans)
        approved_loans = [loan for loan in all_loans if loan.get("status") == "approved"]
        rejected_loans = [loan for loan in all_loans if loan.get("status") == "rejected"]
        pending_loans = [loan for loan in all_loans if loan.get("status") in ["pending", "submitted"]]
        
        approved_applications = len(approved_loans)
        rejected_applications = len(rejected_loans)
        pending_applications = len(pending_loans)
        
        total_loans_value = sum(loan.get("amount", 0) for loan in approved_loans)
        avg_loan_amount = total_loans_value / approved_applications if approved_applications > 0 else 0
        
        # Calculate approval rate
        approval_rate = (approved_applications / total_applications * 100) if total_applications > 0 else 0
        default_rate = 2.5  # Mock default rate
        
        # Mock monthly trends (in real app, this would be calculated from actual dates)
        monthly_trends = [
            {"month": "Jan 2024", "applications": 45, "approvals": 32, "disbursedAmount": 1250000},
            {"month": "Feb 2024", "applications": 52, "approvals": 38, "disbursedAmount": 1480000},
            {"month": "Mar 2024", "applications": 48, "approvals": 35, "disbursedAmount": 1320000},
            {"month": "Apr 2024", "applications": 58, "approvals": 42, "disbursedAmount": 1650000},
            {"month": "May 2024", "applications": 61, "approvals": 45, "disbursedAmount": 1780000},
            {"month": "Jun 2024", "applications": 55, "approvals": 40, "disbursedAmount": 1560000}
        ]
        
        # Mock loan type distribution
        loan_type_distribution = [
            {"type": "crop_loan", "count": 120, "totalAmount": 4500000, "percentage": 45.2},
            {"type": "equipment_loan", "count": 85, "totalAmount": 3200000, "percentage": 32.1},
            {"type": "working_capital", "count": 60, "totalAmount": 2100000, "percentage": 22.7}
        ]
        
        return {
            "totalLoansValue": total_loans_value,
            "totalApplications": total_applications,
            "approvalRate": round(approval_rate, 1),
            "defaultRate": default_rate,
            "monthlyTrends": monthly_trends,
            "loanTypeDistribution": loan_type_distribution,
            "riskAnalysis": {
                "lowRisk": 65,
                "mediumRisk": 25,
                "highRisk": 10
            },
            "performanceInsights": [
                {
                    "metric": "Portfolio Growth",
                    "value": "+12.5%",
                    "trend": "up",
                    "description": "Compared to last quarter"
                },
                {
                    "metric": "Default Rate",
                    "value": f"{default_rate}%",
                    "trend": "down",
                    "description": "Below industry average"
                },
                {
                    "metric": "Processing Time",
                    "value": "3.2 days",
                    "trend": "down",
                    "description": "Average application processing"
                }
            ]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting analytics data: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")


@router.get("/loan-products")
async def get_loan_products(
    status_filter: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db=Depends(get_db)
):
    """Get loan products for financier management"""
    try:
        # Check if user is a financier
        if current_user.role != "financier":
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
        
        # Build query
        query = {"financier_id": str(current_user.id)}
        
        # Add status filter if provided
        if status_filter == "active":
            query["is_active"] = True
        elif status_filter == "inactive":
            query["is_active"] = False
        
        # Fetch products from database
        products_cursor = await db.financial_products.find(query).to_list(length=None)
        products = []
        
        # Get loan applications for each product to calculate stats
        for product in products_cursor:
            # Get application stats for this product
            app_stats = await db.loan_applications.aggregate([
                {"$match": {"product_id": str(product["_id"])}},
                {"$group": {
                    "_id": "$status",
                    "count": {"$sum": 1},
                    "total_amount": {"$sum": "$loan_amount"}
                }}
            ]).to_list(length=None)
            
            # Initialize stats
            application_count = 0
            approved_count = 0
            total_disbursed = 0
            
            # Calculate stats from aggregation
            for stat in app_stats:
                application_count += stat["count"]
                if stat["_id"] == "approved" or stat["_id"] == "disbursed":
                    approved_count += stat["count"]
                    total_disbursed += stat.get("total_amount", 0)
            
            # Format product data
            product_data = {
                "id": str(product["_id"]),
                "name": product["product_name"],
                "description": product.get("description", ""),
                "interestRate": product["interest_rate_min"],
                "minAmount": product["min_amount"],
                "maxAmount": product["max_amount"],
                "tenure": product["max_tenure_months"],
                "status": "active" if product.get("is_active", False) else "inactive",
                "eligibilityCriteria": product.get("eligibility_criteria", []),
                "applicationCount": application_count,
                "approvedCount": approved_count,
                "totalDisbursed": total_disbursed,
                "createdAt": product["created_at"].isoformat() + "Z" if "created_at" in product else None
            }
            products.append(product_data)
        
        # Add mock products if no real products found or for testing
        if not products or os.getenv("ENVIRONMENT") == "development":
            mock_products = [
                {
                    "id": "mock1",
                    "name": "Crop Loan Standard",
                    "description": "Standard crop financing for seasonal farming needs",
                    "interestRate": 8.5,
                    "minAmount": 50000,
                    "maxAmount": 500000,
                    "tenure": 12,
                    "status": "active",
                    "eligibilityCriteria": ["Minimum 2 years farming experience", "Valid land documents"],
                    "applicationCount": 45,
                    "approvedCount": 32,
                    "totalDisbursed": 1250000,
                    "createdAt": "2024-01-15T10:00:00Z"
                },
                {
                    "id": "mock2", 
                    "name": "Equipment Finance",
                    "description": "Financing for agricultural equipment and machinery",
                    "interestRate": 9.2,
                    "minAmount": 100000,
                    "maxAmount": 2000000,
                    "tenure": 36,
                    "status": "active",
                    "eligibilityCriteria": ["Minimum 5 years farming experience", "Equipment quotation required"],
                    "applicationCount": 28,
                    "approvedCount": 22,
                    "totalDisbursed": 1800000,
                    "createdAt": "2024-02-01T10:00:00Z"
                }
            ]
            # Add mock products to the beginning of the list
            products = mock_products + products
        
        # Calculate summary stats
        total_products = len(products)
        active_products = len([p for p in products if p.get("status") == "active"])
        avg_interest_rate = sum(p.get("interestRate", 0) for p in products) / len(products) if products else 0
        total_capacity = sum(p.get("maxAmount", 0) for p in products)
        
        return {
            "products": products,
            "stats": {
                "totalProducts": total_products,
                "activeProducts": active_products,
                "avgInterestRate": round(avg_interest_rate, 2),
                "totalCapacity": total_capacity
            },
            "isMockData": len(products) > 0 and any(p.get("id", "").startswith("mock") for p in products)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting loan products: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")
class FinancialProductRequest(BaseModel):
    product_name: str
    product_type: str
    description: Optional[str] = None
    min_amount: float
    max_amount: float
    min_tenure_months: int
    max_tenure_months: int
    interest_rate_min: float
    interest_rate_max: float
    processing_fee_percentage: float = 0.0
    min_farm_size: Optional[float] = None
    min_experience_years: Optional[int] = None
    min_annual_income: Optional[float] = None
    eligible_states: Optional[List[str]] = None
    eligible_crops: Optional[List[str]] = None
    min_credit_score: Optional[int] = None
    is_active: bool = True
    is_featured: bool = False

@router.post("/financier/financial-products", response_model=dict)
async def create_financial_product(
    product_data: FinancialProductRequest,
    current_user: User = Depends(get_current_user)
):
    """Create a new financial product"""
    try:
        # Check if user is a financier
        if current_user.role != "financier":
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
        
        # Get the financial products collection
        products_collection = get_collection("financial_products")
        
        # Create the product document
        product_doc = {
            "financier_id": current_user.id,
            "product_name": product_data.product_name,
            "product_type": product_data.product_type,
            "description": product_data.description,
            "min_amount": product_data.min_amount,
            "max_amount": product_data.max_amount,
            "min_tenure_months": product_data.min_tenure_months,
            "max_tenure_months": product_data.max_tenure_months,
            "interest_rate_min": product_data.interest_rate_min,
            "interest_rate_max": product_data.interest_rate_max,
            "processing_fee_percentage": product_data.processing_fee_percentage,
            "min_farm_size": product_data.min_farm_size,
            "min_experience_years": product_data.min_experience_years,
            "min_annual_income": product_data.min_annual_income,
            "eligible_states": product_data.eligible_states or [],
            "eligible_crops": product_data.eligible_crops or [],
            "min_credit_score": product_data.min_credit_score,
            "is_active": product_data.is_active,
            "is_featured": product_data.is_featured,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        # Insert the product
        result = await products_collection.insert_one(product_doc)
        
        # Return the created product with ID
        product_doc["_id"] = str(result.inserted_id)
        product_doc["id"] = str(result.inserted_id)
        
        return {
            "message": "Financial product created successfully",
            "product": product_doc
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating financial product: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")


@router.put("/financier/loan-products/{product_id}")
async def update_loan_product(
    product_id: int,
    product_data: dict,
    current_user: dict = Depends(get_current_user)
):
    """Update a loan product"""
    try:
        # Check if user is a financier
        if current_user.get("role") != "financier":
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
        
        query = """
            UPDATE loan_products 
            SET name = %s, description = %s, interest_rate = %s, min_amount = %s, 
                max_amount = %s, tenure_months = %s, eligibility_criteria = %s, 
                status = %s, updated_at = NOW()
            WHERE id = %s
            RETURNING *
        """
        
        product = await database.fetch_one(
            query,
            product_data["name"],
            product_data["description"],
            product_data["interestRate"],
            product_data["minAmount"],
            product_data["maxAmount"],
            product_data["tenure"],
            product_data.get("eligibilityCriteria", []),
            product_data["status"],
            product_id
        )
        
        if not product:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Loan product not found")
        
        return {
            "id": product["id"],
            "name": product["name"],
            "description": product["description"],
            "interestRate": float(product["interest_rate"]),
            "minAmount": float(product["min_amount"]),
            "maxAmount": float(product["max_amount"]),
            "tenure": product["tenure_months"],
            "status": product["status"],
            "eligibilityCriteria": product["eligibility_criteria"] or [],
            "updatedAt": product["updated_at"].isoformat()
        }
        
    except HTTPException:
        raise
        logger.error(f"Error updating loan product: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")


@router.get("/financier/analytics/insights")
async def get_ai_insights(current_user: User = Depends(get_current_user)):
    """Get AI-powered performance insights"""
    try:
        # Check if user is a financier
        if current_user.get("role") != "financier":
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
        
        # Get analytics data first
        loans_collection = get_collection("loan_applications")
        all_loans = await loans_collection.find({}).to_list(None)
        
        # Calculate basic metrics
        total_applications = len(all_loans)
        approved_loans = [loan for loan in all_loans if loan.get("status") == "approved"]
        total_loans_value = sum(loan.get("amount", 0) for loan in approved_loans)
        approval_rate = (len(approved_loans) / total_applications * 100) if total_applications > 0 else 0
        
        # Prepare data for AI analysis
        performance_data = {
            "total_applications": total_applications,
            "approved_loans": len(approved_loans),
            "total_loans_value": total_loans_value,
            "approval_rate": approval_rate,
            "average_loan_amount": total_loans_value / len(approved_loans) if approved_loans else 0
        }
        
        # Generate AI insights using Gemini
        try:
            import google.generativeai as genai
            import os
            
            # Configure Gemini API
            genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
            model = genai.GenerativeModel('gemini-pro')
            
            prompt = f"""
            Analyze the following loan portfolio performance data and provide 3-4 key insights:
            
            Performance Metrics:
            - Total Applications: {performance_data['total_applications']}
            - Approved Loans: {performance_data['approved_loans']}
            - Total Loans Value: ₹{performance_data['total_loans_value']:,.0f}
            - Approval Rate: {performance_data['approval_rate']:.1f}%
            - Average Loan Amount: ₹{performance_data['average_loan_amount']:,.0f}
            
            Please provide actionable insights in JSON format with the following structure:
            {{
                "insights": [
                    {{
                        "title": "Insight Title",
                        "description": "Detailed insight description",
                        "impact": "high|medium|low",
                        "recommendation": "Actionable recommendation"
                    }}
                ]
            }}
            
            Focus on portfolio health, risk assessment, growth opportunities, and operational efficiency.
            """
            
            response = model.generate_content(prompt)
            
            # Parse the AI response
            import json
            import re
            
            # Extract JSON from response
            json_match = re.search(r'\{.*\}', response.text, re.DOTALL)
            if json_match:
                ai_insights = json.loads(json_match.group())
                return ai_insights
            else:
                # Fallback if JSON parsing fails
                raise Exception("Failed to parse AI response")
                
        except Exception as ai_error:
            logger.warning(f"AI insights generation failed: {ai_error}")
            # Return fallback insights
            return {
                "insights": [
                    {
                        "title": "Portfolio Performance",
                        "description": f"Your portfolio has {total_applications} applications with {approval_rate:.1f}% approval rate.",
                        "impact": "medium",
                        "recommendation": "Monitor approval rates and adjust criteria as needed."
                    },
                    {
                        "title": "Loan Volume",
                        "description": f"Total disbursed amount is ₹{total_loans_value:,.0f} across {len(approved_loans)} loans.",
                        "impact": "high",
                        "recommendation": "Consider diversifying loan products to increase volume."
                    }
                ]
            }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting AI performance insights: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")


@router.get("/buyer/dashboard/stats")
async def get_buyer_dashboard_stats(current_user: User = Depends(get_current_user)):
    """Get buyer dashboard statistics"""
    try:
        # Check if user is a buyer
        if current_user.get("role") != "buyer":
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
        
        # Mock data for buyer dashboard stats
        # In a real implementation, these would be calculated from actual data
        return {
            "activeOrders": 24,
            "totalProcurement": 1250000,  # ₹12.5L
            "pendingDeliveries": 8,
            "activeFarmers": 156
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting buyer dashboard stats: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")


@router.get("/buyer/analytics")
async def get_buyer_analytics(
    period: str = "30d",
    current_user: User = Depends(get_current_user)
):
    """Get buyer analytics data"""
    try:
        # Check if user is a buyer
        if current_user.get("role") != "buyer":
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
        
        # Mock analytics data for buyer
        # In a real implementation, this would be calculated from actual transaction data
        return {
            "summary": {
                "totalSpent": 2500000,
                "totalOrders": 45,
                "avgOrderValue": 55555,
                "topCrop": "Rice"
            },
            "monthlySpending": [
                {"month": "Jan", "amount": 180000},
                {"month": "Feb", "amount": 220000},
                {"month": "Mar", "amount": 195000},
                {"month": "Apr", "amount": 240000},
                {"month": "May", "amount": 210000},
                {"month": "Jun", "amount": 185000}
            ],
            "cropDistribution": [
                {"crop": "Rice", "percentage": 35, "amount": 875000},
                {"crop": "Wheat", "percentage": 25, "amount": 625000},
                {"crop": "Corn", "percentage": 20, "amount": 500000},
                {"crop": "Sugarcane", "percentage": 15, "amount": 375000},
                {"crop": "Others", "percentage": 5, "amount": 125000}
            ],
            "farmerEngagement": [
                {"month": "Jan", "activeFarmers": 120},
                {"month": "Feb", "activeFarmers": 135},
                {"month": "Mar", "activeFarmers": 142},
                {"month": "Apr", "activeFarmers": 156},
                {"month": "May", "activeFarmers": 148},
                {"month": "Jun", "activeFarmers": 162}
            ],
            "qualityMetrics": {
                "avgQualityScore": 4.2,
                "onTimeDelivery": 87,
                "farmerSatisfaction": 4.5
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting buyer analytics: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")
