from datetime import timedelta, datetime
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId

from app.core.database import get_db, get_collection
from app.core.security import verify_password, get_password_hash, create_access_token
from app.core.config import settings
from app.models.user import User, Farmer, Buyer, Financier
from app.schemas.user import (
    UserCreate, UserResponse, Token, LoginRequest, 
    FarmerCreate, BuyerCreate, FinancierCreate,
    CompleteUserProfileResponse
)
from app.api.deps import get_current_active_user

router = APIRouter()

@router.post("/register", response_model=Token)
async def register_user(
    user_data: UserCreate,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Register a new user."""
    # Check if user already exists
    users_collection = get_collection("users")
    existing_user = await users_collection.find_one(
        {"$or": [
            {"email": user_data.email},
            {"phone": user_data.phone}
        ]}
    )
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email or phone already exists"
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    user_dict = {
        "email": user_data.email,
        "phone": user_data.phone,
        "hashed_password": hashed_password,
        "full_name": user_data.full_name,
        "role": user_data.role.value,
        "latitude": user_data.latitude,
        "longitude": user_data.longitude,
        "address": user_data.address,
        "city": user_data.city,
        "state": user_data.state,
        "country": user_data.country,
        "pincode": user_data.pincode,
        "verification_status": "pending",
        "is_active": True,
        "created_at": datetime.utcnow(),
        "updated_at": None,
        "last_login": None
    }
    
    # Insert user into database
    result = await users_collection.insert_one(user_dict)
    user_dict["_id"] = str(result.inserted_id)
    
    # Create Pydantic model for response
    db_user = User(**user_dict)
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(result.inserted_id)},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserResponse.model_validate(db_user)
    }

@router.post("/login", response_model=Token)
async def login_user(
    login_data: LoginRequest,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Authenticate user and return access token."""
    # Get user by email
    users_collection = get_collection("users")
    user_doc = await users_collection.find_one({"email": login_data.email})
    
    if not user_doc or not verify_password(login_data.password, user_doc["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user_doc.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    # Update last login
    await users_collection.update_one(
        {"_id": user_doc["_id"]},
        {"$set": {"last_login": datetime.utcnow()}}
    )
    
    # Create Pydantic model for response
    user_doc["_id"] = str(user_doc["_id"])
    user = User(**user_doc)
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user_doc["_id"])},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserResponse.model_validate(user)
    }

@router.get("/me", response_model=CompleteUserProfileResponse)
async def get_current_user_profile(
    current_user: User = Depends(get_current_active_user)
):
    """Get current user's complete profile."""
    # Get profile data based on user role
    farmer_profile = None
    buyer_profile = None
    financier_profile = None
    
    if current_user.role.value == "farmer":
        farmers_collection = get_collection("farmers")
        farmer_doc = await farmers_collection.find_one({"user_id": current_user.id})
        if farmer_doc:
            farmer_doc["_id"] = str(farmer_doc["_id"])
            farmer_profile = Farmer(**farmer_doc)
    elif current_user.role.value == "buyer":
        buyers_collection = get_collection("buyers")
        buyer_doc = await buyers_collection.find_one({"user_id": current_user.id})
        if buyer_doc:
            buyer_doc["_id"] = str(buyer_doc["_id"])
            buyer_profile = Buyer(**buyer_doc)
    elif current_user.role.value == "financier":
        financiers_collection = get_collection("financiers")
        financier_doc = await financiers_collection.find_one({"user_id": current_user.id})
        if financier_doc:
            financier_doc["_id"] = str(financier_doc["_id"])
            financier_profile = Financier(**financier_doc)
    
    return CompleteUserProfileResponse(
        user=UserResponse.model_validate(current_user),
        farmer_profile=farmer_profile,
        buyer_profile=buyer_profile,
        financier_profile=financier_profile
    )

@router.post("/complete-profile/farmer")
async def complete_farmer_profile(
    farmer_data: FarmerCreate,
    current_user: User = Depends(get_current_active_user)
):
    """Complete farmer profile after registration."""
    if current_user.role.value != "farmer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only farmers can complete farmer profile"
        )
    
    # Check if farmer profile already exists
    existing_farmer = await Farmer.find_one({"user_id": current_user.id})
    
    if existing_farmer:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Farmer profile already exists"
        )
    
    # Create farmer profile
    db_farmer = Farmer(
        user_id=current_user.id,
        **farmer_data.model_dump()
    )
    
    await db_farmer.insert()
    
    return {"message": "Farmer profile completed successfully"}

@router.post("/complete-profile/buyer")
async def complete_buyer_profile(
    buyer_data: BuyerCreate,
    current_user: User = Depends(get_current_active_user)
):
    """Complete buyer profile after registration."""
    if current_user.role.value != "buyer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only buyers can complete buyer profile"
        )
    
    # Check if buyer profile already exists
    existing_buyer = await Buyer.find_one({"user_id": current_user.id})
    
    if existing_buyer:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Buyer profile already exists"
        )
    
    # Create buyer profile
    db_buyer = Buyer(
        user_id=current_user.id,
        **buyer_data.model_dump()
    )
    
    await db_buyer.insert()
    
    return {"message": "Buyer profile completed successfully"}

@router.post("/complete-profile/financier")
async def complete_financier_profile(
    financier_data: FinancierCreate,
    current_user: User = Depends(get_current_active_user)
):
    """Complete financier profile after registration."""
    if current_user.role.value != "financier":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only financiers can complete financier profile"
        )
    
    # Check if financier profile already exists
    existing_financier = await Financier.find_one({"user_id": current_user.id})
    
    if existing_financier:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Financier profile already exists"
        )
    
    # Create financier profile
    db_financier = Financier(
        user_id=current_user.id,
        **financier_data.model_dump()
    )
    
    await db_financier.insert()
    
    return {"message": "Financier profile completed successfully"}
