import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CurrencyDollarIcon,
  ShoppingBagIcon,
  EyeIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import { Button } from '../../components/ui/Button';

interface AnalyticsData {
  totalRevenue: number;
  totalListings: number;
  averagePrice: number;
  viewsThisMonth: number;
  salesThisMonth: number;
  topCrop: string;
  revenueGrowth: number;
  listingPerformance: Array<{
    crop: string;
    revenue: number;
    quantity: number;
    averagePrice: number;
    views: number;
  }>;
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
    listings: number;
  }>;
  cropDistribution: Array<{
    crop: string;
    percentage: number;
    revenue: number;
  }>;
}

export const FarmerAnalytics: React.FC = () => {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState('6months');

  // Mock analytics data
  const analyticsData: AnalyticsData = {
    totalRevenue: 485000,
    totalListings: 24,
    averagePrice: 28500,
    viewsThisMonth: 1250,
    salesThisMonth: 8,
    topCrop: 'Wheat',
    revenueGrowth: 15.2,
    listingPerformance: [
      { crop: 'Wheat', revenue: 180000, quantity: 45, averagePrice: 25000, views: 450 },
      { crop: 'Rice', revenue: 150000, quantity: 35, averagePrice: 32000, views: 380 },
      { crop: 'Corn', revenue: 95000, quantity: 28, averagePrice: 22000, views: 290 },
      { crop: 'Barley', revenue: 60000, quantity: 20, averagePrice: 18000, views: 130 },
    ],
    monthlyRevenue: [
      { month: 'Jan', revenue: 65000, listings: 4 },
      { month: 'Feb', revenue: 72000, listings: 3 },
      { month: 'Mar', revenue: 85000, listings: 5 },
      { month: 'Apr', revenue: 78000, listings: 4 },
      { month: 'May', revenue: 92000, listings: 4 },
      { month: 'Jun', revenue: 93000, listings: 4 },
    ],
    cropDistribution: [
      { crop: 'Wheat', percentage: 37, revenue: 180000 },
      { crop: 'Rice', percentage: 31, revenue: 150000 },
      { crop: 'Corn', percentage: 20, revenue: 95000 },
      { crop: 'Barley', percentage: 12, revenue: 60000 },
    ],
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const StatCard = ({ title, value, change, icon: Icon, trend }: {
    title: string;
    value: string;
    change?: string;
    icon: React.ElementType;
    trend?: 'up' | 'down';
  }) => (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Icon className="h-6 w-6 text-gray-400" />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900">{value}</div>
                {change && (
                  <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                    trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-500'
                  }`}>
                    {trend === 'up' && <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />}
                    {trend === 'down' && <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />}
                    {change}
                  </div>
                )}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/farmer/dashboard')}
            className="flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Dashboard
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="mt-2 text-gray-600">
                Track your farm's performance and sales metrics
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="1month">Last Month</option>
                <option value="3months">Last 3 Months</option>
                <option value="6months">Last 6 Months</option>
                <option value="1year">Last Year</option>
              </select>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard
            title="Total Revenue"
            value={formatCurrency(analyticsData.totalRevenue)}
            change={`+${analyticsData.revenueGrowth}%`}
            icon={CurrencyDollarIcon}
            trend="up"
          />
          <StatCard
            title="Total Listings"
            value={analyticsData.totalListings.toString()}
            change="+3 this month"
            icon={ShoppingBagIcon}
            trend="up"
          />
          <StatCard
            title="Average Price"
            value={formatCurrency(analyticsData.averagePrice)}
            change="+8%"
            icon={ChartBarIcon}
            trend="up"
          />
          <StatCard
            title="Profile Views"
            value={analyticsData.viewsThisMonth.toString()}
            change="+12%"
            icon={EyeIcon}
            trend="up"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue Trend */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Revenue Trend</h3>
              <CalendarIcon className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {analyticsData.monthlyRevenue.map((month) => (
                <div key={month.month} className="flex items-center">
                  <div className="w-12 text-sm text-gray-500">{month.month}</div>
                  <div className="flex-1 ml-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(month.revenue)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {month.listings} listings
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full"
                        style={{
                          width: `${(month.revenue / Math.max(...analyticsData.monthlyRevenue.map(m => m.revenue))) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Crop Distribution */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Crop Revenue Distribution</h3>
            <div className="space-y-4">
              {analyticsData.cropDistribution.map((crop) => (
                <div key={crop.crop} className="flex items-center">
                  <div className="w-16 text-sm text-gray-900 font-medium">{crop.crop}</div>
                  <div className="flex-1 ml-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600">{crop.percentage}%</span>
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(crop.revenue)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${crop.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Listing Performance */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Listing Performance</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Crop
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity Sold
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Views
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analyticsData.listingPerformance.map((listing) => {
                  const performance = (listing.revenue / analyticsData.totalRevenue) * 100;
                  return (
                    <tr key={listing.crop}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{listing.crop}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatCurrency(listing.revenue)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{listing.quantity} tons</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatCurrency(listing.averagePrice)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{listing.views}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div
                              className="bg-primary-600 h-2 rounded-full"
                              style={{ width: `${performance}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600">{performance.toFixed(1)}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-center space-x-4">
          <Button
            variant="outline"
            onClick={() => navigate('/farmer/listings/new')}
          >
            Create New Listing
          </Button>
          <Button
            variant="primary"
            onClick={() => navigate('/payments')}
          >
            View Payment History
          </Button>
        </div>
      </div>
    </div>
  );
};
