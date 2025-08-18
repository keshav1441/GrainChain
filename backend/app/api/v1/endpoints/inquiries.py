import logging
from fastapi import APIRouter, Depends, HTTPException, status, Query, Path
from ....core.database import get_db, get_collection
from ....api.deps import get_current_user
from pydantic import BaseModel, Field
from datetime import datetime
from bson import ObjectId
from typing import List, Optional, Dict, Any
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

@router.get("/")
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
    
    # Build the match stage
    match_stage = {"buyer_id": str(current_user.id)}
    if status:
        match_stage["status"] = status.value

    # Get inquiries collection
    inquiries_collection = get_collection("inquiries")
    
    logger.info(f"Querying inquiries with filter: {match_stage}")
    
    try:
        # Use aggregation pipeline to join with related collections
        pipeline = [
            {"$match": match_stage},
            {"$sort": {"created_at": -1}},
            {"$skip": skip},
            {"$limit": limit},
            # Convert crop_listing_id to ObjectId for lookup
            {
                "$addFields": {
                    "listing_object_id": {
                        "$cond": {
                            "if": {"$ne": ["$crop_listing_id", None]},
                            "then": {"$toObjectId": "$crop_listing_id"},
                            "else": None
                        }
                    },
                    "farmer_object_id": {
                        "$cond": {
                            "if": {"$ne": ["$farmer_id", None]},
                            "then": {"$toObjectId": "$farmer_id"},
                            "else": None
                        }
                    }
                }
            },
            # Lookup listing details
            {
                "$lookup": {
                    "from": "crop_listings",
                    "localField": "listing_object_id",
                    "foreignField": "_id",
                    "as": "listing_details"
                }
            },
            # Lookup farmer details
            {
                "$lookup": {
                    "from": "users",
                    "localField": "farmer_object_id",
                    "foreignField": "_id",
                    "as": "farmer_details"
                }
            },
            # Project the final structure
            {
                "$project": {
                    "id": {"$toString": "$_id"},
                    "listing_id": {"$ifNull": ["$crop_listing_id", ""]},
                    "buyer_id": {"$ifNull": ["$buyer_id", ""]},
                    "buyer_name": f"{current_user.full_name or 'Unknown Buyer'}",
                    "farmer_id": {"$ifNull": ["$farmer_id", ""]},
                    "quantity": {"$ifNull": ["$quantity_requested", 0]},
                    "proposed_price": "$proposed_price",
                    "message": "$message",
                    "delivery_location": "$delivery_location",
                    "preferred_delivery_date": "$preferred_delivery_date",
                    "status": {"$ifNull": ["$status", ""]},
                    "farmer_response": "$farmer_response",
                    "counter_price": "$farmer_counter_price",
                    "created_at": {"$ifNull": ["$created_at", datetime.utcnow()]},
                    "updated_at": "$updated_at",
                    "listing": {
                        "crop_name": {
                            "$ifNull": [
                                {"$arrayElemAt": ["$listing_details.crop_type", 0]},
                                "Unknown Crop"
                            ]
                        },
                        "farmer": {
                            "full_name": {
                                "$ifNull": [
                                    {"$arrayElemAt": ["$farmer_details.full_name", 0]},
                                    "Unknown Farmer"
                                ]
                            }
                        }
                    }
                }
            }
        ]
        
        # Execute aggregation pipeline
        cursor = inquiries_collection.aggregate(pipeline)
        result = await cursor.to_list(length=None)
        
        # Convert any remaining ObjectId to string
        for item in result:
            if isinstance(item.get("_id"), ObjectId):
                item["_id"] = str(item["_id"])

        logger.info(f"Found {len(result)} inquiries")
        return result[:3]
        
    except Exception as e:
        logger.error(f"Error in get_buyer_inquiries: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while fetching inquiries: {str(e)}"
        )


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


@router.get("/farmer", response_model=List[Dict[str, Any]])
async def get_farmer_inquiries(
    status: Optional[InquiryStatus] = Query(None, description="Filter by inquiry status"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=100, description="Number of records to return"),
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get all inquiries for the current farmer's listings.
    """
    if current_user.role.value != "farmer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only farmers can view their listing inquiries"
        )
    
    try:
        inquiries_collection = get_collection("inquiries")
        listings_collection = get_collection("crop_listings")
        users_collection = get_collection("users")
        
        # Build query for farmer's inquiries
        query: Dict[str, Any] = {"farmer_id": current_user.id}
        
        # Add status filter if provided
        if status:
            query["status"] = status.value
        
        # Get inquiries with pagination
        cursor = inquiries_collection.find(query).sort("created_at", -1).skip(skip).limit(limit)
        inquiries = await cursor.to_list(limit)
        
        # Get listing and buyer details for each inquiry
        result = []
        for inquiry in inquiries:
            # Get listing details
            listing = await listings_collection.find_one({"_id": ObjectId(inquiry["crop_listing_id"])})
            
            # Get buyer details
            buyer = await users_collection.find_one({"_id": ObjectId(inquiry["buyer_id"])})
            
            # Get crop name from listing or use a default
            crop_name = "Unknown Crop"
            if listing:
                crop_name = listing.get("crop_name") or listing.get("crop_type", "Unknown Crop")
            
            # Prepare listing data with serialized ObjectIds
            listing_data = None
            if listing:
                listing_data = {
                    "id": str(listing.get("_id")),
                    "crop_name": listing.get("crop_name") or "Unknown Crop",
                    "crop_type": listing.get("crop_type"),
                    "price_per_kg": float(listing.get("price_per_kg", 0)),
                    "quantity_available": float(listing.get("quantity_available", 0)),
                    "status": listing.get("status", "unknown")
                }

            # Format the response with serializable data types
            inquiry_data = {
                "id": str(inquiry["_id"]),
                "listing_id": str(inquiry["crop_listing_id"]),
                "buyer_id": str(inquiry["buyer_id"]),
                "buyer_name": buyer.get("full_name") if buyer else "Unknown Buyer",
                "crop_name": crop_name,
                "quantity_requested": float(inquiry["quantity_requested"]),
                "proposed_price": float(inquiry["proposed_price"]),
                "status": inquiry["status"],
                "created_at": inquiry["created_at"].isoformat() if hasattr(inquiry["created_at"], 'isoformat') else inquiry["created_at"],
                "message": inquiry.get("message"),
                "listing": listing_data,
                "buyer": {
                    "id": str(buyer["_id"]) if buyer else None,
                    "name": buyer.get("full_name") if buyer else "Unknown Buyer",
                    "email": buyer.get("email") if buyer else None,
                    "phone": buyer.get("phone") if buyer else None
                } if buyer else None
            }
            result.append(inquiry_data)
        
        return result
        
    except Exception as e:
        logger.error(f"Error in get_farmer_inquiries: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while fetching farmer inquiries: {str(e)}"
        )


@router.get("/farmer/{inquiry_id}", response_model=Dict[str, Any])
async def get_farmer_inquiry(
    inquiry_id: str = Path(..., description="ID of the inquiry to fetch"),
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get a specific inquiry by ID for the current farmer's listings.
    """
    if current_user.role.value != "farmer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only farmers can view their listing inquiries"
        )
    
    try:
        object_id = ObjectId(inquiry_id)
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid inquiry ID format"
        )
    
    try:
        inquiries_collection = get_collection("inquiries")
        listings_collection = get_collection("crop_listings")
        users_collection = get_collection("users")
        
        # Find inquiry and verify it's for the farmer's listing
        inquiry = await inquiries_collection.find_one({
            "_id": object_id,
            "farmer_id": current_user.id
        })
        
        if not inquiry:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Inquiry not found or you don't have permission to view it"
            )
        
        # Get listing details
        listing = await listings_collection.find_one({"crop_listing_id": inquiry["crop_listing_id"]})
        
        # Get buyer details
        buyer = await users_collection.find_one({"user_id": inquiry["buyer_id"]})
        
        # Format the response
        return {
            "_id": str(inquiry["_id"]),
            "listing_id": str(inquiry["crop_listing_id"]),
            "buyer_id": inquiry["buyer_id"],
            "buyer_name": buyer.get("full_name") if buyer else "Unknown Buyer",
            "quantity_requested": inquiry["quantity_requested"],
            "proposed_price": inquiry["proposed_price"],
            "status": inquiry["status"],
            "created_at": inquiry["created_at"],
            "message": inquiry.get("message"),
            "delivery_location": inquiry.get("delivery_location"),
            "preferred_delivery_date": inquiry.get("preferred_delivery_date"),
            "listing": {
                "crop_name": listing.get("crop_name") if listing else "Unknown Listing",
                "variety": listing.get("variety"),
                "price_per_kg": listing.get("price_per_kg") if listing else 0,
                "quantity_available": listing.get("quantity_available") if listing else 0,
                "status": listing.get("status") if listing else "unknown"
            } if listing else None,
            "buyer": {
                "name": buyer.get("full_name") if buyer else "Unknown Buyer",
                "phone": buyer.get("phone"),
                "email": buyer.get("email"),
                "company": buyer.get("company")
            } if buyer else None
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_farmer_inquiry: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while fetching the inquiry: {str(e)}"
        )


@router.put("/farmer/{inquiry_id}/respond", response_model=Dict[str, Any])
async def respond_to_inquiry(
    inquiry_id: str = Path(..., description="ID of the inquiry to respond to"),
    response_data: Dict[str, Any] = {
        "status": Field(..., description="New status: 'accepted', 'rejected', or 'counter_offer'"),
        "message": Field(None, description="Optional message to the buyer"),
        "counter_price": Field(None, description="Required if status is 'counter_offer'"),
        "delivery_date": Field(None, description="Proposed delivery date if accepting the inquiry")
    },
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Respond to an inquiry (farmer's action).
    """
    if current_user.role.value != "farmer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only farmers can respond to inquiries"
        )
    
    # Validate response data
    status_val = response_data.get("status")
    if status_val not in ["accepted", "rejected", "counter_offer"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid status. Must be 'accepted', 'rejected', or 'counter_offer'"
        )
    
    if status_val == "counter_offer" and "counter_price" not in response_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="counter_price is required for counter offers"
        )
    
    try:
        object_id = ObjectId(inquiry_id)
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid inquiry ID format"
        )
    
    try:
        inquiries_collection = get_collection("inquiries")
        listings_collection = get_collection("crop_listings")
        
        # Find inquiry and verify it's for the farmer's listing and is in a valid state
        inquiry = await inquiries_collection.find_one({
            "_id": object_id,
            "farmer_id": current_user.id,
            "status": {"$in": ["pending", "counter_offer"]}  # Only allow responding to these statuses
        })
        
        if not inquiry:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Inquiry not found, already processed, or cannot be modified"
            )
        
        # Get listing to verify availability
        listing = await listings_collection.find_one({
            "crop_listing_id": inquiry["crop_listing_id"]
        })
        
        if not listing or listing.get("status") != "available":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The listing is no longer available"
            )
        
        # Prepare update data
        update_data = {
            "status": status_val,
            "updated_at": datetime.utcnow(),
            "farmer_message": response_data.get("message"),
        }
        
        if status_val == "accepted":
            # For accepted offers, set the final price and quantity
            update_data["final_price"] = inquiry.get("proposed_price")
            update_data["final_quantity"] = inquiry["quantity_requested"]
            update_data["delivery_date"] = response_data.get("delivery_date")
            
            # Mark listing as reserved
            await listings_collection.update_one(
                {"crop_listing_id": inquiry["crop_listing_id"]},
                {"$inc": {"quantity_reserved": inquiry["quantity_requested"]}}
            )
            
        elif status_val == "counter_offer":
            # For counter offers, update the proposed price
            update_data["proposed_price"] = response_data["counter_price"]
        
        # Update the inquiry
        await inquiries_collection.update_one(
            {"_id": object_id},
            {"$set": update_data}
        )
        
        # Get the updated inquiry
        updated_inquiry = await inquiries_collection.find_one({"_id": object_id})
        
        # TODO: Send notification to buyer about the response
        
        return {
            "status": "success",
            "message": f"Inquiry {status_val} successfully",
            "inquiry_id": str(updated_inquiry["_id"]),
            "status": updated_inquiry["status"]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in respond_to_inquiry: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while processing your response: {str(e)}"
        )

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
