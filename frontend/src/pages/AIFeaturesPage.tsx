import React, { useState } from 'react';
import { SparklesIcon, ChartBarIcon, LightBulbIcon, EyeIcon, CreditCardIcon } from '@heroicons/react/24/outline';
import PricePredictionCard from '../components/ai/PricePredictionCard';
import RecommendationCard from '../components/ai/RecommendationCard';
import MarketInsightsCard from '../components/ai/MarketInsightsCard';
import CreditScoreCard from '../components/ai/CreditScoreCard';
import { useAuthStore } from '../stores/authStore';

const AIFeaturesPage: React.FC = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('price-prediction');

  const tabs = [
    {
      id: 'price-prediction',
      name: 'AI Price Prediction',
      icon: ChartBarIcon,
      description: 'Smart crop price forecasting',
      color: 'emerald'
    },
    {
      id: 'market-insights',
      name: 'Market Insights',
      icon: EyeIcon,
      description: 'Comprehensive market analysis',
      color: 'blue'
    },
    {
      id: 'recommendations',
      name: 'AI Recommendations',
      icon: LightBulbIcon,
      description: 'Personalized suggestions',
      color: 'yellow'
    },
    ...(user?.role === 'farmer' || user?.role === 'financier' ? [{
      id: 'credit-score',
      name: 'Credit Analysis',
      icon: CreditCardIcon,
      description: 'AI-powered credit scoring',
      color: 'purple'
    }] : [])
  ];

  const getColorClasses = (color: string) => {
    const colorMap: { [key: string]: { active: string; inactive: string; bg: string; icon: string } } = {
      emerald: {
        active: 'border-emerald-500 text-emerald-600 bg-emerald-50',
        inactive: 'border-transparent text-gray-500 hover:text-emerald-600 hover:border-emerald-300',
        bg: 'from-emerald-100 to-emerald-50',
        icon: 'text-emerald-600'
      },
      blue: {
        active: 'border-blue-500 text-blue-600 bg-blue-50',
        inactive: 'border-transparent text-gray-500 hover:text-blue-600 hover:border-blue-300',
        bg: 'from-blue-100 to-blue-50',
        icon: 'text-blue-600'
      },
      yellow: {
        active: 'border-yellow-500 text-yellow-600 bg-yellow-50',
        inactive: 'border-transparent text-gray-500 hover:text-yellow-600 hover:border-yellow-300',
        bg: 'from-yellow-100 to-yellow-50',
        icon: 'text-yellow-600'
      },
      purple: {
        active: 'border-purple-500 text-purple-600 bg-purple-50',
        inactive: 'border-transparent text-gray-500 hover:text-purple-600 hover:border-purple-300',
        bg: 'from-purple-100 to-purple-50',
        icon: 'text-purple-600'
      }
    };

    return colorMap[color] || colorMap.emerald;
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'price-prediction':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-6 border border-emerald-200">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-emerald-200 rounded-lg mr-3">
                  <ChartBarIcon className="h-6 w-6 text-emerald-700" />
                </div>
                <h3 className="text-xl font-semibold text-emerald-900">Smart Price Forecasting</h3>
              </div>
              <p className="text-emerald-800 mb-6">
                Leverage advanced AI algorithms to predict crop prices with high accuracy, helping you make informed decisions about when to sell your produce.
              </p>
            </div>
            <PricePredictionCard />
          </div>
        );
      
      case 'market-insights':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-blue-200 rounded-lg mr-3">
                  <EyeIcon className="h-6 w-6 text-blue-700" />
                </div>
                <h3 className="text-xl font-semibold text-blue-900">Market Intelligence</h3>
              </div>
              <p className="text-blue-800 mb-6">
                Get comprehensive market analysis including demand patterns, seasonal trends, and regional price variations to stay ahead of market movements.
              </p>
            </div>
            <MarketInsightsCard />
          </div>
        );
      
      case 'recommendations':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-6 border border-yellow-200">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-yellow-200 rounded-lg mr-3">
                  <LightBulbIcon className="h-6 w-6 text-yellow-700" />
                </div>
                <h3 className="text-xl font-semibold text-yellow-900">Personalized Recommendations</h3>
              </div>
              <p className="text-yellow-800 mb-6">
                Receive AI-powered suggestions tailored to your profile, including optimal crop selections, buyer connections, and investment opportunities.
              </p>
            </div>
            <RecommendationCard userRole={user?.role as 'farmer' | 'buyer' | 'financier'} />
          </div>
        );
      
      case 'credit-score':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-purple-200 rounded-lg mr-3">
                  <CreditCardIcon className="h-6 w-6 text-purple-700" />
                </div>
                <h3 className="text-xl font-semibold text-purple-900">AI Credit Analysis</h3>
              </div>
              <p className="text-purple-800 mb-6">
                Advanced credit scoring system that evaluates financial health, farming history, and market performance to determine creditworthiness.
              </p>
            </div>
            <CreditScoreCard />
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center mb-6">
            <div className="p-4 bg-gradient-to-br from-emerald-100 via-blue-100 to-purple-100 rounded-2xl shadow-lg">
              <SparklesIcon className="h-12 w-12 text-emerald-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
            AI-Powered Agriculture Intelligence
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Harness the power of Google's Gemini AI to make smarter farming decisions, 
            predict market trends, and optimize your agricultural business.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200 bg-white rounded-t-2xl shadow-sm">
            <nav className="-mb-px flex space-x-8 px-6 py-4" aria-label="Tabs">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                const colors = getColorClasses(tab.color);
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`${
                      activeTab === tab.id ? colors.active : colors.inactive
                    } group inline-flex items-center py-3 px-4 border-b-2 font-medium text-sm rounded-t-lg transition-all duration-200 ease-in-out transform hover:scale-105`}
                  >
                    <IconComponent
                      className={`${
                        activeTab === tab.id ? colors.icon : 'text-gray-400 group-hover:text-current'
                      } -ml-0.5 mr-3 h-5 w-5 transition-colors duration-200`}
                    />
                    <div className="text-left">
                      <div className="font-semibold">{tab.name}</div>
                      <div className="text-xs opacity-75 hidden sm:block">{tab.description}</div>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-b-2xl shadow-lg min-h-[600px]">
          <div className="p-8">
            {renderTabContent()}
          </div>
        </div>

        {/* AI Technology Info */}
        <div className="mt-12 bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-gradient-to-br from-emerald-100 to-blue-100 rounded-xl">
                <SparklesIcon className="h-8 w-8 text-emerald-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Powered by Google Gemini AI
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our AI features leverage advanced machine learning to provide intelligent insights for your agricultural needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div className="text-center group hover:scale-105 transition-transform duration-200">
              <div className="p-4 bg-gradient-to-br from-emerald-100 to-blue-100 rounded-xl mb-4 mx-auto w-16 h-16 flex items-center justify-center group-hover:shadow-lg transition-shadow duration-200">
                <ChartBarIcon className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Analytics</h3>
              <p className="text-gray-600 text-sm">
                Advanced data processing and pattern recognition for accurate predictions and insights.
              </p>
            </div>

            <div className="text-center group hover:scale-105 transition-transform duration-200">
              <div className="p-4 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-xl mb-4 mx-auto w-16 h-16 flex items-center justify-center group-hover:shadow-lg transition-shadow duration-200">
                <LightBulbIcon className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Intelligent Recommendations</h3>
              <p className="text-gray-600 text-sm">
                Personalized suggestions based on your profile, market conditions, and historical performance.
              </p>
            </div>

            <div className="text-center group hover:scale-105 transition-transform duration-200">
              <div className="p-4 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl mb-4 mx-auto w-16 h-16 flex items-center justify-center group-hover:shadow-lg transition-shadow duration-200">
                <EyeIcon className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Market Intelligence</h3>
              <p className="text-gray-600 text-sm">
                Real-time market analysis with comprehensive trend forecasting and opportunity identification.
              </p>
            </div>
          </div>

          <div className="p-6 bg-gradient-to-r from-emerald-50 via-blue-50 to-purple-50 rounded-xl border border-emerald-200">
            <div className="flex items-center mb-3">
              <SparklesIcon className="h-5 w-5 text-emerald-600 mr-2" />
              <h4 className="font-semibold text-gray-900">Advanced AI Technology</h4>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed">
              All AI features are powered by Google's Gemini 2.5 Flash model, providing state-of-the-art natural language processing 
              and analytical capabilities specifically optimized for agricultural applications. Our AI considers multiple factors including 
              weather patterns, market dynamics, historical trends, regional variations, and seasonal cycles to deliver highly accurate insights 
              and actionable recommendations for your agricultural business.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIFeaturesPage;