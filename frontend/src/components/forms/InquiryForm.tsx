import React, { useState, useMemo } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Button } from '../ui/Button';
import { buyerApi } from '../../services/api';
import toast from 'react-hot-toast';

interface InquiryFormProps {
  listingId: string;
  cropName: string;
  farmerName: string;
  currentPrice: number;
  availableQuantity: number;
  unit?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  isModal?: boolean;
}

interface InquiryFormData {
  quantity_requested: string;
  proposed_price: string;
  message: string;
  delivery_location: string;
  preferred_delivery_date: string;
}

export const InquiryForm: React.FC<InquiryFormProps> = ({
  listingId,
  cropName,
  farmerName,
  currentPrice,
  availableQuantity,
  unit = 'kg',
  onSuccess,
  onCancel,
  isModal = false,
}) => {
  const [formData, setFormData] = useState<InquiryFormData>({
    quantity_requested: '1',
    proposed_price: currentPrice.toString(),
    message: '',
    delivery_location: '',
    preferred_delivery_date: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<InquiryFormData>>({});

  // FIXED: Simplified input change handler without complex dependencies
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Update form data
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this specific field if it exists
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[name as keyof InquiryFormData];
      return newErrors;
    });
  };

  const validateForm = () => {
    const newErrors: Partial<InquiryFormData> = {};

    const quantity = parseFloat(formData.quantity_requested) || 0;
    const price = parseFloat(formData.proposed_price) || 0;

    if (!quantity || quantity <= 0) {
      newErrors.quantity_requested = 'Quantity must be greater than 0';
    } else if (quantity > availableQuantity) {
      newErrors.quantity_requested = `Quantity cannot exceed ${availableQuantity} ${unit}`;
    }

    if (!price || price <= 0) {
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
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        listing_id: listingId,
        quantity_requested: parseFloat(formData.quantity_requested),
        proposed_price: parseFloat(formData.proposed_price),
        message: formData.message,
        delivery_location: formData.delivery_location,
        preferred_delivery_date: formData.preferred_delivery_date 
          ? new Date(formData.preferred_delivery_date).toISOString()
          : undefined,
      };
      
      await buyerApi.createInquiry(submitData);

      toast.success('Inquiry sent successfully!');
      onSuccess?.();
    } catch (err: any) {
      console.error('Error creating inquiry:', err);
      const errorMessage = err.response?.data?.detail || 'Failed to create inquiry. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Calculate total value
  const totalValue = useMemo(() => {
    return (parseFloat(formData.quantity_requested) || 0) * (parseFloat(formData.proposed_price) || 0);
  }, [formData.quantity_requested, formData.proposed_price]);

  const minDate = new Date().toISOString().split('T')[0];

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className={isModal ? 'flex justify-between items-start' : ''}>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Send Inquiry for {cropName}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            To: {farmerName}
          </p>
        </div>
        {isModal && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        )}
      </div>

      {/* Quantity and Price */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="quantity_requested" className="block text-sm font-medium text-gray-700">
            Quantity ({unit}) *
          </label>
          <input
            type="number"
            name="quantity_requested"
            id="quantity_requested"
            min="1"
            max={availableQuantity}
            step="1"
            required
            value={formData.quantity_requested}
            onChange={handleInputChange}
            className={`mt-1 block w-full px-3 py-2 border ${
              errors.quantity_requested ? 'border-red-300' : 'border-gray-300'
            } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
          />
          {errors.quantity_requested && (
            <p className="mt-1 text-sm text-red-600">{errors.quantity_requested}</p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            Available: {availableQuantity} {unit}
          </p>
        </div>

        <div>
          <label htmlFor="proposed_price" className="block text-sm font-medium text-gray-700">
            Proposed Price (₹/{unit}) *
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
            className={`mt-1 block w-full px-3 py-2 border ${
              errors.proposed_price ? 'border-red-300' : 'border-gray-300'
            } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
          />
          {errors.proposed_price && (
            <p className="mt-1 text-sm text-red-600">{errors.proposed_price}</p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            Current price: ₹{currentPrice}/{unit}
          </p>
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
          className={`mt-1 block w-full px-3 py-2 border ${
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
          className={`mt-1 block w-full px-3 py-2 border ${
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
          min={minDate}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Buttons */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          loading={loading}
          disabled={loading}
        >
          {loading ? 'Sending...' : 'Send Inquiry'}
        </Button>
      </div>
    </form>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onCancel}></div>

          <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

          <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
            {formContent}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {formContent}
    </div>
  );
};