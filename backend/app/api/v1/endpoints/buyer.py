import logging
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId

# Set up logging
logger = logging.getLogger(__name__)

from app.core.database import get_db, get_collection
from app.models.user import User, Buyer
from app.models.crop import CropListing, Inquiry, InquiryStatus, CropCategory, ListingStatus, CropGrade
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
    min_price: Optional[float] = Query(None, description="Minimum price per kg"),
    max_price: Optional[float] = Query(None, description="Maximum price per kg"),
    
    # Quantity filters
    min_quantity: Optional[float] = Query(None, description="Minimum available quantity"),
    max_quantity: Optional[float] = Query(None, description="Maximum available quantity"),
    
    # Pagination
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=100, description="Number of records to return"),
    
    # Sorting
    sort_by: str = Query("created_at", description="Sort field: created_at, price_per_kg, quantity_available"),
    sort_order: str = Query("desc", description="Sort order: asc or desc"),
    
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Search and filter crop listings for buyers.
    Returns paginated results with sorting options.
    """
    # Build MongoDB query - only active listings by default
    query = {"status": "available"}
    
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
        query["price_per_kg"] = price_filter
    
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
    
    # Execute query with pagination and sorting
    sort_order = 1 if sort_order == "asc" else -1
    sort_field = sort_by if sort_by in ["created_at", "price_per_kg", "quantity_available"] else "created_at"
    
    # For dashboard, always sort by created_at in descending order
    if skip == 0 and limit == 3 and sort_field == "created_at" and sort_order == -1:
        cursor = (
            db["crop_listings"]
            .find(query)
            .sort("created_at", -1)
            .limit(limit)
        )
    else:
        cursor = (
            db["crop_listings"]
            .find(query)
            .sort([(sort_field, sort_order)])
            .skip(skip)
            .limit(limit)
        )
    
    # Execute aggregation
    results = await cursor.to_list(length=limit)
    
    # Convert to response format
    listings = []
    for result in results:
        try:
            # Transform the document to match CropListing model
            listing_data = {
                "_id": str(result["_id"]),
                "farmer_id": str(result["farmer_id"]),
                "farmer_name": result.get("farmer_name", "Unknown Farmer"),
                "crop_name": result.get("crop_type", "Unnamed Crop"),
                "title": result.get("title", result.get("crop_name", "Crop Listing")),
                "category": CropCategory(result.get("category", "cereals")),  # Default to 'cereals' if not specified
                "variety": result.get("variety"),
                "quantity_available": result.get("quantity_available", 0),
                "price_per_kg": result.get("price_per_kg", 0),
                "grade": result.get("grade"),
                "location": result.get("location", ""),
                "pickup_location": result.get("pickup_location", result.get("location", "")),  # Use location as fallback
                "harvest_date": result.get("harvest_date"),
                "description": result.get("description", ""),
                "images": result.get("images", []),
                "certifications": result.get("certifications", []),
                "storage_location": result.get("storage_location"),
                "status": result.get("status", "available"),
                "created_at": result.get("created_at", datetime.utcnow()),
                "updated_at": result.get("updated_at", datetime.utcnow())
            }
            
            # Create CropListing object and convert to dict for response
            listing = CropListing(**listing_data)
            # Convert to dict and include all fields
            listing_dict = listing.model_dump(by_alias=True)
            # Ensure all required fields for CropListingResponse are present
            response_data = {
                # Required fields from CropListingBase
                "crop_name": listing_dict.get("crop_name", ""),
                "category": listing_dict.get("category", "cereals"),
                "variety": listing_dict.get("variety"),
                "quantity_available": listing_dict.get("quantity_available", 0),
                "price_per_kg": listing_dict.get("price_per_kg", 0),
                "location": listing_dict.get("location", ""),
                "harvest_date": listing_dict.get("harvest_date"),
                "description": listing_dict.get("description", ""),
                "images": listing_dict.get("images", []),
                "certifications": listing_dict.get("certifications", []),
                "storage_location": listing_dict.get("storage_location"),
                
                # Required fields from CropListingResponse
                "_id": str(listing_dict.get("_id", "")),
                "farmer_id": str(listing_dict.get("farmer_id", "")),
                "status": listing_dict.get("status", ListingStatus.ACTIVE.value),  
                "created_at": listing_dict.get("created_at", datetime.utcnow()),
                "updated_at": listing_dict.get("updated_at", datetime.utcnow()),
                
                # Additional fields
                "farmer": {
                    "id": str(listing_dict.get("farmer_id", "")),
                    "name": listing_dict.get("farmer_name", "Unknown Farmer")
                }
            }
            listings.append(response_data)
            
        except Exception as e:
            logger.error(f"Error processing listing {result.get('_id')}: {str(e)}")
            continue  # Skip this listing if there's an error
    
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
