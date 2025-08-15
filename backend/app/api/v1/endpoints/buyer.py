from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId

from app.core.database import get_db, get_collection
from app.models.user import User, Buyer
from app.models.crop import CropListing, Inquiry, InquiryStatus, CropCategory, ListingStatus
from app.schemas.crop import (
    CropListingResponse, InquiryCreate, InquiryResponse, 
    CropSearchFilters, InquiryUpdate
)
from app.schemas.user import UserProfileResponse, UserResponse
from app.api.deps import get_current_active_user

router = APIRouter()

@router.get("/dashboard/stats")
async def get_dashboard_stats(
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get dashboard statistics for the buyer."""
    if current_user.role.value != "buyer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only buyers can access dashboard stats"
        )
    
    # Get collections
    inquiries_collection = get_collection("inquiries")
    listings_collection = get_collection("crop_listings")
    users_collection = get_collection("users")
    
    # Get active orders (inquiries that are completed/accepted)
    active_orders = await inquiries_collection.count_documents({
        "buyer_id": current_user.id,
        "status": {"$in": [InquiryStatus.NEGOTIATING.value, InquiryStatus.COMPLETED.value]}
    })
    
    # Get total procurement value (sum of completed inquiries)
    procurement_pipeline = [
        {"$match": {
            "buyer_id": current_user.id,
            "status": InquiryStatus.COMPLETED.value
        }},
        {"$group": {
            "_id": None,
            "total": {"$sum": {"$multiply": ["$quantity_requested", "$proposed_price"]}}
        }}
    ]
    procurement_result = await inquiries_collection.aggregate(procurement_pipeline).to_list(1)
    total_procurement = procurement_result[0]["total"] if procurement_result else 0
    
    # Get pending deliveries (completed inquiries)
    pending_deliveries = await inquiries_collection.count_documents({
        "buyer_id": current_user.id,
        "status": InquiryStatus.COMPLETED.value
    })
    
    # Get active farmers count (farmers with active listings)
    active_farmers_pipeline = [
        {"$match": {"status": ListingStatus.ACTIVE.value}},
        {"$group": {"_id": "$farmer_id"}},
        {"$count": "total"}
    ]
    farmers_result = await listings_collection.aggregate(active_farmers_pipeline).to_list(1)
    active_farmers = farmers_result[0]["total"] if farmers_result else 0
    
    return {
        "active_orders": active_orders,
        "total_procurement": total_procurement,
        "pending_deliveries": pending_deliveries,
        "active_farmers": active_farmers
    }

@router.get("/farmers", response_model=List[UserProfileResponse])
async def get_farmers(
    limit: int = 20,
    skip: int = 0,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get a list of all farmers with their profiles.
    Only accessible by buyers.
    """
    if current_user.role.value != "buyer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only buyers can view farmers"
        )

    # Get users collection
    users_collection = get_collection("users")
    farmers_collection = get_collection("farmers")
    
    # Get paginated list of farmers
    farmers_cursor = users_collection.find({"role": "farmer"}).skip(skip).limit(limit)
    farmers = await farmers_cursor.to_list(length=limit)
    
    # Get farmer profiles for each user
    result = []
    for farmer in farmers:
        # Convert ObjectId to string and map _id to id for UserResponse
        farmer_id = str(farmer["_id"])
        farmer["id"] = farmer_id
        farmer["_id"] = farmer_id
        
        # Get the farmer's profile if it exists
        farmer_profile = await farmers_collection.find_one({"user_id": farmer_id})
        
        # Create a UserProfileResponse with the user and profile data
        result.append(UserProfileResponse(
            user=UserResponse.model_validate(farmer),
            farmer_profile=farmer_profile,
            buyer_profile=None,
            financier_profile=None
        ))
    
    return result


@router.get("/listings", response_model=List[CropListingResponse])
async def search_crop_listings(
    # Search parameters
    crop_name: Optional[str] = Query(None, description="Search by crop name"),
    category: Optional[CropCategory] = Query(None, description="Filter by crop category"),
    state: Optional[str] = Query(None, description="Filter by farmer's state"),
    city: Optional[str] = Query(None, description="Filter by farmer's city"),
    
    # Price filters
    min_price: Optional[float] = Query(None, description="Minimum price per unit"),
    max_price: Optional[float] = Query(None, description="Maximum price per unit"),
    
    # Quantity filters
    min_quantity: Optional[float] = Query(None, description="Minimum available quantity"),
    max_quantity: Optional[float] = Query(None, description="Maximum available quantity"),
    
    # Pagination
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=100, description="Number of records to return"),
    
    # Sorting
    sort_by: str = Query("created_at", description="Sort field: created_at, price_per_unit, quantity_available"),
    sort_order: str = Query("desc", description="Sort order: asc or desc"),
    
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Search and filter crop listings for buyers.
    Returns paginated results with sorting options.
    """
    # Build MongoDB query
    query = {"status": ListingStatus.ACTIVE.value}
    
    # Add search filters
    if crop_name:
        query["crop_name"] = {"$regex": crop_name, "$options": "i"}
    
    if category:
        query["category"] = category.value
    
    # Price range filter
    if min_price is not None or max_price is not None:
        price_filter = {}
        if min_price is not None:
            price_filter["$gte"] = min_price
        if max_price is not None:
            price_filter["$lte"] = max_price
        query["price_per_unit"] = price_filter
    
    # Quantity range filter
    if min_quantity is not None or max_quantity is not None:
        quantity_filter = {}
        if min_quantity is not None:
            quantity_filter["$gte"] = min_quantity
        if max_quantity is not None:
            quantity_filter["$lte"] = max_quantity
        query["quantity_available"] = quantity_filter
    
    # Location filters - need to join with farmer data
    location_match = {}
    if state:
        location_match["farmer.state"] = {"$regex": state, "$options": "i"}
    if city:
        location_match["farmer.city"] = {"$regex": city, "$options": "i"}
    
    # Build aggregation pipeline
    pipeline = [
        {"$match": query},
        {
            "$lookup": {
                "from": "users",
                "localField": "farmer_id",
                "foreignField": "_id",
                "as": "farmer"
            }
        },
        {"$unwind": "$farmer"}
    ]
    
    # Add location match if needed
    if location_match:
        pipeline.append({"$match": location_match})
    
    # Add sorting
    sort_direction = 1 if sort_order.lower() == "asc" else -1
    valid_sort_fields = ["created_at", "price_per_unit", "quantity_available", "updated_at"]
    if sort_by not in valid_sort_fields:
        sort_by = "created_at"
    
    pipeline.extend([
        {"$sort": {sort_by: sort_direction}},
        {"$skip": skip},
        {"$limit": limit}
    ])
    
    # Execute aggregation
    listings_collection = get_collection("crop_listings")
    cursor = listings_collection.aggregate(pipeline)
    results = await cursor.to_list(length=limit)
    
    # Convert to response format
    listings = []
    for result in results:
        # Convert ObjectIds to strings
        result["_id"] = str(result["_id"])
        result["farmer_id"] = str(result["farmer_id"])
        
        # Create CropListing object
        listing = CropListing(**result)
        listings.append(CropListingResponse.model_validate(listing))
    
    return listings

@router.get("/listings/{listing_id}", response_model=CropListingResponse)
async def get_crop_listing_details(
    listing_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get detailed information about a specific crop listing."""
    try:
        object_id = ObjectId(listing_id)
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid listing ID format"
        )
    
    # Get listing with farmer details
    listings_collection = get_collection("crop_listings")
    pipeline = [
        {"$match": {"_id": object_id}},
        {
            "$lookup": {
                "from": "users",
                "localField": "farmer_id",
                "foreignField": "_id",
                "as": "farmer"
            }
        },
        {"$unwind": "$farmer"}
    ]
    
    cursor = listings_collection.aggregate(pipeline)
    results = await cursor.to_list(length=1)
    
    if not results:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Crop listing not found"
        )
    
    result = results[0]
    result["_id"] = str(result["_id"])
    result["farmer_id"] = str(result["farmer_id"])
    
    listing = CropListing(**result)
    return CropListingResponse.model_validate(listing)

@router.post("/inquiries", response_model=InquiryResponse)
async def create_inquiry(
    inquiry_data: InquiryCreate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new inquiry for a crop listing."""
    # Verify the buyer role
    if current_user.role.value != "buyer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only buyers can create inquiries"
        )
    
    # Verify listing exists and is active
    try:
        listing_object_id = ObjectId(inquiry_data.listing_id)
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid listing ID format"
        )
    
    listings_collection = get_collection("crop_listings")
    listing = await listings_collection.find_one({
        "_id": listing_object_id,
        "status": ListingStatus.ACTIVE.value
    })
    
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Active crop listing not found"
        )
    
    # Check if buyer already has a pending inquiry for this listing
    inquiries_collection = get_collection("inquiries")
    existing_inquiry = await inquiries_collection.find_one({
        "listing_id": inquiry_data.listing_id,
        "buyer_id": current_user.id,
        "status": {"$in": [InquiryStatus.PENDING.value, InquiryStatus.NEGOTIATING.value]}
    })
    
    if existing_inquiry:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You already have a pending inquiry for this listing"
        )
    
    # Create inquiry
    inquiry_dict = {
        "listing_id": inquiry_data.listing_id,
        "buyer_id": current_user.id,
        "farmer_id": str(listing["farmer_id"]),
        "quantity_requested": inquiry_data.quantity_requested,
        "proposed_price": inquiry_data.proposed_price,
        "message": inquiry_data.message,
        "delivery_location": inquiry_data.delivery_location,
        "preferred_delivery_date": inquiry_data.preferred_delivery_date,
        "status": InquiryStatus.PENDING.value,
        "created_at": datetime.utcnow(),
        "updated_at": None
    }
    
    # Insert inquiry
    result = await inquiries_collection.insert_one(inquiry_dict)
    inquiry_dict["_id"] = str(result.inserted_id)
    
    # Create Pydantic model for response
    inquiry = Inquiry(**inquiry_dict)
    return InquiryResponse.model_validate(inquiry)

@router.get("/inquiries", response_model=List[InquiryResponse])
async def get_buyer_inquiries(
    status: Optional[InquiryStatus] = Query(None, description="Filter by inquiry status"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=100, description="Number of records to return"),
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all inquiries created by the current buyer."""
    if current_user.role.value != "buyer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only buyers can access buyer inquiries"
        )
    
    # Build query
    query = {"buyer_id": current_user.id}
    if status:
        query["status"] = status.value
    
    # Get inquiries with listing details
    inquiries_collection = get_collection("inquiries")
    pipeline = [
        {"$match": query},
        {
            "$lookup": {
                "from": "crop_listings",
                "localField": "listing_id",
                "foreignField": "_id",
                "as": "listing"
            }
        },
        {"$unwind": "$listing"},
        {"$sort": {"created_at": -1}},
        {"$skip": skip},
        {"$limit": limit}
    ]
    
    cursor = inquiries_collection.aggregate(pipeline)
    results = await cursor.to_list(length=limit)
    
    # Convert to response format
    inquiries = []
    for result in results:
        result["_id"] = str(result["_id"])
        inquiry = Inquiry(**result)
        inquiries.append(InquiryResponse.model_validate(inquiry))
    
    return inquiries

@router.put("/inquiries/{inquiry_id}", response_model=InquiryResponse)
async def update_inquiry(
    inquiry_id: str,
    inquiry_update: InquiryUpdate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update an existing inquiry (only by the buyer who created it)."""
    if current_user.role.value != "buyer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only buyers can update inquiries"
        )
    
    try:
        object_id = ObjectId(inquiry_id)
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid inquiry ID format"
        )
    
    # Find inquiry and verify ownership
    inquiries_collection = get_collection("inquiries")
    inquiry = await inquiries_collection.find_one({
        "_id": object_id,
        "buyer_id": current_user.id
    })
    
    if not inquiry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inquiry not found or you don't have permission to update it"
        )
    
    # Check if inquiry can be updated (only pending or negotiating)
    if inquiry["status"] not in [InquiryStatus.PENDING.value, InquiryStatus.NEGOTIATING.value]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot update inquiry with current status"
        )
    
    # Build update data
    update_data = {"updated_at": datetime.utcnow()}
    
    if inquiry_update.quantity_requested is not None:
        update_data["quantity_requested"] = inquiry_update.quantity_requested
    if inquiry_update.proposed_price is not None:
        update_data["proposed_price"] = inquiry_update.proposed_price
    if inquiry_update.message is not None:
        update_data["message"] = inquiry_update.message
    if inquiry_update.delivery_location is not None:
        update_data["delivery_location"] = inquiry_update.delivery_location
    if inquiry_update.preferred_delivery_date is not None:
        update_data["preferred_delivery_date"] = inquiry_update.preferred_delivery_date
    
    # Update inquiry
    await inquiries_collection.update_one(
        {"_id": object_id},
        {"$set": update_data}
    )
    
    # Get updated inquiry
    updated_inquiry = await inquiries_collection.find_one({"_id": object_id})
    updated_inquiry["_id"] = str(updated_inquiry["_id"])
    
    inquiry = Inquiry(**updated_inquiry)
    return InquiryResponse.model_validate(inquiry)

@router.delete("/inquiries/{inquiry_id}")
async def cancel_inquiry(
    inquiry_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Cancel an inquiry (soft delete by updating status)."""
    if current_user.role.value != "buyer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only buyers can cancel inquiries"
        )
    
    try:
        object_id = ObjectId(inquiry_id)
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid inquiry ID format"
        )
    
    # Find inquiry and verify ownership
    inquiries_collection = get_collection("inquiries")
    inquiry = await inquiries_collection.find_one({
        "_id": object_id,
        "buyer_id": current_user.id
    })
    
    if not inquiry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inquiry not found or you don't have permission to cancel it"
        )
    
    # Check if inquiry can be cancelled
    if inquiry["status"] in [InquiryStatus.COMPLETED.value, InquiryStatus.REJECTED.value]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot cancel inquiry with current status"
        )
    
    # Update status to rejected (cancelled by buyer)
    await inquiries_collection.update_one(
        {"_id": object_id},
        {"$set": {
            "status": InquiryStatus.REJECTED.value,
            "updated_at": datetime.utcnow()
        }}
    )
    
    return {"message": "Inquiry cancelled successfully"}

@router.get("/analytics")
async def get_buyer_analytics(
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get comprehensive analytics data for the buyer."""
    if current_user.role.value != "buyer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only buyers can access analytics"
        )
    
    # Get collections
    inquiries_collection = get_collection("inquiries")
    listings_collection = get_collection("crop_listings")
    
    # Calculate total spent (sum of completed inquiries)
    total_spent_pipeline = [
        {"$match": {
            "buyer_id": current_user.id,
            "status": InquiryStatus.COMPLETED.value
        }},
        {"$group": {
            "_id": None,
            "total": {"$sum": {"$multiply": ["$quantity_requested", "$proposed_price"]}}
        }}
    ]
    spent_result = await inquiries_collection.aggregate(total_spent_pipeline).to_list(1)
    total_spent = spent_result[0]["total"] if spent_result else 0
    
    # Calculate total orders
    total_orders = await inquiries_collection.count_documents({
        "buyer_id": current_user.id,
        "status": InquiryStatus.COMPLETED.value
    })
    
    # Calculate average order value
    average_order_value = total_spent / total_orders if total_orders > 0 else 0
    
    # Get top crops by value
    top_crops_pipeline = [
        {"$match": {
            "buyer_id": current_user.id,
            "status": InquiryStatus.COMPLETED.value
        }},
        {
            "$lookup": {
                "from": "crop_listings",
                "localField": "listing_id",
                "foreignField": "_id",
                "as": "listing"
            }
        },
        {"$unwind": "$listing"},
        {
            "$group": {
                "_id": "$listing.crop_name",
                "quantity": {"$sum": "$quantity_requested"},
                "value": {"$sum": {"$multiply": ["$quantity_requested", "$proposed_price"]}}
            }
        },
        {"$sort": {"value": -1}},
        {"$limit": 5},
        {
            "$project": {
                "crop": "$_id",
                "quantity": 1,
                "value": 1,
                "_id": 0
            }
        }
    ]
    top_crops_result = await inquiries_collection.aggregate(top_crops_pipeline).to_list(5)
    
    # Get monthly spending (last 6 months)
    from datetime import datetime, timedelta
    import calendar
    
    six_months_ago = datetime.utcnow() - timedelta(days=180)
    monthly_spending_pipeline = [
        {"$match": {
            "buyer_id": current_user.id,
            "status": InquiryStatus.COMPLETED.value,
            "created_at": {"$gte": six_months_ago}
        }},
        {
            "$group": {
                "_id": {
                    "year": {"$year": "$created_at"},
                    "month": {"$month": "$created_at"}
                },
                "amount": {"$sum": {"$multiply": ["$quantity_requested", "$proposed_price"]}}
            }
        },
        {"$sort": {"_id.year": 1, "_id.month": 1}},
        {
            "$project": {
                "month": {
                    "$let": {
                        "vars": {
                            "monthsInString": [
                                "", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                                "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
                            ]
                        },
                        "in": {"$arrayElemAt": ["$$monthsInString", "$_id.month"]}
                    }
                },
                "amount": 1,
                "_id": 0
            }
        }
    ]
    monthly_spending_result = await inquiries_collection.aggregate(monthly_spending_pipeline).to_list(6)
    
    return {
        "totalSpent": total_spent,
        "totalOrders": total_orders,
        "averageOrderValue": average_order_value,
        "topCrops": top_crops_result,
        "monthlySpending": monthly_spending_result
    }
