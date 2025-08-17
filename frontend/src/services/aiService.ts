import api from './api';

// AI/ML Service for GrainChain - Powered by Gemini
export interface PricePredictionRequest {
  crop_type: string;
  quantity: number;
  location: string;
  quality_grade?: string;
}

export interface PricePredictionResponse {
  predicted_price: number;
  price_range: { min: number; max: number };
  confidence_score: number;
  market_trend: string;
  recommendation: string;
  factors: string[];
}

export interface RecommendationRequest {
  recommendation_type: 'crop' | 'buyer' | 'financier';
  location?: string;
  farm_size?: number;
  budget?: number;
}

export interface RecommendationResponse {
  recommendations: string[];
  confidence_score: number;
  expected_roi?: number;
  risk_level: string;
  reasoning: string[];
}

export interface CreditScoreRequest {
  annual_income: number;
  farm_size: number;
  years_farming: number;
  loan_amount: number;
  credit_history: string;
  collateral_value?: number;
}

export interface CreditScoreResponse {
  credit_score: number;
  risk_category: string;
  loan_eligible: boolean;
  max_loan_amount: number;
  interest_rate_range: { min: number; max: number };
  factors: string[];
  recommendations: string[];
}

export interface MarketInsight {
  crop_type: string;
  location: string;
  trend_direction: string;
  price_volatility: string;
  demand_level: string;
  supply_level: string;
  market_sentiment: string;
  key_insights: string[];
  forecast: string;
}

export interface PriceTrend {
  crop_type: string;
  location: string;
  period_days: number;
  data: Array<{ date: string; price: number }>;
  average_price: number;
  trend: string;
}

class AIService {
  // Price Prediction
  async getPricePrediction(data: PricePredictionRequest): Promise<PricePredictionResponse> {
    try {
      const response = await api.post('/ai-ml/predict-price', data);
      return response.data;
    } catch (error) {
      console.error('Error getting price prediction:', error);
      throw error;
    }
  }

  // Crop/Business Recommendations
  async getRecommendations(data: RecommendationRequest): Promise<RecommendationResponse> {
    try {
      const response = await api.post('/ai-ml/recommendations', data);
      return response.data;
    } catch (error) {
      console.error('Error getting recommendations:', error);
      throw error;
    }
  }

  // Credit Score Assessment
  async getCreditScore(data: CreditScoreRequest): Promise<CreditScoreResponse> {
    try {
      const response = await api.post('/ai-ml/credit-score', data);
      return response.data;
    } catch (error) {
      console.error('Error getting credit score:', error);
      throw error;
    }
  }

  // Market Insights
  async getMarketInsights(cropType: string, location?: string): Promise<MarketInsight> {
    try {
      const response = await api.get(`/ai-ml/market-insights/${cropType}${location ? `?location=${location}` : ''}`);
      return response.data;
    } catch (error) {
      console.error('Error getting market insights:', error);
      throw error;
    }
  }

  // Price Trends
  async getPriceTrends(cropType: string, days: number = 30, location?: string): Promise<PriceTrend> {
    try {
      const response = await api.get(`/ai-ml/price-trends/${cropType}?days=${days}${location ? `&location=${location}` : ''}`);
      return response.data;
    } catch (error) {
      console.error('Error getting price trends:', error);
      throw error;
    }
  }

  // Batch Price Prediction
  async getBatchPricePrediction(requests: PricePredictionRequest[]): Promise<PricePredictionResponse[]> {
    try {
      const response = await api.post('/ai-ml/batch-price-prediction', requests);
      return response.data;
    } catch (error) {
      console.error('Error getting batch price prediction:', error);
      throw error;
    }
  }

  // Location-based Crop Recommendations
  async getCropRecommendationsByLocation(
    location: string, 
    farmSize?: number, 
    budget?: number
  ): Promise<RecommendationResponse> {
    try {
      const params = new URLSearchParams();
      if (farmSize) params.append('farm_size', farmSize.toString());
      if (budget) params.append('budget', budget.toString());
      
      const response = await api.get(`/ai-ml/crop-recommendations/${location}?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error getting crop recommendations:', error);
      throw error;
    }
  }

  // Utility Methods
  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price);
  }

  getConfidenceColor(score: number): string {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  }

  getTrendColor(trend: string): string {
    switch (trend.toLowerCase()) {
      case 'bullish':
      case 'rising':
      case 'upward':
        return 'text-green-600';
      case 'bearish':
      case 'falling':
      case 'downward':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  }

  getRiskColor(risk: string): string {
    switch (risk.toLowerCase()) {
      case 'low':
        return 'text-green-600 bg-green-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'high':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  }

  // Mock data for development/fallback
  getMockPricePrediction(cropType: string): PricePredictionResponse {
    const basePrices: { [key: string]: number } = {
      wheat: 25,
      rice: 30,
      corn: 20,
      sugarcane: 3.5,
      cotton: 60,
      soybean: 45,
      potato: 15,
      onion: 25,
      tomato: 30,
      cabbage: 12
    };

    const basePrice = basePrices[cropType.toLowerCase()] || 25;
    
    return {
      predicted_price: basePrice,
      price_range: { min: basePrice * 0.9, max: basePrice * 1.1 },
      confidence_score: 75,
      market_trend: 'stable',
      recommendation: 'Good time to sell based on current market conditions',
      factors: ['Seasonal demand', 'Weather conditions', 'Market supply']
    };
  }

  getMockRecommendations(type: string): RecommendationResponse {
    const recommendations: { [key: string]: string[] } = {
      crop: ['Wheat', 'Rice', 'Sugarcane', 'Cotton', 'Soybean'],
      buyer: ['Local farmers', 'Cooperative societies', 'Direct farm purchases'],
      financier: ['Small-scale farmers', 'Organic farming', 'Technology adoption']
    };

    return {
      recommendations: recommendations[type] || ['General recommendations'],
      confidence_score: 70,
      expected_roi: 15,
      risk_level: 'medium',
      reasoning: ['Based on market analysis', 'Historical performance', 'Current trends']
    };
  }
}

export const aiService = new AIService();
export default aiService;
