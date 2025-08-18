import json
import asyncio
from typing import Dict, List, Optional, Any
from datetime import datetime
from groq import Groq
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

class GroqChatbotService:
    """Chatbot service using Groq API for agricultural assistance"""
    
    def __init__(self):
        try:
            # Check if API key is available
            if not settings.GROQ_API_KEY:
                logger.warning("GROQ_API_KEY not found in settings")
                self.client = None
                return
                
            # Initialize Groq client with minimal parameters
            self.client = Groq(api_key=settings.GROQ_API_KEY)
            self.model = settings.GROQ_MODEL
            self.system_prompt = """
            You are GrainBot, a friendly and knowledgeable agricultural assistant for GrainChain platform. 
            You help farmers, buyers, and financiers with:
            
            - Crop cultivation advice
            - Market price information
            - Weather-related farming tips
            - Financial guidance for agriculture
            - Supply chain optimization
            - Sustainable farming practices
            
            Keep responses under 100 words, practical, and friendly. Use simple language and provide actionable advice.
            If asked about technical platform features, guide users to the appropriate sections of the app.
            REMEMBER: Do not answer in markdown and properly format your responses as if talking to someone on WhatsApp, you can use paragraphs.
            """
            logger.info("Groq client initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Groq client: {e}")
            self.client = None
    
    async def get_response(self, message: str, user_context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Get chatbot response for user message"""
        
        if not self.client:
            return {
                "response": "I'm currently unavailable. Please try again later or contact support.",
                "error": True
            }
        
        try:
            # Build context-aware prompt
            context_info = ""
            if user_context:
                role = user_context.get('role', 'user')
                location = user_context.get('location', '')
                if role:
                    context_info = f"User is a {role}"
                if location:
                    context_info += f" from {location}"
                if context_info:
                    context_info = f"Context: {context_info}. "
            
            # Create messages for the chat
            messages = [
                {"role": "system", "content": self.system_prompt},
                {"role": "user", "content": f"{context_info}{message}"}
            ]
            
            # Get response from Groq
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                max_tokens=500,
                temperature=0.7
            )
            
            bot_response = response.choices[0].message.content.strip()
            
            return {
                "response": bot_response,
                "timestamp": datetime.now().isoformat(),
                "error": False
            }
            
        except Exception as e:
            logger.error(f"Error getting chatbot response: {e}")
            return {
                "response": "I'm having trouble processing your request. Please try rephrasing your question.",
                "error": True
            }
    
    async def get_quick_suggestions(self, user_role: str = "farmer") -> List[str]:
        """Get quick suggestion prompts based on user role"""
        
        suggestions = {
            "farmer": [
                "What crops should I plant this season?",
                "How can I improve my soil quality?",
                "What are the current market prices?",
                "How do I apply for agricultural loans?"
            ],
            "buyer": [
                "How do I find quality suppliers?",
                "What are the best crops to buy now?",
                "How do I negotiate better prices?",
                "What should I check for crop quality?"
            ],
            "financier": [
                "How do I assess farmer creditworthiness?",
                "What are the risks in agricultural lending?",
                "How do I evaluate crop insurance?",
                "What are profitable agricultural investments?"
            ]
        }
        
        return suggestions.get(user_role, suggestions["farmer"])

# Global chatbot service instance
chatbot_service = GroqChatbotService()
