from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict, Any, List
from app.core.chatbot_service import chatbot_service
from app.api.deps import get_current_user
from app.models.user import User
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/chat")
async def chat_with_bot(
    request: Dict[str, Any],
    current_user: User = Depends(get_current_user)
):
    """
    Chat with the agricultural assistant bot
    
    - **message**: User's message to the chatbot
    """
    try:
        message = request.get("message", "").strip()
        
        if not message:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Message cannot be empty"
            )
        
        # Build user context
        user_context = {
            "role": current_user.role,
            "location": getattr(current_user, 'location', ''),
            "user_id": str(current_user.id)
        }
        
        # Get bot response
        response = await chatbot_service.get_response(message, user_context)
        
        logger.info(f"Chatbot response generated for user {current_user.id}")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in chatbot endpoint: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get chatbot response"
        )

@router.get("/suggestions")
async def get_chat_suggestions(
    current_user: User = Depends(get_current_user)
):
    """
    Get quick chat suggestions based on user role
    """
    try:
        suggestions = await chatbot_service.get_quick_suggestions(current_user.role)
        
        return {
            "suggestions": suggestions,
            "user_role": current_user.role
        }
        
    except Exception as e:
        logger.error(f"Error getting chat suggestions: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get chat suggestions"
        )
