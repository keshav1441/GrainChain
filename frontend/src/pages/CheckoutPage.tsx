import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CurrencyRupeeIcon,
  MapPinIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  TruckIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import { useCartStore } from '../stores/cartStore';
import { useAuthStore } from '../stores/authStore';
import { cartApi, paymentApi } from '../services/api';
import toast from 'react-hot-toast';

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  description: string;
}

interface DeliveryAddress {
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

const CheckoutPage: React.FC = () => {
  const { items, getTotalPrice, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddress>({
    name: user?.full_name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    state: user?.state || '',
    pincode: '',
  });

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'upi',
      name: 'UPI Payment',
      icon: '📱',
      description: 'Pay using Google Pay, PhonePe, Paytm, or any UPI app'
    },
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: '💳',
      description: 'Visa, Mastercard, RuPay cards accepted'
    },
    {
      id: 'netbanking',
      name: 'Net Banking',
      icon: '🏦',
      description: 'Pay directly from your bank account'
    },
    {
      id: 'wallet',
      name: 'Digital Wallet',
      icon: '👛',
      description: 'Paytm, PhonePe, Amazon Pay wallet'
    },
    {
      id: 'cod',
      name: 'Cash on Delivery',
      icon: '💵',
      description: 'Pay when you receive your order'
    }
  ];

  const totalAmount = getTotalPrice();
  const platformFee = Math.round(totalAmount * 0.02);
  const finalAmount = totalAmount + platformFee;

  const handleAddressChange = (field: keyof DeliveryAddress, value: string) => {
    setDeliveryAddress(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!deliveryAddress.name || !deliveryAddress.phone || !deliveryAddress.address || 
        !deliveryAddress.city || !deliveryAddress.state || !deliveryAddress.pincode) {
      toast.error('Please fill in all delivery address fields');
      return false;
    }
    if (!selectedPaymentMethod) {
      toast.error('Please select a payment method');
      return false;
    }
    return true;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) return;

    setIsProcessing(true);
    
    try {
      // Create order data
      const orderData = {
        items: items.map(item => ({
          crop_listing_id: item.id,
          quantity: item.selected_quantity,
        })),
        delivery_address: deliveryAddress,
        payment_method: selectedPaymentMethod,
        order_notes: '',
        special_instructions: ''
      };

      // Create order
      const orderResponse = await cartApi.createOrder(orderData);
      const order = orderResponse.data;
      
      // Handle payment based on method
      if (selectedPaymentMethod === 'cod') {
        // Cash on Delivery - order is placed, no payment processing needed
        clearCart();
        toast.success('Order placed successfully! You can pay on delivery.');
        navigate('/order-success', { 
          state: { 
            orderId: order.order_id,
            amount: order.total_amount,
            items: order.items.length,
            paymentMethod: 'Cash on Delivery'
          } 
        });
      } else {
        let payment;
        let paymentMethodName = '';
        
        // Use method-specific endpoints for better handling
        if (selectedPaymentMethod === 'upi') {
          // UPI Payment
          const paymentResponse = await paymentApi.initiateUPIPayment({
            order_id: order.id,
            upi_provider: 'googlepay'
          });
          payment = paymentResponse.data;
          
          // Verify UPI payment
          await paymentApi.verifyUPIPayment({
            payment_id: payment.payment_id,
            upi_transaction_id: `upi_${Date.now()}`,
            upi_ref_id: `ref_${Date.now()}`
          });
          
          paymentMethodName = 'UPI';
          
        } else if (selectedPaymentMethod === 'card') {
          // Card Payment
          const paymentResponse = await paymentApi.initiateCardPayment({
            order_id: order.id,
            card_type: 'visa'
          });
          payment = paymentResponse.data;
          
          // Verify card payment
          await paymentApi.verifyCardPayment({
            payment_id: payment.payment_id,
            gateway_payment_id: `card_${Date.now()}`,
            gateway_signature: 'verified',
            auth_code: `auth_${Date.now()}`
          });
          
          paymentMethodName = 'Credit/Debit Card';
          
        } else if (selectedPaymentMethod === 'netbanking') {
          // Net Banking Payment
          const paymentResponse = await paymentApi.initiateNetBankingPayment({
            order_id: order.id,
            bank_code: 'sbi',
            account_holder_name: deliveryAddress.name
          });
          payment = paymentResponse.data;
          
          // Verify net banking payment
          await paymentApi.verifyNetBankingPayment({
            payment_id: payment.payment_id,
            bank_transaction_id: `nb_${Date.now()}`,
            bank_ref_id: `nbref_${Date.now()}`
          });
          
          paymentMethodName = 'Net Banking';
          
        } else if (selectedPaymentMethod === 'wallet') {
          // Wallet payment - use generic payment creation
          const paymentResponse = await paymentApi.createPayment({
            order_id: order.id,
            payment_method: selectedPaymentMethod,
            gateway_name: 'razorpay'
          });
          payment = paymentResponse.data;
          
          // Simulate wallet payment success
          await paymentApi.simulateSuccess(payment.payment_id);
          paymentMethodName = 'Digital Wallet';
        }
        
        // Success handling for all payment methods
        clearCart();
        toast.success(`${paymentMethodName} payment completed successfully!`);
        navigate('/order-success', { 
          state: { 
            orderId: order.order_id,
            amount: order.total_amount,
            items: order.items.length,
            paymentMethod: paymentMethodName,
            paymentId: payment.payment_id
          } 
        });
      }
      
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to place order. Please try again.');
      console.error('Order placement error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate('/cart')}
            className="flex items-center text-gray-600 hover:text-gray-800 mr-4"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-1" />
            Back to Cart
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <MapPinIcon className="h-6 w-6 mr-2 text-emerald-600" />
                Delivery Address
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={deliveryAddress.name}
                    onChange={(e) => handleAddressChange('name', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={deliveryAddress.phone}
                    onChange={(e) => handleAddressChange('phone', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Enter your phone number"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <textarea
                    value={deliveryAddress.address}
                    onChange={(e) => handleAddressChange('address', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Enter your complete address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <input
                    type="text"
                    value={deliveryAddress.city}
                    onChange={(e) => handleAddressChange('city', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Enter your city"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                  <input
                    type="text"
                    value={deliveryAddress.state}
                    onChange={(e) => handleAddressChange('state', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Enter your state"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">PIN Code</label>
                  <input
                    type="text"
                    value={deliveryAddress.pincode}
                    onChange={(e) => handleAddressChange('pincode', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Enter PIN code"
                  />
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <CreditCardIcon className="h-6 w-6 mr-2 text-emerald-600" />
                Payment Method
              </h2>
              
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                      selectedPaymentMethod === method.id
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedPaymentMethod(method.id)}
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0 text-2xl mr-4">{method.icon}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{method.name}</h3>
                        <p className="text-sm text-gray-600">{method.description}</p>
                      </div>
                      {selectedPaymentMethod === method.id && (
                        <CheckCircleIcon className="h-6 w-6 text-emerald-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
              
              {/* Items */}
              <div className="space-y-3 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-lg">{item.image || '🌾'}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">{item.crop_type}</h4>
                      <p className="text-xs text-gray-600">{item.selected_quantity} kg × ₹{item.price_per_kg}</p>
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      ₹{(item.price_per_kg * item.selected_quantity).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pricing */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <div className="flex items-center">
                    <CurrencyRupeeIcon className="h-4 w-4" />
                    <span>{totalAmount.toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Platform Fee</span>
                  <div className="flex items-center">
                    <CurrencyRupeeIcon className="h-4 w-4" />
                    <span>{platformFee.toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>
                <hr className="border-gray-200" />
                <div className="flex justify-between text-lg font-bold text-gray-900">
                  <span>Total</span>
                  <div className="flex items-center">
                    <CurrencyRupeeIcon className="h-5 w-5" />
                    <span>{finalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Delivery Info */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <TruckIcon className="h-4 w-4 mr-2" />
                  <span>Estimated Delivery</span>
                </div>
                <div className="flex items-center text-sm font-medium text-gray-900">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  <span>3-5 business days</span>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={isProcessing}
                className="w-full bg-orange-600 text-white px-6 py-4 rounded-xl font-semibold text-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <ShieldCheckIcon className="h-5 w-5 mr-2" />
                    Place Order
                  </>
                )}
              </button>

              {/* Security Info */}
              <div className="mt-4 text-center text-xs text-gray-500">
                <div className="flex items-center justify-center">
                  <ShieldCheckIcon className="h-4 w-4 mr-1" />
                  <span>Your payment information is secure and encrypted</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
