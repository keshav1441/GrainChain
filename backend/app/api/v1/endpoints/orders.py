"""
Order management endpoints for GrainChain
Handles order creation, management, and tracking
"""

from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
import logging

from fastapi import APIRouter, Depends, HTTPException, status, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from pydantic import BaseModel, Field
from bson import ObjectId

from app.api.deps import get_current_user
from app.models.user import User, UserRole
from app.core.database import get_db, get_collection

logger = logging.getLogger(__name__)

router = APIRouter()

# Order models
class OrderBase(BaseModel):
    buyer_id: str
    seller_id: str
    crop_listing_id: str
    crop_type: str
    quantity: float
    price_per_kg: float
    total_amount: float
    delivery_address: str
    delivery_date: Optional[datetime] = None
    status: str = "pending"  # pending, confirmed, in_transit, delivered, cancelled
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class OrderCreate(BaseModel):
    crop_listing_id: str
    quantity: float = Field(..., gt=0)
    delivery_address: str
    delivery_date: Optional[datetime] = None

class OrderResponse(OrderBase):
    id: str
    buyer_name: Optional[str] = None
    seller_name: Optional[str] = None
    
    class Config:
        json_encoders = {
            ObjectId: str,
            datetime: lambda dt: dt.isoformat()
        }

class OrderUpdate(BaseModel):
    status: str
    delivery_date: Optional[datetime] = None

@router.get("/", response_model=List[OrderResponse])
async def get_orders(
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Get orders for the current user.
    
    - **status**: Filter by order status
    - **skip**: Number of records to skip
    - **limit**: Maximum number of records to return
    """
    try:
        if limit > 100:
            limit = 100
            
        # Build query based on user role
        query = {}
        if current_user.role == UserRole.BUYER:
            query["buyer_id"] = current_user.id
        elif current_user.role == UserRole.FARMER:
            query["seller_id"] = current_user.id
        elif current_user.role != UserRole.ADMIN:
            # Other roles can only see their own orders
            query["$or"] = [
                {"buyer_id": current_user.id},
                {"seller_id": current_user.id}
            ]
        
        if status:
            query["status"] = status
            
        # Get orders from database
        orders_collection = get_collection("orders")
        cursor = orders_collection.find(query).sort("created_at", -1).skip(skip).limit(limit)
        orders = []
        
        async for doc in cursor:
            doc["id"] = str(doc.pop("_id"))
            orders.append(OrderResponse(**doc))
        
        return orders
        
    except Exception as e:
        logger.error(f"Error getting orders: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")

@router.post("/", response_model=OrderResponse)
async def create_order(
    request: OrderCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Create a new order (buyers only)"""
    try:
        # Only buyers can create orders
        if current_user.role != UserRole.BUYER:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only buyers can create orders"
            )
        
        # Get the crop listing to validate and get details
        listings_collection = get_collection("crop_listings")
        listing = await listings_collection.find_one({"_id": ObjectId(request.crop_listing_id)})
        
        if not listing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Crop listing not found"
            )
        
        if listing["status"] != "available":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Crop listing is not available"
            )
        
        if request.quantity > listing["quantity"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Requested quantity exceeds available quantity"
            )
        
        # Calculate total amount
        total_amount = request.quantity * listing["price_per_kg"]
        
        # Create order document
        order_data = {
            "buyer_id": current_user.id,
            "buyer_name": current_user.full_name,
            "seller_id": listing["farmer_id"],
            "seller_name": listing.get("farmer_name", "Unknown Farmer"),
            "crop_listing_id": request.crop_listing_id,
            "crop_type": listing["crop_type"],
            "quantity": request.quantity,
            "price_per_kg": listing["price_per_kg"],
            "total_amount": total_amount,
            "delivery_address": request.delivery_address,
            "delivery_date": request.delivery_date,
            "status": "pending",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        # Insert order into database
        orders_collection = get_collection("orders")
        result = await orders_collection.insert_one(order_data)
        
        # Update crop listing quantity
        new_quantity = listing["quantity"] - request.quantity
        if new_quantity <= 0:
            # Mark listing as sold out
            await listings_collection.update_one(
                {"_id": ObjectId(request.crop_listing_id)},
                {"$set": {"quantity": 0, "status": "sold_out", "updated_at": datetime.utcnow()}}
            )
        else:
            # Update remaining quantity
            await listings_collection.update_one(
                {"_id": ObjectId(request.crop_listing_id)},
                {"$set": {"quantity": new_quantity, "updated_at": datetime.utcnow()}}
            )
        
        # Create response
        new_order = OrderResponse(
            id=str(result.inserted_id),
            **order_data
        )
        
        logger.info(f"Order created: {new_order.id}")
        return new_order
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating order: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")

@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get a specific order by ID"""
    try:
        orders_collection = get_collection("orders")
        order = await orders_collection.find_one({"_id": ObjectId(order_id)})
        
        if not order:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
        
        # Check if user has permission to view this order
        if (current_user.role != UserRole.ADMIN and 
            order["buyer_id"] != current_user.id and 
            order["seller_id"] != current_user.id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to view this order"
            )
        
        order["id"] = str(order.pop("_id"))
        return OrderResponse(**order)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting order {order_id}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")

@router.patch("/{order_id}", response_model=OrderResponse)
async def update_order(
    order_id: str,
    request: OrderUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Update order status (sellers and admins only)"""
    try:
        orders_collection = get_collection("orders")
        order = await orders_collection.find_one({"_id": ObjectId(order_id)})
        
        if not order:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
        
        # Check permissions - only seller or admin can update
        if (current_user.role != UserRole.ADMIN and 
            order["seller_id"] != current_user.id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only the seller or admin can update this order"
            )
        
        # Update order
        update_data = {
            "status": request.status,
            "updated_at": datetime.utcnow()
        }
        
        if request.delivery_date:
            update_data["delivery_date"] = request.delivery_date
        
        await orders_collection.update_one(
            {"_id": ObjectId(order_id)},
            {"$set": update_data}
        )
        
        # Get updated order
        updated_order = await orders_collection.find_one({"_id": ObjectId(order_id)})
        updated_order["id"] = str(updated_order.pop("_id"))
        
        logger.info(f"Order {order_id} updated to status: {request.status}")
        return OrderResponse(**updated_order)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating order {order_id}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")

@router.delete("/{order_id}")
async def cancel_order(
    order_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Cancel an order (buyers only, and only if pending)"""
    try:
        orders_collection = get_collection("orders")
        order = await orders_collection.find_one({"_id": ObjectId(order_id)})
        
        if not order:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
        
        # Only buyer can cancel their own order
        if order["buyer_id"] != current_user.id and current_user.role != UserRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only the buyer can cancel this order"
            )
        
        # Can only cancel pending orders
        if order["status"] != "pending":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Can only cancel pending orders"
            )
        
        # Update order status to cancelled
        await orders_collection.update_one(
            {"_id": ObjectId(order_id)},
            {"$set": {"status": "cancelled", "updated_at": datetime.utcnow()}}
        )
        
        # Restore quantity to crop listing
        listings_collection = get_collection("crop_listings")
        await listings_collection.update_one(
            {"_id": ObjectId(order["crop_listing_id"])},
            {
                "$inc": {"quantity": order["quantity"]},
                "$set": {"status": "available", "updated_at": datetime.utcnow()}
            }
        )
        
        logger.info(f"Order {order_id} cancelled")
        return {"message": "Order cancelled successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error cancelling order {order_id}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")
