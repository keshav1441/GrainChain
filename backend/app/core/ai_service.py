import os
import json
import asyncio
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
import google.generativeai as genai
from app.core.config import settings
from app.ml.models import price_model, credit_model

class GeminiAIService:
    """AI service using Google's Gemini API for agricultural intelligence"""
    
    def __init__(self):
        # Configure Gemini API
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model = genai.GenerativeModel(settings.GEMINI_MODEL)
        
    async def predict_crop_price(self, crop_data: Dict[str, Any]) -> Dict[str, Any]:
        """Predict crop prices using ML model with Gemini AI enhancement"""
        
        try:
            # First, get ML model prediction
            ml_prediction = price_model.predict(crop_data)
            
            # Try to enhance with Gemini AI insights
            try:
                prompt = f"""
                Enhance this crop price prediction with current market insights:
                
                Crop: {crop_data.get('crop_type')}
                ML Predicted Price: ₹{ml_prediction['predicted_price']}/kg
                Location: {crop_data.get('location')}
                Quantity: {crop_data.get('quantity')} kg
                
                Provide brief market insights and validate the prediction.
                Return JSON with:
                - market_insights: brief current market analysis
                - price_adjustment: percentage adjustment (-20 to +20)
                - confidence_boost: additional confidence (0-10)
                
                Only return valid JSON.
                """
                
                response = self.model.generate_content(prompt)
                ai_enhancement = json.loads(response.text.strip())
                
                # Apply AI enhancement
                price_adjustment = ai_enhancement.get("price_adjustment", 0) / 100
                adjusted_price = ml_prediction["predicted_price"] * (1 + price_adjustment)
                confidence_boost = ai_enhancement.get("confidence_boost", 0)
                
                # Update prediction with AI insights
                ml_prediction["predicted_price"] = round(adjusted_price, 2)
                ml_prediction["price_range"]["min"] = round(adjusted_price * 0.85, 2)
                ml_prediction["price_range"]["max"] = round(adjusted_price * 1.15, 2)
                ml_prediction["confidence_score"] = min(100, ml_prediction["confidence_score"] + confidence_boost)
                ml_prediction["factors"].append(f"AI Market Analysis: {ai_enhancement.get('market_insights', 'Current market conditions considered')}")
                
            except Exception as ai_error:
                # If AI enhancement fails, use ML prediction as-is
                pass
            
            return ml_prediction
            
        except Exception as e:
            # Complete fallback
            base_price = self._get_base_price(crop_data.get('crop_type', 'wheat'))
            return {
                "predicted_price": base_price,
                "price_range": {"min": base_price * 0.9, "max": base_price * 1.1},
                "confidence_score": 60,
                "market_trend": "stable",
                "recommendation": "Using fallback prediction",
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
        """AI-powered credit score assessment using ML model with Gemini enhancement"""
        
        try:
            # First, get ML model prediction
            ml_assessment = credit_model.predict(farmer_data)
            
            # Try to enhance with Gemini AI insights
            try:
                prompt = f"""
                Enhance this credit assessment with additional insights:
                
                Farmer: {farmer_data.get('name', 'Farmer')}
                ML Credit Score: {ml_assessment['credit_score']}
                Farm Size: {farmer_data.get('farm_size')} acres
                Experience: {farmer_data.get('years_farming')} years
                Income: ₹{farmer_data.get('annual_income')}
                
                Provide additional risk factors and suggestions.
                Return JSON with:
                - additional_factors: list of 1-2 additional considerations
                - risk_mitigation: list of 1-2 risk mitigation strategies
                - score_adjustment: small adjustment (-20 to +20)
                
                Only return valid JSON.
                """
                
                response = self.model.generate_content(prompt)
                ai_enhancement = json.loads(response.text.strip())
                
                # Apply AI enhancement
                score_adjustment = ai_enhancement.get("score_adjustment", 0)
                enhanced_score = max(300, min(850, ml_assessment["credit_score"] + score_adjustment))
                
                # Add AI insights
                ml_assessment["credit_score"] = enhanced_score
                ml_assessment["factors_affecting_score"].extend(
                    ai_enhancement.get("additional_factors", [])
                )
                ml_assessment["improvement_suggestions"].extend(
                    ai_enhancement.get("risk_mitigation", [])
                )
                
                # Update category if score changed significantly
                if enhanced_score >= 750:
                    ml_assessment["score_category"] = "excellent"
                    ml_assessment["risk_level"] = "low"
                elif enhanced_score >= 700:
                    ml_assessment["score_category"] = "very_good"
                    ml_assessment["risk_level"] = "low"
                elif enhanced_score >= 650:
                    ml_assessment["score_category"] = "good"
                    ml_assessment["risk_level"] = "medium"
                elif enhanced_score >= 600:
                    ml_assessment["score_category"] = "fair"
                    ml_assessment["risk_level"] = "medium"
                else:
                    ml_assessment["score_category"] = "poor"
                    ml_assessment["risk_level"] = "high"
                
            except Exception as ai_error:
                # If AI enhancement fails, use ML assessment as-is
                pass
            
            return ml_assessment
            
        except Exception as e:
            return {
                "credit_score": 650,
                "score_category": "fair",
                "risk_level": "medium",
                "factors_affecting_score": ["Assessment unavailable"],
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
