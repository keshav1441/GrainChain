"""
Crop management endpoints for GrainChain
Handles crop listings, marketplace, and crop-related operations
"""

from datetime import datetime
from typing import List, Optional
import logging

from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from pydantic import BaseModel
from bson import ObjectId

from ....api.deps import get_current_user
from ....models.user import User
from ....core.database import get_db, get_collection

logger = logging.getLogger(__name__)

router = APIRouter()

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

class CropCreateRequest(BaseModel):
    crop_type: str
    quantity: float
    price_per_kg: float
    location: str
    description: Optional[str] = None


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
                doc["price_per_kg"] = doc.get("price_per_unit", 0.0)
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
        if current_user.role != "farmer":
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
        listing_doc = await listings_collection.find_one({"_id": ObjectId(listing_id)})
        
        if not listing_doc:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Crop listing not found")
        
        # Convert ObjectId to string for the response
        listing_doc["id"] = str(listing_doc.pop("_id"))
        
        return CropListingResponse(**listing_doc)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting crop listing: {e}")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Crop listing not found")


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
                doc["price_per_kg"] = doc.get("price_per_unit", 0.0)
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
        if current_user.role != "farmer":
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
                doc["price_per_kg"] = doc.get("price_per_unit", 0.0)
            if "farmer_name" not in doc:
                doc["farmer_name"] = "Unknown Farmer"
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
