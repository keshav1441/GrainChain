from fastapi import APIRouter, Depends, HTTPException, status, Query
from ....core.database import get_db, get_collection
from ....api.deps import get_current_user
from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId

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
    
    # Get inquiries collection first
    inquiries_collection = get_collection("inquiries")
    
    # Debug: Print first few documents to check data format
    sample_docs = await inquiries_collection.find({}).limit(3).to_list(3)
    print(f"Sample documents in inquiries collection: {sample_docs}")
    
    # Build query - use the exact field names from the database
    buyer_id = str(current_user.id)
    query = {"buyer_id": buyer_id}  # Match string buyer_id
    
    if status:
        query["status"] = status.value
        
    print(f"Querying inquiries with: {query}")  # Debug log
    
    # Get inquiries with listing details
    pipeline = [
        {"$match": query},
        {
            "$lookup": {
                "from": "crop_listings",
                "localField": "crop_listing_id",  # Changed from listing_id to match the actual field
                "foreignField": "_id",
                "as": "listing"
            }
        },
        {
            "$lookup": {
                "from": "users",
                "localField": "farmer_id",
                "foreignField": "_id",
                "as": "farmer"
            }
        },
        {"$unwind": "$listing"},
        {"$unwind": "$farmer"},
        {"$sort": {"created_at": -1}},
        {"$skip": skip},
        {"$limit": limit}
    ]
    
    cursor = inquiries_collection.aggregate(pipeline)
    results = await cursor.to_list(length=limit)
    
    print(f"Found {len(results)} raw inquiry results")  # Debug log
    
    # Get user's full name
    users_collection = get_collection("users")
    user = await users_collection.find_one({"_id": ObjectId(current_user.id)})
    buyer_name = user.get("full_name", "") if user else ""
    
    print(f"Current user: {current_user.id}, Buyer name: {buyer_name}")  # Debug log
    
    # Convert to response format
    response = []
    for result in results:
        # Get listing details if available
        listing = result.get('listing', [{}])[0] if result.get('listing') else {}
        
        response.append({
            "id": str(result.get("_id", "")),
            "listing_id": str(result.get("crop_listing_id", "")),
            "buyer_id": str(result.get("buyer_id", "")),
            "buyer_name": buyer_name,
            "quantity": result.get("quantity_requested", 0),
            "proposed_price": result.get("proposed_price", 0),
            "notes": result.get("message", ""),
            "status": result.get("status", "pending"),
            "created_at": result.get("created_at", datetime.utcnow()),
            "listing": {
                "crop_name": listing.get("crop_name", "Unknown Crop"),
                "farmer": {
                    "full_name": result.get("farmer_name", "Unknown Farmer")
                }
            }
        })
    
    return response

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
