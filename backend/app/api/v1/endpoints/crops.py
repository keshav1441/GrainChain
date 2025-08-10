"""
Crop management endpoints for GrainChain
Handles crop listings, marketplace, and crop-related operations
"""

from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
import logging

from ....api.deps import get_current_user
from ....models.user import User
from pydantic import BaseModel

logger = logging.getLogger(__name__)

router = APIRouter()

# Basic crop models for now
class CropListingResponse(BaseModel):
    id: str
    crop_type: str
    quantity: float
    price_per_kg: float
    farmer_id: str
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
    current_user: User = Depends(get_current_user)
):
    """Get crop listings with optional filters"""
    try:
        # Mock data for now - would be replaced with actual database queries
        mock_listings = [
            CropListingResponse(
                id="crop_001",
                crop_type="wheat",
                quantity=1000.0,
                price_per_kg=25.0,
                farmer_id="farmer_001",
                location="Punjab",
                status="available"
            ),
            CropListingResponse(
                id="crop_002",
                crop_type="rice",
                quantity=500.0,
                price_per_kg=30.0,
                farmer_id="farmer_002",
                location="Karnataka",
                status="available"
            )
        ]
        
        # Apply filters if provided
        filtered_listings = mock_listings
        if crop_type:
            filtered_listings = [l for l in filtered_listings if l.crop_type.lower() == crop_type.lower()]
        if location:
            filtered_listings = [l for l in filtered_listings if location.lower() in l.location.lower()]
        
        return filtered_listings
        
    except Exception as e:
        logger.error(f"Error getting crop listings: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")


@router.post("/listings", response_model=CropListingResponse)
async def create_crop_listing(
    request: CropCreateRequest,
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
        
        # Mock creation - would be replaced with actual database insert
        new_listing = CropListingResponse(
            id=f"crop_{len(str(current_user.id))}",
            crop_type=request.crop_type,
            quantity=request.quantity,
            price_per_kg=request.price_per_kg,
            farmer_id=current_user.id,
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
    current_user: User = Depends(get_current_user)
):
    """Get specific crop listing details"""
    try:
        # Mock data - would be replaced with database query
        mock_listing = CropListingResponse(
            id=listing_id,
            crop_type="wheat",
            quantity=1000.0,
            price_per_kg=25.0,
            farmer_id="farmer_001",
            location="Punjab",
            status="available"
        )
        
        return mock_listing
        
    except Exception as e:
        logger.error(f"Error getting crop listing: {e}")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Crop listing not found")


@router.get("/marketplace", response_model=List[CropListingResponse])
async def get_marketplace_crops(
    limit: int = 20,
    current_user: User = Depends(get_current_user)
):
    """Get crops available in marketplace"""
    try:
        # Mock marketplace data
        marketplace_crops = [
            CropListingResponse(
                id="market_001",
                crop_type="wheat",
                quantity=2000.0,
                price_per_kg=24.5,
                farmer_id="farmer_003",
                location="Haryana",
                status="available"
            ),
            CropListingResponse(
                id="market_002",
                crop_type="rice",
                quantity=1500.0,
                price_per_kg=28.0,
                farmer_id="farmer_004",
                location="West Bengal",
                status="available"
            )
        ]
        
        return marketplace_crops[:limit]
        
    except Exception as e:
        logger.error(f"Error getting marketplace crops: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")
