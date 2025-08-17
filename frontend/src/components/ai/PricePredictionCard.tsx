import React, { useState } from 'react';
import { 
  ChartBarIcon, 
  SparklesIcon, 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { aiService } from '../../services/aiService';
import toast from 'react-hot-toast';

interface PricePredictionCardProps {
  cropType?: string;
  quantity?: number;
  location?: string;
}

const PricePredictionCard: React.FC<PricePredictionCardProps> = ({
  cropType: initialCropType = '',
  quantity: initialQuantity = 100,
  location: initialLocation = ''
}) => {
  const [cropType, setCropType] = useState(initialCropType);
  const [quantity, setQuantity] = useState(initialQuantity);
  const [location, setLocation] = useState(initialLocation);
  const [qualityGrade, setQualityGrade] = useState('A');
  const [prediction, setPrediction] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handlePredict = async () => {
    if (!cropType || !quantity || !location) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const result = await aiService.getPricePrediction({
        crop_type: cropType,
        quantity,
        location,
        quality_grade: qualityGrade
      });
      setPrediction(result);
      toast.success('Price prediction generated successfully!');
    } catch (error) {
      toast.error('Failed to get price prediction');
      console.error('Price prediction error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center mb-6">
        <div className="p-3 bg-gradient-to-br from-emerald-100 to-blue-100 rounded-xl mr-4">
          <SparklesIcon className="h-6 w-6 text-emerald-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">AI Price Prediction</h3>
          <p className="text-gray-600">Get AI-powered price forecasts using Gemini</p>
        </div>
      </div>

      {/* Input Form */}
      <div className="space-y-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Crop Type *
            </label>
            <select
              value={cropType}
              onChange={(e) => setCropType(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Select crop</option>
              <option value="wheat">Wheat</option>
              <option value="rice">Rice</option>
              <option value="corn">Corn</option>
              <option value="sugarcane">Sugarcane</option>
              <option value="cotton">Cotton</option>
              <option value="soybean">Soybean</option>
              <option value="potato">Potato</option>
              <option value="onion">Onion</option>
              <option value="tomato">Tomato</option>
              <option value="cabbage">Cabbage</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity (kg) *
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Enter quantity"
              min="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location *
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Enter location/state"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quality Grade
            </label>
            <select
              value={qualityGrade}
              onChange={(e) => setQualityGrade(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="A">Grade A (Premium)</option>
              <option value="B">Grade B (Standard)</option>
              <option value="C">Grade C (Basic)</option>
            </select>
          </div>
        </div>

        <button
          onClick={handlePredict}
          disabled={loading}
          className="w-full bg-gradient-to-r from-emerald-600 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-emerald-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Analyzing with AI...
            </>
          ) : (
            <>
              <SparklesIcon className="h-5 w-5 mr-2" />
              Get AI Prediction
            </>
          )}
        </button>
      </div>

      {/* Prediction Results */}
      {prediction && (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-emerald-50 to-blue-50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-bold text-gray-900">Prediction Results</h4>
              <div className="flex items-center text-sm text-gray-600">
                <InformationCircleIcon className="h-4 w-4 mr-1" />
                Confidence: {prediction.confidence_score}%
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">
                  ₹{prediction.predicted_price.toFixed(2)}
                </div>
                <div className="text-sm text-gray-600">Predicted Price/kg</div>
              </div>
              
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-800">
                  ₹{prediction.price_range.min.toFixed(2)} - ₹{prediction.price_range.max.toFixed(2)}
                </div>
                <div className="text-sm text-gray-600">Price Range</div>
              </div>

              <div className="text-center">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  prediction.market_trend === 'bullish' ? 'bg-green-100 text-green-800' :
                  prediction.market_trend === 'bearish' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {prediction.market_trend === 'bullish' ? (
                    <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                  ) : prediction.market_trend === 'bearish' ? (
                    <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
                  ) : (
                    <ChartBarIcon className="h-4 w-4 mr-1" />
                  )}
                  {prediction.market_trend}
                </div>
                <div className="text-sm text-gray-600 mt-1">Market Trend</div>
              </div>
            </div>

            <div className="mb-4">
              <h5 className="font-semibold text-gray-900 mb-2">AI Recommendation</h5>
              <p className="text-gray-700 text-sm bg-white rounded-lg p-3">
                {prediction.recommendation}
              </p>
            </div>

            <div>
              <h5 className="font-semibold text-gray-900 mb-2">Key Factors</h5>
              <div className="flex flex-wrap gap-2">
                {prediction.factors.map((factor: string, index: number) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-white text-gray-700 rounded-full text-sm border"
                  >
                    {factor}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PricePredictionCard;
