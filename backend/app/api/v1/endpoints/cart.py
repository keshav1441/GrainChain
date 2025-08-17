from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from datetime import datetime, timedelta
import uuid
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.database import get_database
from app.api.deps import get_current_user
from app.models.user import User
from app.models.cart import CartItem, Order, OrderItem, Payment, OrderStatusHistory, OrderStatus, PaymentStatus, DeliveryAddress
from app.models.crop import CropListing
from app.schemas.cart import (
    CartItemCreate, CartItemUpdate, CartItemResponse, CartSummary,
    OrderCreate, OrderResponse, OrderListResponse, OrderStatusUpdate,
    PaymentCreate, PaymentResponse, PaymentVerification, OrderStats,
    OrderItemResponse, DeliveryAddressResponse
)
from bson import ObjectId

router = APIRouter()

# Cart Management Endpoints


@router.post("/cart/add", response_model=CartItemResponse)
async def add_to_cart(
    item_data: CartItemCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Add item to user's cart"""

    # Convert crop_listing_id to ObjectId
    try:
        crop_listing_oid = ObjectId(item_data.crop_listing_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid crop listing ID format"
        )

    # Get crop listing details
    crop_listing = await db.crop_listings.find_one({"_id": crop_listing_oid})
    if not crop_listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Crop listing not found"
        )

    # Ensure required fields exist in DB
    required_fields = ["crop_type", "farmer_id", "farmer_name", "price_per_kg", "location", "quantity"]
    for field in required_fields:
        if field not in crop_listing:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Missing field in crop listing: {field}"
            )

    # Check if item already exists in cart
    existing_item = await db.cart_items.find_one({
        "user_id": str(current_user.id),
        "crop_listing_id": str(item_data.crop_listing_id)
    })

    # If exists, update quantity
    if existing_item:
        new_quantity = existing_item["quantity"] + item_data.quantity
        if new_quantity > crop_listing["quantity"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Requested quantity exceeds available stock"
            )

        await db.cart_items.update_one(
            {"_id": existing_item["_id"]},
            {
                "$set": {
                    "quantity": new_quantity,
                    "updated_at": datetime.utcnow()
                }
            }
        )

        updated_item = await db.cart_items.find_one({"_id": existing_item["_id"]})
        return CartItemResponse(
            id=str(updated_item["_id"]),
            crop_listing_id=updated_item["crop_listing_id"],
            crop_type=updated_item["crop_type"],
            farmer_id=updated_item["farmer_id"],
            farmer_name=updated_item["farmer_name"],
            price_per_kg=float(updated_item["price_per_kg"]),
            location=updated_item["location"],
            quantity=updated_item["quantity"],
            max_quantity=updated_item["max_quantity"],
            total_price=updated_item["quantity"] * float(updated_item["price_per_kg"]),
            added_at=updated_item.get("added_at", datetime.utcnow())
        )

    # Validate requested quantity for new item
    if item_data.quantity > crop_listing["quantity"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Requested quantity exceeds available stock"
        )

    # Create new cart item
    cart_item = CartItem(
        user_id=str(current_user.id),
        crop_listing_id=item_data.crop_listing_id,
        crop_type=crop_listing["crop_type"],
        farmer_id=str(crop_listing["farmer_id"]),
        farmer_name=crop_listing.get("farmer_name", "Unknown Farmer"),
        price_per_kg=float(crop_listing["price_per_kg"]),
        location=crop_listing.get("location", "Unknown"),
        quantity=item_data.quantity,
        max_quantity=crop_listing["quantity"],
        added_at=datetime.utcnow()
    )

    result = await db.cart_items.insert_one(cart_item.dict(by_alias=True, exclude={"id"}))

    return CartItemResponse(
        id=str(result.inserted_id),
        crop_listing_id=cart_item.crop_listing_id,
        crop_type=cart_item.crop_type,
        farmer_id=cart_item.farmer_id,
        farmer_name=cart_item.farmer_name,
        price_per_kg=cart_item.price_per_kg,
        location=cart_item.location,
        quantity=cart_item.quantity,
        max_quantity=cart_item.max_quantity,
        total_price=cart_item.quantity * cart_item.price_per_kg,
        added_at=cart_item.added_at
    )
@router.get("/cart", response_model=CartSummary)
async def get_cart(
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get user's cart items"""
    
    cart_items = await db.cart_items.find({"user_id": str(current_user.id)}).to_list(None)
    
    items = []
    subtotal = 0.0
    
    for item in cart_items:
        total_price = item["quantity"] * item["price_per_kg"]
        subtotal += total_price
        
        items.append(CartItemResponse(
            id=str(item["_id"]),
            crop_listing_id=item["crop_listing_id"],
            crop_type=item["crop_type"],
            farmer_id=item["farmer_id"],
            farmer_name=item["farmer_name"],
            price_per_kg=item["price_per_kg"],
            location=item["location"],
            quantity=item["quantity"],
            max_quantity=item["max_quantity"],
            total_price=total_price,
            added_at=item["added_at"]
        ))
    
    platform_fee = subtotal * 0.02  # 2% platform fee
    total_amount = subtotal + platform_fee
    
    return CartSummary(
        items=items,
        total_items=len(items),
        subtotal=subtotal,
        platform_fee=platform_fee,
        total_amount=total_amount
    )

@router.put("/cart/{item_id}", response_model=CartItemResponse)
async def update_cart_item(
    item_id: str,
    update_data: CartItemUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Update cart item quantity"""
    
    cart_item = await db.cart_items.find_one({
        "_id": item_id,
        "user_id": str(current_user.id)
    })
    
    if not cart_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart item not found"
        )
    
    if update_data.quantity > cart_item["max_quantity"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Requested quantity exceeds available stock"
        )
    
    if update_data.quantity <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Quantity must be greater than 0"
        )
    
    await db.cart_items.update_one(
        {"_id": item_id},
        {
            "$set": {
                "quantity": update_data.quantity,
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    updated_item = await db.cart_items.find_one({"_id": item_id})
    
    return CartItemResponse(
        id=str(updated_item["_id"]),
        crop_listing_id=updated_item["crop_listing_id"],
        crop_type=updated_item["crop_type"],
        farmer_id=updated_item["farmer_id"],
        farmer_name=updated_item["farmer_name"],
        price_per_kg=updated_item["price_per_kg"],
        location=updated_item["location"],
        quantity=updated_item["quantity"],
        max_quantity=updated_item["max_quantity"],
        total_price=updated_item["quantity"] * updated_item["price_per_kg"],
        added_at=updated_item["added_at"]
    )

@router.delete("/cart/{item_id}")
async def remove_cart_item(
    item_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Remove item from cart"""
    
    result = await db.cart_items.delete_one({
        "_id": item_id,
        "user_id": str(current_user.id)
    })
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart item not found"
        )
    
    return {"message": "Item removed from cart"}

@router.delete("/cart/clear")
async def clear_cart(
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Clear all items from cart"""
    
    await db.cart_items.delete_many({"user_id": current_user.id})
    return {"message": "Cart cleared"}

# Order Management Endpoints

@router.post("/orders", response_model=OrderResponse)
async def create_order(
    order_data: OrderCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Create order from cart or direct items"""
    
    order_items = []
    subtotal = 0.0
    
    for item_data in order_data.items:
        # Convert crop_listing_id to ObjectId
        try:
            crop_listing_oid = ObjectId(item_data.crop_listing_id)
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid crop listing ID format"
            )
            
        # Get crop listing details
        crop_listing = await db.crop_listings.find_one({"_id": crop_listing_oid})
        if not crop_listing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Crop listing {item_data.crop_listing_id} not found"
            )
        
        # Validate quantity
        if item_data.quantity > crop_listing["quantity"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Requested quantity for {crop_listing['crop_type']} exceeds available stock"
            )
        
        total_price = item_data.quantity * float(crop_listing["price_per_kg"])
        subtotal += total_price
        
        order_items.append(OrderItem(
            crop_listing_id=str(item_data.crop_listing_id),
            crop_type=crop_listing["crop_type"],
            farmer_id=str(crop_listing["farmer_id"]),
            farmer_name=crop_listing["farmer_name"],
            quantity=item_data.quantity,
            price_per_kg=float(crop_listing["price_per_kg"]),
            total_price=total_price,
            location=crop_listing["location"]
        ))
    
    # Calculate fees and total
    platform_fee = subtotal * 0.02  # 2% platform fee
    delivery_fee = 0.0  # Free delivery for now
    total_amount = subtotal + platform_fee + delivery_fee
    
    # Generate order ID
    order_id = f"GC{int(datetime.utcnow().timestamp())}"
    
    # Convert DeliveryAddressCreate to DeliveryAddress
    delivery_address = DeliveryAddress(
        name=order_data.delivery_address.name,
        phone=order_data.delivery_address.phone,
        address=order_data.delivery_address.address,
        city=order_data.delivery_address.city,
        state=order_data.delivery_address.state,
        pincode=order_data.delivery_address.pincode,
        landmark=order_data.delivery_address.landmark
    )
    
    # Create order
    order = Order(
        order_id=order_id,
        user_id=str(current_user.id),
        items=order_items,
        subtotal=subtotal,
        platform_fee=platform_fee,
        delivery_fee=delivery_fee,
        total_amount=total_amount,
        delivery_address=delivery_address,
        payment_method=order_data.payment_method,
        order_notes=order_data.order_notes or "",
        special_instructions=order_data.special_instructions or "",
        estimated_delivery_date=datetime.utcnow() + timedelta(days=5)
    )
    
    result = await db.orders.insert_one(order.dict(by_alias=True, exclude={"id"}))
    order_id_str = str(result.inserted_id)
    
    # Update crop listing quantities (reduce available stock)
    for item_data in order_data.items:
        crop_listing_oid = ObjectId(item_data.crop_listing_id)
        
        # Reduce the available quantity in crop listing
        await db.crop_listings.update_one(
            {"_id": crop_listing_oid},
            {
                "$inc": {"quantity": -item_data.quantity},
                "$set": {"updated_at": datetime.utcnow()}
            }
        )
        
        # If quantity becomes 0 or negative, mark as out of stock
        updated_crop = await db.crop_listings.find_one({"_id": crop_listing_oid})
        if updated_crop and updated_crop["quantity"] <= 0:
            await db.crop_listings.update_one(
                {"_id": crop_listing_oid},
                {
                    "$set": {
                        "quantity": 0,
                        "status": "out_of_stock",
                        "updated_at": datetime.utcnow()
                    }
                }
            )
    
    # Create order status history
    status_history = OrderStatusHistory(
        order_id=order_id_str,
        to_status=OrderStatus.PENDING,
        changed_by=str(current_user.id),
        reason="Order created"
    )
    await db.order_status_history.insert_one(status_history.dict(by_alias=True, exclude={"id"}))
    
    # Clear cart items for this user (optional - based on business logic)
    await db.cart_items.delete_many({"user_id": str(current_user.id)})
    
    # Return order response
    created_order = await db.orders.find_one({"_id": result.inserted_id})
    
    return OrderResponse(
        id=str(created_order["_id"]),
        order_id=created_order["order_id"],
        user_id=created_order["user_id"],
        items=[OrderItemResponse(**item) for item in created_order["items"]],
        subtotal=created_order["subtotal"],
        platform_fee=created_order["platform_fee"],
        delivery_fee=created_order["delivery_fee"],
        total_amount=created_order["total_amount"],
        delivery_address=DeliveryAddressResponse(**created_order["delivery_address"]),
        status=created_order["status"],
        payment_status=created_order["payment_status"],
        payment_method=created_order.get("payment_method"),
        estimated_delivery_date=created_order.get("estimated_delivery_date"),
        tracking_number=created_order.get("tracking_number"),
        order_notes=created_order.get("order_notes"),
        created_at=created_order["created_at"],
        updated_at=created_order.get("updated_at")
    )

@router.get("/orders", response_model=OrderListResponse)
async def get_user_orders(
    page: int = 1,
    limit: int = 10,
    status: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get user's orders with pagination and filtering"""
    
    skip = (page - 1) * limit
    filter_query = {"user_id": current_user.id}
    
    if status:
        filter_query["status"] = status
    
    orders_cursor = db.orders.find(filter_query).sort("created_at", -1).skip(skip).limit(limit)
    orders = await orders_cursor.to_list(None)
    
    total_count = await db.orders.count_documents(filter_query)
    
    order_responses = []
    for order in orders:
        order_responses.append(OrderResponse(
            id=str(order["_id"]),
            order_id=order["order_id"],
            user_id=order["user_id"],
            items=[OrderItemResponse(**item) for item in order["items"]],
            subtotal=order["subtotal"],
            platform_fee=order["platform_fee"],
            delivery_fee=order["delivery_fee"],
            total_amount=order["total_amount"],
            delivery_address=order["delivery_address"],
            status=order["status"],
            payment_status=order["payment_status"],
            payment_method=order.get("payment_method"),
            estimated_delivery_date=order.get("estimated_delivery_date"),
            tracking_number=order.get("tracking_number"),
            order_notes=order.get("order_notes"),
            created_at=order["created_at"],
            updated_at=order.get("updated_at")
        ))
    
    return OrderListResponse(
        orders=order_responses,
        total_count=total_count,
        page=page,
        limit=limit
    )

@router.get("/orders/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get specific order details"""
    
    order = await db.orders.find_one({
        "$or": [
            {"_id": order_id},
            {"order_id": order_id}
        ],
        "user_id": str(current_user.id)
    })
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    return OrderResponse(
        id=str(order["_id"]),
        order_id=order["order_id"],
        user_id=order["user_id"],
        items=[OrderItemResponse(**item) for item in order["items"]],
        subtotal=order["subtotal"],
        platform_fee=order["platform_fee"],
        delivery_fee=order["delivery_fee"],
        total_amount=order["total_amount"],
        delivery_address=order["delivery_address"],
        status=order["status"],
        payment_status=order["payment_status"],
        payment_method=order.get("payment_method"),
        estimated_delivery_date=order.get("estimated_delivery_date"),
        tracking_number=order.get("tracking_number"),
        order_notes=order.get("order_notes"),
        created_at=order["created_at"],
        updated_at=order.get("updated_at")
    )

@router.put("/orders/{order_id}/cancel")
async def cancel_order(
    order_id: str,
    reason: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Cancel an order"""
    
    order = await db.orders.find_one({
        "$or": [
            {"_id": order_id},
            {"order_id": order_id}
        ],
        "user_id": str(current_user.id)
    })
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    if order["status"] in [OrderStatus.DELIVERED, OrderStatus.COMPLETED, OrderStatus.CANCELLED]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot cancel order in current status"
        )
    
    # Update order status
    await db.orders.update_one(
        {"_id": order["_id"]},
        {
            "$set": {
                "status": OrderStatus.CANCELLED,
                "cancelled_at": datetime.utcnow(),
                "cancellation_reason": reason,
                "cancelled_by": current_user.id,
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    # Add status history
    status_history = OrderStatusHistory(
        order_id=str(order["_id"]),
        from_status=order["status"],
        to_status=OrderStatus.CANCELLED,
        changed_by=current_user.id,
        reason=reason or "Order cancelled by user"
    )
    await db.order_status_history.insert_one(status_history.dict(by_alias=True, exclude={"id"}))
    
    return {"message": "Order cancelled successfully"}

@router.get("/orders/stats", response_model=OrderStats)
async def get_order_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get user's order statistics"""
    
    pipeline = [
        {"$match": {"user_id": current_user.id}},
        {
            "$group": {
                "_id": None,
                "total_orders": {"$sum": 1},
                "pending_orders": {
                    "$sum": {"$cond": [{"$eq": ["$status", "pending"]}, 1, 0]}
                },
                "completed_orders": {
                    "$sum": {"$cond": [{"$eq": ["$status", "completed"]}, 1, 0]}
                },
                "cancelled_orders": {
                    "$sum": {"$cond": [{"$eq": ["$status", "cancelled"]}, 1, 0]}
                },
                "total_revenue": {"$sum": "$total_amount"},
                "average_order_value": {"$avg": "$total_amount"}
            }
        }
    ]
    
    result = await db.orders.aggregate(pipeline).to_list(None)
    
    if not result:
        return OrderStats(
            total_orders=0,
            pending_orders=0,
            completed_orders=0,
            cancelled_orders=0,
            total_revenue=0.0,
            average_order_value=0.0
        )
    
    stats = result[0]
    return OrderStats(
        total_orders=stats["total_orders"],
        pending_orders=stats["pending_orders"],
        completed_orders=stats["completed_orders"],
        cancelled_orders=stats["cancelled_orders"],
        total_revenue=stats["total_revenue"],
        average_order_value=stats["average_order_value"] or 0.0
    )
