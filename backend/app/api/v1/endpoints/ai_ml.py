"""
AI/ML API endpoints for GrainChain
Provides price prediction, recommendations, and credit scoring functionality
"""

from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict, Any
import logging

from ....core.ai_ml_service import ai_ml_service
from ....models.ai_ml import (
    PricePredictionRequest, PricePredictionResponse,
    RecommendationRequest, RecommendationResponse,
    CreditScoreRequest, CreditScoreResponse,
    MarketInsight, MLModelMetadata
)
from ....models.user import User
from ...deps import get_current_user

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/predict-price", response_model=PricePredictionResponse)
async def predict_crop_price(
    request: PricePredictionRequest,
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
        logger.info(f"Price prediction request from user {current_user.id} for {request.crop_type}")
        
        # Validate user permissions (farmers and buyers can use this)
        if current_user.role not in ["farmer", "buyer"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only farmers and buyers can access price predictions"
            )
        
        prediction = await ai_ml_service.predict_price(request)
        
        logger.info(f"Price prediction successful: {prediction.predicted_price}")
        return prediction
        
    except Exception as e:
        logger.error(f"Error in price prediction: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to predict price"
        )


@router.post("/recommendations", response_model=RecommendationResponse)
async def get_recommendations(
    request: RecommendationRequest,
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
        logger.info(f"Recommendation request from user {current_user.id} for {request.recommendation_type}")
        
        # Validate user permissions (primarily for farmers)
        if current_user.role not in ["farmer", "buyer"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only farmers and buyers can access recommendations"
            )
        
        # Set user_id from current user
        request.user_id = current_user.id
        
        recommendations = await ai_ml_service.get_recommendations(request)
        
        logger.info(f"Recommendations generated successfully")
        return recommendations
        
    except Exception as e:
        logger.error(f"Error in recommendations: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate recommendations"
        )


@router.post("/credit-score", response_model=CreditScoreResponse)
async def calculate_credit_score(
    request: CreditScoreRequest,
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
        
        # Set user_id from current user
        request.user_id = current_user.id
        
        credit_score = await ai_ml_service.calculate_credit_score(request)
        
        logger.info(f"Credit score calculated: {credit_score.credit_score}")
        return credit_score
        
    except Exception as e:
        logger.error(f"Error in credit scoring: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to calculate credit score"
        )


@router.get("/market-insights/{crop_type}", response_model=List[MarketInsight])
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
        
        # Mock market insights data
        insights = [
            MarketInsight(
                crop_type=crop_type,
                current_price=45.50,
                price_trend="rising",
                demand_level="high",
                supply_level="medium",
                seasonal_factor=1.15,
                location=location or "National Average"
            )
        ]
        
        return insights
        
    except Exception as e:
        logger.error(f"Error getting market insights: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get market insights"
        )


@router.get("/model-info", response_model=List[MLModelMetadata])
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


@router.post("/batch-price-prediction", response_model=List[PricePredictionResponse])
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
        for request in requests:
            prediction = await ai_ml_service.predict_price(request)
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
        
        request = RecommendationRequest(
            user_id=current_user.id,
            recommendation_type="crop",
            location=location,
            farm_size=farm_size,
            budget=budget
        )
        
        recommendations = await ai_ml_service.get_recommendations(request)
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
