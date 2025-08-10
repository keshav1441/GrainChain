"""
Finance Service for GrainChain
Handles loan processing, payment integration, and financial services
"""

import asyncio
import uuid
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
import logging
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId

from ..core.database import get_database
from ..core.ai_ml_service import ai_ml_service
from ..models.finance import (
    LoanApplication, LoanStatus, LoanType, CreditScore, CreditScoreRange,
    Payment, FinancialProduct
)
from ..models.ai_ml import CreditScoreRequest
from ..models.user import User

logger = logging.getLogger(__name__)


class FinanceService:
    """Comprehensive finance service for agricultural lending and payments"""
    
    def __init__(self):
        self.db: AsyncIOMotorDatabase = None
        self.payment_gateways = {
            "razorpay": {"enabled": True, "test_mode": True},
            "stripe": {"enabled": False, "test_mode": True},
            "payu": {"enabled": False, "test_mode": True}
        }
    
    async def initialize(self):
        """Initialize the finance service"""
        self.db = await get_database()
    
    async def create_loan_application(
        self, 
        farmer_id: str, 
        loan_data: Dict[str, Any]
    ) -> LoanApplication:
        """Create a new loan application"""
        try:
            # Generate unique application ID
            application_id = f"LOAN_{datetime.now().strftime('%Y%m%d')}_{str(uuid.uuid4())[:8].upper()}"
            
            # Create loan application
            loan_app = LoanApplication(
                application_id=application_id,
                farmer_id=farmer_id,
                loan_type=LoanType(loan_data["loan_type"]),
                requested_amount=loan_data["requested_amount"],
                loan_purpose=loan_data["loan_purpose"],
                repayment_period_months=loan_data["repayment_period_months"],
                status=LoanStatus.DRAFT,
                application_date=datetime.utcnow(),
                income_proof_doc=loan_data.get("income_proof_doc"),
                land_documents=loan_data.get("land_documents"),
                bank_statements=loan_data.get("bank_statements"),
                crop_insurance_doc=loan_data.get("crop_insurance_doc"),
                other_documents=loan_data.get("other_documents", [])
            )
            
            # Insert into database
            collection = self.db.loan_applications
            result = await collection.insert_one(loan_app.dict(by_alias=True, exclude={"id"}))
            loan_app.id = str(result.inserted_id)
            
            logger.info(f"Loan application created: {application_id}")
            return loan_app
            
        except Exception as e:
            logger.error(f"Error creating loan application: {e}")
            raise
    
    async def submit_loan_application(self, application_id: str) -> LoanApplication:
        """Submit loan application for review"""
        try:
            collection = self.db.loan_applications
            
            # Update status to submitted
            update_data = {
                "status": LoanStatus.SUBMITTED.value,
                "application_date": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            
            result = await collection.update_one(
                {"application_id": application_id},
                {"$set": update_data}
            )
            
            if result.matched_count == 0:
                raise ValueError(f"Loan application {application_id} not found")
            
            # Get updated application
            loan_app_doc = await collection.find_one({"application_id": application_id})
            loan_app = LoanApplication(**loan_app_doc)
            
            # Trigger automated credit assessment
            await self._perform_credit_assessment(loan_app)
            
            logger.info(f"Loan application submitted: {application_id}")
            return loan_app
            
        except Exception as e:
            logger.error(f"Error submitting loan application: {e}")
            raise
    
    async def _perform_credit_assessment(self, loan_app: LoanApplication):
        """Perform automated credit assessment using AI/ML"""
        try:
            # Get farmer details (mock data for now)
            farmer_data = {
                "annual_income": 200000.0,  # Would be fetched from farmer profile
                "farm_size": 10.0,
                "years_farming": 5,
                "crop_diversity": 3,
                "assets_value": 500000.0,
                "liabilities": 100000.0,
                "insurance_coverage": True
            }
            
            # Create credit score request
            credit_request = CreditScoreRequest(
                user_id=loan_app.farmer_id,
                **farmer_data
            )
            
            # Calculate credit score using AI/ML service
            credit_result = await ai_ml_service.calculate_credit_score(credit_request)
            
            # Update loan application with credit assessment
            collection = self.db.loan_applications
            update_data = {
                "credit_score": credit_result.credit_score,
                "credit_score_range": credit_result.credit_range.value,
                "risk_assessment": credit_result.risk_assessment,
                "status": LoanStatus.UNDER_REVIEW.value,
                "review_date": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            
            await collection.update_one(
                {"application_id": loan_app.application_id},
                {"$set": update_data}
            )
            
            # Auto-approve if credit score is excellent
            if credit_result.credit_score >= 750:
                await self._auto_approve_loan(loan_app, credit_result)
            
            logger.info(f"Credit assessment completed for {loan_app.application_id}: {credit_result.credit_score}")
            
        except Exception as e:
            logger.error(f"Error in credit assessment: {e}")
    
    async def _auto_approve_loan(self, loan_app: LoanApplication, credit_result):
        """Auto-approve loan for excellent credit scores"""
        try:
            # Calculate loan terms based on credit score
            approved_amount = min(loan_app.requested_amount, credit_result.max_loan_amount)
            interest_rate = credit_result.interest_rate_range["min"]
            processing_fee = approved_amount * 0.01  # 1% processing fee
            
            # Update loan application
            collection = self.db.loan_applications
            update_data = {
                "status": LoanStatus.APPROVED.value,
                "approved_amount": approved_amount,
                "interest_rate": interest_rate,
                "processing_fee": processing_fee,
                "approval_date": datetime.utcnow(),
                "review_notes": "Auto-approved based on excellent credit score",
                "updated_at": datetime.utcnow()
            }
            
            await collection.update_one(
                {"application_id": loan_app.application_id},
                {"$set": update_data}
            )
            
            logger.info(f"Loan auto-approved: {loan_app.application_id}")
            
        except Exception as e:
            logger.error(f"Error in auto-approval: {e}")
    
    async def review_loan_application(
        self, 
        application_id: str, 
        financier_id: str,
        decision: str,
        notes: str = None
    ) -> LoanApplication:
        """Review loan application by financier"""
        try:
            collection = self.db.loan_applications
            
            if decision.lower() == "approve":
                # Calculate loan terms
                loan_app_doc = await collection.find_one({"application_id": application_id})
                if not loan_app_doc:
                    raise ValueError(f"Loan application {application_id} not found")
                
                loan_app = LoanApplication(**loan_app_doc)
                
                # Calculate terms based on credit score and loan type
                approved_amount, interest_rate, processing_fee = self._calculate_loan_terms(
                    loan_app.requested_amount,
                    loan_app.credit_score or 650,
                    loan_app.loan_type
                )
                
                update_data = {
                    "status": LoanStatus.APPROVED.value,
                    "financier_id": financier_id,
                    "approved_amount": approved_amount,
                    "interest_rate": interest_rate,
                    "processing_fee": processing_fee,
                    "approval_date": datetime.utcnow(),
                    "review_notes": notes,
                    "updated_at": datetime.utcnow()
                }
            else:
                update_data = {
                    "status": LoanStatus.REJECTED.value,
                    "financier_id": financier_id,
                    "rejection_reason": notes,
                    "review_date": datetime.utcnow(),
                    "updated_at": datetime.utcnow()
                }
            
            result = await collection.update_one(
                {"application_id": application_id},
                {"$set": update_data}
            )
            
            if result.matched_count == 0:
                raise ValueError(f"Loan application {application_id} not found")
            
            # Get updated application
            loan_app_doc = await collection.find_one({"application_id": application_id})
            loan_app = LoanApplication(**loan_app_doc)
            
            logger.info(f"Loan application reviewed: {application_id} - {decision}")
            return loan_app
            
        except Exception as e:
            logger.error(f"Error reviewing loan application: {e}")
            raise
    
    def _calculate_loan_terms(
        self, 
        requested_amount: float, 
        credit_score: int, 
        loan_type: LoanType
    ) -> tuple:
        """Calculate loan terms based on credit score and loan type"""
        
        # Base interest rates by loan type
        base_rates = {
            LoanType.CROP_LOAN: 9.0,
            LoanType.EQUIPMENT_LOAN: 11.0,
            LoanType.WORKING_CAPITAL: 12.0,
            LoanType.TERM_LOAN: 10.5,
            LoanType.KISAN_CREDIT_CARD: 7.0
        }
        
        base_rate = base_rates.get(loan_type, 10.0)
        
        # Adjust rate based on credit score
        if credit_score >= 750:
            rate_adjustment = -1.5  # 1.5% discount
            amount_factor = 1.0     # Full amount
        elif credit_score >= 650:
            rate_adjustment = -0.5  # 0.5% discount
            amount_factor = 0.9     # 90% of requested
        elif credit_score >= 550:
            rate_adjustment = 1.0   # 1% premium
            amount_factor = 0.8     # 80% of requested
        else:
            rate_adjustment = 2.5   # 2.5% premium
            amount_factor = 0.6     # 60% of requested
        
        approved_amount = requested_amount * amount_factor
        interest_rate = base_rate + rate_adjustment
        processing_fee = approved_amount * 0.01  # 1% processing fee
        
        return approved_amount, interest_rate, processing_fee
    
    async def disburse_loan(self, application_id: str) -> Dict[str, Any]:
        """Disburse approved loan"""
        try:
            collection = self.db.loan_applications
            
            # Get loan application
            loan_app_doc = await collection.find_one({"application_id": application_id})
            if not loan_app_doc:
                raise ValueError(f"Loan application {application_id} not found")
            
            loan_app = LoanApplication(**loan_app_doc)
            
            if loan_app.status != LoanStatus.APPROVED:
                raise ValueError(f"Loan application {application_id} is not approved")
            
            # Create disbursement payment
            payment_id = await self._create_disbursement_payment(loan_app)
            
            # Update loan status
            update_data = {
                "status": LoanStatus.DISBURSED.value,
                "disbursement_date": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            
            await collection.update_one(
                {"application_id": application_id},
                {"$set": update_data}
            )
            
            logger.info(f"Loan disbursed: {application_id}")
            
            return {
                "application_id": application_id,
                "payment_id": payment_id,
                "amount": loan_app.approved_amount,
                "status": "disbursed"
            }
            
        except Exception as e:
            logger.error(f"Error disbursing loan: {e}")
            raise
    
    async def _create_disbursement_payment(self, loan_app: LoanApplication) -> str:
        """Create payment record for loan disbursement"""
        try:
            payment_id = f"PAY_{datetime.now().strftime('%Y%m%d')}_{str(uuid.uuid4())[:8].upper()}"
            
            payment = Payment(
                payment_id=payment_id,
                loan_application_id=loan_app.application_id,
                amount=loan_app.approved_amount,
                currency="INR",
                payment_type="loan_disbursement",
                payer_user_id=loan_app.financier_id or "system",
                payee_user_id=loan_app.farmer_id,
                initiated_at=datetime.utcnow(),
                description=f"Loan disbursement for {loan_app.application_id}"
            )
            
            # Insert payment record
            collection = self.db.payments
            result = await collection.insert_one(payment.dict(by_alias=True, exclude={"id"}))
            
            # Simulate payment processing (in real implementation, integrate with payment gateway)
            await asyncio.sleep(1)  # Simulate processing time
            
            # Mark payment as completed
            await collection.update_one(
                {"payment_id": payment_id},
                {"$set": {
                    "status": "completed",
                    "completed_at": datetime.utcnow(),
                    "gateway_payment_id": f"gw_{str(uuid.uuid4())[:12]}"
                }}
            )
            
            return payment_id
            
        except Exception as e:
            logger.error(f"Error creating disbursement payment: {e}")
            raise
    
    async def get_loan_applications(
        self, 
        farmer_id: str = None, 
        financier_id: str = None,
        status: LoanStatus = None
    ) -> List[LoanApplication]:
        """Get loan applications with filters"""
        try:
            collection = self.db.loan_applications
            
            # Build query
            query = {}
            if farmer_id:
                query["farmer_id"] = farmer_id
            if financier_id:
                query["financier_id"] = financier_id
            if status:
                query["status"] = status.value
            
            # Execute query
            cursor = collection.find(query).sort("created_at", -1)
            loan_apps = []
            
            async for doc in cursor:
                loan_apps.append(LoanApplication(**doc))
            
            return loan_apps
            
        except Exception as e:
            logger.error(f"Error getting loan applications: {e}")
            raise
    
    async def get_loan_eligibility(self, farmer_id: str) -> Dict[str, Any]:
        """Get loan eligibility for a farmer"""
        try:
            # Get farmer's credit score (mock data for now)
            credit_data = {
                "annual_income": 200000.0,
                "farm_size": 10.0,
                "years_farming": 5,
                "crop_diversity": 3,
                "assets_value": 500000.0,
                "liabilities": 100000.0,
                "insurance_coverage": True
            }
            
            credit_request = CreditScoreRequest(
                user_id=farmer_id,
                **credit_data
            )
            
            # Calculate credit score
            credit_result = await ai_ml_service.calculate_credit_score(credit_request)
            
            # Get available loan products
            loan_products = await self._get_available_loan_products(credit_result.credit_score)
            
            eligibility = {
                "farmer_id": farmer_id,
                "credit_score": credit_result.credit_score,
                "credit_range": credit_result.credit_range,
                "loan_eligible": credit_result.loan_eligibility,
                "max_loan_amount": credit_result.max_loan_amount,
                "interest_rate_range": credit_result.interest_rate_range,
                "available_products": loan_products,
                "recommendations": credit_result.recommendations,
                "risk_assessment": credit_result.risk_assessment
            }
            
            return eligibility
            
        except Exception as e:
            logger.error(f"Error getting loan eligibility: {e}")
            raise
    
    async def _get_available_loan_products(self, credit_score: int) -> List[Dict[str, Any]]:
        """Get available loan products based on credit score"""
        
        products = []
        
        # Crop Loan
        if credit_score >= 500:
            products.append({
                "product_name": "Crop Loan",
                "loan_type": "crop_loan",
                "min_amount": 10000,
                "max_amount": 500000 if credit_score >= 700 else 200000,
                "interest_rate": 9.0 - (1.5 if credit_score >= 750 else 0),
                "tenure_months": 12,
                "description": "Short-term loan for crop cultivation expenses"
            })
        
        # Equipment Loan
        if credit_score >= 600:
            products.append({
                "product_name": "Equipment Loan",
                "loan_type": "equipment_loan",
                "min_amount": 50000,
                "max_amount": 1000000 if credit_score >= 700 else 500000,
                "interest_rate": 11.0 - (1.5 if credit_score >= 750 else 0),
                "tenure_months": 60,
                "description": "Loan for purchasing agricultural equipment"
            })
        
        # Kisan Credit Card
        if credit_score >= 650:
            products.append({
                "product_name": "Kisan Credit Card",
                "loan_type": "kisan_credit_card",
                "min_amount": 25000,
                "max_amount": 300000,
                "interest_rate": 7.0,
                "tenure_months": 12,
                "description": "Flexible credit facility for agricultural needs"
            })
        
        return products
    
    async def process_payment(
        self, 
        payer_id: str, 
        payee_id: str, 
        amount: float,
        payment_type: str,
        description: str = None
    ) -> str:
        """Process a payment transaction"""
        try:
            payment_id = f"PAY_{datetime.now().strftime('%Y%m%d')}_{str(uuid.uuid4())[:8].upper()}"
            
            payment = Payment(
                payment_id=payment_id,
                amount=amount,
                currency="INR",
                payment_type=payment_type,
                payer_user_id=payer_id,
                payee_user_id=payee_id,
                initiated_at=datetime.utcnow(),
                description=description or f"Payment from {payer_id} to {payee_id}"
            )
            
            # Insert payment record
            collection = self.db.payments
            result = await collection.insert_one(payment.dict(by_alias=True, exclude={"id"}))
            
            # Simulate payment gateway processing
            await self._process_with_gateway(payment_id, amount)
            
            logger.info(f"Payment processed: {payment_id}")
            return payment_id
            
        except Exception as e:
            logger.error(f"Error processing payment: {e}")
            raise
    
    async def _process_with_gateway(self, payment_id: str, amount: float):
        """Simulate payment gateway processing"""
        try:
            # Simulate processing delay
            await asyncio.sleep(2)
            
            # Update payment status (90% success rate simulation)
            import random
            success = random.random() > 0.1
            
            collection = self.db.payments
            
            if success:
                update_data = {
                    "status": "completed",
                    "completed_at": datetime.utcnow(),
                    "gateway_provider": "razorpay",
                    "gateway_payment_id": f"pay_{str(uuid.uuid4())[:16]}"
                }
            else:
                update_data = {
                    "status": "failed",
                    "failed_at": datetime.utcnow(),
                    "failure_reason": "Payment declined by bank"
                }
            
            await collection.update_one(
                {"payment_id": payment_id},
                {"$set": update_data}
            )
            
        except Exception as e:
            logger.error(f"Error processing with gateway: {e}")
    
    async def get_payment_history(
        self, 
        user_id: str, 
        limit: int = 50
    ) -> List[Payment]:
        """Get payment history for a user"""
        try:
            collection = self.db.payments
            
            # Query for payments where user is payer or payee
            query = {
                "$or": [
                    {"payer_user_id": user_id},
                    {"payee_user_id": user_id}
                ]
            }
            
            cursor = collection.find(query).sort("created_at", -1).limit(limit)
            payments = []
            
            async for doc in cursor:
                payments.append(Payment(**doc))
            
            return payments
            
        except Exception as e:
            logger.error(f"Error getting payment history: {e}")
            raise


# Global instance
finance_service = FinanceService()
