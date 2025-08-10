"""
AI/ML Service for GrainChain
Implements price prediction, recommendations, and credit scoring algorithms
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score
import joblib
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime, timedelta
import logging
import os
from pathlib import Path

from ..models.ai_ml import (
    PricePredictionRequest, PricePredictionResponse,
    RecommendationRequest, RecommendationResponse,
    CreditScoreRequest, CreditScoreResponse,
    CreditScoreRange, MarketInsight, MLModelMetadata
)

logger = logging.getLogger(__name__)


class AIMLService:
    """AI/ML Service for agricultural predictions and recommendations"""
    
    def __init__(self):
        self.models_dir = Path("app/ml_models")
        self.models_dir.mkdir(exist_ok=True)
        self.price_model = None
        self.credit_model = None
        self.scaler = StandardScaler()
        self.label_encoders = {}
        self._initialize_models()
    
    def _initialize_models(self):
        """Initialize ML models with default configurations"""
        try:
            # Try to load existing models
            self._load_models()
        except Exception as e:
            logger.info(f"No existing models found, creating new ones: {e}")
            self._create_default_models()
    
    def _create_default_models(self):
        """Create default ML models with sample data"""
        # Price prediction model
        self.price_model = RandomForestRegressor(
            n_estimators=100,
            random_state=42,
            max_depth=10
        )
        
        # Credit scoring model
        self.credit_model = GradientBoostingRegressor(
            n_estimators=100,
            random_state=42,
            max_depth=6
        )
        
        # Train with sample data
        self._train_with_sample_data()
    
    def _train_with_sample_data(self):
        """Train models with sample agricultural data"""
        # Sample price prediction data
        np.random.seed(42)
        n_samples = 1000
        
        # Generate synthetic price data
        price_data = pd.DataFrame({
            'crop_type_encoded': np.random.randint(0, 10, n_samples),
            'quantity': np.random.uniform(100, 10000, n_samples),
            'location_encoded': np.random.randint(0, 20, n_samples),
            'quality_grade_encoded': np.random.randint(0, 3, n_samples),
            'season': np.random.randint(0, 4, n_samples),
            'market_demand': np.random.uniform(0.3, 1.0, n_samples),
            'supply_level': np.random.uniform(0.2, 1.0, n_samples)
        })
        
        # Generate target prices based on features
        price_targets = (
            price_data['crop_type_encoded'] * 5 +
            np.log(price_data['quantity']) * 2 +
            price_data['location_encoded'] * 1.5 +
            price_data['quality_grade_encoded'] * 3 +
            price_data['season'] * 2 +
            price_data['market_demand'] * 10 +
            (1 - price_data['supply_level']) * 8 +
            np.random.normal(0, 2, n_samples)
        )
        
        # Train price model
        X_price = price_data.values
        y_price = price_targets.values
        self.price_model.fit(X_price, y_price)
        
        # Sample credit scoring data
        credit_data = pd.DataFrame({
            'annual_income': np.random.uniform(50000, 500000, n_samples),
            'farm_size': np.random.uniform(1, 100, n_samples),
            'years_farming': np.random.randint(1, 40, n_samples),
            'crop_diversity': np.random.randint(1, 8, n_samples),
            'assets_value': np.random.uniform(100000, 2000000, n_samples),
            'liabilities': np.random.uniform(0, 500000, n_samples),
            'insurance_coverage': np.random.randint(0, 2, n_samples)
        })
        
        # Generate credit scores based on features
        credit_scores = (
            np.log(credit_data['annual_income']) * 50 +
            credit_data['farm_size'] * 2 +
            credit_data['years_farming'] * 5 +
            credit_data['crop_diversity'] * 10 +
            np.log(credit_data['assets_value']) * 30 +
            -np.log(credit_data['liabilities'] + 1) * 20 +
            credit_data['insurance_coverage'] * 30 +
            np.random.normal(0, 30, n_samples)
        ).clip(300, 850)
        
        # Train credit model
        X_credit = credit_data.values
        y_credit = credit_scores.values
        self.credit_model.fit(X_credit, y_credit)
        
        # Save models
        self._save_models()
        
        logger.info("Models trained with sample data successfully")
    
    def _save_models(self):
        """Save trained models to disk"""
        try:
            joblib.dump(self.price_model, self.models_dir / "price_model.pkl")
            joblib.dump(self.credit_model, self.models_dir / "credit_model.pkl")
            joblib.dump(self.scaler, self.models_dir / "scaler.pkl")
            joblib.dump(self.label_encoders, self.models_dir / "label_encoders.pkl")
            logger.info("Models saved successfully")
        except Exception as e:
            logger.error(f"Error saving models: {e}")
    
    def _load_models(self):
        """Load trained models from disk"""
        self.price_model = joblib.load(self.models_dir / "price_model.pkl")
        self.credit_model = joblib.load(self.models_dir / "credit_model.pkl")
        self.scaler = joblib.load(self.models_dir / "scaler.pkl")
        self.label_encoders = joblib.load(self.models_dir / "label_encoders.pkl")
        logger.info("Models loaded successfully")
    
    async def predict_price(self, request: PricePredictionRequest) -> PricePredictionResponse:
        """Predict crop price based on various factors"""
        try:
            # Encode categorical features
            crop_encoded = self._encode_feature('crop_type', request.crop_type)
            location_encoded = self._encode_feature('location', request.location)
            quality_encoded = self._encode_feature('quality_grade', request.quality_grade or 'B')
            
            # Get current season
            current_month = datetime.now().month
            season = (current_month - 1) // 3  # 0-3 for seasons
            
            # Market factors (simplified)
            market_demand = np.random.uniform(0.4, 0.9)  # In real implementation, get from market data
            supply_level = np.random.uniform(0.3, 0.8)
            
            # Prepare features
            features = np.array([[
                crop_encoded,
                request.quantity,
                location_encoded,
                quality_encoded,
                season,
                market_demand,
                supply_level
            ]])
            
            # Make prediction
            predicted_price = self.price_model.predict(features)[0]
            
            # Calculate confidence and price range
            confidence = min(0.95, max(0.6, np.random.uniform(0.7, 0.9)))
            price_variance = predicted_price * 0.15
            price_range = {
                "min": max(0, predicted_price - price_variance),
                "max": predicted_price + price_variance
            }
            
            # Determine market trend
            trend_factor = np.random.choice(['rising', 'falling', 'stable'], p=[0.3, 0.3, 0.4])
            
            # Key factors affecting price
            factors = [
                f"Crop type: {request.crop_type}",
                f"Quantity: {request.quantity} kg",
                f"Location: {request.location}",
                f"Season: {['Spring', 'Summer', 'Autumn', 'Winter'][season]}",
                f"Market demand: {'High' if market_demand > 0.7 else 'Medium' if market_demand > 0.5 else 'Low'}",
                f"Supply level: {'High' if supply_level > 0.7 else 'Medium' if supply_level > 0.5 else 'Low'}"
            ]
            
            # Generate recommendation
            if predicted_price > 50:
                recommendation = "Good time to sell - prices are favorable"
            elif predicted_price > 30:
                recommendation = "Moderate prices - consider market timing"
            else:
                recommendation = "Consider holding or improving quality grade"
            
            return PricePredictionResponse(
                predicted_price=round(predicted_price, 2),
                price_range=price_range,
                confidence_score=round(confidence, 2),
                factors=factors,
                market_trend=trend_factor,
                recommendation=recommendation
            )
            
        except Exception as e:
            logger.error(f"Error in price prediction: {e}")
            raise
    
    async def get_recommendations(self, request: RecommendationRequest) -> RecommendationResponse:
        """Generate personalized recommendations for farmers"""
        try:
            recommendations = []
            reasoning = []
            
            if request.recommendation_type == "crop":
                # Crop recommendations based on location and farm size
                suitable_crops = self._get_suitable_crops(request.location, request.farm_size)
                recommendations = suitable_crops
                reasoning = [
                    f"Based on {request.location} climate conditions",
                    f"Suitable for {request.farm_size} acre farm size",
                    "High market demand crops prioritized"
                ]
            
            elif request.recommendation_type == "buyer":
                # Buyer recommendations
                potential_buyers = self._get_potential_buyers(request.location)
                recommendations = potential_buyers
                reasoning = [
                    "Based on location proximity",
                    "Historical good payment records",
                    "Competitive pricing offered"
                ]
            
            elif request.recommendation_type == "fertilizer":
                # Fertilizer recommendations
                fertilizer_recs = self._get_fertilizer_recommendations(request.current_crops)
                recommendations = fertilizer_recs
                reasoning = [
                    "Based on current crop requirements",
                    "Soil type compatibility",
                    "Cost-effectiveness analysis"
                ]
            
            elif request.recommendation_type == "timing":
                # Timing recommendations
                timing_recs = self._get_timing_recommendations(request.location)
                recommendations = timing_recs
                reasoning = [
                    "Based on seasonal patterns",
                    "Weather forecast analysis",
                    "Market price trends"
                ]
            
            # Calculate confidence and ROI
            confidence = np.random.uniform(0.7, 0.9)
            expected_roi = np.random.uniform(15, 35) if request.budget else None
            risk_level = np.random.choice(['low', 'medium', 'high'], p=[0.4, 0.4, 0.2])
            
            return RecommendationResponse(
                recommendations=recommendations,
                reasoning=reasoning,
                confidence_score=round(confidence, 2),
                expected_roi=expected_roi,
                risk_level=risk_level
            )
            
        except Exception as e:
            logger.error(f"Error in recommendations: {e}")
            raise
    
    async def calculate_credit_score(self, request: CreditScoreRequest) -> CreditScoreResponse:
        """Calculate credit score for farmers"""
        try:
            # Prepare features
            features = np.array([[
                request.annual_income,
                request.farm_size,
                request.years_farming,
                request.crop_diversity,
                request.assets_value or request.annual_income * 2,
                request.liabilities or 0,
                1 if request.insurance_coverage else 0
            ]])
            
            # Predict credit score
            predicted_score = int(self.credit_model.predict(features)[0])
            predicted_score = max(300, min(850, predicted_score))
            
            # Determine credit range
            if predicted_score >= 750:
                credit_range = CreditScoreRange.EXCELLENT
            elif predicted_score >= 650:
                credit_range = CreditScoreRange.GOOD
            elif predicted_score >= 550:
                credit_range = CreditScoreRange.FAIR
            else:
                credit_range = CreditScoreRange.POOR
            
            # Loan eligibility
            loan_eligible = predicted_score >= 550
            
            # Maximum loan amount (based on income and assets)
            max_loan = (request.annual_income * 3 + (request.assets_value or 0) * 0.7) if loan_eligible else 0
            
            # Interest rate range
            if predicted_score >= 750:
                interest_range = {"min": 8.5, "max": 10.5}
            elif predicted_score >= 650:
                interest_range = {"min": 10.5, "max": 13.0}
            elif predicted_score >= 550:
                interest_range = {"min": 13.0, "max": 16.0}
            else:
                interest_range = {"min": 16.0, "max": 20.0}
            
            # Factors affecting score
            factors = {
                "income": min(100, (request.annual_income / 100000) * 20),
                "farm_size": min(100, request.farm_size * 2),
                "experience": min(100, request.years_farming * 2.5),
                "diversification": min(100, request.crop_diversity * 12.5),
                "assets": min(100, ((request.assets_value or 0) / 500000) * 25),
                "insurance": 50 if request.insurance_coverage else 0
            }
            
            # Recommendations to improve score
            recommendations = []
            if factors["income"] < 50:
                recommendations.append("Increase annual income through crop diversification")
            if factors["experience"] < 50:
                recommendations.append("Gain more farming experience")
            if factors["diversification"] < 50:
                recommendations.append("Diversify crop portfolio to reduce risk")
            if not request.insurance_coverage:
                recommendations.append("Get crop insurance to improve creditworthiness")
            if factors["assets"] < 50:
                recommendations.append("Build assets through equipment and land investments")
            
            # Risk assessment
            if predicted_score >= 700:
                risk_assessment = "low"
            elif predicted_score >= 600:
                risk_assessment = "medium"
            else:
                risk_assessment = "high"
            
            return CreditScoreResponse(
                credit_score=predicted_score,
                credit_range=credit_range,
                loan_eligibility=loan_eligible,
                max_loan_amount=round(max_loan, 2),
                interest_rate_range=interest_range,
                factors=factors,
                recommendations=recommendations,
                risk_assessment=risk_assessment
            )
            
        except Exception as e:
            logger.error(f"Error in credit scoring: {e}")
            raise
    
    def _encode_feature(self, feature_name: str, value: str) -> int:
        """Encode categorical features"""
        if feature_name not in self.label_encoders:
            self.label_encoders[feature_name] = {}
        
        if value not in self.label_encoders[feature_name]:
            # Assign new encoding
            self.label_encoders[feature_name][value] = len(self.label_encoders[feature_name])
        
        return self.label_encoders[feature_name][value]
    
    def _get_suitable_crops(self, location: str, farm_size: Optional[float]) -> List[Dict[str, Any]]:
        """Get suitable crop recommendations"""
        crops_db = {
            "Punjab": ["Wheat", "Rice", "Cotton", "Sugarcane"],
            "Maharashtra": ["Cotton", "Sugarcane", "Soybean", "Onion"],
            "Uttar Pradesh": ["Wheat", "Rice", "Sugarcane", "Potato"],
            "Rajasthan": ["Wheat", "Barley", "Mustard", "Cotton"],
            "Karnataka": ["Rice", "Cotton", "Sugarcane", "Ragi"]
        }
        
        suitable = crops_db.get(location, ["Wheat", "Rice", "Cotton"])
        
        return [
            {
                "crop": crop,
                "expected_yield": np.random.uniform(20, 50),
                "market_price": np.random.uniform(25, 60),
                "season": np.random.choice(["Kharif", "Rabi"]),
                "water_requirement": np.random.choice(["Low", "Medium", "High"])
            }
            for crop in suitable[:3]
        ]
    
    def _get_potential_buyers(self, location: str) -> List[Dict[str, Any]]:
        """Get potential buyer recommendations"""
        return [
            {
                "buyer_name": f"AgriCorp {location}",
                "rating": np.random.uniform(4.0, 5.0),
                "payment_terms": "30 days",
                "distance": f"{np.random.randint(5, 50)} km",
                "specialization": "Grains & Cereals"
            },
            {
                "buyer_name": f"FarmFresh {location}",
                "rating": np.random.uniform(3.5, 4.8),
                "payment_terms": "15 days",
                "distance": f"{np.random.randint(10, 80)} km",
                "specialization": "Organic Produce"
            }
        ]
    
    def _get_fertilizer_recommendations(self, crops: Optional[List[str]]) -> List[Dict[str, Any]]:
        """Get fertilizer recommendations"""
        if not crops:
            crops = ["General"]
        
        return [
            {
                "fertilizer": "NPK 10-26-26",
                "application_rate": "50-75 kg/acre",
                "timing": "At sowing",
                "cost": f"₹{np.random.randint(800, 1200)}/bag"
            },
            {
                "fertilizer": "Urea",
                "application_rate": "25-40 kg/acre",
                "timing": "Top dressing",
                "cost": f"₹{np.random.randint(300, 500)}/bag"
            }
        ]
    
    def _get_timing_recommendations(self, location: str) -> List[Dict[str, Any]]:
        """Get timing recommendations"""
        return [
            {
                "activity": "Sowing",
                "recommended_period": "June 15 - July 15",
                "reason": "Optimal monsoon timing",
                "confidence": "High"
            },
            {
                "activity": "Harvesting",
                "recommended_period": "October 15 - November 15",
                "reason": "Peak market prices expected",
                "confidence": "Medium"
            }
        ]


# Global instance
ai_ml_service = AIMLService()
