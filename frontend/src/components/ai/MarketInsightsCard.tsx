import React, { useState } from 'react';
import { 
  ChartBarIcon, 
  SparklesIcon, 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon,
  EyeIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { aiService } from '../../services/aiService';
import toast from 'react-hot-toast';

const MarketInsightsCard: React.FC = () => {
  const [cropType, setCropType] = useState('');
  const [location, setLocation] = useState('');
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleGetInsights = async () => {
    if (!cropType) {
      toast.error('Please select a crop type');
      return;
    }

    setLoading(true);
    try {
      const result = await aiService.getMarketInsights(cropType, location);
      setInsights(result);
      toast.success('Market insights generated successfully!');
    } catch (error) {
      toast.error('Failed to get market insights');
      console.error('Market insights error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case 'positive': return 'text-green-600 bg-green-100';
      case 'negative': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center mb-6">
        <div className="p-3 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl mr-4">
          <EyeIcon className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Market Insights</h3>
          <p className="text-gray-600">AI-powered market analysis using Gemini</p>
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
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              Location (Optional)
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter location/state"
            />
          </div>
        </div>

        <button
          onClick={handleGetInsights}
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Analyzing Market...
            </>
          ) : (
            <>
              <SparklesIcon className="h-5 w-5 mr-2" />
              Get Market Insights
            </>
          )}
        </button>
      </div>

      {/* Insights Results */}
      {insights && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-bold text-gray-900">Market Analysis</h4>
              <div className="text-sm text-gray-600">
                {insights.crop_type} • {insights.location}
              </div>
            </div>

            {/* Market Indicators */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  insights.trend_direction === 'upward' ? 'bg-green-100 text-green-800' :
                  insights.trend_direction === 'downward' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {insights.trend_direction === 'upward' ? (
                    <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                  ) : insights.trend_direction === 'downward' ? (
                    <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
                  ) : (
                    <ArrowPathIcon className="h-4 w-4 mr-1" />
                  )}
                  {insights.trend_direction}
                </div>
                <div className="text-xs text-gray-600 mt-1">Trend</div>
              </div>

              <div className="text-center">
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getLevelColor(insights.price_volatility)}`}>
                  {insights.price_volatility}
                </div>
                <div className="text-xs text-gray-600 mt-1">Volatility</div>
              </div>

              <div className="text-center">
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getLevelColor(insights.demand_level)}`}>
                  {insights.demand_level}
                </div>
                <div className="text-xs text-gray-600 mt-1">Demand</div>
              </div>

              <div className="text-center">
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getLevelColor(insights.supply_level)}`}>
                  {insights.supply_level}
                </div>
                <div className="text-xs text-gray-600 mt-1">Supply</div>
              </div>
            </div>

            {/* Market Sentiment */}
            <div className="mb-6">
              <h5 className="font-semibold text-gray-900 mb-2">Market Sentiment</h5>
              <div className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium ${getSentimentColor(insights.market_sentiment)}`}>
                <ChartBarIcon className="h-4 w-4 mr-2" />
                {insights.market_sentiment}
              </div>
            </div>

            {/* Key Insights */}
            <div className="mb-6">
              <h5 className="font-semibold text-gray-900 mb-3">Key Insights</h5>
              <div className="space-y-2">
                {insights.key_insights.map((insight: string, index: number) => (
                  <div key={index} className="flex items-start p-3 bg-white rounded-lg border border-blue-200">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold mr-3 flex-shrink-0">
                      {index + 1}
                    </div>
                    <span className="text-gray-700 text-sm">{insight}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Forecast */}
            <div>
              <h5 className="font-semibold text-gray-900 mb-2">3-Month Forecast</h5>
              <div className="bg-white rounded-lg p-4 border border-purple-200">
                <p className="text-gray-700 text-sm">{insights.forecast}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketInsightsCard;
