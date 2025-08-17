import os
import json
import asyncio
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
import google.generativeai as genai
from app.core.config import settings

class GeminiAIService:
    """AI service using Google's Gemini API for agricultural intelligence"""
    
    def __init__(self):
        # Configure Gemini API
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model = genai.GenerativeModel(settings.GEMINI_MODEL)
        
    async def predict_crop_price(self, crop_data: Dict[str, Any]) -> Dict[str, Any]:
        """Predict crop prices using AI analysis"""
        
        prompt = f"""
        As an agricultural market analyst, predict the price for the following crop:
        
        Crop Type: {crop_data.get('crop_type')}
        Quantity: {crop_data.get('quantity')} kg
        Location: {crop_data.get('location')}
        Quality Grade: {crop_data.get('quality_grade')}
        Current Season: {datetime.now().strftime('%B %Y')}
        
        Consider factors like:
        - Seasonal demand patterns
        - Regional market conditions
        - Quality grade impact
        - Supply chain factors
        - Historical price trends
        
        Provide a JSON response with:
        - predicted_price: price per kg in INR
        - price_range: {{"min": number, "max": number}}
        - confidence_score: 0-100
        - market_trend: "bullish"/"bearish"/"stable"
        - recommendation: brief recommendation
        - factors: list of key factors affecting price
        
        Only return valid JSON, no additional text.
        """
        
        try:
            response = self.model.generate_content(prompt)
            result = json.loads(response.text.strip())
            
            # Validate and ensure all required fields
            return {
                "predicted_price": result.get("predicted_price", 0),
                "price_range": result.get("price_range", {"min": 0, "max": 0}),
                "confidence_score": min(100, max(0, result.get("confidence_score", 75))),
                "market_trend": result.get("market_trend", "stable"),
                "recommendation": result.get("recommendation", "Monitor market conditions"),
                "factors": result.get("factors", ["Market demand", "Seasonal patterns"])
            }
        except Exception as e:
            # Fallback response if AI fails
            base_price = self._get_base_price(crop_data.get('crop_type', 'wheat'))
            return {
                "predicted_price": base_price,
                "price_range": {"min": base_price * 0.9, "max": base_price * 1.1},
                "confidence_score": 60,
                "market_trend": "stable",
                "recommendation": "AI analysis unavailable, using historical averages",
                "factors": ["Historical data", "Market averages"]
            }
    
    async def get_recommendations(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """Get AI-powered crop recommendations"""
        
        recommendation_type = request_data.get('recommendation_type')
        location = request_data.get('location', 'India')
        farm_size = request_data.get('farm_size', 1)
        budget = request_data.get('budget', 50000)
        
        if recommendation_type == 'crop':
            prompt = f"""
            As an agricultural expert, recommend the best crops for a farmer with:
            
            Location: {location}
            Farm Size: {farm_size} acres
            Budget: ₹{budget}
            Current Season: {datetime.now().strftime('%B %Y')}
            
            Consider:
            - Climate suitability
            - Market demand
            - Profitability
            - Water requirements
            - Soil compatibility
            - Investment requirements
            
            Provide JSON response with:
            - recommendations: list of 3-5 crop names
            - confidence_score: 0-100
            - expected_roi: percentage return on investment
            - risk_level: "low"/"medium"/"high"
            - reasoning: list of reasons for recommendations
            
            Only return valid JSON.
            """
        
        elif recommendation_type == 'buyer':
            prompt = f"""
            As a procurement expert, recommend the best suppliers/farmers for buyers in:
            
            Location: {location}
            Budget: ₹{budget}
            
            Consider:
            - Quality suppliers
            - Competitive pricing
            - Reliability
            - Seasonal availability
            
            Provide JSON response with:
            - recommendations: list of supplier types/regions
            - confidence_score: 0-100
            - expected_roi: cost savings percentage
            - risk_level: "low"/"medium"/"high"
            - reasoning: list of reasons
            
            Only return valid JSON.
            """
        
        elif recommendation_type == 'financier':
            prompt = f"""
            As a financial advisor for agriculture, recommend investment opportunities:
            
            Location: {location}
            Investment Budget: ₹{budget}
            
            Consider:
            - High-potential farmers
            - Profitable crop cycles
            - Risk assessment
            - Market opportunities
            
            Provide JSON response with:
            - recommendations: list of investment opportunities
            - confidence_score: 0-100
            - expected_roi: percentage returns
            - risk_level: "low"/"medium"/"high"
            - reasoning: list of reasons
            
            Only return valid JSON.
            """
        
        try:
            response = self.model.generate_content(prompt)
            result = json.loads(response.text.strip())
            
            return {
                "recommendations": result.get("recommendations", []),
                "confidence_score": min(100, max(0, result.get("confidence_score", 75))),
                "expected_roi": result.get("expected_roi", 15),
                "risk_level": result.get("risk_level", "medium"),
                "reasoning": result.get("reasoning", ["AI analysis based on market data"])
            }
        except Exception as e:
            return {
                "recommendations": self._get_fallback_recommendations(recommendation_type),
                "confidence_score": 60,
                "expected_roi": 15,
                "risk_level": "medium",
                "reasoning": ["Fallback recommendations due to AI service unavailability"]
            }
    
    async def get_market_insights(self, crop_type: str, location: str = "India") -> Dict[str, Any]:
        """Analyze market trends for specific crops"""
        
        prompt = f"""
        Analyze current market trends for {crop_type} in {location}:
        
        Provide comprehensive market analysis including:
        - Current market conditions
        - Price trends (last 3 months)
        - Demand-supply dynamics
        - Seasonal patterns
        - Future outlook (next 3 months)
        
        Return JSON with:
        - trend_direction: "upward"/"downward"/"stable"
        - price_volatility: "low"/"medium"/"high"
        - demand_level: "low"/"medium"/"high"
        - supply_level: "low"/"medium"/"high"
        - market_sentiment: "positive"/"negative"/"neutral"
        - key_insights: list of important insights
        - forecast: 3-month outlook
        
        Only return valid JSON.
        """
        
        try:
            response = self.model.generate_content(prompt)
            result = json.loads(response.text.strip())
            
            return {
                "trend_direction": result.get("trend_direction", "stable"),
                "price_volatility": result.get("price_volatility", "medium"),
                "demand_level": result.get("demand_level", "medium"),
                "supply_level": result.get("supply_level", "medium"),
                "market_sentiment": result.get("market_sentiment", "neutral"),
                "key_insights": result.get("key_insights", ["Market analysis based on current data"]),
                "forecast": result.get("forecast", "Stable market conditions expected")
            }
        except Exception as e:
            return {
                "trend_direction": "stable",
                "price_volatility": "medium",
                "demand_level": "medium",
                "supply_level": "medium",
                "market_sentiment": "neutral",
                "key_insights": ["AI analysis temporarily unavailable"],
                "forecast": "Monitor market conditions for updates"
            }
    
    async def assess_credit_score(self, farmer_data: Dict[str, Any]) -> Dict[str, Any]:
        """AI-powered loan risk assessment"""
        
        prompt = f"""
        Assess credit score for a farmer with the following profile:
        
        Name: {farmer_data.get('name', 'Not specified')}
        Farm Size: {farmer_data.get('farm_size', 'Not specified')} acres
        Location: {farmer_data.get('location', 'India')}
        Farming Experience: {farmer_data.get('years_farming', 'Not specified')} years
        Annual Income: ₹{farmer_data.get('annual_income', 'Not specified')}
        Crop Types: {farmer_data.get('crop_types', 'Mixed farming')}
        Previous Loan History: {farmer_data.get('loan_history', 'No previous loans')}
        
        Analyze and provide JSON response with:
        - credit_score: 300-850 (standard credit score range)
        - score_category: "poor"/"fair"/"good"/"very_good"/"excellent"
        - risk_level: "low"/"medium"/"high"
        - factors_affecting_score: list of positive and negative factors
        - improvement_suggestions: list of suggestions to improve score
        - loan_eligibility: "high"/"medium"/"low"
        - recommended_loan_amount: suggested maximum loan amount
        
        Only return valid JSON.
        """
        
        try:
            response = self.model.generate_content(prompt)
            result = json.loads(response.text.strip())
            
            return {
                "credit_score": min(850, max(300, result.get("credit_score", 650))),
                "score_category": result.get("score_category", "fair"),
                "risk_level": result.get("risk_level", "medium"),
                "factors_affecting_score": result.get("factors_affecting_score", ["Standard agricultural factors"]),
                "improvement_suggestions": result.get("improvement_suggestions", ["Maintain regular income", "Build credit history"]),
                "loan_eligibility": result.get("loan_eligibility", "medium"),
                "recommended_loan_amount": result.get("recommended_loan_amount", 100000)
            }
        except Exception as e:
            return {
                "credit_score": 650,
                "score_category": "fair",
                "risk_level": "medium",
                "factors_affecting_score": ["AI assessment unavailable"],
                "improvement_suggestions": ["Manual review required"],
                "loan_eligibility": "medium",
                "recommended_loan_amount": 100000
            }
    
    def _get_base_price(self, crop_type: str) -> float:
        """Get base price for crops (fallback data)"""
        base_prices = {
            'wheat': 25.0,
            'rice': 30.0,
            'corn': 20.0,
            'sugarcane': 3.5,
            'cotton': 60.0,
            'soybean': 45.0,
            'potato': 15.0,
            'onion': 25.0,
            'tomato': 30.0,
            'cabbage': 12.0
        }
        return base_prices.get(crop_type.lower(), 25.0)
    
    def _get_fallback_recommendations(self, recommendation_type: str) -> List[str]:
        """Get fallback recommendations when AI is unavailable"""
        fallback_data = {
            'crop': ['Wheat', 'Rice', 'Sugarcane', 'Cotton', 'Soybean'],
            'buyer': ['Local farmers', 'Cooperative societies', 'Direct farm purchases'],
            'financier': ['Small-scale farmers', 'Organic farming', 'Technology adoption']
        }
        return fallback_data.get(recommendation_type, ['General recommendations'])

# Global instance
ai_service = GeminiAIService()
