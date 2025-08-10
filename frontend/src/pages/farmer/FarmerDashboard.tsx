import React from 'react';
import { Link } from 'react-router-dom';
import {
  PlusIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  TruckIcon,
  BellIcon,
} from '@heroicons/react/24/outline';
import { Button } from '../../components/ui/Button';

export const FarmerDashboard: React.FC = () => {
  const stats = [
    {
      name: 'Active Listings',
      value: '12',
      change: '+2 this week',
      changeType: 'positive',
      icon: ChartBarIcon,
    },
    {
      name: 'Total Revenue',
      value: '₹2,45,000',
      change: '+15% from last month',
      changeType: 'positive',
      icon: CurrencyDollarIcon,
    },
    {
      name: 'Pending Orders',
      value: '5',
      change: '2 ready for delivery',
      changeType: 'neutral',
      icon: TruckIcon,
    },
    {
      name: 'New Inquiries',
      value: '8',
      change: '3 today',
      changeType: 'positive',
      icon: BellIcon,
    },
  ];

  const recentListings = [
    {
      id: 1,
      crop: 'Wheat',
      quantity: '50 tons',
      price: '₹25,000/ton',
      status: 'Active',
      inquiries: 5,
    },
    {
      id: 2,
      crop: 'Rice',
      quantity: '30 tons',
      price: '₹35,000/ton',
      status: 'Sold',
      inquiries: 12,
    },
    {
      id: 3,
      crop: 'Maize',
      quantity: '40 tons',
      price: '₹22,000/ton',
      status: 'Active',
      inquiries: 3,
    },
  ];

  const recentInquiries = [
    {
      id: 1,
      buyer: 'AgriCorp Ltd.',
      crop: 'Wheat',
      quantity: '20 tons',
      offeredPrice: '₹24,500/ton',
      status: 'Pending',
      time: '2 hours ago',
    },
    {
      id: 2,
      buyer: 'FoodTech Industries',
      crop: 'Rice',
      quantity: '15 tons',
      offeredPrice: '₹34,000/ton',
      status: 'Accepted',
      time: '1 day ago',
    },
  ];

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
            <Button as={Link} to="/farmer/listings/new" variant="primary">
              <PlusIcon className="h-5 w-5 mr-2" />
              New Listing
            </Button>
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
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Recent Listings */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Recent Listings
                </h3>
                <Link
                  to="/farmer/listings"
                  className="text-sm text-primary-600 hover:text-primary-500"
                >
                  View all
                </Link>
              </div>
              <div className="flow-root">
                <ul className="-my-5 divide-y divide-gray-200">
                  {recentListings.map((listing) => (
                    <li key={listing.id} className="py-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center">
                            <span className="text-primary-600 font-semibold text-sm">
                              {listing.crop[0]}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {listing.crop}
                          </p>
                          <p className="text-sm text-gray-500">
                            {listing.quantity} • {listing.price}
                          </p>
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              listing.status === 'Active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {listing.status}
                          </span>
                          <p className="text-sm text-gray-500 mt-1">
                            {listing.inquiries} inquiries
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
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
                <ul className="-my-5 divide-y divide-gray-200">
                  {recentInquiries.map((inquiry) => (
                    <li key={inquiry.id} className="py-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <span className="text-blue-600 font-semibold text-sm">
                              {inquiry.buyer[0]}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {inquiry.buyer}
                          </p>
                          <p className="text-sm text-gray-500">
                            {inquiry.crop} • {inquiry.quantity} • {inquiry.offeredPrice}
                          </p>
                          <p className="text-xs text-gray-400">{inquiry.time}</p>
                        </div>
                        <div className="flex-shrink-0">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              inquiry.status === 'Pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : inquiry.status === 'Accepted'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {inquiry.status}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
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
              <Button as={Link} to="/farmer/listings/new" variant="outline" className="justify-start">
                <PlusIcon className="h-5 w-5 mr-2" />
                Create Listing
              </Button>
              <Button as={Link} to="/farmer/analytics" variant="outline" className="justify-start">
                <ChartBarIcon className="h-5 w-5 mr-2" />
                View Analytics
              </Button>
              <Button as={Link} to="/farmer/finance" variant="outline" className="justify-start">
                <CurrencyDollarIcon className="h-5 w-5 mr-2" />
                Apply for Loan
              </Button>
              <Button as={Link} to="/farmer/profile" variant="outline" className="justify-start">
                <BellIcon className="h-5 w-5 mr-2" />
                Update Profile
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
