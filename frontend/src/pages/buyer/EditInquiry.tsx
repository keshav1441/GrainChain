import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Button } from '../../components/ui/Button';
import { buyerApi } from '../../services/api';
import toast from 'react-hot-toast';

interface InquiryData {
  _id: string;
  listing_id: string;
  quantity: number;
  proposed_price: number;
  message?: string;
  delivery_location?: string;
  preferred_delivery_date?: string;
  status: string;
  created_at: string;
  listing?: {
    crop_name: string;
    price_per_kg: number;
    quantity_available: number;
    farmer?: {
      full_name: string;
    };
  };
}

interface FormData {
  quantity: number;
  proposed_price: number;
  message: string;
  delivery_location: string;
  preferred_delivery_date: string;
}

interface FormErrors {
  quantity?: string;
  proposed_price?: string;
  message?: string;
  delivery_location?: string;
  preferred_delivery_date?: string;
}

export const EditInquiry: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [inquiry, setInquiry] = useState<InquiryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    quantity: 0,
    proposed_price: 0,
    message: '',
    delivery_location: '',
    preferred_delivery_date: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (!id) {
      setError('Inquiry ID is missing');
      setLoading(false);
      return;
    }

    const fetchInquiry = async () => {
      try {
        setLoading(true);
        const response = await buyerApi.getInquiry(id);
        const inquiryData = response.data;
        setInquiry(inquiryData);
        
        // Populate form with existing data
        setFormData({
          quantity: inquiryData.quantity,
          proposed_price: inquiryData.proposed_price,
          message: inquiryData.message || '',
          delivery_location: inquiryData.delivery_location || '',
          preferred_delivery_date: inquiryData.preferred_delivery_date 
            ? new Date(inquiryData.preferred_delivery_date).toISOString().split('T')[0]
            : '',
        });
      } catch (err: any) {
        console.error('Error fetching inquiry:', err);
        setError(err.response?.data?.detail || 'Failed to load inquiry');
      } finally {
        setLoading(false);
      }
    };

    fetchInquiry();
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  const { name, value, type } = e.target;
  
  let processedValue = value;
  if (type === 'number') {
    if (value === '') {
      processedValue = "0";
    } else {
      const parsed = parseFloat(value);
      processedValue = isNaN(parsed) ? "0" : parsed.toString();
    }
  }
  
  setFormData(prev => ({
    ...prev,
    [name]: processedValue,
  }));

  // Clear error when user starts typing
  if (errors[name as keyof FormErrors]) {
    setErrors(prev => ({ ...prev, [name]: undefined }));
  }
};

  const validateForm = () => {
    const newErrors: FormErrors = {};

    if (!formData.quantity || formData.quantity <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0';
    } else if (inquiry?.listing && formData.quantity > inquiry.listing.quantity_available) {
      newErrors.quantity = `Quantity cannot exceed ${inquiry.listing.quantity_available} units`;
    }

    if (!formData.proposed_price || formData.proposed_price <= 0) {
      newErrors.proposed_price = 'Price must be greater than 0';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Please provide a message for the farmer';
    }

    if (!formData.delivery_location.trim()) {
      newErrors.delivery_location = 'Please specify the delivery location';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !id) {
      return;
    }

    setUpdating(true);
    try {
      await buyerApi.updateInquiry(id, formData);
      toast.success('Inquiry updated successfully!');
      navigate('/buyer/inquiries');
    } catch (err: any) {
      console.error('Error updating inquiry:', err);
      const errorMessage = err.response?.data?.detail || 'Failed to update inquiry. Please try again.';
      toast.error(errorMessage);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading inquiry...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link to="/buyer/inquiries">
            <Button variant="outline">Back to Inquiries</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!inquiry) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Inquiry not found</p>
          <Link to="/buyer/inquiries">
            <Button variant="outline">Back to Inquiries</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Check if inquiry can be edited
  const canEdit = inquiry.status === 'pending' || inquiry.status === 'negotiating';

  if (!canEdit) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Link
              to="/buyer/inquiries"
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-1" />
              Back to Inquiries
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Cannot Edit Inquiry</h2>
              <p className="text-gray-600 mb-4">
                This inquiry cannot be edited because its status is "{inquiry.status}".
                Only pending or negotiating inquiries can be modified.
              </p>
              <Link to="/buyer/inquiries">
                <Button variant="primary">Back to Inquiries</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const quantity = Number(formData.quantity) || 0;
  const proposedPrice = Number(formData.proposed_price) || 0;
  const totalValue = quantity * proposedPrice;


  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            to="/buyer/inquiries"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Inquiries
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">Edit Inquiry</h2>
            <p className="text-sm text-gray-600 mt-2">
              Update your inquiry for {inquiry.listing?.crop_name || 'Unknown Crop'} 
              {inquiry.listing?.farmer?.full_name && ` from ${inquiry.listing.farmer.full_name}`}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Quantity and Price */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                  Quantity (units) *
                </label>
                <input
                  type="number"
                  name="quantity"
                  id="quantity"
                  min="1"
                  max={inquiry.listing?.quantity_available || 999999}
                  step="1"
                  required
                  value={formData.quantity}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full border ${
                    errors.quantity ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                />
                {errors.quantity && (
                  <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>
                )}
                {inquiry.listing && (
                  <p className="mt-1 text-sm text-gray-500">
                    Available: {inquiry.listing.quantity_available} units
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="proposed_price" className="block text-sm font-medium text-gray-700">
                  Proposed Price (₹/unit) *
                </label>
                <input
                  type="number"
                  name="proposed_price"
                  id="proposed_price"
                  min="0"
                  step="0.01"
                  required
                  value={formData.proposed_price}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full border ${
                    errors.proposed_price ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                />
                {errors.proposed_price && (
                  <p className="mt-1 text-sm text-red-600">{errors.proposed_price}</p>
                )}
                {inquiry.listing && (
                  <p className="mt-1 text-sm text-gray-500">
                    Current price: ₹{inquiry.listing.price_per_kg}/unit
                  </p>
                )}
              </div>
            </div>

            {/* Total Value */}
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-blue-800">Total Value:</span>
                <span className="text-lg font-bold text-blue-900">
                  ₹{totalValue.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Message */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                Message to Farmer *
              </label>
              <textarea
                name="message"
                id="message"
                rows={4}
                required
                value={formData.message}
                onChange={handleInputChange}
                placeholder="Please provide details about your requirements, preferred quality, etc."
                className={`mt-1 block w-full border ${
                  errors.message ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
              />
              {errors.message && (
                <p className="mt-1 text-sm text-red-600">{errors.message}</p>
              )}
            </div>

            {/* Delivery Location */}
            <div>
              <label htmlFor="delivery_location" className="block text-sm font-medium text-gray-700">
                Delivery Location *
              </label>
              <input
                type="text"
                name="delivery_location"
                id="delivery_location"
                required
                value={formData.delivery_location}
                onChange={handleInputChange}
                placeholder="City, State"
                className={`mt-1 block w-full border ${
                  errors.delivery_location ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
              />
              {errors.delivery_location && (
                <p className="mt-1 text-sm text-red-600">{errors.delivery_location}</p>
              )}
            </div>

            {/* Preferred Delivery Date */}
            <div>
              <label htmlFor="preferred_delivery_date" className="block text-sm font-medium text-gray-700">
                Preferred Delivery Date
              </label>
              <input
                type="date"
                name="preferred_delivery_date"
                id="preferred_delivery_date"
                value={formData.preferred_delivery_date}
                onChange={handleInputChange}
                min={new Date().toISOString().split('T')[0]}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <Link to="/buyer/inquiries">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                variant="primary"
                loading={updating}
                disabled={updating}
              >
                {updating ? 'Updating...' : 'Update Inquiry'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};