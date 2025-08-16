from fastapi import APIRouter, Depends, HTTPException, status
from typing import Optional
from datetime import datetime
import uuid
import hashlib
import hmac
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.database import get_database
from app.api.deps import get_current_user
from app.models.user import User
from app.models.cart import Payment, Order, PaymentStatus, OrderStatus
from app.schemas.cart import (
    PaymentCreate, PaymentResponse, PaymentVerification, PaymentCallback
)

router = APIRouter()

# Mock payment gateway configuration
RAZORPAY_KEY_SECRET = "test_secret_key"  # In production, use environment variables

@router.post("/payments/create", response_model=PaymentResponse)
async def create_payment(
    payment_data: PaymentCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Create a payment for an order"""
    
    # Get order details
    order = await db.orders.find_one({
        "$or": [
            {"_id": payment_data.order_id},
            {"order_id": payment_data.order_id}
        ],
        "user_id": current_user.id
    })
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    if order["payment_status"] == PaymentStatus.COMPLETED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Order is already paid"
        )
    
    # Generate payment ID
    payment_id = f"pay_{uuid.uuid4().hex[:16]}"
    
    # Create payment record
    payment = Payment(
        payment_id=payment_id,
        order_id=str(order["_id"]),
        user_id=current_user.id,
        amount=order["total_amount"],
        payment_method=payment_data.payment_method,
        gateway_name=payment_data.gateway_name or "razorpay"
    )
    
    # For demo purposes, generate mock gateway IDs
    if payment_data.payment_method.value == "cod":
        # Cash on Delivery - mark as pending
        payment.status = PaymentStatus.PENDING
    else:
        # Generate mock gateway order ID
        payment.gateway_order_id = f"order_{uuid.uuid4().hex[:16]}"
        payment.status = PaymentStatus.PENDING
    
    result = await db.payments.insert_one(payment.dict(by_alias=True, exclude={"id"}))
    
    # Update order payment status
    await db.orders.update_one(
        {"_id": order["_id"]},
        {
            "$set": {
                "payment_status": PaymentStatus.PROCESSING,
                "payment_id": payment_id,
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    created_payment = await db.payments.find_one({"_id": result.inserted_id})
    
    return PaymentResponse(
        id=str(created_payment["_id"]),
        payment_id=created_payment["payment_id"],
        order_id=created_payment["order_id"],
        amount=created_payment["amount"],
        currency=created_payment["currency"],
        payment_method=created_payment["payment_method"],
        status=created_payment["status"],
        gateway_payment_id=created_payment.get("gateway_payment_id"),
        gateway_order_id=created_payment.get("gateway_order_id"),
        created_at=created_payment["created_at"]
    )

@router.post("/payments/verify")
async def verify_payment(
    verification_data: PaymentVerification,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Verify payment with gateway"""
    
    # Get payment record
    payment = await db.payments.find_one({
        "payment_id": verification_data.payment_id,
        "user_id": current_user.id
    })
    
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )
    
    # Mock signature verification (in production, use actual gateway verification)
    expected_signature = hmac.new(
        RAZORPAY_KEY_SECRET.encode(),
        f"{verification_data.gateway_order_id}|{verification_data.gateway_payment_id}".encode(),
        hashlib.sha256
    ).hexdigest()
    
    # For demo purposes, we'll accept any signature that's not empty
    if not verification_data.gateway_signature:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid payment signature"
        )
    
    # Update payment status
    await db.payments.update_one(
        {"_id": payment["_id"]},
        {
            "$set": {
                "status": PaymentStatus.COMPLETED,
                "gateway_payment_id": verification_data.gateway_payment_id,
                "gateway_signature": verification_data.gateway_signature,
                "completed_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    # Update order status
    await db.orders.update_one(
        {"_id": payment["order_id"]},
        {
            "$set": {
                "payment_status": PaymentStatus.COMPLETED,
                "status": OrderStatus.CONFIRMED,
                "payment_date": datetime.utcnow(),
                "confirmed_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    return {"message": "Payment verified successfully", "status": "success"}

@router.get("/payments/{payment_id}", response_model=PaymentResponse)
async def get_payment(
    payment_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get payment details"""
    
    payment = await db.payments.find_one({
        "payment_id": payment_id,
        "user_id": current_user.id
    })
    
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )
    
    return PaymentResponse(
        id=str(payment["_id"]),
        payment_id=payment["payment_id"],
        order_id=payment["order_id"],
        amount=payment["amount"],
        currency=payment["currency"],
        payment_method=payment["payment_method"],
        status=payment["status"],
        gateway_payment_id=payment.get("gateway_payment_id"),
        gateway_order_id=payment.get("gateway_order_id"),
        created_at=payment["created_at"]
    )

@router.post("/payments/{payment_id}/refund")
async def refund_payment(
    payment_id: str,
    reason: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Process payment refund"""
    
    payment = await db.payments.find_one({
        "payment_id": payment_id,
        "user_id": current_user.id
    })
    
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )
    
    if payment["status"] != PaymentStatus.COMPLETED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Can only refund completed payments"
        )
    
    # In production, integrate with actual payment gateway refund API
    # For demo purposes, we'll just update the status
    
    await db.payments.update_one(
        {"_id": payment["_id"]},
        {
            "$set": {
                "status": PaymentStatus.REFUNDED,
                "updated_at": datetime.utcnow(),
                "failure_reason": reason or "Refund processed"
            }
        }
    )
    
    # Update order status
    await db.orders.update_one(
        {"_id": payment["order_id"]},
        {
            "$set": {
                "payment_status": PaymentStatus.REFUNDED,
                "status": OrderStatus.REFUNDED,
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    return {"message": "Refund processed successfully"}

# Mock payment simulation endpoints for testing

@router.post("/payments/simulate/success/{payment_id}")
async def simulate_payment_success(
    payment_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Simulate successful payment (for testing)"""
    
    payment = await db.payments.find_one({"payment_id": payment_id})
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    # Update payment
    await db.payments.update_one(
        {"_id": payment["_id"]},
        {
            "$set": {
                "status": PaymentStatus.COMPLETED,
                "gateway_payment_id": f"pay_{uuid.uuid4().hex[:16]}",
                "completed_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    # Update order
    await db.orders.update_one(
        {"_id": payment["order_id"]},
        {
            "$set": {
                "payment_status": PaymentStatus.COMPLETED,
                "status": OrderStatus.CONFIRMED,
                "payment_date": datetime.utcnow(),
                "confirmed_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    return {"message": "Payment simulation successful"}

@router.post("/payments/simulate/failure/{payment_id}")
async def simulate_payment_failure(
    payment_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Simulate failed payment (for testing)"""
    
    payment = await db.payments.find_one({"payment_id": payment_id})
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    # Update payment
    await db.payments.update_one(
        {"_id": payment["_id"]},
        {
            "$set": {
                "status": PaymentStatus.FAILED,
                "failed_at": datetime.utcnow(),
                "failure_reason": "Simulated payment failure",
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    return {"message": "Payment simulation failed"}
