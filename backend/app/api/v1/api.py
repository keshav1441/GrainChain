from fastapi import APIRouter
from app.api.v1.endpoints import auth, buyer, crops, users, ai_ml, finance, inquiries

api_router = APIRouter()

# Include authentication routes
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])

# Include user management routes
api_router.include_router(users.router, prefix="/users", tags=["users"])

# Include crop management routes
api_router.include_router(crops.router, prefix="/crops", tags=["crops"])

# Include buyer routes
api_router.include_router(buyer.router, prefix="/buyer", tags=["buyer"])

# Include AI/ML routes
api_router.include_router(ai_ml.router, prefix="/ai-ml", tags=["ai-ml"])

# Include finance routes
api_router.include_router(finance.router, prefix="/finance", tags=["finance"])

# Include inquiries routes
api_router.include_router(inquiries.router, prefix="/inquiries", tags=["inquiries"])

# Health check endpoint
@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "service": "grainchain-api-v1"}
