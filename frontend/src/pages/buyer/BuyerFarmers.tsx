import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  MapPinIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { Button } from '../../components/ui/Button';
import { buyerApi } from '../../services/api';

interface Farmer {
  user: {
    _id: string;
    full_name: string;
    email: string;
    phone_number?: string;
  };
  farmer_profile?: {
    farm_size?: number;
    farming_experience?: number;
    state?: string;
    city?: string;
    specialization?: string[];
  };
}

export const BuyerFarmers: React.FC = () => {
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchFarmers = async () => {
      try {
        setLoading(true);
        const response = await buyerApi.getFarmers({ limit: 50 });
        setFarmers(response.data);
      } catch (err) {
        console.error('Error fetching farmers:', err);
        setError('Failed to load farmers');
      } finally {
        setLoading(false);
      }
    };

    fetchFarmers();
  }, []);

  const filteredFarmers = farmers.filter(farmer =>
    farmer.user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    farmer.farmer_profile?.state?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    farmer.farmer_profile?.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading farmers...</p>
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
              Find Farmers
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Connect with verified farmers across India.
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

        {/* Search */}
        <div className="mt-8">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Search farmers by name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Farmers Grid */}
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredFarmers.map((farmer) => (
            <div
              key={farmer.user._id}
              className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <UserIcon className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {farmer.user.full_name}
                    </h3>
                    {farmer.farmer_profile?.state && (
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPinIcon className="h-4 w-4 mr-1" />
                        {farmer.farmer_profile.city && `${farmer.farmer_profile.city}, `}
                        {farmer.farmer_profile.state}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  {farmer.farmer_profile?.farming_experience && (
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Experience:</strong> {farmer.farmer_profile.farming_experience} years
                    </p>
                  )}
                  {farmer.farmer_profile?.farm_size && (
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Farm Size:</strong> {farmer.farmer_profile.farm_size} acres
                    </p>
                  )}
                  {farmer.farmer_profile?.specialization && farmer.farmer_profile.specialization.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm text-gray-600 mb-1">
                        <strong>Specialization:</strong>
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {farmer.farmer_profile.specialization.map((spec, index) => (
                          <span
                            key={`${farmer.user._id}-${spec}-${index}`}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex space-x-3">
                  <Link to={`/marketplace?farmer=${farmer.user._id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      View Listings
                    </Button>
                  </Link>
                  <div className="flex-1 relative">
                    <Button 
                      variant="primary" 
                      size="sm" 
                      className="w-full"
                      onClick={() => {
                        const contactOptions = [];
                        if (farmer.user.email) {
                          contactOptions.push(`Email: ${farmer.user.email}`);
                        }
                        if (farmer.user.phone_number) {
                          contactOptions.push(`Phone: ${farmer.user.phone_number}`);
                        }
                        
                        if (contactOptions.length === 0) {
                          alert('No contact information available for this farmer.');
                          return;
                        }
                        
                        const message = `Contact ${farmer.user.full_name}:\n\n${contactOptions.join('\n')}`;
                        
                        // Try to open email if available, otherwise show contact info
                        if (farmer.user.email) {
                          const subject = encodeURIComponent(`Inquiry from GrainChain - ${farmer.user.full_name}`);
                          const body = encodeURIComponent(`Dear ${farmer.user.full_name},\n\nI am interested in your agricultural products listed on GrainChain. Please let me know about your current availability and pricing.\n\nBest regards`);
                          window.open(`mailto:${farmer.user.email}?subject=${subject}&body=${body}`, '_blank');
                        } else if (farmer.user.phone_number) {
                          window.open(`tel:${farmer.user.phone_number}`, '_blank');
                        } else {
                          alert(message);
                        }
                      }}
                    >
                      Contact
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredFarmers.length === 0 && !loading && (
          <div className="text-center py-12">
            <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No farmers found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'Try adjusting your search terms.' : 'No farmers are currently available.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
