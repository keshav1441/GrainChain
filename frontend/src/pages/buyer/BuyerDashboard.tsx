import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  ShoppingCartIcon,
  TruckIcon,
  ChartBarIcon,
  UserGroupIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { Button } from '../../components/ui/Button';
import { buyerApi } from '../../services/api';

interface DashboardStats {
  active_orders: number;
  total_procurement: number;
  pending_deliveries: number;
  active_farmers: number;
}

interface Listing {
  _id: string;
  crop_name: string;
  variety: string;
  quantity_available: number;
  price_per_unit: number;
  grade?: string;
  location?: string;
  harvest_date?: string;
  farmer?: {
    full_name: string;
    state?: string;
  };
}

interface Inquiry {
  _id: string;
  listing_id: string;
  quantity_requested: number;
  proposed_price: number;
  status: string;
  created_at: string;
  preferred_delivery_date?: string;
  listing?: {
    crop_name: string;
    farmer?: {
      full_name: string;
    };
  };
}

export const BuyerDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [recentInquiries, setRecentInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsResponse, listingsResponse, inquiriesResponse] = await Promise.all([
          buyerApi.getDashboardStats(),
          buyerApi.getListings({ limit: 3, sort_by: 'created_at', sort_order: 'desc' }),
          buyerApi.getInquiries({ limit: 3 })
        ]);
        
        setStats(statsResponse.data);
        setListings(listingsResponse.data);
        setRecentInquiries(inquiriesResponse.data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
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

  const getStatsArray = () => {
    if (!stats) return [];
    
    return [
      {
        name: 'Active Orders',
        value: stats.active_orders.toString(),
        change: 'Current active orders',
        changeType: 'neutral',
        icon: ShoppingCartIcon,
      },
      {
        name: 'Total Procurement',
        value: formatCurrency(stats.total_procurement),
        change: 'Total value procured',
        changeType: 'positive',
        icon: ChartBarIcon,
      },
      {
        name: 'Pending Deliveries',
        value: stats.pending_deliveries.toString(),
        change: 'Awaiting delivery',
        changeType: 'neutral',
        icon: TruckIcon,
      },
      {
        name: 'Active Farmers',
        value: stats.active_farmers.toString(),
        change: 'Farmers with listings',
        changeType: 'positive',
        icon: UserGroupIcon,
      },
    ];
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'negotiating':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Buyer Dashboard
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Discover quality crops from verified farmers across India.
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <Link to="/marketplace">
              <Button variant="primary">
                <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
                Browse Marketplace
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-8">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {getStatsArray().map((item) => (
              <div
                key={item.name}
                className="relative bg-white pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden"
              >
                <dt>
                  <div className="absolute bg-blue-500 rounded-md p-3">
                    <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  <p className="ml-16 text-sm font-medium text-gray-500 truncate">
                    {item.name}
                  </p>
                </dt>
                <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
                  <p className="text-2xl font-semibold text-gray-900">{item.value}</p>
                  <p
                    className={`ml-2 flex items-baseline text-sm font-semibold ${
                      item.changeType === 'positive'
                        ? 'text-green-600'
                        : item.changeType === 'negative'
                        ? 'text-red-600'
                        : 'text-gray-500'
                    }`}
                  >
                    {item.change}
                  </p>
                </dd>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="mt-8 grid grid-cols-1 gap-8 xl:grid-cols-3">
          {/* Available Listings */}
          <div className="xl:col-span-2">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Available Listings Near You
                  </h3>
                  <Link
                    to="/marketplace"
                    className="text-sm text-primary-600 hover:text-primary-500"
                  >
                    View all
                  </Link>
                </div>
                <div className="space-y-4">
                  {listings.map((listing) => (
                    <div
                      key={listing._id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="text-lg font-medium text-gray-900">
                              {listing.crop_name}
                            </h4>
                            {listing.grade && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {listing.grade}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-1">
                            Variety: {listing.variety}
                          </p>
                          <p className="text-sm text-gray-600 mb-1">
                            Farmer: {listing.farmer?.full_name || 'Unknown'} • {listing.farmer?.state || listing.location || 'Location not specified'}
                          </p>
                          <p className="text-sm text-gray-600 mb-2">
                            {listing.harvest_date && `Harvested: ${new Date(listing.harvest_date).toLocaleDateString()}`}
                          </p>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-lg font-semibold text-gray-900">
                                ₹{listing.price_per_unit.toLocaleString()}/unit
                              </p>
                              <p className="text-sm text-gray-500">
                                {listing.quantity_available} units available
                              </p>
                            </div>
                            <div className="flex space-x-2">
                              <Link to={`/buyer/listings/${listing._id}`}>
                                <Button variant="outline" size="sm">
                                  View Details
                                </Button>
                              </Link>
                              <Button 
                                variant="primary" 
                                size="sm"
                                onClick={() => {
                                  // Navigate to inquiry form
                                  window.location.href = `/buyer/listings/${listing._id}?action=inquiry`;
                                }}
                              >
                                Send Inquiry
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="xl:col-span-1">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Recent Inquiries
                  </h3>
                  <Link
                    to="/buyer/inquiries"
                    className="text-sm text-primary-600 hover:text-primary-500"
                  >
                    View all
                  </Link>
                </div>
                <div className="space-y-4">
                  {recentInquiries.map((inquiry) => (
                    <div
                      key={inquiry._id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-900">
                          {inquiry.listing?.crop_name || 'Unknown Crop'}
                        </h4>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(inquiry.status)}`}
                        >
                          {inquiry.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        From: {inquiry.listing?.farmer?.full_name || 'Unknown Farmer'}
                      </p>
                      <p className="text-sm text-gray-600 mb-1">
                        Quantity: {inquiry.quantity_requested} units
                      </p>
                      <p className="text-sm font-medium text-gray-900 mb-2">
                        ₹{(inquiry.proposed_price * inquiry.quantity_requested).toLocaleString()}
                      </p>
                      <div className="flex items-center text-xs text-gray-500">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        Created: {new Date(inquiry.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Link to="/marketplace">
                <Button variant="outline" className="justify-start w-full">
                  <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
                  Search Crops
                </Button>
              </Link>
              <Link to="/buyer/farmers">
                <Button variant="outline" className="justify-start w-full">
                  <UserGroupIcon className="h-5 w-5 mr-2" />
                  Find Farmers
                </Button>
              </Link>
              <Link to="/buyer/analytics">
                <Button variant="outline" className="justify-start w-full">
                  <ChartBarIcon className="h-5 w-5 mr-2" />
                  View Analytics
                </Button>
              </Link>
              <Link to="/buyer/inquiries">
                <Button variant="outline" className="justify-start w-full">
                  <TruckIcon className="h-5 w-5 mr-2" />
                  Track Inquiries
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
