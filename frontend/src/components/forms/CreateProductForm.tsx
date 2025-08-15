import React, { useState } from 'react';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Button } from '../ui/Button';
import { financierApi } from '../../services/api';

interface CreateProductFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface ProductFormData {
  product_name: string;
  product_type: string;
  description: string;
  min_amount: number;
  max_amount: number;
  min_tenure_months: number;
  max_tenure_months: number;
  interest_rate_min: number;
  interest_rate_max: number;
  processing_fee_percentage: number;
  min_farm_size?: number;
  min_experience_years?: number;
  min_annual_income?: number;
  eligible_states: string[];
  eligible_crops: string[];
  min_credit_score?: number;
  is_active: boolean;
  is_featured: boolean;
}

const LOAN_TYPES = [
  { value: 'crop_loan', label: 'Crop Loan' },
  { value: 'equipment_loan', label: 'Equipment Loan' },
  { value: 'working_capital', label: 'Working Capital' },
  { value: 'term_loan', label: 'Term Loan' },
  { value: 'kisan_credit_card', label: 'Kisan Credit Card' }
];

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];

const CROP_TYPES = [
  'Rice', 'Wheat', 'Cotton', 'Sugarcane', 'Maize', 'Bajra', 'Jowar',
  'Barley', 'Gram', 'Tur', 'Moong', 'Urad', 'Mustard', 'Groundnut',
  'Sesame', 'Sunflower', 'Soybean', 'Castor', 'Jute', 'Tobacco'
];

export const CreateProductForm: React.FC<CreateProductFormProps> = ({
  onSuccess,
  onCancel
}) => {
  const [formData, setFormData] = useState<ProductFormData>({
    product_name: '',
    product_type: 'crop_loan',
    description: '',
    min_amount: 10000,
    max_amount: 1000000,
    min_tenure_months: 6,
    max_tenure_months: 60,
    interest_rate_min: 8.0,
    interest_rate_max: 15.0,
    processing_fee_percentage: 1.0,
    eligible_states: [],
    eligible_crops: [],
    is_active: true,
    is_featured: false
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newState, setNewState] = useState('');
  const [newCrop, setNewCrop] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: parseFloat(value) || 0
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const addState = () => {
    if (newState && !formData.eligible_states.includes(newState)) {
      setFormData(prev => ({
        ...prev,
        eligible_states: [...prev.eligible_states, newState]
      }));
      setNewState('');
    }
  };

  const removeState = (state: string) => {
    setFormData(prev => ({
      ...prev,
      eligible_states: prev.eligible_states.filter(s => s !== state)
    }));
  };

  const addCrop = () => {
    if (newCrop && !formData.eligible_crops.includes(newCrop)) {
      setFormData(prev => ({
        ...prev,
        eligible_crops: [...prev.eligible_crops, newCrop]
      }));
      setNewCrop('');
    }
  };

  const removeCrop = (crop: string) => {
    setFormData(prev => ({
      ...prev,
      eligible_crops: prev.eligible_crops.filter(c => c !== crop)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate form data
      if (!formData.product_name.trim()) {
        throw new Error('Product name is required');
      }
      if (formData.min_amount >= formData.max_amount) {
        throw new Error('Maximum amount must be greater than minimum amount');
      }
      if (formData.min_tenure_months >= formData.max_tenure_months) {
        throw new Error('Maximum tenure must be greater than minimum tenure');
      }
      if (formData.interest_rate_min >= formData.interest_rate_max) {
        throw new Error('Maximum interest rate must be greater than minimum interest rate');
      }

      // Create product via API
      await financierApi.createFinancialProduct(formData);
      
      // Success callback
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Create Financial Product</h2>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Name *
            </label>
            <input
              type="text"
              name="product_name"
              value={formData.product_name}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
              placeholder="e.g., Crop Finance Loan"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Type *
            </label>
            <select
              name="product_type"
              value={formData.product_type}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
            >
              {LOAN_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
            placeholder="Describe the product features and benefits"
          />
        </div>

        {/* Amount and Tenure */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Amount (₹) *
            </label>
            <input
              type="number"
              name="min_amount"
              value={formData.min_amount}
              onChange={handleInputChange}
              required
              min="1000"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Amount (₹) *
            </label>
            <input
              type="number"
              name="max_amount"
              value={formData.max_amount}
              onChange={handleInputChange}
              required
              min="1000"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Tenure (Months) *
            </label>
            <input
              type="number"
              name="min_tenure_months"
              value={formData.min_tenure_months}
              onChange={handleInputChange}
              required
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Tenure (Months) *
            </label>
            <input
              type="number"
              name="max_tenure_months"
              value={formData.max_tenure_months}
              onChange={handleInputChange}
              required
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>

        {/* Interest Rates */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Interest Rate (%) *
            </label>
            <input
              type="number"
              name="interest_rate_min"
              value={formData.interest_rate_min}
              onChange={handleInputChange}
              required
              min="0"
              max="50"
              step="0.1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Interest Rate (%) *
            </label>
            <input
              type="number"
              name="interest_rate_max"
              value={formData.interest_rate_max}
              onChange={handleInputChange}
              required
              min="0"
              max="50"
              step="0.1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Processing Fee (%)
            </label>
            <input
              type="number"
              name="processing_fee_percentage"
              value={formData.processing_fee_percentage}
              onChange={handleInputChange}
              min="0"
              max="10"
              step="0.1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>

        {/* Eligibility Criteria */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Eligibility Criteria</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Farm Size (Acres)
              </label>
              <input
                type="number"
                name="min_farm_size"
                value={formData.min_farm_size || ''}
                onChange={handleInputChange}
                min="0"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Experience (Years)
              </label>
              <input
                type="number"
                name="min_experience_years"
                value={formData.min_experience_years || ''}
                onChange={handleInputChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Annual Income (₹)
              </label>
              <input
                type="number"
                name="min_annual_income"
                value={formData.min_annual_income || ''}
                onChange={handleInputChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Credit Score
            </label>
            <input
              type="number"
              name="min_credit_score"
              value={formData.min_credit_score || ''}
              onChange={handleInputChange}
              min="300"
              max="850"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>

        {/* Eligible States */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Eligible States
          </label>
          <div className="flex gap-2 mb-2">
            <select
              value={newState}
              onChange={(e) => setNewState(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
            >
              <option value="">Select a state</option>
              {INDIAN_STATES.filter(state => !formData.eligible_states.includes(state)).map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={addState}
              disabled={!newState}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              <PlusIcon className="h-4 w-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.eligible_states.map(state => (
              <span
                key={state}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
              >
                {state}
                <button
                  type="button"
                  onClick={() => removeState(state)}
                  className="ml-2 text-green-600 hover:text-green-800"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Eligible Crops */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Eligible Crops
          </label>
          <div className="flex gap-2 mb-2">
            <select
              value={newCrop}
              onChange={(e) => setNewCrop(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
            >
              <option value="">Select a crop</option>
              {CROP_TYPES.filter(crop => !formData.eligible_crops.includes(crop)).map(crop => (
                <option key={crop} value={crop}>{crop}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={addCrop}
              disabled={!newCrop}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              <PlusIcon className="h-4 w-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.eligible_crops.map(crop => (
              <span
                key={crop}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
              >
                {crop}
                <button
                  type="button"
                  onClick={() => removeCrop(crop)}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Product Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Product Settings</h3>
          <div className="flex gap-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleInputChange}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Active Product</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                name="is_featured"
                checked={formData.is_featured}
                onChange={handleInputChange}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Featured Product</span>
            </label>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4 pt-6">
          <Button
            type="submit"
            disabled={loading}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
          >
            {loading ? 'Creating Product...' : 'Create Product'}
          </Button>
          
          {onCancel && (
            <Button
              type="button"
              onClick={onCancel}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};

export default CreateProductForm;
