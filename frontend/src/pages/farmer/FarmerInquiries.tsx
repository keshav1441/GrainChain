import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { cropApi } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

interface Inquiry {
  id: string;
  buyer_id: string;
  buyer_name: string;
  listing_id: string;
  crop_type: string;
  quantity: number;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  price_per_kg?: number;
}


export const FarmerInquiries: React.FC = () => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        setLoading(true);
        // This endpoint needs to be implemented in the backend
        const response = await cropApi.getInquiries();
        setInquiries(response.data);
      } catch (err) {
        setError('Failed to fetch inquiries.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchInquiries();
  }, []);

  const handleStatusUpdate = async (inquiryId: string, newStatus: 'accepted' | 'rejected') => {
    try {
      await cropApi.respondToInquiry(parseInt(inquiryId), { status: newStatus });
      // Update local state
      setInquiries(inquiries.map(inquiry => 
        inquiry.id === inquiryId ? { ...inquiry, status: newStatus } : inquiry
      ));
    } catch (err) {
      console.error('Failed to update inquiry status:', err);
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading inquiries...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link to="/farmer/dashboard" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700">
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Link>
          <h1 className="mt-2 text-3xl font-extrabold text-gray-900">Crop Inquiries</h1>
          <p className="mt-1 text-sm text-gray-500">Manage and respond to buyer inquiries about your crop listings.</p>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          {inquiries.length === 0 ? (
            <div className="text-center py-12">
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
          ) : (
            <ul className="divide-y divide-gray-200">
              {inquiries.map((inquiry) => (
                <li key={inquiry.id} className="p-6">
                  <div className="md:flex md:items-center md:justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            {inquiry.buyer_name} is interested in your {inquiry.crop_type}
                          </h3>
                          <div className="mt-2 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
                            <div className="mt-2 flex items-center text-sm text-gray-500">
                              <svg
                                className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                aria-hidden="true"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              {formatDate(inquiry.created_at)}
                            </div>
                            <div className="mt-2 flex items-center text-sm text-gray-500">
                              <svg
                                className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                aria-hidden="true"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              {inquiry.quantity} kg • {inquiry.price_per_kg ? `₹${inquiry.price_per_kg}/kg` : 'Price not specified'}
                            </div>
                          </div>
                        </div>
                      </div>
                      {inquiry.message && (
                        <div className="mt-4">
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Message: </span>
                            {inquiry.message}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="mt-4 flex space-x-3 md:mt-0 md:ml-4">
                      {inquiry.status === 'pending' ? (
                        <>
                          <Button
                            variant="outline"
                            onClick={() => handleStatusUpdate(inquiry.id, 'accepted')}
                            className="text-green-700 border-green-300 hover:bg-green-50"
                          >
                            Accept
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => handleStatusUpdate(inquiry.id, 'rejected')}
                            className="text-red-700 border-red-300 hover:bg-red-50"
                          >
                            Reject
                          </Button>
                        </>
                      ) : (
                        <span
                          className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${
                            inquiry.status === 'accepted'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1)}
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default FarmerInquiries;
