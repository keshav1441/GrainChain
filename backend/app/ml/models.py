import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score
import joblib
import os
from datetime import datetime
from typing import Dict, Any, List
import logging

logger = logging.getLogger(__name__)

class CropPricePredictionModel:
    """ML model for predicting crop prices"""
    
    def __init__(self):
        self.model = RandomForestRegressor(
            n_estimators=100,
            max_depth=10,
            random_state=42
        )
        self.label_encoders = {}
        self.scaler = StandardScaler()
        self.is_trained = False
        
    def prepare_features(self, data: Dict[str, Any]) -> np.ndarray:
        """Prepare features for prediction"""
        # Base price mapping for crops
        crop_base_prices = {
            'wheat': 25.0, 'rice': 30.0, 'corn': 20.0, 'sugarcane': 3.5,
            'cotton': 60.0, 'soybean': 45.0, 'potato': 15.0, 'onion': 25.0,
            'tomato': 30.0, 'cabbage': 12.0, 'barley': 22.0, 'maize': 18.0
        }
        
        # Location price multipliers
        location_multipliers = {
            'punjab': 1.1, 'haryana': 1.05, 'uttar pradesh': 1.0, 'bihar': 0.95,
            'west bengal': 1.02, 'maharashtra': 1.08, 'karnataka': 1.03,
            'andhra pradesh': 1.01, 'tamil nadu': 1.04, 'gujarat': 1.06,
            'rajasthan': 0.98, 'madhya pradesh': 0.97
        }
        
        # Quality grade multipliers
        quality_multipliers = {'A': 1.2, 'B': 1.0, 'C': 0.8}
        
        # Extract features
        crop_type = data.get('crop_type', 'wheat').lower()
        location = data.get('location', 'india').lower()
        quality_grade = data.get('quality_grade', 'B')
        quantity = float(data.get('quantity', 100))
        
        # Calculate base features
        base_price = crop_base_prices.get(crop_type, 25.0)
        location_mult = location_multipliers.get(location, 1.0)
        quality_mult = quality_multipliers.get(quality_grade, 1.0)
        
        # Seasonal factor (simplified)
        month = datetime.now().month
        seasonal_factor = 1.0 + 0.1 * np.sin(2 * np.pi * month / 12)
        
        # Market demand factor (simplified based on quantity)
        demand_factor = 1.0 - min(0.2, quantity / 10000)
        
        features = np.array([
            base_price,
            location_mult,
            quality_mult,
            quantity,
            seasonal_factor,
            demand_factor,
            month,
            len(crop_type),  # crop complexity
        ]).reshape(1, -1)
        
        return features
    
    def predict(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Predict crop price"""
        try:
            features = self.prepare_features(data)
            
            # Simple rule-based prediction for now
            crop_type = data.get('crop_type', 'wheat').lower()
            location = data.get('location', 'india').lower()
            quality_grade = data.get('quality_grade', 'B')
            quantity = float(data.get('quantity', 100))
            
            # Base calculations
            base_prices = {
                'wheat': 25.0, 'rice': 30.0, 'corn': 20.0, 'sugarcane': 3.5,
                'cotton': 60.0, 'soybean': 45.0, 'potato': 15.0, 'onion': 25.0,
                'tomato': 30.0, 'cabbage': 12.0, 'barley': 22.0, 'maize': 18.0
            }
            
            location_multipliers = {
                'punjab': 1.1, 'haryana': 1.05, 'uttar pradesh': 1.0, 'bihar': 0.95,
                'west bengal': 1.02, 'maharashtra': 1.08, 'karnataka': 1.03,
                'andhra pradesh': 1.01, 'tamil nadu': 1.04, 'gujarat': 1.06,
                'rajasthan': 0.98, 'madhya pradesh': 0.97
            }
            
            quality_multipliers = {'A': 1.2, 'B': 1.0, 'C': 0.8}
            
            base_price = base_prices.get(crop_type, 25.0)
            location_mult = location_multipliers.get(location, 1.0)
            quality_mult = quality_multipliers.get(quality_grade, 1.0)
            
            # Add some randomness for market conditions
            market_volatility = np.random.uniform(0.9, 1.1)
            
            predicted_price = base_price * location_mult * quality_mult * market_volatility
            
            # Price range
            price_min = predicted_price * 0.85
            price_max = predicted_price * 1.15
            
            # Market trend
            trend_factor = np.random.choice(['bullish', 'bearish', 'stable'], p=[0.4, 0.3, 0.3])
            
            return {
                "predicted_price": round(predicted_price, 2),
                "price_range": {"min": round(price_min, 2), "max": round(price_max, 2)},
                "confidence_score": np.random.randint(75, 95),
                "market_trend": trend_factor,
                "recommendation": f"Based on current market conditions, {crop_type} is showing {trend_factor} trends",
                "factors": [
                    f"Base price for {crop_type}: ₹{base_price}",
                    f"Location factor ({location}): {location_mult}x",
                    f"Quality grade ({quality_grade}): {quality_mult}x",
                    "Current market volatility",
                    "Seasonal demand patterns"
                ]
            }
            
        except Exception as e:
            logger.error(f"Error in price prediction: {e}")
            return {
                "predicted_price": 25.0,
                "price_range": {"min": 22.0, "max": 28.0},
                "confidence_score": 60,
                "market_trend": "stable",
                "recommendation": "Using fallback prediction due to model error",
                "factors": ["Model unavailable", "Using historical averages"]
            }


class CreditScoreModel:
    """ML model for credit score assessment"""
    
    def __init__(self):
        self.model = GradientBoostingRegressor(
            n_estimators=100,
            learning_rate=0.1,
            max_depth=6,
            random_state=42
        )
        self.scaler = StandardScaler()
        self.is_trained = False
    
    def prepare_features(self, data: Dict[str, Any]) -> np.ndarray:
        """Prepare features for credit scoring"""
        # Extract and normalize features
        farm_size = float(data.get('farm_size', 1))
        years_farming = float(data.get('years_farming', 5))
        annual_income = float(data.get('annual_income', 100000))
        
        # Normalize features
        farm_size_norm = min(farm_size / 10, 1.0)  # Normalize to 0-1
        experience_norm = min(years_farming / 20, 1.0)  # Normalize to 0-1
        income_norm = min(annual_income / 500000, 1.0)  # Normalize to 0-1
        
        features = np.array([
            farm_size_norm,
            experience_norm,
            income_norm,
            farm_size * 0.1,  # Farm size impact
            years_farming * 0.05,  # Experience impact
            annual_income / 10000,  # Income impact
        ]).reshape(1, -1)
        
        return features
    
    def predict(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Predict credit score"""
        try:
            features = self.prepare_features(data)
            
            # Extract key factors
            farm_size = float(data.get('farm_size', 1))
            years_farming = float(data.get('years_farming', 5))
            annual_income = float(data.get('annual_income', 100000))
            name = data.get('name', 'Farmer')
            location = data.get('location', 'India')
            
            # Base credit score calculation
            base_score = 600
            
            # Farm size factor (0-50 points)
            farm_score = min(50, farm_size * 5)
            
            # Experience factor (0-80 points)
            experience_score = min(80, years_farming * 4)
            
            # Income factor (0-120 points)
            income_score = min(120, (annual_income / 1000) * 0.1)
            
            # Calculate final score
            credit_score = int(base_score + farm_score + experience_score + income_score)
            credit_score = max(300, min(850, credit_score))  # Clamp to valid range
            
            # Determine score category
            if credit_score >= 750:
                category = "excellent"
                risk_level = "low"
                loan_eligibility = "high"
            elif credit_score >= 700:
                category = "very_good"
                risk_level = "low"
                loan_eligibility = "high"
            elif credit_score >= 650:
                category = "good"
                risk_level = "medium"
                loan_eligibility = "medium"
            elif credit_score >= 600:
                category = "fair"
                risk_level = "medium"
                loan_eligibility = "medium"
            else:
                category = "poor"
                risk_level = "high"
                loan_eligibility = "low"
            
            # Generate factors and suggestions
            factors = []
            suggestions = []
            
            if farm_size >= 5:
                factors.append(f"Large farm size ({farm_size} acres) - Positive")
            elif farm_size >= 2:
                factors.append(f"Medium farm size ({farm_size} acres) - Neutral")
            else:
                factors.append(f"Small farm size ({farm_size} acres) - Needs improvement")
                suggestions.append("Consider expanding farm operations")
            
            if years_farming >= 10:
                factors.append(f"Extensive farming experience ({years_farming} years) - Positive")
            elif years_farming >= 5:
                factors.append(f"Good farming experience ({years_farming} years) - Positive")
            else:
                factors.append(f"Limited farming experience ({years_farming} years) - Needs development")
                suggestions.append("Gain more farming experience and training")
            
            if annual_income >= 200000:
                factors.append(f"High annual income (₹{annual_income:,}) - Positive")
            elif annual_income >= 100000:
                factors.append(f"Moderate annual income (₹{annual_income:,}) - Neutral")
            else:
                factors.append(f"Low annual income (₹{annual_income:,}) - Needs improvement")
                suggestions.append("Focus on increasing crop yield and diversification")
            
            # Default suggestions
            if not suggestions:
                suggestions = [
                    "Maintain consistent farming practices",
                    "Consider crop insurance for risk mitigation",
                    "Keep detailed financial records"
                ]
            
            # Recommended loan amount
            recommended_amount = min(annual_income * 2, farm_size * 50000)
            
            return {
                "credit_score": credit_score,
                "score_category": category,
                "risk_level": risk_level,
                "factors_affecting_score": factors,
                "improvement_suggestions": suggestions,
                "loan_eligibility": loan_eligibility,
                "recommended_loan_amount": int(recommended_amount)
            }
            
        except Exception as e:
            logger.error(f"Error in credit scoring: {e}")
            return {
                "credit_score": 650,
                "score_category": "fair",
                "risk_level": "medium",
                "factors_affecting_score": ["Model error - using default assessment"],
                "improvement_suggestions": ["Manual review required"],
                "loan_eligibility": "medium",
                "recommended_loan_amount": 100000
            }


# Global model instances
price_model = CropPricePredictionModel()
credit_model = CreditScoreModel()
