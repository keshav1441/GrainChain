from fastapi import APIRouter
from app.api.v1.endpoints import auth, buyer, crops, users,orders, ai_ml, finance, inquiries, cart, payments, notifications, chatbot


api_router = APIRouter()

# Include authentication routes
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])

# Include user management routes
api_router.include_router(users.router, prefix="/users", tags=["users"])

# Include crop management routes
api_router.include_router(crops.router, prefix="/crops", tags=["crops"])

# Include order routes
api_router.include_router(orders.router, prefix="/orders", tags=["orders"])

# Include AI/ML routes
api_router.include_router(ai_ml.router, prefix="/ai-ml", tags=["ai-ml"])

# Include payment routes
api_router.include_router(payments.router, prefix="/payments", tags=["payments"])

# Include chatbot routes
api_router.include_router(chatbot.router, prefix="/chatbot", tags=["chatbot"])

# Include cart routes
# Note: cart endpoints already include the "/cart" prefix in their route definitions
api_router.include_router(cart.router, tags=["cart"])

# Include payment routes
api_router.include_router(payments.router, tags=["payments"])

# Include notifications routes
api_router.include_router(notifications.router, prefix="/notifications", tags=["notifications"])

# Health check endpoint
@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "service": "grainchain-api-v1"}
