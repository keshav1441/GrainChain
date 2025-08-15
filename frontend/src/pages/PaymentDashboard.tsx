import React, { useState, useEffect } from 'react';
import {
  CreditCardIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  DocumentTextIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import PaymentModal from '../components/payments/PaymentModal';
import TransactionHistory from '../components/payments/TransactionHistory';

interface PaymentStats {
  totalIncome: number;
  totalExpenses: number;
  pendingPayments: number;
  completedTransactions: number;
  monthlyIncome: number;
  monthlyExpenses: number;
}

interface QuickPayment {
  id: string;
  recipient: string;
  amount: number;
  description: string;
  paymentType: string;
}

const PaymentDashboard: React.FC = () => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<QuickPayment | null>(null);
  const [stats, setStats] = useState<PaymentStats>({
    totalIncome: 0,
    totalExpenses: 0,
    pendingPayments: 0,
    completedTransactions: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0
  });
  const [quickPayments, setQuickPayments] = useState<QuickPayment[]>([]);
  const [userRole] = useState('farmer'); // Would come from auth context
  const [userId] = useState('user_123'); // Would come from auth context

  useEffect(() => {
    fetchPaymentStats();
    fetchQuickPayments();
  }, []);

  const fetchPaymentStats = async () => {
    try {
      // Remove mock data - implement API call
      setStats({
        totalIncome: 0,
        totalExpenses: 0,
        pendingPayments: 0,
        completedTransactions: 0,
        monthlyIncome: 0,
        monthlyExpenses: 0
      });
    } catch (error) {
      console.error('Error fetching payment stats:', error);
    }
  };

  const fetchQuickPayments = async () => {
    try {
      // Mock quick payment options based on user role
      let mockQuickPayments: QuickPayment[] = [];

      // Remove mock data - use API calls instead
      mockQuickPayments = [];

      setQuickPayments(mockQuickPayments);
    } catch (error) {
      console.error('Error fetching quick payments:', error);
    }
  };

  const handleQuickPayment = (payment: QuickPayment) => {
    setSelectedPayment(payment);
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = async (paymentData: any) => {
    try {
      // Mock payment processing - would be replaced with actual API call
      console.log('Processing payment:', paymentData);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Refresh stats after payment
      await fetchPaymentStats();
      
      alert('Payment processed successfully!');
    } catch (error) {
      console.error('Payment failed:', error);
      alert('Payment failed. Please try again.');
    }
  };

  const getRoleSpecificTitle = () => {
    switch (userRole) {
      case 'farmer':
        return 'Farmer Payment Dashboard';
      case 'buyer':
        return 'Buyer Payment Dashboard';
      case 'financier':
        return 'Financier Payment Dashboard';
      default:
        return 'Payment Dashboard';
    }
  };

  const getRoleSpecificStats = () => {
    switch (userRole) {
      case 'farmer':
        return [
          { label: 'Crop Sales Income', value: `₹${stats.totalIncome.toLocaleString()}`, icon: ArrowTrendingUpIcon, color: 'text-green-600' },
          { label: 'Loan & Fees Paid', value: `₹${stats.totalExpenses.toLocaleString()}`, icon: ArrowTrendingDownIcon, color: 'text-red-600' },
          { label: 'Pending Payments', value: stats.pendingPayments.toString(), icon: DocumentTextIcon, color: 'text-yellow-600' },
          { label: 'Completed Transactions', value: stats.completedTransactions.toString(), icon: ChartBarIcon, color: 'text-blue-600' }
        ];
      case 'buyer':
        return [
          { label: 'Total Purchases', value: `₹${stats.totalExpenses.toLocaleString()}`, icon: ArrowTrendingDownIcon, color: 'text-red-600' },
          { label: 'Commission Earned', value: `₹${stats.totalIncome.toLocaleString()}`, icon: ArrowTrendingUpIcon, color: 'text-green-600' },
          { label: 'Pending Payments', value: stats.pendingPayments.toString(), icon: DocumentTextIcon, color: 'text-yellow-600' },
          { label: 'Completed Orders', value: stats.completedTransactions.toString(), icon: ChartBarIcon, color: 'text-blue-600' }
        ];
      case 'financier':
        return [
          { label: 'Loans Disbursed', value: `₹${stats.totalExpenses.toLocaleString()}`, icon: ArrowTrendingDownIcon, color: 'text-red-600' },
          { label: 'Interest & Fees Earned', value: `₹${stats.totalIncome.toLocaleString()}`, icon: ArrowTrendingUpIcon, color: 'text-green-600' },
          { label: 'Pending Disbursements', value: stats.pendingPayments.toString(), icon: DocumentTextIcon, color: 'text-yellow-600' },
          { label: 'Active Loans', value: stats.completedTransactions.toString(), icon: ChartBarIcon, color: 'text-blue-600' }
        ];
      default:
        return [];
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{getRoleSpecificTitle()}</h1>
          <p className="mt-2 text-gray-600">
            Manage your payments, view transaction history, and track financial activity
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {getRoleSpecificStats().map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className={`text-2xl font-semibold ${stat.color}`}>{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Quick Payments */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Quick Payments</h3>
              </div>
              <div className="p-6">
                {quickPayments.length === 0 ? (
                  <div className="text-center py-8">
                    <CreditCardIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No quick payments available</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {quickPayments.map((payment) => (
                      <div
                        key={payment.id}
                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleQuickPayment(payment)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {payment.recipient}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {payment.description}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-green-600">
                              ₹{payment.amount.toLocaleString()}
                            </p>
                            <button className="mt-1 inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200">
                              <PlusIcon className="h-3 w-3 mr-1" />
                              Pay Now
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Monthly Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">This Month's Summary</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto mb-4">
                      <ArrowTrendingUpIcon className="h-8 w-8 text-green-600" />
                    </div>
                    <p className="text-2xl font-bold text-green-600">
                      ₹{stats.monthlyIncome.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      {userRole === 'farmer' ? 'Monthly Income' : 
                       userRole === 'buyer' ? 'Monthly Savings' : 'Monthly Interest Earned'}
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
                      <ArrowTrendingDownIcon className="h-8 w-8 text-red-600" />
                    </div>
                    <p className="text-2xl font-bold text-red-600">
                      ₹{stats.monthlyExpenses.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      {userRole === 'farmer' ? 'Monthly Expenses' : 
                       userRole === 'buyer' ? 'Monthly Purchases' : 'Monthly Disbursements'}
                    </p>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Net Monthly Flow</span>
                    <span className={`text-lg font-semibold ${
                      stats.monthlyIncome - stats.monthlyExpenses >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stats.monthlyIncome - stats.monthlyExpenses >= 0 ? '+' : ''}
                      ₹{(stats.monthlyIncome - stats.monthlyExpenses).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <TransactionHistory userId={userId} userRole={userRole} />

        {/* Payment Modal */}
        {showPaymentModal && selectedPayment && (
          <PaymentModal
            isOpen={showPaymentModal}
            onClose={() => {
              setShowPaymentModal(false);
              setSelectedPayment(null);
            }}
            onPaymentSubmit={handlePaymentSubmit}
            paymentDetails={{
              amount: selectedPayment.amount,
              recipient: selectedPayment.recipient,
              description: selectedPayment.description,
              paymentType: selectedPayment.paymentType
            }}
          />
        )}
      </div>
    </div>
  );
};

export default PaymentDashboard;
