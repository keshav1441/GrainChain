"""
Crop management endpoints for GrainChain
Handles crop listings, marketplace, and crop-related operations
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

# Models for inquiries
class InquiryBase(BaseModel):
    buyer_id: str
    buyer_name: str
    listing_id: str
    crop_type: str
    quantity: float
    message: str
    status: str = "pending"  # pending, accepted, rejected
    price_per_kg: Optional[float] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class InquiryCreate(InquiryBase):
    pass

class InquiryResponse(InquiryBase):
    id: str = Field(alias="_id")
    listing_id: str = Field(alias="crop_listing_id")  
    farmer_id: str
    buyer_id: str
    farmer_id: str
    buyer_name: Optional[str] = "Unknown Buyer"  # Make optional with default
    crop_type: Optional[str] = "Unknown"  # Make optional with default
    quantity: Optional[float] = 0.0  # Make optional with default
    status: str = "pending"
    proposed_price: int
    farmer_response: Optional[str] = None
    counter_price: Optional[float] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        populate_by_name = True
        json_encoders = {
            ObjectId: str,
            datetime: lambda dt: dt.isoformat()
        }
    
    class Config:
        populate_by_name = True
        json_encoders = {
            ObjectId: str,
            datetime: lambda dt: dt.isoformat()
        }

class InquiryUpdate(BaseModel):
    status: str

# Basic crop models for now
class CropListingResponse(BaseModel):
    id: str
    crop_type: str
    quantity: float
    price_per_kg: float
    farmer_id: str
    farmer_name: str
    location: str
    status: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class CropCreateRequest(BaseModel):
    crop_type: str
    quantity: float = Field(..., gt=0, description="Quantity must be greater than 0")
    price_per_kg: float = Field(..., gt=0, description="Price per kg must be greater than 0")
    location: str
    description: Optional[str] = None
    images: Optional[List[str]] = None
    harvest_date: Optional[datetime] = None


@router.get("/listings", response_model=List[CropListingResponse])
async def get_crop_listings(
    crop_type: Optional[str] = None,
    location: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    skip: int = 0,
    limit: int = 20,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get crop listings with optional filters.
    
    - **crop_type**: Filter by crop type (e.g., 'wheat', 'rice')
    - **location**: Filter by location (partial match)
    - **min_price**: Minimum price per kg
    - **max_price**: Maximum price per kg
    - **skip**: Number of records to skip (for pagination)
    - **limit**: Maximum number of records to return (default: 20, max: 100)
    """
    try:
        # Validate limit
        if limit > 100:
            limit = 100
            
        # Build query filters
        query = {"status": "available"}  # Only show available listings by default
        
        if crop_type:
            query["crop_type"] = {"$regex": f"^{crop_type}$", "$options": "i"}  # Case-insensitive exact match
            
        if location:
            query["location"] = {"$regex": location, "$options": "i"}  # Case-insensitive partial match
            
        # Price range filter
        price_filter = {}
        if min_price is not None:
            price_filter["$gte"] = min_price
        if max_price is not None:
            price_filter["$lte"] = max_price
        if price_filter:
            query["price_per_kg"] = price_filter
        
        # Get listings from database
        listings_collection = get_collection("crop_listings")
        cursor = listings_collection.find(query).sort("created_at", -1).skip(skip).limit(limit)
        listings = []
        
        async for doc in cursor:
            # Convert ObjectId to string for the response
            doc["id"] = str(doc.pop("_id"))
            
            # Ensure all required fields exist with defaults
            if "price_per_kg" not in doc:
                doc["price_per_kg"] = doc.get("price_per_kg", 0.0)
            if "farmer_name" not in doc:
                doc["farmer_name"] = "Unknown Farmer"
            if "location" not in doc:
                doc["location"] = "Unknown Location"
            if "status" not in doc:
                doc["status"] = "available"
                
            listings.append(CropListingResponse(**doc))
        
        return listings
        
    except Exception as e:
        logger.error(f"Error getting crop listings: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")


@router.post("/listings", response_model=CropListingResponse)
async def create_crop_listing(
    request: CropCreateRequest,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new crop listing (farmers only)"""
    try:
        # Only farmers can create crop listings
        if current_user.role != UserRole.FARMER:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only farmers can create crop listings"
            )
        
        # Create listing document
        listing_data = {
            "crop_type": request.crop_type,
            "quantity": request.quantity,
            "price_per_kg": request.price_per_kg,
            "farmer_id": current_user.id,
            "farmer_name": current_user.full_name,
            "location": request.location,
            "description": request.description,
            "status": "available",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        # Insert into database
        listings_collection = get_collection("crop_listings")
        result = await listings_collection.insert_one(listing_data)
        
        # Create response
        new_listing = CropListingResponse(
            id=str(result.inserted_id),
            crop_type=request.crop_type,
            quantity=request.quantity,
            price_per_kg=request.price_per_kg,
            farmer_id=current_user.id,
            farmer_name=current_user.full_name,
            location=request.location,
            status="available"
        )
        
        logger.info(f"Crop listing created: {new_listing.id}")
        return new_listing
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating crop listing: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")


@router.get("/listings/{listing_id}", response_model=CropListingResponse)
async def get_crop_listing(
    listing_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get specific crop listing details"""
    try:
        # Query database for the specific listing
        listings_collection = get_collection("crop_listings")
        
        # Try to find by ObjectId first
        try:
            from bson.errors import InvalidId
            listing_doc = await listings_collection.find_one({"_id": ObjectId(listing_id)})
        except (InvalidId, TypeError):
            # If not a valid ObjectId, try finding by string ID
            listing_doc = await listings_collection.find_one({"id": listing_id})
            
            # If still not found, try case-insensitive search
            if not listing_doc:
                listing_doc = await listings_collection.find_one(
                    {"$or": [
                        {"id": {"$regex": f"^{listing_id}$", "$options": "i"}},
                        {"crop_type": {"$regex": f"^{listing_id}$", "$options": "i"}}
                    ]}
                )
        
        if not listing_doc:
            # Log the error for debugging
            logger.error(f"Crop listing not found with ID: {listing_id}")
            # Try to find any listing to check if the collection is accessible
            count = await listings_collection.count_documents({})
            logger.info(f"Total listings in collection: {count}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail=f"Crop listing not found with ID: {listing_id}"
            )
        
        # Convert ObjectId to string for the response if it exists
        if "_id" in listing_doc:
            listing_doc["id"] = str(listing_doc.pop("_id"))
        
        # Ensure all required fields exist with defaults
        if "price_per_kg" not in listing_doc:
            listing_doc["price_per_kg"] = listing_doc.get("price_per_kg", 0.0)
        if "farmer_name" not in listing_doc:
            listing_doc["farmer_name"] = "Unknown Farmer"
        if "location" not in listing_doc:
            listing_doc["location"] = "Unknown Location"
        if "status" not in listing_doc:
            listing_doc["status"] = "available"
        
        return CropListingResponse(**listing_doc)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting crop listing {listing_id}: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"Error retrieving crop listing: {str(e)}"
        )


@router.get("/marketplace", response_model=List[CropListingResponse])
async def get_marketplace_crops(
    limit: int = 20,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get crops available in marketplace"""
    try:
        # Validate limit
        if limit > 100:
            limit = 100
            
        # Query database for available listings
        listings_collection = get_collection("crop_listings")
        cursor = listings_collection.find({"status": "available"}).sort("created_at", -1).limit(limit)
        
        marketplace_crops = []
        async for doc in cursor:
            # Convert ObjectId to string for the response
            doc["id"] = str(doc.pop("_id"))
            
            # Ensure all required fields exist with defaults
            if "price_per_kg" not in doc:
                doc["price_per_kg"] = doc.get("price_per_kg", 0.0)
            if "farmer_name" not in doc:
                doc["farmer_name"] = "Unknown Farmer"
            if "location" not in doc:
                doc["location"] = "Unknown Location"
            if "status" not in doc:
                doc["status"] = "available"
                
            marketplace_crops.append(CropListingResponse(**doc))
        
        return marketplace_crops
        
    except Exception as e:
        logger.error(f"Error getting marketplace crops: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")


@router.get("/my-listings", response_model=List[CropListingResponse])
async def get_my_listings(
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all crop listings for the current farmer"""
    try:
        if current_user.role != UserRole.FARMER:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only farmers can view their listings"
            )

        listings_collection = get_collection("crop_listings")
        cursor = listings_collection.find({"farmer_id": current_user.id}).sort("created_at", -1)
        
        my_listings = []
        async for doc in cursor:
            doc["id"] = str(doc.pop("_id"))
            
            # Ensure all required fields exist with defaults
            if "price_per_kg" not in doc:
                doc["price_per_kg"] = doc.get("price_per_kg", 0.0)
            if "farmer_name" not in doc:
                doc["farmer_name"] = current_user.full_name or "Unknown Farmer"
            if "location" not in doc:
                doc["location"] = "Unknown Location"
            if "status" not in doc:
                doc["status"] = "available"
                
            my_listings.append(CropListingResponse(**doc))
        
        return my_listings
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting my listings for farmer {current_user.id}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")
# Fixed Inquiry Endpoints
@router.get("/inquiries", response_model=List[InquiryResponse])
async def get_farmer_inquiries(
    status_filter: Optional[str] = Query(None, alias="status"),
    skip: int = 0,
    limit: int = 100,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all inquiries for the current farmer's listings"""
    try:
        if current_user.role != UserRole.FARMER:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only farmers can view inquiries"
            )

        inquiries_collection = get_collection("inquiries")
        listings_collection = get_collection("crop_listings")
        users_collection = get_collection("users")
        
        # Build query to find inquiries for this farmer's listings
        query: Dict[str, Any] = {
            "farmer_id": str(current_user.id)
        }
        
        if status_filter:
            query["status"] = status_filter
            
        cursor = inquiries_collection.find(query).sort("created_at", -1).skip(skip).limit(limit)
        
        inquiries = []
        async for doc in cursor:
            try:
                # Convert ObjectId to string
                doc_id = str(doc.pop("_id"))
                
                # Map database fields to frontend expectations
                inquiry_data = {
                    "id": doc_id,
                    "buyer_id": doc.get("buyer_id", ""),
                    "farmer_id": doc.get("farmer_id", str(current_user.id)),  # Include farmer_id
                    "listing_id": doc.get("crop_listing_id", ""),  # Map crop_listing_id to listing_id
                    "quantity": doc.get("quantity_requested", 0.0),  # Map quantity_requested to quantity
                    "proposed_price": doc.get("proposed_price", 0.0),
                    "message": doc.get("message", ""),
                    "status": doc.get("status", "pending"),
                    "created_at": doc.get("created_at", datetime.now(timezone.utc))
                }
                
                # Fetch buyer name from users collection
                buyer_name = "Unknown Buyer"
                if doc.get("buyer_id"):
                    try:
                        buyer = await users_collection.find_one({"_id": ObjectId(doc["buyer_id"])})
                        if buyer:
                            buyer_name = buyer.get("full_name", "Unknown Buyer")
                    except Exception as buyer_error:
                        logger.warning(f"Could not fetch buyer name for {doc['buyer_id']}: {buyer_error}")
                
                inquiry_data["buyer_name"] = buyer_name
                
                # Fetch crop type and price_per_kg from crop listing
                crop_type = "Unknown"
                price_per_kg = None
                if doc.get("crop_listing_id"):
                    try:
                        listing = await listings_collection.find_one({"_id": ObjectId(doc["crop_listing_id"])})
                        if listing:
                            crop_type = listing.get("crop_type", "Unknown")
                            price_per_kg = listing.get("price_per_kg")
                    except Exception as listing_error:
                        logger.warning(f"Could not fetch listing details for {doc['crop_listing_id']}: {listing_error}")
                
                inquiry_data["crop_type"] = crop_type
                inquiry_data["price_per_kg"] = price_per_kg
                
                inquiries.append(InquiryResponse(**inquiry_data))
                
            except Exception as doc_error:
                logger.error(f"Error processing inquiry document {doc.get('_id', 'unknown')}: {doc_error}")
                # Skip this document and continue with others
                continue
            
        return inquiries
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting inquiries for farmer {current_user.id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="Failed to fetch inquiries"
        )

@router.get("/inquiries/{inquiry_id}", response_model=InquiryResponse)
async def get_inquiry(
    inquiry_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific inquiry by ID"""
    try:
        inquiries_collection = get_collection("inquiries")
        listings_collection = get_collection("crop_listings")
        users_collection = get_collection("users")
        
        # Find the inquiry
        inquiry = await inquiries_collection.find_one({"_id": ObjectId(inquiry_id)})
        if not inquiry:
            raise HTTPException(status_code=404, detail="Inquiry not found")
            
        # Verify the current user is the farmer who owns the listing
        if inquiry["farmer_id"] != str(current_user.id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to view this inquiry"
            )
        
        # Map database fields to frontend expectations
        inquiry_data = {
            "id": str(inquiry.pop("_id")),
            "buyer_id": inquiry.get("buyer_id", ""),
            "farmer_id": inquiry.get("farmer_id", str(current_user.id)),  # Include farmer_id
            "listing_id": inquiry.get("crop_listing_id", ""),
            "quantity": inquiry.get("quantity_requested", 0.0),
            "proposed_price": inquiry.get("proposed_price", 0.0),
            "message": inquiry.get("message", ""),
            "status": inquiry.get("status", "pending"),
            "created_at": inquiry.get("created_at", datetime.now(timezone.utc))
        }
        
        # Fetch additional data
        buyer_name = "Unknown Buyer"
        if inquiry.get("buyer_id"):
            buyer = await users_collection.find_one({"_id": ObjectId(inquiry["buyer_id"])})
            if buyer:
                buyer_name = buyer.get("full_name", "Unknown Buyer")
        
        crop_type = "Unknown"
        price_per_kg = None
        if inquiry.get("crop_listing_id"):
            listing = await listings_collection.find_one({"_id": ObjectId(inquiry["crop_listing_id"])})
            if listing:
                crop_type = listing.get("crop_type", "Unknown")
                price_per_kg = listing.get("price_per_kg")
        
        inquiry_data["buyer_name"] = buyer_name
        inquiry_data["crop_type"] = crop_type
        inquiry_data["price_per_kg"] = price_per_kg
            
        return InquiryResponse(**inquiry_data)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting inquiry {inquiry_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch inquiry")


@router.put("/inquiries/{inquiry_id}/respond", response_model=InquiryResponse)
async def respond_to_inquiry(
    inquiry_id: str,
    inquiry_update: InquiryUpdate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update the status of an inquiry (accept/reject)"""
    try:
        if current_user.role != UserRole.FARMER:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only farmers can respond to inquiries"
            )
            
        if inquiry_update.status not in ["accepted", "rejected"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Status must be either 'accepted' or 'rejected'"
            )
            
        inquiries_collection = get_collection("inquiries")
        listings_collection = get_collection("crop_listings")
        users_collection = get_collection("users")
        
        # Find the inquiry
        inquiry = await inquiries_collection.find_one({"_id": ObjectId(inquiry_id)})
        if not inquiry:
            raise HTTPException(status_code=404, detail="Inquiry not found")
            
        # Verify the current user is the farmer who owns the listing
        if inquiry["farmer_id"] != str(current_user.id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to respond to this inquiry"
            )
            
        # Update the inquiry
        update_data = {
            "status": inquiry_update.status,
            "updated_at": datetime.now(timezone.utc)
        }
        
        result = await inquiries_collection.update_one(
            {"_id": ObjectId(inquiry_id)},
            {"$set": update_data}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=500, detail="Failed to update inquiry")
            
        # If inquiry is accepted, optionally mark the listing as sold
        if inquiry_update.status == "accepted":
            # You might want to update listing status or reduce quantity
            await listings_collection.update_one(
                {"_id": ObjectId(inquiry["crop_listing_id"])},
                {"$set": {"status": "sold", "updated_at": datetime.now(timezone.utc)}}
            )
        
        # Get the updated inquiry and return it properly formatted
        updated_inquiry = await inquiries_collection.find_one({"_id": ObjectId(inquiry_id)})
        
        # Map database fields to frontend expectations
        inquiry_data = {
            "id": str(updated_inquiry.pop("_id")),
            "buyer_id": updated_inquiry.get("buyer_id", ""),
            "farmer_id": updated_inquiry.get("farmer_id", str(current_user.id)),  # Include farmer_id
            "listing_id": updated_inquiry.get("crop_listing_id", ""),
            "quantity": updated_inquiry.get("quantity_requested", 0.0),
            "proposed_price": updated_inquiry.get("proposed_price", 0.0),
            "message": updated_inquiry.get("message", ""),
            "status": updated_inquiry.get("status", "pending"),
            "created_at": updated_inquiry.get("created_at", datetime.now(timezone.utc))
        }
        
        # Fetch additional data
        buyer_name = "Unknown Buyer"
        if updated_inquiry.get("buyer_id"):
            buyer = await users_collection.find_one({"_id": ObjectId(updated_inquiry["buyer_id"])})
            if buyer:
                buyer_name = buyer.get("full_name", "Unknown Buyer")
        
        crop_type = "Unknown"
        price_per_kg = None
        if updated_inquiry.get("crop_listing_id"):
            listing = await listings_collection.find_one({"_id": ObjectId(updated_inquiry["crop_listing_id"])})
            if listing:
                crop_type = listing.get("crop_type", "Unknown")
                price_per_kg = listing.get("price_per_kg")
        
        inquiry_data["buyer_name"] = buyer_name
        inquiry_data["crop_type"] = crop_type
        inquiry_data["price_per_kg"] = price_per_kg
        
        return InquiryResponse(**inquiry_data)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error responding to inquiry {inquiry_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to update inquiry")