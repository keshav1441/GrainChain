"""
User management endpoints for GrainChain
Handles user profiles, verification, and user-related operations
"""

from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
import logging

from ....api.deps import get_current_user
from ....models.user import User
from pydantic import BaseModel

logger = logging.getLogger(__name__)

router = APIRouter()

# User response models
class UserProfileResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    phone: Optional[str] = None
    is_verified: bool = False
    location: Optional[str] = None

class UserUpdateRequest(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None


@router.get("/profile", response_model=UserProfileResponse)
async def get_user_profile(
    current_user: User = Depends(get_current_user)
):
    """Get current user's profile"""
    try:
        return UserProfileResponse(
            id=current_user.id,
            email=current_user.email,
            full_name=current_user.full_name,
            role=current_user.role,
            phone=getattr(current_user, 'phone', None),
            is_verified=getattr(current_user, 'is_verified', False),
            location=f"{getattr(current_user, 'latitude', 0)}, {getattr(current_user, 'longitude', 0)}"
        )
        
    except Exception as e:
        logger.error(f"Error getting user profile: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")


@router.put("/profile", response_model=UserProfileResponse)
async def update_user_profile(
    request: UserUpdateRequest,
    current_user: User = Depends(get_current_user)
):
    """Update current user's profile"""
    try:
        # Mock update - would be replaced with actual database update
        updated_profile = UserProfileResponse(
            id=current_user.id,
            email=current_user.email,
            full_name=request.full_name or current_user.full_name,
            role=current_user.role,
            phone=request.phone or getattr(current_user, 'phone', None),
            is_verified=getattr(current_user, 'is_verified', False),
            location=request.location or f"{getattr(current_user, 'latitude', 0)}, {getattr(current_user, 'longitude', 0)}"
        )
        
        logger.info(f"User profile updated: {current_user.id}")
        return updated_profile
        
    except Exception as e:
        logger.error(f"Error updating user profile: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")


@router.get("/farmers", response_model=List[UserProfileResponse])
async def get_farmers(
    limit: int = 20,
    current_user: User = Depends(get_current_user)
):
    """Get list of farmers (buyers and financiers only)"""
    try:
        # Only buyers and financiers can view farmer lists
        if current_user.role not in ["buyer", "financier"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        # Mock farmer data
        farmers = [
            UserProfileResponse(
                id="farmer_001",
                email="farmer1@example.com",
                full_name="Rajesh Kumar",
                role="farmer",
                phone="+91-9876543210",
                is_verified=True,
                location="Punjab, India"
            ),
            UserProfileResponse(
                id="farmer_002",
                email="farmer2@example.com",
                full_name="Priya Sharma",
                role="farmer",
                phone="+91-9876543211",
                is_verified=True,
                location="Karnataka, India"
            )
        ]
        
        return farmers[:limit]
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting farmers: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")


@router.get("/buyers", response_model=List[UserProfileResponse])
async def get_buyers(
    limit: int = 20,
    current_user: User = Depends(get_current_user)
):
    """Get list of buyers (farmers only)"""
    try:
        # Only farmers can view buyer lists
        if current_user.role != "farmer":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only farmers can view buyers"
            )
        
        # Mock buyer data
        buyers = [
            UserProfileResponse(
                id="buyer_001",
                email="buyer1@example.com",
                full_name="AgriCorp Ltd",
                role="buyer",
                phone="+91-9876543220",
                is_verified=True,
                location="Mumbai, India"
            ),
            UserProfileResponse(
                id="buyer_002",
                email="buyer2@example.com",
                full_name="GrainTrade Co",
                role="buyer",
                phone="+91-9876543221",
                is_verified=True,
                location="Delhi, India"
            )
        ]
        
        return buyers[:limit]
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting buyers: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")


@router.get("/financiers", response_model=List[UserProfileResponse])
async def get_financiers(
    limit: int = 20,
    current_user: User = Depends(get_current_user)
):
    """Get list of financiers (farmers only)"""
    try:
        # Only farmers can view financier lists
        if current_user.role != "farmer":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only farmers can view financiers"
            )
        
        # Mock financier data
        financiers = [
            UserProfileResponse(
                id="financier_001",
                email="financier1@example.com",
                full_name="AgriBank Ltd",
                role="financier",
                phone="+91-9876543230",
                is_verified=True,
                location="Bangalore, India"
            ),
            UserProfileResponse(
                id="financier_002",
                email="financier2@example.com",
                full_name="Rural Finance Co",
                role="financier",
                phone="+91-9876543231",
                is_verified=True,
                location="Chennai, India"
            )
        ]
        
        return financiers[:limit]
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting financiers: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")


@router.get("/{user_id}", response_model=UserProfileResponse)
async def get_user_by_id(
    user_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get user profile by ID"""
    try:
        # Mock user data - would be replaced with database query
        mock_user = UserProfileResponse(
            id=user_id,
            email="user@example.com",
            full_name="Sample User",
            role="farmer",
            phone="+91-9876543240",
            is_verified=True,
            location="Sample Location"
        )
        
        return mock_user
        
    except Exception as e:
        logger.error(f"Error getting user by ID: {e}")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
