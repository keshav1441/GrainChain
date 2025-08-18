import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  CheckIcon,
  CurrencyDollarIcon,
  PlusIcon,
  PencilIcon,
  ClockIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { financierApi } from '../../services/api';
import { Button } from '../../components/ui/Button';

interface FinancialProduct {
  id: string;
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
  created_at: string;
  updated_at: string;
  // Status is determined by is_active
}

export const LoanProducts: React.FC = () => {
  const [products, setProducts] = useState<FinancialProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<FinancialProduct | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await financierApi.getLoanProductsManagement();
      setProducts(response.data || []);
    } catch (error) {
      console.error('Error fetching financial products:', error);
      toast.error('Failed to load financial products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []); // Removed statusFilter from dependencies since it's not used

  const toggleProductStatus = async (productId: string) => {
    try {
      // In real implementation, this would call an API
      setProducts(prev => prev.map(product => 
        product.id === productId 
          ? { ...product, is_active: !product.is_active }
          : product
      ));
      toast.success('Product status updated successfully');
    } catch (error) {
      console.error('Error updating product status:', error);
      toast.error('Failed to update product status');
    }
  };

  const formatCurrency = (amount: number) => {
    const validAmount = isNaN(amount) || amount === null || amount === undefined ? 0 : amount;
    if (validAmount >= 100000) {
      return `₹${(validAmount / 100000).toFixed(1)} L`;
    } else {
      return `₹${validAmount.toLocaleString()}`;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (isActive: boolean) => (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
      isActive 
        ? 'bg-green-100 text-green-800' 
        : 'bg-gray-100 text-gray-800'
    }`}>
      {isActive ? 'Active' : 'Inactive'}
    </span>
  );

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
                <CurrencyDollarIcon className="h-8 w-8 mr-3 text-primary-600" />
                Loan Products
              </h1>
              <p className="mt-2 text-gray-600">
                Manage your loan products and their terms
              </p>
            </div>
            <Link to="/financier/products/create">
              <Button
                variant="primary"
                className="flex items-center"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Create Product
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyDollarIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Products</p>
                <p className="text-2xl font-semibold text-gray-900">{products.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Products</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {products.filter(p => p.is_active).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-yellow-600 font-semibold">%</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Avg Interest Rate</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {((products.reduce((sum, p) => sum + (p.interest_rate_min + p.interest_rate_max) / 2, 0) / products.length).toFixed(1))|| 2.5}%
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Avg Tenure</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {products.length > 0 
                    ? Math.round(products.reduce((sum, p) => sum + (p.min_tenure_months + p.max_tenure_months) / 2, 0) / products.length) 
                    : '0'} months
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Products List */}
        <div className="bg-white shadow rounded-lg">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <span className="ml-3 text-gray-600">Loading products...</span>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <CurrencyDollarIcon className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Products Found</h3>
              <p className="text-gray-600 mb-6">Create your first loan product to get started</p>
              <Button
                variant="primary"
                onClick={() => setShowCreateModal(true)}
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Create Product
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
              {products.map((product) => (
                <div key={product.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900">{product.product_name}</h3>
                        {getStatusBadge(product.is_active)}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                      <div className="mt-4 grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Product Type</p>
                          <p className="text-sm text-gray-900 capitalize">{product.product_type}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Amount Range</p>
                          <p className="text-sm text-gray-900">
                            {formatCurrency(product.min_amount)} - {formatCurrency(product.max_amount)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Interest Rate</p>
                          <p className="text-sm text-gray-900">
                            {product.interest_rate_min}% - {product.interest_rate_max}%
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Tenure</p>
                          <p className="text-sm text-gray-900">
                            {product.min_tenure_months} - {product.max_tenure_months} months
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Processing Fee</p>
                          <p className="text-sm text-gray-900">{product.processing_fee_percentage}%</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Featured</p>
                          <p className="text-sm text-gray-900">{product.is_featured ? 'Yes' : 'No'}</p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-500 mb-2">Eligibility</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {product.min_farm_size && (
                            <div className="flex items-center">
                              <span className="text-gray-500">Min Farm Size:</span>
                              <span className="ml-2 text-gray-700">{product.min_farm_size} acres</span>
                            </div>
                          )}
                          {product.min_experience_years && (
                            <div className="flex items-center">
                              <span className="text-gray-500">Min Experience:</span>
                              <span className="ml-2 text-gray-700">{product.min_experience_years} years</span>
                            </div>
                          )}
                          {product.min_annual_income && (
                            <div className="flex items-center">
                              <span className="text-gray-500">Min Annual Income:</span>
                              <span className="ml-2 text-gray-700">{formatCurrency(product.min_annual_income)}</span>
                            </div>
                          )}
                          {product.min_credit_score && (
                            <div className="flex items-center">
                              <span className="text-gray-500">Min Credit Score:</span>
                              <span className="ml-2 text-gray-700">{product.min_credit_score}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="mt-4 flex justify-between items-center text-xs text-gray-500">
                        <span>Created: {formatDate(product.created_at)}</span>
                        <span>Updated: {formatDate(product.updated_at)}</span>
                      </div>
                      {(product.eligible_states?.length > 0 || product.eligible_crops?.length > 0) && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <h4 className="text-xs font-medium text-gray-500 mb-1">Eligible For:</h4>
                          <div className="flex flex-wrap gap-1">
                            {product.eligible_states?.map((state, idx) => (
                              <span key={`state-${idx}`} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                {state}
                              </span>
                            ))}
                            {product.eligible_crops?.map((crop, idx) => (
                              <span key={`crop-${idx}`} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                {crop}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingProduct(product)}
                      className="flex-1"
                    >
                      <PencilIcon className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled
                    >
                      All
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled
                    >
                      Active
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled
                    >
                      Inactive
                    </Button>
                    <Button
                      variant={product.is_active ? "danger" : "primary"}
                      size="sm"
                      onClick={() => toggleProductStatus(product.id)}
                      className="flex-1"
                    >
                      {product.is_active ? (
                        <>
                          <XMarkIcon className="h-4 w-4 mr-1" />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <CheckIcon className="h-4 w-4 mr-1" />
                          Activate
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create/Edit Modal Placeholder */}
        {(showCreateModal || editingProduct) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {editingProduct ? 'Edit Product' : 'Create New Product'}
              </h3>
              <p className="text-gray-600 mb-6">
                Product creation/editing form would go here in a full implementation.
              </p>
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingProduct(null);
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingProduct(null);
                    toast.success(editingProduct ? 'Product updated!' : 'Product created!');
                  }}
                  className="flex-1"
                >
                  {editingProduct ? 'Update' : 'Create'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
