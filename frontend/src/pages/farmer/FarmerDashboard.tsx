import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  TruckIcon,
  BellIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { Button } from '../../components/ui/Button';
import { cropApi, farmerApi } from '../../services/api';

interface CropListing {
  id: string;
  crop_type: string;
  quantity: number;
  price_per_kg: number;
  status: string;
  // Add other relevant fields if needed
}

interface Inquiry {
  id: string;
  buyer_name: string;
  crop_name: string;
  quantity_requested: number;
  proposed_price: number;
  status: 'pending' | 'accepted' | 'rejected' | 'counter_offer';
  created_at: string;
  message?: string;
  listing_id: string;
}

export const FarmerDashboard: React.FC = () => {
  const [listings, setListings] = useState<CropListing[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [inquiriesLoading, setInquiriesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Stats data
  const stats = [
    { name: 'Active Listings', value: listings.filter(l => l.status === 'available').length, icon: ChartBarIcon },
    { name: 'Total Revenue', value: '₹0', icon: CurrencyDollarIcon },
    { name: 'Pending Orders', value: '0', icon: TruckIcon },
    { name: 'New Inquiries', value: inquiries.filter(i => i.status === 'pending').length, icon: BellIcon },
  ];

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        const response = await cropApi.getMyListings();
        setListings(response.data);
      } catch (err) {
        setError('Failed to fetch your listings.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const fetchInquiries = async () => {
      try {
        setInquiriesLoading(true);
        const response = await farmerApi.getInquiries({ limit: 5 });
        setInquiries(response.data);
      } catch (err) {
        console.error('Failed to fetch inquiries:', err);
      } finally {
        setInquiriesLoading(false);
      }
    };

    fetchListings();
    fetchInquiries();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Farmer Dashboard
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Welcome back! Here's what's happening with your crops today.
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <Link to="/farmer/listings/new">
              <Button variant="primary">
                <PlusIcon className="h-5 w-5 mr-2" />
                New Listing
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-8">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((item) => (
              <div
                key={item.name}
                className="relative bg-white pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden"
              >
                <dt>
                  <div className="absolute bg-primary-500 rounded-md p-3">
                    <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  <p className="ml-16 text-sm font-medium text-gray-500 truncate">
                    {item.name}
                  </p>
                </dt>
                <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
                  <p className="text-2xl font-semibold text-gray-900">{item.value}</p>
                </dd>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Recent Listings */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Your Listings
                </h3>
                <Link
                  to="/farmer/listings"
                  className="text-sm text-primary-600 hover:text-primary-500"
                >
                  View all
                </Link>
              </div>
              <div className="flow-root">
                {loading ? (
                  <p>Loading your listings...</p>
                ) : error ? (
                  <p className="text-red-500">{error}</p>
                ) : (
                  <ul className="-my-5 divide-y divide-gray-200">
                    {listings.length > 0 ? listings.map((listing) => (
                      <li key={listing.id} className="py-4">
                        <div className="flex items-center space-x-4">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {listing.crop_type}
                            </p>
                            <p className="text-sm text-gray-500">
                              {listing.quantity} kg • ₹{listing.price_per_kg}/kg
                            </p>
                          </div>
                          <div className="flex-shrink-0">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                listing.status === 'available'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {listing.status}
                            </span>
                          </div>
                        </div>
                      </li>
                    )) : <p>You have no active listings.</p>}
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* Recent Inquiries */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Recent Inquiries
                </h3>
                <Link
                  to="/farmer/inquiries"
                  className="text-sm text-primary-600 hover:text-primary-500"
                >
                  View all
                </Link>
              </div>
              <div className="flow-root">
                {inquiriesLoading ? (
                  <p>Loading inquiries...</p>
                ) : inquiries.length > 0 ? (
                  <ul className="divide-y divide-gray-200">
                    {inquiries.map((inquiry) => (
                      <li key={inquiry.id} className="py-4">
                        <div className="flex items-center space-x-4">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {inquiry.buyer_name} - {inquiry.crop_name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {inquiry.quantity_requested} kg • ₹{inquiry.proposed_price}/kg
                            </p>
                            {inquiry.message && (
                              <p className="text-sm text-gray-500 mt-1">
                                "{inquiry.message}"
                              </p>
                            )}
                          </div>
                          <div className="flex-shrink-0">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                inquiry.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : inquiry.status === 'accepted'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {inquiry.status.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-8">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                      />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No inquiries</h3>
                    <p className="mt-1 text-sm text-gray-500">You don't have any inquiries yet. Check back later!</p>
                  </div>
                )}
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
              <Link to="/farmer/listings/new">
                <Button variant="outline" className="justify-start w-full">
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Create Listing
                </Button>
              </Link>
              <Link to="/farmer/analytics">
                <Button variant="outline" className="justify-start w-full">
                  <ChartBarIcon className="h-5 w-5 mr-2" />
                  View Analytics
                </Button>
              </Link>
              <Link to="/farmer/finance">
                <Button variant="outline" className="justify-start w-full">
                  <CurrencyDollarIcon className="h-5 w-5 mr-2" />
                  Apply for Loan
                </Button>
              </Link>
              <Link to="/ai-features">
                <Button variant="outline" className="justify-start w-full">
                  <SparklesIcon className="h-5 w-5 mr-2" />
                  AI Features
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
