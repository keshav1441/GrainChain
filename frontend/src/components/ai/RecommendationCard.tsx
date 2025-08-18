import React, { useState } from 'react';
import { 
  LightBulbIcon, 
  SparklesIcon, 
  MapPinIcon,
  CurrencyRupeeIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { aiService } from '../../services/aiService';
import toast from 'react-hot-toast';

interface RecommendationCardProps {
  userRole?: 'farmer' | 'buyer' | 'financier';
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({
  userRole = 'farmer'
}) => {
  // Set default recommendation type based on user role
  const getDefaultRecommendationType = (role: string): 'crop' | 'buyer' | 'financier' => {
    switch(role) {
      case 'buyer': return 'buyer';
      case 'financier': return 'financier';
      case 'farmer':
      default: 
        return 'crop';
    }
  };

  const [recommendationType, setRecommendationType] = useState<'crop' | 'buyer' | 'financier'>(
    getDefaultRecommendationType(userRole) as 'crop' | 'buyer' | 'financier'
  );
  const [location, setLocation] = useState('');
  const [farmSize, setFarmSize] = useState<number>(1);
  const [budget, setBudget] = useState<number>(50000);
  interface RecommendationData {
    reasoning?: string | string[]; // Can be either string or array of strings
    confidence_score?: number;
    risk_level?: string;
    recommendations?: string[];
    expected_roi?: string | number;
    data_source?: string;
    // Add any other properties that might be returned
  }

  const [recommendations, setRecommendations] = useState<RecommendationData | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGetRecommendations = async () => {
    if (!location) {
      toast.error('Please enter your location');
      return;
    }

    setLoading(true);
    try {
      // Prepare request data based on user role and recommendation type
      const requestData: any = {
        recommendation_type: recommendationType,
        user_role: userRole,
        location,
      };

      // Only include farm_size for farmer role
      if (userRole === 'farmer') {
        requestData.farm_size = farmSize;
      }

      // Include budget for financier role
      if (userRole === 'financier') {
        requestData.budget = budget;
      }

      const result = await aiService.getRecommendations(requestData);
      setRecommendations(result);
      toast.success('AI recommendations generated successfully!');
    } catch (error) {
      toast.error('Failed to get recommendations');
      console.error('Recommendations error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center mb-6">
        <div className="p-3 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-xl mr-4">
          <LightBulbIcon className="h-6 w-6 text-yellow-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">AI Recommendations</h3>
          <p className="text-gray-600">Get personalized suggestions powered by Gemini</p>
        </div>
      </div>

      {/* Input Form */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Recommendation Type
          </label>
          <select
            value={recommendationType}
            onChange={(e) => setRecommendationType(e.target.value as 'crop' | 'buyer' | 'financier')}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500"
          >
            {userRole === 'farmer' && (
              <option value="crop">Crop Recommendations</option>
            )}
            {userRole === 'buyer' && (
              <option value="buyer">Find Farmers</option>
            )}
            {userRole === 'financier' && (
              <option value="financier">Investment Opportunities</option>
            )}
            <option value="market">Market Trends</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPinIcon className="h-4 w-4 inline mr-1" />
              Location *
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500"
              placeholder="Enter your location"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Farm Size (acres)
            </label>
            <input
              type="number"
              value={farmSize}
              onChange={(e) => setFarmSize(Number(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500"
              placeholder="Farm size"
              min="0.1"
              step="0.1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <CurrencyRupeeIcon className="h-4 w-4 inline mr-1" />
              Budget
            </label>
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500"
              placeholder="Available budget"
              min="1000"
              step="1000"
            />
          </div>
        </div>

        <button
          onClick={handleGetRecommendations}
          disabled={loading}
          className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-yellow-700 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Generating AI Recommendations...
            </>
          ) : (
            <>
              <SparklesIcon className="h-5 w-5 mr-2" />
              Get AI Recommendations
            </>
          )}
        </button>
      </div>

      {/* Recommendations Results */}
      {recommendations && (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-bold text-gray-900">AI Recommendations</h4>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-600">
                  Confidence: {recommendations.confidence_score}%
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  recommendations.risk_level === 'low' ? 'bg-green-100 text-green-800' :
                  recommendations.risk_level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {recommendations.risk_level} risk
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h5 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <LightBulbIcon className="h-5 w-5 mr-2 text-yellow-600" />
                  Top Recommendations
                </h5>
                <div className="space-y-2">
                  {recommendations.recommendations?.map((rec: string, index: number) => (
                    <div
                      key={index}
                      className="flex items-center p-3 bg-white rounded-lg border border-yellow-200"
                    >
                      <div className="w-6 h-6 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center text-sm font-semibold mr-3">
                        {index + 1}
                      </div>
                      <span className="text-gray-800">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h5 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <ChartBarIcon className="h-5 w-5 mr-2 text-orange-600" />
                  Expected ROI
                </h5>
                <div className="bg-white rounded-lg p-4 border border-orange-200">
                  <div className="text-3xl font-bold text-orange-600 mb-2">
                    {recommendations.expected_roi}%
                  </div>
                  <div className="text-sm text-gray-600">
                    Projected return on investment
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h5 className="font-semibold text-gray-900 mb-3">AI Analysis & Reasoning</h5>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="space-y-2">
                  {typeof recommendations?.reasoning === 'string' ? (
                    <p className="text-gray-700 text-sm">{recommendations.reasoning}</p>
                  ) : Array.isArray(recommendations?.reasoning) ? (
                    <ul className="space-y-2">
                      {recommendations.reasoning.map((reason: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                          <span className="text-gray-700 text-sm">{reason}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 text-sm">No reasoning available</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecommendationCard;
