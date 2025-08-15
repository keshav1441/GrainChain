from typing import Generator, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.config import settings
from app.core.security import verify_token
from app.core.database import get_db, get_collection
from app.models.user import User, UserRole
from app.schemas.user import TokenData

security = HTTPBearer()



async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncIOMotorDatabase = Depends(get_db)
) -> dict:
    """Get current authenticated user from MongoDB as a dict."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = verify_token(credentials.credentials)
        user_id: str = payload.get("sub")
        if not user_id:
            raise credentials_exception
        token_data = TokenData(user_id=user_id)
    except JWTError:
        raise credentials_exception
    
    try:
        users_collection = get_collection("users")
        user_doc = await users_collection.find_one({"_id": ObjectId(token_data.user_id)})
    except Exception:
        raise credentials_exception
    
    if not user_doc:
        raise credentials_exception
    
    # Convert ObjectId to string for JSON compatibility
    user_doc["_id"] = str(user_doc["_id"])
    
    if not user_doc.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    return user_doc  # return as dict, not Pydantic model


async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """Get current active user."""
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

def require_roles(*allowed_roles: UserRole):
    """Dependency factory for role-based access control."""
    def role_checker(current_user: User = Depends(get_current_active_user)) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions"
            )
        return current_user
    return role_checker

# Role-specific dependencies
get_farmer_user = require_roles(UserRole.FARMER)
get_buyer_user = require_roles(UserRole.BUYER)
get_financier_user = require_roles(UserRole.FINANCIER)
get_admin_user = require_roles(UserRole.ADMIN)

# Multi-role dependencies
def get_farmer_or_admin(current_user: User = Depends(get_current_active_user)) -> User:
    if current_user.role not in [UserRole.FARMER, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access restricted to farmers and admins"
        )
    return current_user

def get_buyer_or_admin(current_user: User = Depends(get_current_active_user)) -> User:
    if current_user.role not in [UserRole.BUYER, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access restricted to buyers and admins"
        )
    return current_user
