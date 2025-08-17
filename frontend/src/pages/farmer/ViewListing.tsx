import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeftIcon, PencilIcon } from '@heroicons/react/24/outline';
import { Button } from '../../components/ui/Button';
import { cropApi } from '../../services/api';

interface CropListing {
  id: string;
  crop_type: string;
  variety: string;
  quantity: number;
  price_per_kg: number;
  status: string;
  location: string;
  description: string;
  created_at: string;
  updated_at: string;
  // Add other fields as needed
}

export const ViewListing: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [listing, setListing] = useState<CropListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true);
        const response = await cropApi.getListing(id!);
        setListing(response.data);
      } catch (err) {
        setError('Failed to fetch listing details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchListing();
    }
  }, [id]);

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      available: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      sold: 'bg-gray-100 text-gray-800',
      rejected: 'bg-red-100 text-red-800',
    };

    return (
      <span
        className={`inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium ${
          statusClasses[status as keyof typeof statusClasses] || 'bg-gray-100 text-gray-800'
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500">{error}</p>
          <Link to="/farmer/listings" className="mt-4 inline-block">
            <Button variant="outline">Back to Listings</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900">Listing not found</h3>
          <p className="mt-1 text-sm text-gray-500">The requested listing could not be found.</p>
          <Link to="/farmer/listings" className="mt-4 inline-block">
            <Button variant="outline">Back to Listings</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            to="/farmer/listings"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Listings
          </Link>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {listing.crop_type} - {listing.variety || 'Standard'}
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Listed on {new Date(listing.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex space-x-3">
                <Link to={`/farmer/listings/${listing.id}/edit`}>
                  <Button variant="outline" size="sm">
                    <PencilIcon className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                </Link>
              </div>
            </div>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {getStatusBadge(listing.status)}
                </dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Location</dt>
                <dd className="mt-1 text-sm text-gray-900">{listing.location || 'Not specified'}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Quantity Available</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {listing.quantity.toLocaleString()} kg
                </dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Price per kg</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  ₹{listing.price_per_kg.toFixed(2)}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Description</dt>
                <dd className="mt-1 text-sm text-gray-900 whitespace-pre-line">
                  {listing.description || 'No description provided.'}
                </dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Created</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(listing.created_at).toLocaleString()}
                </dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(listing.updated_at).toLocaleString()}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewListing;
