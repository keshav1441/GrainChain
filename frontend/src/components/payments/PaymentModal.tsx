import React, { useState } from 'react';
import { XMarkIcon, CreditCardIcon, BanknotesIcon, DevicePhoneMobileIcon } from '@heroicons/react/24/outline';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSubmit: (paymentData: PaymentData) => void;
  paymentDetails: {
    amount: number;
    recipient: string;
    description: string;
    paymentType: string;
  };
}

interface PaymentData {
  paymentMethod: string;
  amount: number;
  recipient: string;
  description: string;
  paymentType: string;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onPaymentSubmit,
  paymentDetails
}) => {
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      await onPaymentSubmit({
        paymentMethod,
        amount: paymentDetails.amount,
        recipient: paymentDetails.recipient,
        description: paymentDetails.description,
        paymentType: paymentDetails.paymentType
      });
      onClose();
    } catch (error) {
      console.error('Payment failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Complete Payment</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Payment Details */}
          <div className="mb-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Amount</span>
                <span className="text-lg font-semibold text-green-600">
                  ₹{paymentDetails.amount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Recipient</span>
                <span className="text-sm font-medium text-gray-900">
                  {paymentDetails.recipient}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Description</span>
                <span className="text-sm text-gray-700">
                  {paymentDetails.description}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Payment Method
            </label>
            <div className="space-y-3">
              <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card"
                  checked={paymentMethod === 'card'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="h-4 w-4 text-green-600"
                />
                <CreditCardIcon className="h-5 w-5 text-gray-500 ml-3 mr-3" />
                <span className="text-sm font-medium text-gray-900">Credit/Debit Card</span>
              </label>

              <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="upi"
                  checked={paymentMethod === 'upi'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="h-4 w-4 text-green-600"
                />
                <DevicePhoneMobileIcon className="h-5 w-5 text-gray-500 ml-3 mr-3" />
                <span className="text-sm font-medium text-gray-900">UPI</span>
              </label>

              <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="netbanking"
                  checked={paymentMethod === 'netbanking'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="h-4 w-4 text-green-600"
                />
                <BanknotesIcon className="h-5 w-5 text-gray-500 ml-3 mr-3" />
                <span className="text-sm font-medium text-gray-900">Net Banking</span>
              </label>
            </div>
          </div>

          {/* Security Notice */}
          <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-700">
              🔒 Your payment is secured with 256-bit SSL encryption. 
              We never store your payment information.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Processing...' : `Pay ₹${paymentDetails.amount.toLocaleString()}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;
