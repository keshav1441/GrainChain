import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ChartBarIcon,
  CurrencyRupeeIcon,
  ShoppingCartIcon,
  TruckIcon,
} from '@heroicons/react/24/outline';
import { Button } from '../../components/ui/Button';
import { buyerApi } from '../../services/api';

interface AnalyticsData {
  totalSpent: number;
  totalOrders: number;
  averageOrderValue: number;
  topCrops: Array<{
    crop: string;
    quantity: number;
    value: number;
  }>;
  monthlySpending: Array<{
    month: string;
    amount: number;
  }>;
}

export const BuyerAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await buyerApi.getAnalytics();
        setAnalytics(response.data);
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(1)}Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}K`;
    }
    return `₹${amount}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No analytics data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Analytics Dashboard
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Track your procurement performance and spending patterns.
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <Link to="/buyer/dashboard">
              <Button variant="outline">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="mt-8">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="relative bg-white pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden">
              <dt>
                <div className="absolute bg-blue-500 rounded-md p-3">
                  <CurrencyRupeeIcon className="h-6 w-6 text-white" />
                </div>
                <p className="ml-16 text-sm font-medium text-gray-500 truncate">
                  Total Spent
                </p>
              </dt>
              <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
                <p className="text-2xl font-semibold text-gray-900">
                  {formatCurrency(analytics.totalSpent)}
                </p>
              </dd>
            </div>

            <div className="relative bg-white pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden">
              <dt>
                <div className="absolute bg-green-500 rounded-md p-3">
                  <ShoppingCartIcon className="h-6 w-6 text-white" />
                </div>
                <p className="ml-16 text-sm font-medium text-gray-500 truncate">
                  Total Orders
                </p>
              </dt>
              <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
                <p className="text-2xl font-semibold text-gray-900">
                  {analytics.totalOrders}
                </p>
              </dd>
            </div>

            <div className="relative bg-white pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden">
              <dt>
                <div className="absolute bg-purple-500 rounded-md p-3">
                  <ChartBarIcon className="h-6 w-6 text-white" />
                </div>
                <p className="ml-16 text-sm font-medium text-gray-500 truncate">
                  Avg Order Value
                </p>
              </dt>
              <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
                <p className="text-2xl font-semibold text-gray-900">
                  {formatCurrency(analytics.averageOrderValue)}
                </p>
              </dd>
            </div>

            <div className="relative bg-white pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden">
              <dt>
                <div className="absolute bg-orange-500 rounded-md p-3">
                  <TruckIcon className="h-6 w-6 text-white" />
                </div>
                <p className="ml-16 text-sm font-medium text-gray-500 truncate">
                  Top Crop
                </p>
              </dt>
              <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
                <p className="text-2xl font-semibold text-gray-900">
                  {analytics.topCrops[0]?.crop || 'N/A'}
                </p>
              </dd>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Top Crops */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Top Crops by Value
              </h3>
              <div className="space-y-4">
                {analytics.topCrops.map((crop) => (
                  <div key={crop.crop} className="flex items-center">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900">
                          {crop.crop}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatCurrency(crop.value)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${(crop.value / analytics.topCrops[0].value) * 100}%`,
                          }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {crop.quantity} units
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Monthly Spending */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Monthly Spending Trend
              </h3>
              <div className="space-y-4">
                {analytics.monthlySpending.map((month) => (
                  <div key={month.month} className="flex items-center">
                    <div className="w-12 text-sm font-medium text-gray-900">
                      {month.month}
                    </div>
                    <div className="flex-1 ml-4">
                      <div className="flex items-center justify-between mb-1">
                        <div className="w-full bg-gray-200 rounded-full h-3 mr-2">
                          <div
                            className="bg-green-600 h-3 rounded-full"
                            style={{
                              width: `${(month.amount / Math.max(...analytics.monthlySpending.map(m => m.amount))) * 100}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-500 whitespace-nowrap">
                          {formatCurrency(month.amount)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Link to="/buyer/inquiries">
                <Button variant="outline" className="w-full justify-start">
                  <ShoppingCartIcon className="h-5 w-5 mr-2" />
                  View All Orders
                </Button>
              </Link>
              <Link to="/marketplace">
                <Button variant="outline" className="w-full justify-start">
                  <ChartBarIcon className="h-5 w-5 mr-2" />
                  Browse Marketplace
                </Button>
              </Link>
              <Link to="/buyer/farmers">
                <Button variant="outline" className="w-full justify-start">
                  <TruckIcon className="h-5 w-5 mr-2" />
                  Find Farmers
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
