import React, { useState, useEffect } from 'react';
import { 
  ShoppingCartIcon, 
  CreditCardIcon, 
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import PaymentModal from './PaymentModal';
import { paymentService, Transaction } from '../../services/paymentService';

interface PendingOrder {
  id: string;
  farmer_name: string;
  farmer_id: string;
  crop_type: string;
  quantity: number;
  price_per_kg: number;
  total_amount: number;
  order_date: string;
  delivery_date: string;
  status: 'pending_payment' | 'paid' | 'delivered' | 'completed';
}

interface BuyerPaymentsProps {
  buyerId: string;
}

const BuyerPayments: React.FC<BuyerPaymentsProps> = ({ buyerId }) => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBuyerData();
  }, [buyerId]);

  const fetchBuyerData = async () => {
    try {
      setLoading(true);
      
      // Fetch recent transactions
      const transactions = await paymentService.getPaymentHistory(20);
      setRecentTransactions(transactions);
      
      // Mock pending orders - would be replaced with actual API call
      const mockOrders: PendingOrder[] = [
        {
          id: 'order_001',
          farmer_name: 'Rajesh Kumar',
          farmer_id: 'farmer_001',
          crop_type: 'wheat',
          quantity: 500,
          price_per_kg: 25,
          total_amount: 12500,
          order_date: '2024-12-10T10:00:00Z',
          delivery_date: '2024-12-15T10:00:00Z',
          status: 'pending_payment'
        },
        {
          id: 'order_002',
          farmer_name: 'Priya Sharma',
          farmer_id: 'farmer_002',
          crop_type: 'rice',
          quantity: 300,
          price_per_kg: 30,
          total_amount: 9000,
          order_date: '2024-12-09T14:00:00Z',
          delivery_date: '2024-12-14T14:00:00Z',
          status: 'pending_payment'
        },
        {
          id: 'order_003',
          farmer_name: 'Amit Patel',
          farmer_id: 'farmer_003',
          crop_type: 'cotton',
          quantity: 200,
          price_per_kg: 45,
          total_amount: 9000,
          order_date: '2024-12-08T16:00:00Z',
          delivery_date: '2024-12-13T16:00:00Z',
          status: 'paid'
        }
      ];
      
      setPendingOrders(mockOrders);
    } catch (error) {
      console.error('Error fetching buyer data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderPayment = (order: PendingOrder) => {
    const platformCommission = order.total_amount * 0.03; // 3% commission
    const totalWithCommission = order.total_amount + platformCommission;
    
    setSelectedPayment({
      amount: totalWithCommission,
      recipient: order.farmer_id,
      description: `Payment for ${order.quantity}kg ${order.crop_type} from ${order.farmer_name}`,
      paymentType: 'transaction',
      orderDetails: {
        orderId: order.id,
        cropAmount: order.total_amount,
        commission: platformCommission
      }
    });
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = async (paymentData: any) => {
    try {
      // Create main payment to farmer
      await paymentService.createPayment({
        payee_id: paymentData.recipient,
        amount: paymentData.orderDetails.cropAmount,
        payment_type: 'transaction',
        description: paymentData.description
      });
      
      // Create commission payment to platform
      await paymentService.createPayment({
        payee_id: 'platform',
        amount: paymentData.orderDetails.commission,
        payment_type: 'commission',
        description: `Platform commission for order ${paymentData.orderDetails.orderId}`
      });
      
      // Update order status (mock)
      setPendingOrders(orders => 
        orders.map(order => 
          order.id === paymentData.orderDetails.orderId 
            ? { ...order, status: 'paid' as const }
            : order
        )
      );
      
      // Refresh data
      await fetchBuyerData();
    } catch (error) {
      console.error('Payment failed:', error);
      throw error;
    }
  };

  const getOrderStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'pending_payment':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'paid':
        return <CheckCircleIcon className="h-5 w-5 text-blue-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'pending_payment':
        return 'text-yellow-600 bg-yellow-100';
      case 'paid':
        return 'text-blue-600 bg-blue-100';
      case 'delivered':
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const pendingPaymentOrders = pendingOrders.filter(order => order.status === 'pending_payment');
  const totalPendingAmount = pendingPaymentOrders.reduce((sum, order) => sum + order.total_amount, 0);
  const totalPendingCommission = totalPendingAmount * 0.03;

  return (
    <div className="space-y-6">
      {/* Payment Summary */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Payment Summary</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mx-auto mb-4">
                <ClockIcon className="h-8 w-8 text-yellow-600" />
              </div>
              <p className="text-2xl font-bold text-yellow-600">
                ₹{totalPendingAmount.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">Pending Payments</p>
              <p className="text-xs text-gray-500 mt-1">
                {pendingPaymentOrders.length} orders
              </p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4">
                <CreditCardIcon className="h-8 w-8 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-blue-600">
                ₹{totalPendingCommission.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">Platform Commission</p>
              <p className="text-xs text-gray-500 mt-1">3% of orders</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto mb-4">
                <ShoppingCartIcon className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-green-600">
                ₹{(totalPendingAmount + totalPendingCommission).toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">Total Due</p>
              <p className="text-xs text-gray-500 mt-1">Including commission</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Orders */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Pending Payments</h3>
            {pendingPaymentOrders.length > 0 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                {pendingPaymentOrders.length} orders awaiting payment
              </span>
            )}
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {pendingPaymentOrders.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <CheckCircleIcon className="h-12 w-12 text-green-300 mx-auto mb-4" />
              <p className="text-gray-500">All payments are up to date!</p>
              <p className="text-sm text-gray-400 mt-1">No pending orders require payment</p>
            </div>
          ) : (
            pendingPaymentOrders.map((order) => (
              <div key={order.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-sm font-medium text-gray-900">
                        {order.farmer_name}
                      </h4>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getOrderStatusColor(order.status)}`}>
                        {order.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Crop:</span>
                        <p className="font-medium capitalize">{order.crop_type}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Quantity:</span>
                        <p className="font-medium">{order.quantity}kg</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Rate:</span>
                        <p className="font-medium">₹{order.price_per_kg}/kg</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Delivery:</span>
                        <p className="font-medium">{formatDate(order.delivery_date)}</p>
                      </div>
                    </div>
                    
                    <div className="mt-2 flex items-center justify-between">
                      <div className="text-sm">
                        <span className="text-gray-500">Order Total: </span>
                        <span className="font-semibold text-gray-900">₹{order.total_amount.toLocaleString()}</span>
                        <span className="text-gray-500 ml-2">+ Commission: </span>
                        <span className="font-semibold text-blue-600">₹{(order.total_amount * 0.03).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-2">
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">
                        ₹{(order.total_amount + order.total_amount * 0.03).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">Total Due</p>
                    </div>
                    
                    <button
                      onClick={() => handleOrderPayment(order)}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                    >
                      <CreditCardIcon className="h-4 w-4 mr-2" />
                      Pay Now
                      <ArrowRightIcon className="h-4 w-4 ml-2" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Orders</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {pendingOrders.filter(order => order.status !== 'pending_payment').slice(0, 5).map((order) => (
            <div key={order.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {getOrderStatusIcon(order.status)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{order.farmer_name}</p>
                    <p className="text-sm text-gray-500">
                      {order.quantity}kg {order.crop_type} • {formatDate(order.order_date)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    ₹{order.total_amount.toLocaleString()}
                  </p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getOrderStatusColor(order.status)}`}>
                    {order.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedPayment && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedPayment(null);
          }}
          onPaymentSubmit={handlePaymentSubmit}
          paymentDetails={selectedPayment}
        />
      )}
    </div>
  );
};

export default BuyerPayments;
