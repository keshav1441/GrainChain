import React from 'react';
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

export const BuyerDashboard: React.FC = () => {
  const stats = [
    {
      name: 'Active Orders',
      value: '24',
      change: '+3 this week',
      changeType: 'positive',
      icon: ShoppingCartIcon,
    },
    {
      name: 'Total Procurement',
      value: '₹12.5L',
      change: '+25% from last month',
      changeType: 'positive',
      icon: ChartBarIcon,
    },
    {
      name: 'Pending Deliveries',
      value: '8',
      change: '2 arriving today',
      changeType: 'neutral',
      icon: TruckIcon,
    },
    {
      name: 'Active Farmers',
      value: '156',
      change: '+12 new this month',
      changeType: 'positive',
      icon: UserGroupIcon,
    },
  ];

  const availableListings = [
    {
      id: 1,
      farmer: 'Rajesh Kumar',
      crop: 'Wheat',
      variety: 'HD-2967',
      quantity: '50 tons',
      price: '₹25,000/ton',
      grade: 'A Grade',
      location: 'Punjab',
      harvestDate: '2024-04-15',
      distance: '45 km',
    },
    {
      id: 2,
      farmer: 'Priya Sharma',
      crop: 'Rice',
      variety: 'Basmati 1121',
      quantity: '30 tons',
      price: '₹45,000/ton',
      grade: 'Premium',
      location: 'Haryana',
      harvestDate: '2024-04-10',
      distance: '67 km',
    },
    {
      id: 3,
      farmer: 'Amit Patel',
      crop: 'Maize',
      variety: 'Pioneer 30V92',
      quantity: '40 tons',
      price: '₹22,000/ton',
      grade: 'A Grade',
      location: 'Gujarat',
      harvestDate: '2024-04-20',
      distance: '89 km',
    },
  ];

  const recentOrders = [
    {
      id: 1,
      farmer: 'Suresh Singh',
      crop: 'Wheat',
      quantity: '25 tons',
      totalAmount: '₹6,25,000',
      status: 'In Transit',
      orderDate: '2024-04-08',
      expectedDelivery: '2024-04-12',
    },
    {
      id: 2,
      farmer: 'Meera Devi',
      crop: 'Rice',
      quantity: '15 tons',
      totalAmount: '₹5,25,000',
      status: 'Delivered',
      orderDate: '2024-04-05',
      expectedDelivery: '2024-04-09',
    },
  ];

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
            <Button as={Link} to="/marketplace" variant="primary">
              <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
              Browse Marketplace
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
                  {availableListings.map((listing) => (
                    <div
                      key={listing.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="text-lg font-medium text-gray-900">
                              {listing.crop}
                            </h4>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {listing.grade}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">
                            Variety: {listing.variety}
                          </p>
                          <p className="text-sm text-gray-600 mb-1">
                            Farmer: {listing.farmer} • {listing.location}
                          </p>
                          <p className="text-sm text-gray-600 mb-2">
                            Harvested: {listing.harvestDate} • {listing.distance} away
                          </p>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-lg font-semibold text-gray-900">
                                {listing.price}
                              </p>
                              <p className="text-sm text-gray-500">
                                {listing.quantity} available
                              </p>
                            </div>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm">
                                View Details
                              </Button>
                              <Button variant="primary" size="sm">
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
                    Recent Orders
                  </h3>
                  <Link
                    to="/buyer/orders"
                    className="text-sm text-primary-600 hover:text-primary-500"
                  >
                    View all
                  </Link>
                </div>
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-900">
                          {order.crop}
                        </h4>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            order.status === 'Delivered'
                              ? 'bg-green-100 text-green-800'
                              : order.status === 'In Transit'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        From: {order.farmer}
                      </p>
                      <p className="text-sm text-gray-600 mb-1">
                        Quantity: {order.quantity}
                      </p>
                      <p className="text-sm font-medium text-gray-900 mb-2">
                        {order.totalAmount}
                      </p>
                      <div className="flex items-center text-xs text-gray-500">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        Expected: {order.expectedDelivery}
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
              <Button as={Link} to="/marketplace" variant="outline" className="justify-start">
                <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
                Search Crops
              </Button>
              <Button as={Link} to="/buyer/farmers" variant="outline" className="justify-start">
                <UserGroupIcon className="h-5 w-5 mr-2" />
                Find Farmers
              </Button>
              <Button as={Link} to="/buyer/analytics" variant="outline" className="justify-start">
                <ChartBarIcon className="h-5 w-5 mr-2" />
                View Analytics
              </Button>
              <Button as={Link} to="/buyer/orders" variant="outline" className="justify-start">
                <TruckIcon className="h-5 w-5 mr-2" />
                Track Orders
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
