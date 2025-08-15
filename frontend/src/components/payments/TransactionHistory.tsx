import React, { useState, useEffect } from 'react';
import { 
  ArrowUpIcon, 
  ArrowDownIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

interface Transaction {
  id: string;
  payment_id: string;
  amount: number;
  currency: string;
  payment_type: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  payer_user_id: string;
  payee_user_id: string;
  description: string;
  initiated_at: string;
  completed_at?: string;
  failed_at?: string;
  gateway_provider?: string;
}

interface TransactionHistoryProps {
  userId: string;
  userRole: string;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ userId }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');

  useEffect(() => {
    fetchTransactions();
  }, [userId]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      // Remove mock data - implement API call
      setTransactions([]);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'processing':
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      case 'processing':
        return 'text-yellow-600 bg-yellow-100';
      case 'pending':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getTransactionDirection = (transaction: Transaction) => {
    const isIncoming = transaction.payee_user_id === userId;
    return isIncoming ? 'incoming' : 'outgoing';
  };

  const getTransactionIcon = (transaction: Transaction) => {
    const direction = getTransactionDirection(transaction);
    return direction === 'incoming' ? (
      <ArrowDownIcon className="h-4 w-4 text-green-600" />
    ) : (
      <ArrowUpIcon className="h-4 w-4 text-red-600" />
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPaymentType = (type: string) => {
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesFilter = filter === 'all' || 
      (filter === 'incoming' && getTransactionDirection(transaction) === 'incoming') ||
      (filter === 'outgoing' && getTransactionDirection(transaction) === 'outgoing') ||
      (filter === transaction.status) ||
      (filter === transaction.payment_type);

    const matchesSearch = searchTerm === '' || 
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.payment_id.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    switch (sortBy) {
      case 'amount':
        return b.amount - a.amount;
      case 'date':
      default:
        return new Date(b.initiated_at).getTime() - new Date(a.initiated_at).getTime();
    }
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Transaction History</h3>
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-green-500 focus:border-green-500"
              />
            </div>

            {/* Filter */}
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-green-500 focus:border-green-500"
            >
              <option value="all">All Transactions</option>
              <option value="incoming">Incoming</option>
              <option value="outgoing">Outgoing</option>
              <option value="completed">Completed</option>
              <option value="processing">Processing</option>
              <option value="failed">Failed</option>
              <option value="transaction">Crop Payments</option>
              <option value="loan_disbursement">Loan Disbursements</option>
              <option value="loan_processing">Loan Fees</option>
              <option value="commission">Commission</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-green-500 focus:border-green-500"
            >
              <option value="date">Sort by Date</option>
              <option value="amount">Sort by Amount</option>
            </select>
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {sortedTransactions.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="text-gray-500">
              <ClockIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No transactions found</p>
              <p className="text-sm">Try adjusting your filters or search terms</p>
            </div>
          </div>
        ) : (
          sortedTransactions.map((transaction) => {
            const direction = getTransactionDirection(transaction);
            const isIncoming = direction === 'incoming';

            return (
              <div key={transaction.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full">
                        {getTransactionIcon(transaction)}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {transaction.description}
                        </p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                          {transaction.status}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-4 mt-1">
                        <p className="text-xs text-gray-500">
                          {transaction.payment_id}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatPaymentType(transaction.payment_type)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(transaction.initiated_at)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className={`text-sm font-semibold ${isIncoming ? 'text-green-600' : 'text-red-600'}`}>
                        {isIncoming ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                      </p>
                      {transaction.gateway_provider && (
                        <p className="text-xs text-gray-500 capitalize">
                          via {transaction.gateway_provider}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex-shrink-0">
                      {getStatusIcon(transaction.status)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Summary */}
      {sortedTransactions.length > 0 && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">
              Showing {sortedTransactions.length} of {transactions.length} transactions
            </span>
            <div className="flex space-x-6">
              <span className="text-green-600">
                Income: ₹{sortedTransactions
                  .filter(t => getTransactionDirection(t) === 'incoming' && t.status === 'completed')
                  .reduce((sum, t) => sum + t.amount, 0)
                  .toLocaleString()}
              </span>
              <span className="text-red-600">
                Expenses: ₹{sortedTransactions
                  .filter(t => getTransactionDirection(t) === 'outgoing' && t.status === 'completed')
                  .reduce((sum, t) => sum + t.amount, 0)
                  .toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;
