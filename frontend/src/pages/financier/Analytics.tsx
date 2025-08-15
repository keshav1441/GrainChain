import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ArrowLeftIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import { financierApi } from '../../services/api';
import { toast } from 'react-hot-toast';

// interface AnalyticsData {
//   totalLoansValue: number;
//   totalApplications: number;
//   approvalRate: number;
//   defaultRate: number;
//   monthlyTrends: {
//     month: string;
//     applications: number;
//     disbursements: number;
//     value: number;
//   }[];
//   loanTypeDistribution: {
//     type: string;
//     count: number;
//     value: number;
//   }[];
//   riskAnalysis: {
//     lowRisk: number;
//     mediumRisk: number;
//     highRisk: number;
//   };
// }

export const Analytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('3months');
  // const [aiInsights, setAiInsights] = useState(null);
  // const [insightsLoading, setInsightsLoading] = useState(false);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        const response = await financierApi.getAnalyticsData();
        setAnalytics(response.data);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
        toast.error('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  const formatCurrency = (amount: number) => {
    const validAmount = isNaN(amount) || amount === null || amount === undefined ? 0 : amount;
    if (validAmount >= 10000000) {
      return `₹${(validAmount / 10000000).toFixed(1)} Cr`;
    } else if (validAmount >= 100000) {
      return `₹${(validAmount / 100000).toFixed(1)} L`;
    } else {
      return `₹${validAmount.toLocaleString()}`;
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/financier/dashboard"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <ChartBarIcon className="h-8 w-8 mr-3 text-primary-600" />
                Analytics Dashboard
              </h1>
              <p className="mt-2 text-gray-600">
                Comprehensive insights into your lending portfolio
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="3months">Last 3 Months</option>
                  <option value="6months">Last 6 Months</option>
                  <option value="1year">Last Year</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Portfolio Value</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {analytics && formatCurrency(analytics.totalLoansValue)}
                </p>
                <div className="flex items-center mt-1">
                  <ArrowTrendingUpIcon className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-sm text-green-600">+12.5% from last month</span>
                </div>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <CurrencyDollarIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Applications</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {analytics?.totalApplications}
                </p>
                <div className="flex items-center mt-1">
                  <ArrowTrendingUpIcon className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-sm text-green-600">+8.2% from last month</span>
                </div>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <DocumentTextIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Approval Rate</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {analytics?.approvalRate}%
                </p>
                <div className="flex items-center mt-1">
                  <ArrowTrendingUpIcon className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-sm text-green-600">+2.1% from last month</span>
                </div>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <UserGroupIcon className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Default Rate</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {analytics?.defaultRate}%
                </p>
                <div className="flex items-center mt-1">
                  <ArrowTrendingDownIcon className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-sm text-green-600">-0.3% from last month</span>
                </div>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <ChartBarIcon className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Monthly Trends */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Trends</h3>
            <div className="space-y-4">
              {analytics?.monthlyTrends.map((trend: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{trend.month}</span>
                      <span className="text-sm text-gray-500">{formatCurrency(trend.value)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full"
                        style={{ width: `${(trend.value / 6000000) * 100}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Applications: {trend.applications}</span>
                      <span>Disbursements: {trend.disbursements}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Loan Type Distribution */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Loan Type Distribution</h3>
            <div className="space-y-4">
              {analytics?.loanTypeDistribution.map((type: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{type.type}</span>
                      <span className="text-sm text-gray-500">{formatCurrency(type.value)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          index === 0 ? 'bg-blue-600' : 
                          index === 1 ? 'bg-green-600' : 'bg-yellow-600'
                        }`}
                        style={{ width: `${(type.value / 12500000) * 100}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {type.count} loans
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Risk Analysis */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 relative">
                <div className="w-full h-full bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-green-600">{analytics?.riskAnalysis.lowRisk}%</span>
                </div>
              </div>
              <h4 className="font-medium text-gray-900">Low Risk</h4>
              <p className="text-sm text-gray-500">Credit Score 750+</p>
            </div>
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 relative">
                <div className="w-full h-full bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-yellow-600">{analytics?.riskAnalysis.mediumRisk}%</span>
                </div>
              </div>
              <h4 className="font-medium text-gray-900">Medium Risk</h4>
              <p className="text-sm text-gray-500">Credit Score 650-749</p>
            </div>
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 relative">
                <div className="w-full h-full bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-red-600">{analytics?.riskAnalysis.highRisk}%</span>
                </div>
              </div>
              <h4 className="font-medium text-gray-900">High Risk</h4>
              <p className="text-sm text-gray-500">Credit Score Below 650</p>
            </div>
          </div>
        </div>

        {/* Recent Performance */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-gray-700">Key Achievements</h4>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  Approval rate increased by 2.1% this month
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  Default rate decreased to lowest in 6 months
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  Portfolio value grew by ₹2.8 Cr this quarter
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-medium text-gray-700">Areas for Improvement</h4>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                  Application processing time: 5.2 days (target: 3 days)
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                  Customer satisfaction: 4.2/5 (target: 4.5/5)
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                  High-risk applications increased by 1.2%
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
