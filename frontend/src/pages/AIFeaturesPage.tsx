import React from 'react';
import { SparklesIcon, ChartBarIcon, LightBulbIcon, EyeIcon } from '@heroicons/react/24/outline';
import PricePredictionCard from '../components/ai/PricePredictionCard';
import RecommendationCard from '../components/ai/RecommendationCard';
import MarketInsightsCard from '../components/ai/MarketInsightsCard';
import CreditScoreCard from '../components/ai/CreditScoreCard';
import { useAuthStore } from '../stores/authStore';

const AIFeaturesPage: React.FC = () => {
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="p-4 bg-gradient-to-br from-emerald-100 to-purple-100 rounded-2xl">
              <SparklesIcon className="h-12 w-12 text-emerald-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI-Powered Agriculture Intelligence
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Harness the power of Google's Gemini AI to make smarter farming decisions, 
            predict market trends, and optimize your agricultural business.
          </p>
        </div>

        {/* AI Features Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-12">
          {/* Price Prediction */}
          <div className="space-y-6">
            <PricePredictionCard />
          </div>

          {/* Market Insights */}
          <div className="space-y-6">
            <MarketInsightsCard />
          </div>
        </div>

        {/* Second Row - Recommendations and Credit Score */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-12">
          <div className="space-y-6">
            <RecommendationCard userRole={user?.role as 'farmer' | 'buyer' | 'financier'} />
          </div>

          {/* Credit Score - Show for farmers and financiers */}
          {(user?.role === 'farmer' || user?.role === 'financier') && (
            <div className="space-y-6">
              <CreditScoreCard />
            </div>
          )}
        </div>

        {/* AI Features Overview */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Powered by Google Gemini AI
            </h2>
            <p className="text-gray-600">
              Our AI features leverage advanced machine learning to provide intelligent insights for your agricultural needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="p-4 bg-gradient-to-br from-emerald-100 to-blue-100 rounded-xl mb-4 mx-auto w-16 h-16 flex items-center justify-center">
                <ChartBarIcon className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Price Prediction</h3>
              <p className="text-gray-600 text-sm">
                Get accurate crop price forecasts based on market conditions, seasonal patterns, and historical data.
              </p>
            </div>

            <div className="text-center">
              <div className="p-4 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-xl mb-4 mx-auto w-16 h-16 flex items-center justify-center">
                <LightBulbIcon className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Personalized Recommendations</h3>
              <p className="text-gray-600 text-sm">
                Receive tailored suggestions for crops, buyers, and investment opportunities based on your profile.
              </p>
            </div>

            <div className="text-center">
              <div className="p-4 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl mb-4 mx-auto w-16 h-16 flex items-center justify-center">
                <EyeIcon className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Market Intelligence</h3>
              <p className="text-gray-600 text-sm">
                Stay ahead with comprehensive market analysis, trends, and forecasts for informed decision-making.
              </p>
            </div>
          </div>

          <div className="mt-8 p-6 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl border border-emerald-200">
            <div className="flex items-center mb-3">
              <SparklesIcon className="h-5 w-5 text-emerald-600 mr-2" />
              <h4 className="font-semibold text-gray-900">AI Technology</h4>
            </div>
            <p className="text-gray-700 text-sm">
              All AI features are powered by Google's Gemini 2.5 Flash model, providing state-of-the-art natural language processing 
              and analytical capabilities specifically trained for agricultural applications. Our AI considers multiple factors including 
              weather patterns, market dynamics, historical trends, and regional variations to deliver accurate insights.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIFeaturesPage;
