import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  UserGroupIcon,
  MagnifyingGlassIcon,
  ArrowLeftIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import { financierApi } from '../../services/api';
import { toast } from 'react-hot-toast';
import { Button } from '../../components/ui/Button';

interface Farmer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  creditScore: number;
  totalApplications: number;
  approvedLoans: number;
  totalLoanAmount: number;
  lastApplicationDate?: string;
  status: 'active' | 'inactive';
}


export const Farmers: React.FC = () => {
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

  useEffect(() => {
    const fetchFarmersData = async () => {
      try {
        setLoading(true);
        const params: any = {};
        if (searchTerm) params.search = searchTerm;
        if (locationFilter) params.location = locationFilter;
        
        const response = await financierApi.getFarmersData(params);
        setFarmers(response.data.farmers || []);
      } catch (error) {
        console.error('Error fetching farmers data:', error);
        toast.error('Failed to load farmers data');
        setFarmers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFarmersData();
  }, [searchTerm, locationFilter]);

  const filteredFarmers = farmers.filter(farmer => {
    const matchesSearch = farmer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         farmer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = !locationFilter || farmer.location?.toLowerCase().includes(locationFilter.toLowerCase());
    return matchesSearch && matchesLocation;
  });

  const formatCurrency = (amount: number) => {
    const validAmount = isNaN(amount) || amount === null || amount === undefined ? 0 : amount;
    if (validAmount >= 100000) {
      return `₹${(validAmount / 100000).toFixed(1)} L`;
    } else {
      return `₹${validAmount.toLocaleString()}`;
    }
  };

  const getCreditScoreColor = (score?: number) => {
    if (!score) return 'text-gray-600 bg-gray-100';
    if (score >= 750) return 'text-green-600 bg-green-100';
    if (score >= 650) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

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
                <UserGroupIcon className="h-8 w-8 mr-3 text-primary-600" />
                Farmers Directory
              </h1>
              <p className="mt-2 text-gray-600">
                View and manage relationships with farmers in your network
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 bg-white shadow rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search farmers by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="relative">
              <MapPinIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Filter by location..."
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserGroupIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Farmers</p>
                <p className="text-2xl font-semibold text-gray-900">{farmers.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-semibold">A</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Borrowers</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {farmers.filter(f => f.approvedLoans && f.approvedLoans > 0).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-yellow-600 font-semibold">★</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Avg Credit Score</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {Math.round(farmers.reduce((sum, f) => sum + (f.creditScore || 0), 0) / farmers.length)}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-semibold">₹</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Disbursed</p>
                <p className="text-2xl font-semibold text-gray-900">
                  ₹{(farmers.reduce((sum, f) => sum + (f.totalLoanAmount || 0), 0) / 100000).toFixed(1)}L
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Farmers List */}
        <div className="bg-white shadow rounded-lg">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <span className="ml-3 text-gray-600">Loading farmers...</span>
            </div>
          ) : filteredFarmers.length === 0 ? (
            <div className="text-center py-12">
              <UserGroupIcon className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Farmers Found</h3>
              <p className="text-gray-600">
                {searchTerm || locationFilter ? 'No farmers match your search criteria' : 'No farmers available'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
              {filteredFarmers.map((farmer) => (
                <div key={farmer.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{farmer.name}</h3>
                      <div className="flex items-center mt-1">
                        <MapPinIcon className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-600">{farmer.location}</span>
                      </div>
                    </div>
                    {farmer.creditScore && (
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCreditScoreColor(farmer.creditScore)}`}
                      >
                        Credit: {farmer.creditScore}
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <EnvelopeIcon className="h-4 w-4 mr-2" />
                      {farmer.email}
                    </div>
                    {farmer.phone && (
                      <div className="flex items-center text-sm text-gray-600">
                        <PhoneIcon className="h-4 w-4 mr-2" />
                        {farmer.phone}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <span className="text-gray-500">Farm Size:</span>
                      <span className="ml-1 font-medium">N/A</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Active Loans:</span>
                      <span className="ml-1 font-medium">{farmer.approvedLoans || 0}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Total Borrowed:</span>
                      <span className="ml-1 font-medium">{formatCurrency(farmer.totalLoanAmount || 0)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Member Since:</span>
                      <span className="ml-1 font-medium">{farmer.lastApplicationDate ? formatDate(farmer.lastApplicationDate) : 'N/A'}</span>
                    </div>
                  </div>


                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      View Profile
                    </Button>
                    <Button variant="primary" size="sm" className="flex-1">
                      Contact
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
