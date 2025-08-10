"""
AI/ML Models for GrainChain
Includes models for price prediction, recommendations, and credit scoring
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum


class PredictionType(str, Enum):
    PRICE = "price"
    DEMAND = "demand"
    YIELD = "yield"


class RecommendationType(str, Enum):
    CROP = "crop"
    BUYER = "buyer"
    FERTILIZER = "fertilizer"
    TIMING = "timing"


class CreditScoreRange(str, Enum):
    EXCELLENT = "excellent"  # 750-850
    GOOD = "good"           # 650-749
    FAIR = "fair"           # 550-649
    POOR = "poor"           # 300-549


class PricePredictionRequest(BaseModel):
    crop_type: str = Field(..., description="Type of crop (e.g., wheat, rice, corn)")
    quantity: float = Field(..., gt=0, description="Quantity in kg")
    location: str = Field(..., description="Location/state")
    quality_grade: Optional[str] = Field(None, description="Quality grade (A, B, C)")
    harvest_date: Optional[datetime] = Field(None, description="Expected harvest date")
    historical_data: Optional[Dict[str, Any]] = Field(None, description="Historical price data")


class PricePredictionResponse(BaseModel):
    predicted_price: float = Field(..., description="Predicted price per kg")
    price_range: Dict[str, float] = Field(..., description="Min and max price range")
    confidence_score: float = Field(..., ge=0, le=1, description="Prediction confidence (0-1)")
    factors: List[str] = Field(..., description="Key factors affecting price")
    market_trend: str = Field(..., description="Current market trend (rising/falling/stable)")
    recommendation: str = Field(..., description="Recommendation for farmer")


class RecommendationRequest(BaseModel):
    user_id: str = Field(..., description="User ID")
    recommendation_type: RecommendationType = Field(..., description="Type of recommendation")
    location: str = Field(..., description="User location")
    farm_size: Optional[float] = Field(None, description="Farm size in acres")
    soil_type: Optional[str] = Field(None, description="Soil type")
    budget: Optional[float] = Field(None, description="Available budget")
    current_crops: Optional[List[str]] = Field(None, description="Currently grown crops")
    preferences: Optional[Dict[str, Any]] = Field(None, description="User preferences")


class RecommendationResponse(BaseModel):
    recommendations: List[Dict[str, Any]] = Field(..., description="List of recommendations")
    reasoning: List[str] = Field(..., description="Reasoning behind recommendations")
    confidence_score: float = Field(..., ge=0, le=1, description="Recommendation confidence")
    expected_roi: Optional[float] = Field(None, description="Expected return on investment")
    risk_level: str = Field(..., description="Risk level (low/medium/high)")


class CreditScoreRequest(BaseModel):
    user_id: str = Field(..., description="User ID")
    annual_income: float = Field(..., gt=0, description="Annual income")
    farm_size: float = Field(..., gt=0, description="Farm size in acres")
    years_farming: int = Field(..., ge=0, description="Years of farming experience")
    crop_diversity: int = Field(..., ge=1, description="Number of different crops grown")
    loan_history: Optional[List[Dict[str, Any]]] = Field(None, description="Previous loan history")
    assets_value: Optional[float] = Field(None, description="Total assets value")
    liabilities: Optional[float] = Field(None, description="Total liabilities")
    insurance_coverage: Optional[bool] = Field(None, description="Has crop insurance")


class CreditScoreResponse(BaseModel):
    credit_score: int = Field(..., ge=300, le=850, description="Credit score (300-850)")
    credit_range: CreditScoreRange = Field(..., description="Credit score range")
    loan_eligibility: bool = Field(..., description="Eligible for loan")
    max_loan_amount: float = Field(..., description="Maximum loan amount eligible")
    interest_rate_range: Dict[str, float] = Field(..., description="Interest rate range")
    factors: Dict[str, float] = Field(..., description="Factors affecting credit score")
    recommendations: List[str] = Field(..., description="Recommendations to improve score")
    risk_assessment: str = Field(..., description="Risk assessment (low/medium/high)")


class MarketInsight(BaseModel):
    crop_type: str = Field(..., description="Crop type")
    current_price: float = Field(..., description="Current market price")
    price_trend: str = Field(..., description="Price trend")
    demand_level: str = Field(..., description="Demand level")
    supply_level: str = Field(..., description="Supply level")
    seasonal_factor: float = Field(..., description="Seasonal price factor")
    location: str = Field(..., description="Market location")
    last_updated: datetime = Field(default_factory=datetime.utcnow)


class MLModelMetadata(BaseModel):
    model_name: str = Field(..., description="Name of the ML model")
    model_version: str = Field(..., description="Model version")
    accuracy: float = Field(..., ge=0, le=1, description="Model accuracy")
    last_trained: datetime = Field(..., description="Last training date")
    training_data_size: int = Field(..., description="Size of training dataset")
    features: List[str] = Field(..., description="List of features used")
    model_type: str = Field(..., description="Type of ML model")
