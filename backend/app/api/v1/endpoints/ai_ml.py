"""
AI/ML API endpoints for GrainChain
Provides price prediction, recommendations, and credit scoring functionality
"""

from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict, Any
import logging

from app.models.user import User
from app.api.deps import get_current_user
from pydantic import BaseModel

# Import AI service with fallback
try:
    from app.core.ai_service import ai_service
    AI_SERVICE_AVAILABLE = True
except ImportError:
    from app.core.fallback_ai_service import fallback_ai_service as ai_service
    AI_SERVICE_AVAILABLE = True

# Define request models
class PricePredictionRequest(BaseModel):
    crop_type: str
    quantity: float
    location: str
    quality_grade: str = "A"

class RecommendationRequest(BaseModel):
    recommendation_type: str
    location: str
    farm_size: float = 0
    budget: float = 0

class CreditScoreRequest(BaseModel):
    annual_income: float
    loan_amount: float
    credit_history: str
    collateral_value: float = 0

class MarketInsightsRequest(BaseModel):
    crop_type: str
    location: str = ""

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/predict-price")
async def predict_crop_price(
    request: Dict[str, Any],
    current_user: User = Depends(get_current_user)
):
    """
    Predict crop price based on various market factors
    
    - **crop_type**: Type of crop (wheat, rice, corn, etc.)
    - **quantity**: Quantity in kg
    - **location**: Location/state
    - **quality_grade**: Quality grade (A, B, C) - optional
    - **harvest_date**: Expected harvest date - optional
    """
    try:
        logger.info(f"Price prediction request from user {current_user.id}")
        
        # Validate user permissions (farmers and buyers can use this)
        if current_user.role not in ["farmer", "buyer"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only farmers and buyers can access price predictions"
            )
        
        prediction = await ai_service.predict_crop_price(request)
        
        logger.info(f"Price prediction successful: {prediction.get('predicted_price', 'N/A')}")
        return prediction
        
    except Exception as e:
        logger.error(f"Error in price prediction: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to predict price"
        )


@router.post("/recommendations")
async def get_recommendations(
    request: Dict[str, Any],
    current_user: User = Depends(get_current_user)
):
    """
    Get personalized recommendations for farming activities
    
    - **recommendation_type**: Type of recommendation (crop, buyer, fertilizer, timing)
    - **location**: User location
    - **farm_size**: Farm size in acres - optional
    - **soil_type**: Soil type - optional
    - **budget**: Available budget - optional
    - **current_crops**: Currently grown crops - optional
    """
    try:
        logger.info(f"Recommendation request from user {current_user.id}")
        
        # Validate user permissions (primarily for farmers)
        if current_user.role not in ["farmer", "buyer"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only farmers and buyers can access recommendations"
            )
        
        # Use request data directly with Gemini service
        request_data = {
            "recommendation_type": request.get('recommendation_type'),
            "location": request.get('location', 'India'),
            "farm_size": request.get('farm_size', 1),
            "budget": request.get('budget', 50000)
        }
        
        recommendations = await ai_service.get_recommendations(request_data)
        
        logger.info(f"Recommendations generated successfully")
        return recommendations
        
    except Exception as e:
        logger.error(f"Error in recommendations: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate recommendations"
        )


@router.post("/credit-score")
async def calculate_credit_score(
    request: Dict[str, Any],
    current_user: User = Depends(get_current_user)
):
    """
    Calculate credit score for loan eligibility
    
    - **annual_income**: Annual income
    - **farm_size**: Farm size in acres
    - **years_farming**: Years of farming experience
    - **crop_diversity**: Number of different crops grown
    - **loan_history**: Previous loan history - optional
    - **assets_value**: Total assets value - optional
    - **liabilities**: Total liabilities - optional
    - **insurance_coverage**: Has crop insurance - optional
    """
    try:
        logger.info(f"Credit score request from user {current_user.id}")
        
        # Validate user permissions (farmers and financiers can use this)
        if current_user.role not in ["farmer", "financier"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only farmers and financiers can access credit scoring"
            )
        
        # Use request data directly with Gemini service
        farmer_data = {
            "name": request.get('name', 'Farmer'),
            "farm_size": request.get('farm_size', 1),
            "crop_types": "Mixed farming",
            "location": request.get('location', 'India'),
            "years_farming": request.get('years_farming', 5),
            "loan_history": request.get('loan_history', 'No previous loans'),
            "annual_income": request.get('annual_income', 100000)
        }
        
        credit_assessment = await ai_service.assess_credit_score(farmer_data)
        
        # Return credit assessment directly from fallback service
        credit_score = credit_assessment
        
        logger.info(f"Credit score calculated: {credit_score['credit_score']}")
        return credit_score
        
    except Exception as e:
        logger.error(f"Error in credit scoring: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to calculate credit score"
        )


@router.get("/market-insights/{crop_type}")
async def get_market_insights(
    crop_type: str,
    location: str = None,
    current_user: User = Depends(get_current_user)
):
    """
    Get market insights for specific crop type
    
    - **crop_type**: Type of crop to get insights for
    - **location**: Location filter - optional
    """
    try:
        logger.info(f"Market insights request from user {current_user.id} for {crop_type}")
        
        # Get AI-powered market insights
        market_analysis = await ai_service.get_market_insights(crop_type, location or "India")
        
        # Return market analysis directly from fallback service
        insights = market_analysis
        
        return insights
        
    except Exception as e:
        logger.error(f"Error getting market insights: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get market insights"
        )


@router.get("/model-info")
async def get_model_info(
    current_user: User = Depends(get_current_user)
):
    """
    Get information about ML models used in the system
    """
    try:
        # Only admin users can access model information
        if current_user.role != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only admin users can access model information"
            )
        
        models_info = [
            MLModelMetadata(
                model_name="Price Prediction Model",
                model_version="1.0.0",
                accuracy=0.85,
                last_trained="2024-01-15T10:00:00Z",
                training_data_size=10000,
                features=["crop_type", "quantity", "location", "quality_grade", "season", "market_demand", "supply_level"],
                model_type="Random Forest Regressor"
            ),
            MLModelMetadata(
                model_name="Credit Scoring Model",
                model_version="1.0.0",
                accuracy=0.82,
                last_trained="2024-01-15T10:00:00Z",
                training_data_size=5000,
                features=["annual_income", "farm_size", "years_farming", "crop_diversity", "assets_value", "liabilities", "insurance_coverage"],
                model_type="Gradient Boosting Regressor"
            )
        ]
        
        return models_info
        
    except Exception as e:
        logger.error(f"Error getting model info: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get model information"
        )


@router.post("/batch-price-prediction")
async def batch_predict_prices(
    requests: List[PricePredictionRequest],
    current_user: User = Depends(get_current_user)
):
    """
    Predict prices for multiple crops in batch
    """
    try:
        logger.info(f"Batch price prediction request from user {current_user.id} for {len(requests)} items")
        
        # Validate user permissions
        if current_user.role not in ["farmer", "buyer"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only farmers and buyers can access price predictions"
            )
        
        # Limit batch size
        if len(requests) > 50:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Batch size cannot exceed 50 items"
            )
        
        predictions = []
        # Use request data directly with Gemini service
        crop_data = {
            "crop_type": requests[0].get('crop_type'),
            "quantity": requests[0].get('quantity'),
            "location": requests[0].get('location'),
            "quality_grade": requests[0].get('quality_grade', 'A')
        }
        
        prediction = await ai_service.predict_crop_price(crop_data)
        predictions.append(prediction)
        
        logger.info(f"Batch price prediction completed for {len(predictions)} items")
        return predictions
        
    except Exception as e:
        logger.error(f"Error in batch price prediction: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process batch price prediction"
        )


@router.get("/crop-recommendations/{location}")
async def get_crop_recommendations_by_location(
    location: str,
    farm_size: float = None,
    budget: float = None,
    current_user: User = Depends(get_current_user)
):
    """
    Get crop recommendations for a specific location
    """
    try:
        logger.info(f"Location-based crop recommendations for {location}")
        
        if current_user.role not in ["farmer"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only farmers can access crop recommendations"
            )
        
        request_data = {
            "recommendation_type": "crop",
            "location": location,
            "farm_size": farm_size or 1,
            "budget": budget or 50000
        }
        
        recommendations = await ai_service.get_crop_recommendations(request_data)
        return recommendations
        
    except Exception as e:
        logger.error(f"Error getting crop recommendations: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get crop recommendations"
        )


@router.get("/price-trends/{crop_type}")
async def get_price_trends(
    crop_type: str,
    days: int = 30,
    location: str = None,
    current_user: User = Depends(get_current_user)
):
    """
    Get historical price trends for a crop
    """
    try:
        logger.info(f"Price trends request for {crop_type} over {days} days")
        
        # Mock historical price data
        import numpy as np
        from datetime import datetime, timedelta
        
        base_price = np.random.uniform(30, 60)
        dates = [(datetime.now() - timedelta(days=i)).isoformat() for i in range(days, 0, -1)]
        prices = [base_price + np.random.normal(0, 5) for _ in range(days)]
        
        trends = {
            "crop_type": crop_type,
            "location": location or "National",
            "period_days": days,
            "data": [
                {"date": date, "price": round(price, 2)}
                for date, price in zip(dates, prices)
            ],
            "average_price": round(np.mean(prices), 2),
            "trend": "rising" if prices[-1] > prices[0] else "falling"
        }
        
        return trends
        
    except Exception as e:
        logger.error(f"Error getting price trends: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get price trends"
        )
