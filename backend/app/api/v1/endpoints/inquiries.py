import logging
from fastapi import APIRouter, Depends, HTTPException, status, Query
from ....core.database import get_db, get_collection
from ....api.deps import get_current_user
from pydantic import BaseModel
from datetime import datetime
from bson import ObjectId
from typing import List, Optional
from motor.motor_asyncio import AsyncIOMotorDatabase

# Set up logger
logger = logging.getLogger(__name__)

from app.models.user import User
from app.models.crop import Inquiry, InquiryStatus
from app.schemas.crop import (
InquiryCreate, InquiryResponse, InquiryUpdate
)
from app.api.deps import get_current_active_user

router = APIRouter()

# Buyer-specific routes
buyer_router = APIRouter(prefix="/buyer", tags=["buyer"])

class InquiryResponse(BaseModel):
    id: str
    listing_id: str
    buyer_id: str
    buyer_name: str
    quantity: float
    notes: str | None = None
    status: str
    created_at: datetime

@router.post("/", response_model=InquiryResponse)
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
        "status": "available"
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
        "crop_listing_id": inquiry_data.listing_id,
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
    
    # Get buyer info for response
    users_collection = get_collection("users")
    buyer = await users_collection.find_one({"_id": ObjectId(current_user.id)})
    
    # Create response object
    response_data = {
        "id": str(inquiry_dict["_id"]),
        "listing_id": inquiry_dict["crop_listing_id"],
        "buyer_id": inquiry_dict["buyer_id"],
        "buyer_name": buyer.get("full_name", ""),
        "quantity": inquiry_dict["quantity_requested"],
        "notes": inquiry_dict.get("message", ""),
        "status": inquiry_dict["status"],
        "created_at": inquiry_dict["created_at"]
    }
    
    return InquiryResponse(**response_data)

@router.get("/", response_model=List[InquiryResponse])
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
    
    # Build the base query
    query = {"buyer_id": str(current_user.id)}
    if status:
        query["status"] = status.value

    # Get the collection
    inquiries_collection = get_collection("inquiries")
    
    # Log the query for debugging
    logger.info(f"Querying inquiries with filter: {query}")
    
    try:
        # First, convert string IDs to ObjectId for the query
        from bson.objectid import ObjectId
        
        # Create aggregation pipeline with proper type conversion
        pipeline = [
            {"$match": query},
            {
                "$lookup": {
                    "from": "crop_listings",
                    "let": {"crop_listing_oid": {"$toObjectId": "$crop_listing_id"}},
                    "pipeline": [
                        {"$match": {"$expr": {"$eq": ["$_id", "$$crop_listing_oid"]}}},
                        {"$limit": 1}
                    ],
                    "as": "listing"
                }
            },
            {"$unwind": {"path": "$listing", "preserveNullAndEmptyArrays": True}},
            {
                "$lookup": {
                    "from": "users",
                    "let": {"farmer_oid": {"$toObjectId": "$farmer_id"}},
                    "pipeline": [
                        {"$match": {"$expr": {"$eq": ["$_id", "$$farmer_oid"]}}},
                        {"$limit": 1}
                    ],
                    "as": "farmer"
                }
            },
            {"$unwind": {"path": "$farmer", "preserveNullAndEmptyArrays": True}},
            {"$sort": {"created_at": -1}},
            {"$skip": skip},
            {"$limit": limit}
        ]
    
        # Execute the aggregation
        cursor = inquiries_collection.aggregate(pipeline)
        results = await cursor.to_list(length=None)
        
        # Log the number of results found
        logger.info(f"Found {len(results)} inquiries")
        
        # Process the results
        response = []
        for result in results:
            try:
                # Extract listing and farmer data
                listing = result.get("listing", {}) or {}
                farmer = result.get("farmer", {}) or {}
                
                # Log data for debugging
                logger.debug(f"Processing inquiry: {result.get('_id')}")
                
                # Create the response object according to InquiryResponse model
                inquiry_data = {
                    "id": str(result.get("_id")),  # Changed from _id to id
                    "listing_id": str(result.get("crop_listing_id")),
                    "buyer_id": str(result.get("buyer_id")),
                    "buyer_name": current_user.full_name,  # Add buyer_name from current_user
                    "farmer_id": str(result.get("farmer_id")),
                    "quantity": result.get("quantity_requested"),  # Changed from quantity_requested to quantity
                    "proposed_price": result.get("proposed_price"),
                    "message": result.get("message"),
                    "status": result.get("status"),
                    "farmer_response": result.get("farmer_response"),
                    "counter_price": result.get("farmer_counter_price"),
                    "created_at": result.get("created_at"),
                    "updated_at": result.get("updated_at"),
                    "preferred_delivery_date": result.get("preferred_delivery_date"),
                    "listing": {
                        "crop_name": listing.get("crop_name", "Unknown Crop"),
                        "farmer": {
                            "full_name": farmer.get("full_name", "Unknown Farmer")
                        }
                    }
                }
                
                # Create response model instance to validate
                response.append(InquiryResponse(**inquiry_data))
                
            except Exception as e:
                logger.error(f"Error processing inquiry {result.get('_id')}: {str(e)}", exc_info=True)
                continue
                
        return response
        
    except Exception as e:
        logger.error(f"Error in get_buyer_inquiries: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while fetching inquiries: {str(e)}"
        )

@buyer_router.get("/inquiries/{inquiry_id}", response_model=InquiryResponse)
async def get_buyer_inquiry(
    inquiry_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific inquiry by ID."""
    if current_user.role.value != "buyer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only buyers can view their inquiries"
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
            detail="Inquiry not found or you don't have permission to view it"
        )
    
    # Get user's full name
    users_collection = get_collection("users")
    user = await users_collection.find_one({"_id": ObjectId(current_user.id)})
    buyer_name = user.get("full_name", "") if user else ""
    
    # Get listing details
    listings_collection = get_collection("crop_listings")
    listing = await listings_collection.find_one({"_id": ObjectId(inquiry["listing_id"])})
    
    # Create response object
    response_data = {
        "id": str(inquiry.get("_id", "")),
        "listing_id": str(inquiry.get("listing_id", "")),
        "buyer_id": str(inquiry.get("buyer_id", "")),
        "buyer_name": buyer_name,
        "quantity": inquiry.get("quantity_requested", 0),
        "notes": inquiry.get("message", ""),
        "status": inquiry.get("status", ""),
        "created_at": inquiry.get("created_at", datetime.utcnow()),
        "listing": {
            "crop_name": listing.get("crop_name", "") if listing else "",
            "farmer": {
                "full_name": listing.get("farmer_name", "") if listing else ""
            }
        }
    }
    
    return InquiryResponse(**response_data)

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
