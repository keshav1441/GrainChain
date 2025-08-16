import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  CheckCircleIcon,
  CurrencyRupeeIcon,
  CalendarIcon,
  TruckIcon,
  ReceiptPercentIcon,
  HomeIcon,
  ShoppingBagIcon,
} from '@heroicons/react/24/outline';

interface OrderSuccessState {
  orderId: string;
  amount: number;
  items: number;
  paymentMethod?: string;
  paymentId?: string;
}

const OrderSuccessPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as OrderSuccessState;

  // Redirect if no order data
  if (!state) {
    navigate('/marketplace');
    return null;
  }

  const { orderId, amount, items, paymentMethod, paymentId } = state;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          {/* Success Icon */}
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircleIcon className="h-12 w-12 text-green-600" />
          </div>

          {/* Success Message */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Order Placed Successfully! 🎉
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Thank you for your purchase. Your order has been confirmed and is being processed.
            {paymentMethod && paymentMethod !== 'Cash on Delivery' && (
              <span className="block mt-2 text-green-600 font-medium">
                ✅ Payment completed via {paymentMethod}
              </span>
            )}
            {paymentMethod === 'Cash on Delivery' && (
              <span className="block mt-2 text-blue-600 font-medium">
                💰 Payment will be collected on delivery
              </span>
            )}
          </p>

          {/* Order Details */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-center">
              <div className="bg-white rounded-lg p-4">
                <div className="text-2xl font-bold text-emerald-600 mb-1">#{orderId}</div>
                <div className="text-sm text-gray-600">Order ID</div>
              </div>
              <div className="bg-white rounded-lg p-4">
                <div className="text-2xl font-bold text-emerald-600 mb-1 flex items-center justify-center">
                  <CurrencyRupeeIcon className="h-6 w-6" />
                  {amount.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Total Amount</div>
              </div>
              <div className="bg-white rounded-lg p-4">
                <div className="text-2xl font-bold text-emerald-600 mb-1">{items}</div>
                <div className="text-sm text-gray-600">Items Ordered</div>
              </div>
              {paymentMethod && (
                <div className="bg-white rounded-lg p-4">
                  <div className="text-lg font-bold text-emerald-600 mb-1">{paymentMethod}</div>
                  <div className="text-sm text-gray-600">Payment Method</div>
                  {paymentId && (
                    <div className="text-xs text-gray-500 mt-1">ID: {paymentId}</div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* What's Next */}
          <div className="bg-blue-50 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center justify-center">
              <CalendarIcon className="h-5 w-5 mr-2" />
              What's Next?
            </h3>
            <div className="space-y-3 text-left">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-sm font-semibold text-blue-600">1</span>
                </div>
                <div>
                  <div className="font-medium text-gray-900">Order Confirmation</div>
                  <div className="text-sm text-gray-600">You'll receive an email confirmation shortly</div>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-sm font-semibold text-blue-600">2</span>
                </div>
                <div>
                  <div className="font-medium text-gray-900">Farmer Preparation</div>
                  <div className="text-sm text-gray-600">Farmers will prepare your fresh produce</div>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-sm font-semibold text-blue-600">3</span>
                </div>
                <div>
                  <div className="font-medium text-gray-900">Quality Check & Dispatch</div>
                  <div className="text-sm text-gray-600">Quality verification and packaging</div>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-sm font-semibold text-blue-600">4</span>
                </div>
                <div>
                  <div className="font-medium text-gray-900">Delivery</div>
                  <div className="text-sm text-gray-600">Expected delivery in 3-5 business days</div>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Information */}
          <div className="bg-emerald-50 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-center mb-3">
              <TruckIcon className="h-6 w-6 text-emerald-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Delivery Information</h3>
            </div>
            <p className="text-gray-600 mb-2">
              Your order will be delivered to the address provided during checkout.
            </p>
            <p className="text-sm text-gray-500">
              You'll receive tracking information once your order is dispatched.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/marketplace"
              className="inline-flex items-center px-6 py-3 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors"
            >
              <ShoppingBagIcon className="h-5 w-5 mr-2" />
              Continue Shopping
            </Link>
            <Link
              to="/profile"
              className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
            >
              <ReceiptPercentIcon className="h-5 w-5 mr-2" />
              View Orders
            </Link>
            <Link
              to="/"
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
            >
              <HomeIcon className="h-5 w-5 mr-2" />
              Go Home
            </Link>
          </div>

          {/* Support Information */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Need help with your order? Contact our support team at{' '}
              <a href="mailto:support@grainchain.com" className="text-emerald-600 hover:text-emerald-700">
                support@grainchain.com
              </a>{' '}
              or call{' '}
              <a href="tel:+911234567890" className="text-emerald-600 hover:text-emerald-700">
                +91 12345 67890
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
