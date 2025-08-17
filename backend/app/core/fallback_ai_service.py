"""
Fallback AI service for when Google Generative AI is not available
Provides mock responses to keep the application functional
"""

import asyncio
import random
from typing import Dict, Any
from datetime import datetime, timedelta

class FallbackAIService:
    """Fallback AI service that provides mock responses"""
    
    def __init__(self):
        self.available = True
    
    async def predict_crop_price(self, crop_data: Dict[str, Any]) -> Dict[str, Any]:
        """Mock crop price prediction"""
        await asyncio.sleep(0.1)  # Simulate processing time
        
        crop_type = crop_data.get('crop_type', 'wheat')
        quantity = crop_data.get('quantity', 100)
        location = crop_data.get('location', 'India')
        
        # Generate mock price based on crop type
        base_prices = {
            'wheat': 2500,
            'rice': 3000,
            'corn': 2200,
            'sugarcane': 350,
            'cotton': 6000,
            'soybean': 4500,
            'potato': 1200,
            'onion': 800,
            'tomato': 1500,
            'cabbage': 600
        }
        
        base_price = base_prices.get(crop_type.lower(), 2000)
        variation = random.uniform(0.8, 1.2)
        predicted_price = round(base_price * variation, 2)
        
        return {
            "predicted_price": predicted_price,
            "price_range": {
                "min": round(predicted_price * 0.9, 2),
                "max": round(predicted_price * 1.1, 2)
            },
            "confidence": round(random.uniform(75, 95), 1),
            "market_trend": random.choice(["upward", "stable", "downward"]),
            "factors": [
                f"Current market demand for {crop_type}",
                f"Seasonal pricing in {location}",
                "Weather conditions impact",
                "Supply chain considerations"
            ],
            "recommendation": f"Based on current market conditions, {crop_type} shows {random.choice(['good', 'moderate', 'excellent'])} price potential.",
            "last_updated": datetime.utcnow().isoformat(),
            "data_source": "Fallback AI Service (Mock Data)"
        }
    
    async def get_recommendations(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """Mock recommendations"""
        await asyncio.sleep(0.1)
        
        recommendation_type = request_data.get('recommendation_type', 'crop')
        location = request_data.get('location', 'India')
        
        recommendations = {
            'crop': [
                "Consider wheat cultivation for winter season",
                "Rice farming shows good potential in your region",
                "Diversify with legumes for soil health"
            ],
            'buyer': [
                "Local grain markets offer competitive prices",
                "Export opportunities available for premium crops",
                "Direct-to-consumer sales through online platforms"
            ],
            'fertilizer': [
                "Use organic compost for soil enrichment",
                "NPK fertilizers recommended for current season",
                "Micronutrient supplements for better yield"
            ],
            'timing': [
                "Optimal planting window: Next 2-3 weeks",
                "Harvest timing: Plan for peak market season",
                "Consider weather patterns for scheduling"
            ]
        }
        
        selected_recommendations = recommendations.get(recommendation_type, recommendations['crop'])
        
        return {
            "recommendations": selected_recommendations[:3],
            "confidence": round(random.uniform(70, 90), 1),
            "risk_level": random.choice(["low", "medium", "high"]),
            "expected_roi": f"{random.randint(15, 35)}%",
            "reasoning": f"Based on {recommendation_type} analysis for {location} region, considering current market conditions and seasonal factors.",
            "data_source": "Fallback AI Service (Mock Data)"
        }
    
    async def assess_credit_score(self, credit_data: Dict[str, Any]) -> Dict[str, Any]:
        """Mock credit score assessment"""
        await asyncio.sleep(0.1)
        
        annual_income = credit_data.get('annual_income', 500000)
        loan_amount = credit_data.get('loan_amount', 100000)
        
        # Simple mock scoring logic
        income_ratio = loan_amount / annual_income if annual_income > 0 else 1
        base_score = 750
        
        if income_ratio < 0.3:
            score = base_score + random.randint(0, 50)
        elif income_ratio < 0.5:
            score = base_score + random.randint(-30, 30)
        else:
            score = base_score + random.randint(-80, 0)
        
        score = max(300, min(850, score))
        
        return {
            "credit_score": score,
            "score_range": "300-850",
            "risk_category": "low" if score > 700 else "medium" if score > 600 else "high",
            "loan_eligibility": score > 650,
            "recommended_amount": min(loan_amount, annual_income * 0.4),
            "factors": [
                "Annual income assessment",
                "Loan-to-income ratio",
                "Credit history evaluation",
                "Collateral value consideration"
            ],
            "data_source": "Fallback AI Service (Mock Data)"
        }
    
    async def get_market_insights(self, crop_type: str, location: str = "") -> Dict[str, Any]:
        """Mock market insights"""
        await asyncio.sleep(0.1)
        
        return {
            "crop_type": crop_type,
            "location": location or "India",
            "market_sentiment": random.choice(["positive", "neutral", "negative"]),
            "trend_direction": random.choice(["upward", "stable", "downward"]),
            "price_volatility": random.choice(["low", "medium", "high"]),
            "demand_level": random.choice(["low", "medium", "high"]),
            "supply_level": random.choice(["low", "medium", "high"]),
            "key_insights": [
                f"Current {crop_type} market shows stable demand patterns",
                f"Regional supply in {location or 'your area'} is balanced",
                "Weather conditions are favorable for pricing",
                "Export opportunities may impact local prices"
            ],
            "forecast": f"Market outlook for {crop_type} remains optimistic for the next 3 months with expected price stability and moderate growth potential.",
            "data_source": "Fallback AI Service (Mock Data)"
        }

# Create global instance
fallback_ai_service = FallbackAIService()
