import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCartIcon,
  TrashIcon,
  PlusIcon,
  MinusIcon,
  CurrencyRupeeIcon,
  MapPinIcon,
  UserIcon,
  ArrowRightIcon,
  ShoppingBagIcon,
} from '@heroicons/react/24/outline';
import { useCartStore } from '../stores/cartStore';
import toast from 'react-hot-toast';

const CartPage: React.FC = () => {
  const { 
    items, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    getTotalPrice, 
    getTotalItems 
  } = useCartStore();
  const navigate = useNavigate();

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(id);
      toast.success('Item removed from cart');
    } else {
      updateQuantity(id, newQuantity);
    }
  };

  const handleRemoveItem = (id: string, cropType: string) => {
    removeFromCart(id);
    toast.success(`${cropType} removed from cart`);
  };

  const handleClearCart = () => {
    clearCart();
    toast.success('Cart cleared');
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mx-auto h-24 w-24 text-gray-400 mb-6">
              <ShoppingCartIcon className="h-full w-full" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
            <p className="text-lg text-gray-600 mb-8">
              Looks like you haven't added any items to your cart yet.
            </p>
            <Link
              to="/marketplace"
              className="inline-flex items-center px-6 py-3 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors"
            >
              <ShoppingBagIcon className="h-5 w-5 mr-2" />
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
            <p className="text-gray-600 mt-2">{getTotalItems()} items in your cart</p>
          </div>
          <button
            onClick={handleClearCart}
            className="px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
          >
            Clear Cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-start space-x-4">
                  {/* Product Image */}
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-blue-100 rounded-xl flex items-center justify-center">
                      <span className="text-3xl">{item.image || '🌾'}</span>
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {item.crop_type}
                        </h3>
                        <div className="flex items-center text-sm text-gray-600 mb-2">
                          <UserIcon className="h-4 w-4 mr-1" />
                          <span>{item.farmer_name}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600 mb-3">
                          <MapPinIcon className="h-4 w-4 mr-1" />
                          <span>{item.location}</span>
                        </div>
                        <div className="flex items-center text-lg font-semibold text-emerald-600">
                          <CurrencyRupeeIcon className="h-5 w-5" />
                          <span>{item.price_per_kg}/kg</span>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemoveItem(item.id, item.crop_type)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove item"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium text-gray-700">Quantity:</span>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleQuantityChange(item.id, item.selected_quantity - 1)}
                            className="p-1 rounded-full bg-gray-100 border border-gray-300 hover:bg-gray-200 transition-colors"
                            disabled={item.selected_quantity <= 1}
                          >
                            <MinusIcon className="h-4 w-4 text-gray-600" />
                          </button>
                          <span className="w-12 text-center font-medium">{item.selected_quantity} kg</span>
                          <button
                            onClick={() => handleQuantityChange(item.id, item.selected_quantity + 1)}
                            className="p-1 rounded-full bg-gray-100 border border-gray-300 hover:bg-gray-200 transition-colors"
                            disabled={item.selected_quantity >= item.max_quantity}
                          >
                            <PlusIcon className="h-4 w-4 text-gray-600" />
                          </button>
                        </div>
                        <span className="text-xs text-gray-500">
                          (Max: {item.max_quantity} kg)
                        </span>
                      </div>

                      {/* Item Total */}
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900 flex items-center">
                          <CurrencyRupeeIcon className="h-5 w-5" />
                          {(item.price_per_kg * item.selected_quantity).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({getTotalItems()} items)</span>
                  <div className="flex items-center">
                    <CurrencyRupeeIcon className="h-4 w-4" />
                    <span>{getTotalPrice().toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Fee</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Platform Fee</span>
                  <div className="flex items-center">
                    <CurrencyRupeeIcon className="h-4 w-4" />
                    <span>{Math.round(getTotalPrice() * 0.02).toLocaleString()}</span>
                  </div>
                </div>
                <hr className="border-gray-200" />
                <div className="flex justify-between text-lg font-bold text-gray-900">
                  <span>Total</span>
                  <div className="flex items-center">
                    <CurrencyRupeeIcon className="h-5 w-5" />
                    <span>{(getTotalPrice() + Math.round(getTotalPrice() * 0.02)).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleCheckout}
                  className="w-full bg-orange-600 text-white px-6 py-4 rounded-xl font-semibold text-lg hover:bg-orange-700 transition-colors flex items-center justify-center"
                >
                  Proceed to Checkout
                  <ArrowRightIcon className="h-5 w-5 ml-2" />
                </button>
                <Link
                  to="/marketplace"
                  className="w-full bg-gray-100 text-gray-700 px-6 py-4 rounded-xl font-medium text-center hover:bg-gray-200 transition-colors flex items-center justify-center"
                >
                  <ShoppingBagIcon className="h-5 w-5 mr-2" />
                  Continue Shopping
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="text-center text-sm text-gray-600">
                  <div className="flex items-center justify-center space-x-4">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      <span>Secure Payment</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                      <span>Quality Assured</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
