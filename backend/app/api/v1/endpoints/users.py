"""
User management endpoints for GrainChain
Handles user profiles, verification, and user-related operations
"""

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.security import HTTPAuthorizationCredentials
from typing import List, Optional
import logging
import os
import shutil
from datetime import datetime
import uuid

from app.api.deps import get_current_user, security
from app.models.user import User
from app.schemas.user import (
    UserProfileResponse, 
    ProfileUpdateRequest, 
    DocumentUploadResponse,
    FarmerVerificationRequest,
    FinancierVerificationRequest,
    VerificationStatusResponse
)

logger = logging.getLogger(__name__)

router = APIRouter()

# Debug endpoint
@router.get("/debug")
async def debug_endpoint(
    current_user: User = Depends(get_current_user)
):
    """Debug endpoint to test authentication"""
    return {
        "user_id": current_user.id,
        "role": current_user.role,
        "email": current_user.email,
        "message": "Authentication working!"
    }

# Simple token validation endpoint
@router.get("/validate-token")
async def validate_token(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Validate token without database lookup"""
    try:
        from app.core.security import verify_token
        payload = verify_token(credentials.credentials)
        return {
            "valid": True,
            "payload": payload,
            "message": "Token is valid"
        }
    except Exception as e:
        return {
            "valid": False,
            "error": str(e),
            "message": "Token is invalid"
        }

# Upload directory for documents
UPLOAD_DIR = "uploads/documents"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Allowed file extensions for document uploads
ALLOWED_EXTENSIONS = {'.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'}




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
    request: ProfileUpdateRequest,
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
            location=f"{request.city or getattr(current_user, 'city', '')}, {request.state or getattr(current_user, 'state', '')}".strip(', ')
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


# PROFILE MANAGEMENT ENDPOINTS

@router.put("/profile/update")
async def update_profile(
    request: ProfileUpdateRequest,
    current_user: User = Depends(get_current_user)
):
    """Update user profile with role-specific information"""
    try:
        # Mock profile update - would be replaced with actual database update
        logger.info(f"Profile update request for user {current_user.id}: {request.dict(exclude_unset=True)}")
        
        # In a real implementation, you would:
        # 1. Update the User table with basic profile info
        # 2. Update role-specific tables (Farmer, Buyer, Financier) with additional info
        # 3. Handle file uploads and store document URLs
        
        return {
            "message": "Profile updated successfully",
            "user_id": current_user.id,
            "updated_fields": list(request.dict(exclude_unset=True).keys())
        }
        
    except Exception as e:
        logger.error(f"Error updating profile: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to update profile")


# DOCUMENT UPLOAD ENDPOINTS

def validate_file_extension(filename: str) -> bool:
    """Check if file extension is allowed"""
    return any(filename.lower().endswith(ext) for ext in ALLOWED_EXTENSIONS)


@router.post("/documents/upload", response_model=DocumentUploadResponse)
async def upload_document(
    file: UploadFile = File(...),
    document_type: str = Form(...),
    current_user: User = Depends(get_current_user)
):
    """Upload verification documents"""
    try:
        if not validate_file_extension(file.filename):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File type not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
            )
        
        # Generate unique filename
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{current_user.id}_{document_type}_{uuid.uuid4().hex}{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)
        
        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Generate file URL (in production, this would be a proper URL)
        file_url = f"/uploads/documents/{unique_filename}"
        
        logger.info(f"Document uploaded: {file_url} for user {current_user.id}")
        
        return DocumentUploadResponse(
            file_url=file_url,
            file_name=file.filename,
            document_type=document_type,
            uploaded_at=datetime.utcnow(),
            status="submitted"
        )
        
    except Exception as e:
        logger.error(f"Error uploading document: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to upload document")


# VERIFICATION ENDPOINTS

@router.post("/verification/farmer/submit")
async def submit_farmer_verification(
    request: FarmerVerificationRequest,
    current_user: User = Depends(get_current_user)
):
    """Submit farmer verification documents"""
    try:
        if current_user.role != "farmer":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only farmers can submit farmer verification"
            )
        
        # Mock submission - would be replaced with actual database update
        logger.info(f"Farmer verification submitted for user {current_user.id}: {request.dict()}")
        
        # In a real implementation, you would:
        # 1. Update the Farmer table with document URLs
        # 2. Set verification_submitted_at timestamp
        # 3. Update user verification_status to 'pending'
        # 4. Trigger notification to admin for review
        
        return {
            "message": "Verification documents submitted successfully. Your profile is now under verification and you will receive an update within 2-5 working days.",
            "status": "submitted",
            "submitted_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error submitting farmer verification: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to submit verification")


@router.post("/verification/financier/submit")
async def submit_financier_verification(
    request: FinancierVerificationRequest,
    current_user: User = Depends(get_current_user)
):
    """Submit financier verification documents"""
    try:
        if current_user.role != "financier":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only financiers can submit financier verification"
            )
        
        # Mock submission - would be replaced with actual database update
        logger.info(f"Financier verification submitted for user {current_user.id}: {request.dict()}")
        
        # In a real implementation, you would:
        # 1. Update the Financier table with document URLs
        # 2. Set verification_submitted_at timestamp
        # 3. Update user verification_status to 'pending'
        # 4. Trigger notification to admin for review
        
        return {
            "message": "Verification documents submitted successfully. Your profile is now under verification and you will receive an update within 2-5 working days.",
            "status": "submitted",
            "submitted_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error submitting financier verification: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to submit verification")


@router.get("/verification/status")
async def get_verification_status(
    current_user: User = Depends(get_current_user)
):
    """Get current user's verification status"""
    try:
        # Mock verification status - would be replaced with actual database query
        if current_user.role == "buyer":
            return {
                "status": "not_required",
                "message": "Buyers do not require verification"
            }
        
        # For farmers and financiers, mock different statuses
        mock_statuses = {
            "not_submitted": "Please submit your verification documents to complete your profile",
            "submitted": "Your verification documents have been submitted and are under review. You will receive an update within 2-5 working days.",
            "under_review": "Your verification documents are currently being reviewed by our team. You will receive an update within 2-5 working days.",
            "approved": "Your profile has been verified successfully!",
            "rejected": "Your verification was rejected. Please check your email for details and resubmit corrected documents."
        }
        
        # Mock status - in real implementation, get from database
        mock_status = "not_submitted"  # Start with not_submitted for demo
        
        response = {
            "status": mock_status,
            "message": mock_statuses[mock_status]
        }
        
        if mock_status in ["submitted", "under_review", "approved", "rejected"]:
            response["submitted_at"] = datetime.utcnow().isoformat()
        
        return response
        
    except Exception as e:
        logger.error(f"Error getting verification status: {e}")
        logger.exception(e)  # Log full stack trace
        return {
            "status": "error",
            "message": f"Error getting verification status: {str(e)}"
        }


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
