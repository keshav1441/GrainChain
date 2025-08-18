import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';
import { Button } from '../../components/ui/Button';
import { buyerApi } from '../../services/api';

interface Inquiry {
  id: string;
  listing_id: string;
  quantity_requested: number;
  proposed_price: number;
  status: string;
  created_at: string;
  preferred_delivery_date?: string;
  message?: string;
  delivery_location?: string;
  listing?: {
    crop_name: string;
    farmer?: {
      full_name: string;
    };
  };
}

export const BuyerInquiries: React.FC = () => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        setLoading(true);
        setError(null);
        const params = filter !== 'all' ? { status: filter, limit: 100 } : { limit: 100 };
        // Use the correct endpoint from buyerApi
        const response = await buyerApi.getInquiries(params).catch(err => {
          console.warn('Error fetching inquiries, using fallback data', err);
          return { data: [] }; // Return empty array as fallback
        });
        setInquiries(Array.isArray(response?.data) ? response.data : []);
      } catch (err) {
        console.error('Error in fetchInquiries:', err);
        setError('Failed to load inquiries. Please try again later.');
        setInquiries([]); // Ensure we have an empty array even on error
      } finally {
        setLoading(false);
      }
    };

    fetchInquiries();
  }, [filter]);

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'negotiating':
        return <ChatBubbleLeftRightIcon className="h-5 w-5 text-blue-500" />;
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'rejected':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
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

  const handleCancelInquiry = async (inquiryId: string) => {
    if (!window.confirm('Are you sure you want to cancel this inquiry?')) return;
    
    try {
      await buyerApi.cancelInquiry(inquiryId);
      setInquiries(inquiries.filter(inquiry => inquiry.id !== inquiryId));
    } catch (err) {
      console.error('Error cancelling inquiry:', err);
      alert('Failed to cancel inquiry. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading inquiries...</p>
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
              My Inquiries
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Track and manage your crop inquiries.
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

        {/* Filters */}
        <div className="mt-8">
          <div className="sm:hidden">
            <select
              className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Inquiries</option>
              <option value="pending">Pending</option>
              <option value="negotiating">Negotiating</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="hidden sm:block">
            <nav className="flex space-x-8">
              {[
                { key: 'all', label: 'All Inquiries' },
                { key: 'pending', label: 'Pending' },
                { key: 'negotiating', label: 'Negotiating' },
                { key: 'completed', label: 'Completed' },
                { key: 'rejected', label: 'Rejected' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  className={`${
                    filter === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm`}
                  onClick={() => setFilter(tab.key)}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Inquiries List */}
        <div className="mt-8 space-y-6">
          {inquiries.map((inquiry) => (
            <div
              key={inquiry.id}
              className="bg-white shadow rounded-lg overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    {getStatusIcon(inquiry.status)}
                    <h3 className="ml-2 text-lg font-medium text-gray-900">
                      {inquiry.listing?.crop_name || 'Unknown Crop'}
                    </h3>
                  </div>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(inquiry.status)}`}
                  >
                    {inquiry.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>Farmer:</strong> {inquiry.listing?.farmer?.full_name || 'Unknown'}
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>Quantity:</strong> {inquiry.quantity_requested} units
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>Proposed Price:</strong> {inquiry.proposed_price ? `₹${inquiry.proposed_price.toLocaleString()}/unit` : 'Not specified'}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Total Value:</strong> {inquiry.proposed_price ? `₹${(inquiry.proposed_price * inquiry.quantity_requested).toLocaleString()}` : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>Created:</strong> {new Date(inquiry.created_at).toLocaleDateString()}
                    </p>
                    {inquiry.preferred_delivery_date && (
                      <p className="text-sm text-gray-600 mb-1">
                        <strong>Preferred Delivery:</strong> {new Date(inquiry.preferred_delivery_date).toLocaleDateString()}
                      </p>
                    )}
                    {inquiry.delivery_location && (
                      <p className="text-sm text-gray-600 mb-1">
                        <strong>Delivery Location:</strong> {inquiry.delivery_location}
                      </p>
                    )}
                  </div>
                </div>

                {inquiry.message && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>Message:</strong>
                    </p>
                    <p className="text-sm text-gray-800 bg-gray-50 p-3 rounded">
                      {inquiry.message}
                    </p>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <Link to={`/buyer/listings/${inquiry.listing_id}`}>
                    <Button variant="outline" size="sm">
                      View Listing
                    </Button>
                  </Link>
                  <div className="flex space-x-2">
                    {(inquiry.status === 'pending' || inquiry.status === 'negotiating') && (
                      <>
                        <Link to={`/buyer/inquiries/${inquiry.id}/edit`}>
                          <Button
                            variant="outline"
                            size="sm"
                          >
                            Edit
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancelInquiry(inquiry.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {inquiries.length === 0 && !loading && (
          <div className="text-center py-12">
            <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No inquiries found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filter !== 'all' 
                ? `No ${filter} inquiries found.`
                : 'You haven\'t made any inquiries yet. Browse the marketplace to get started.'
              }
            </p>
            {filter === 'all' && (
              <div className="mt-6">
                <Link to="/marketplace">
                  <Button variant="primary">
                    Browse Marketplace
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};