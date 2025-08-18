import React, { useState, useEffect } from 'react';
import { 
  BanknotesIcon, 
  DocumentTextIcon, 
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import PaymentModal from './PaymentModal';
import { paymentService, LoanApplication } from '../../services/paymentService';

interface FinancierPaymentsProps {
  financierId: string;
}

interface LoanPortfolioStats {
  totalDisbursed: number;
  totalInterestEarned: number;
  activeLoanCount: number;
  defaultedLoanCount: number;
  pendingDisbursements: number;
  monthlyInterestIncome: number;
}

const FinancierPayments: React.FC<FinancierPaymentsProps> = ({ financierId }) => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [loanApplications, setLoanApplications] = useState<LoanApplication[]>([]);
  const [portfolioStats, setPortfolioStats] = useState<LoanPortfolioStats>({
    totalDisbursed: 0,
    totalInterestEarned: 0,
    activeLoanCount: 0,
    defaultedLoanCount: 0,
    pendingDisbursements: 0,
    monthlyInterestIncome: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFinancierData();
  }, [financierId]);

  const fetchFinancierData = async () => {
    try {
      setLoading(true);
      
      // Fetch loan applications
      const applications = await paymentService.getLoanApplications();
      setLoanApplications(applications);
      
      // Mock portfolio stats - would be calculated from actual data
      const mockStats: LoanPortfolioStats = {
        totalDisbursed: 2500000,
        totalInterestEarned: 125000,
        activeLoanCount: 15,
        defaultedLoanCount: 2,
        pendingDisbursements: 3,
        monthlyInterestIncome: 18500
      };
      
      setPortfolioStats(mockStats);
    } catch (error) {
      console.error('Error fetching financier data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoanDisbursement = (application: LoanApplication) => {
    if (application.approved_amount) {
      setSelectedPayment({
        amount: application.approved_amount,
        recipient: application.farmer_id,
        description: `Loan disbursement for ${application.application_id}`,
        paymentType: 'loan_disbursement',
        loanDetails: {
          applicationId: application.application_id,
          loanType: application.loan_type,
          interestRate: application.interest_rate
        }
      });
      setShowPaymentModal(true);
    }
  };

  const handlePaymentSubmit = async (paymentData: any) => {
    try {
      // Process loan disbursement
      await paymentService.disburseLoan(paymentData.loanDetails.applicationId);
      
      // Refresh data after disbursement
      await fetchFinancierData();
    } catch (error) {
      console.error('Disbursement failed:', error);
      throw error;
    }
  };

  const getStatusBadge = (status: string) => {
    const colorClass = paymentService.getLoanStatusColor(status);
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const approvedLoans = loanApplications.filter(app => app.status === 'approved');
  const activeLoans = loanApplications.filter(app => app.status === 'active' || app.status === 'disbursed');
  const underReviewLoans = loanApplications.filter(app => app.status === 'under_review' || app.status === 'submitted');

  return (
    <div className="space-y-6">
      {/* Portfolio Overview */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Loan Portfolio Overview</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4">
                <ArrowTrendingDownIcon className="h-8 w-8 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-blue-600">
                ₹{portfolioStats.totalDisbursed.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">Total Disbursed</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto mb-4">
                <ArrowTrendingUpIcon className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-green-600">
                ₹{portfolioStats.totalInterestEarned.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">Interest Earned</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mx-auto mb-4">
                <DocumentTextIcon className="h-8 w-8 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-purple-600">{portfolioStats.activeLoanCount}</p>
              <p className="text-sm text-gray-600">Active Loans</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mx-auto mb-4">
                <ClockIcon className="h-8 w-8 text-yellow-600" />
              </div>
              <p className="text-2xl font-bold text-yellow-600">{portfolioStats.pendingDisbursements}</p>
              <p className="text-sm text-gray-600">Pending Disbursements</p>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Monthly Interest Income</span>
              <span className="text-lg font-semibold text-green-600">
                ₹{portfolioStats.monthlyInterestIncome.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Disbursements */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Pending Disbursements</h3>
            {approvedLoans.length > 0 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                {approvedLoans.length} loans ready for disbursement
              </span>
            )}
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {approvedLoans.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <CheckCircleIcon className="h-12 w-12 text-green-300 mx-auto mb-4" />
              <p className="text-gray-500">No pending disbursements</p>
              <p className="text-sm text-gray-400 mt-1">All approved loans have been disbursed</p>
            </div>
          ) : (
            approvedLoans.map((application) => (
              <div key={application.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-sm font-medium text-gray-900">
                        {application.application_id}
                      </h4>
                      {getStatusBadge(application.status)}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Loan Type:</span>
                        <p className="font-medium capitalize">
                          {application.loan_type.replace('_', ' ')}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Approved Amount:</span>
                        <p className="font-medium text-green-600">
                          ₹{application.approved_amount?.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Interest Rate:</span>
                        <p className="font-medium">{application.interest_rate}%</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Approval Date:</span>
                        <p className="font-medium">{formatDate(application.approval_date)}</p>
                      </div>
                    </div>
                    
                    <div className="mt-2 flex items-center space-x-4 text-sm">
                      <span className="text-gray-500">
                        Credit Score: <span className="font-medium">{application.credit_score}</span>
                      </span>
                      <span className="text-gray-500">
                        Risk: <span className="font-medium">{application.risk_assessment}</span>
                      </span>
                      {application.processing_fee && (
                        <span className="text-gray-500">
                          Processing Fee: <span className="font-medium">₹{application.processing_fee.toLocaleString()}</span>
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-2">
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">
                        ₹{application.approved_amount?.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">Ready to disburse</p>
                    </div>
                    
                    <button
                      onClick={() => handleLoanDisbursement(application)}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                    >
                      <BanknotesIcon className="h-4 w-4 mr-2" />
                      Disburse Loan
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Loans Under Review */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Applications Under Review</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {underReviewLoans.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <DocumentTextIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No applications under review</p>
            </div>
          ) : (
            underReviewLoans.map((application) => (
              <div key={application.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-sm font-medium text-gray-900">
                        {application.application_id}
                      </h4>
                      {getStatusBadge(application.status)}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Loan Type:</span>
                        <p className="font-medium capitalize">
                          {application.loan_type.replace('_', ' ')}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Requested:</span>
                        <p className="font-medium">₹{application.requested_amount.toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Credit Score:</span>
                        <p className="font-medium">{application.credit_score || 'Pending'}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Applied:</span>
                        <p className="font-medium">{formatDate(application.application_date)}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button className="inline-flex items-center px-3 py-1 border border-green-300 text-xs font-medium rounded text-green-700 bg-green-50 hover:bg-green-100">
                      Approve
                    </button>
                    <button className="inline-flex items-center px-3 py-1 border border-red-300 text-xs font-medium rounded text-red-700 bg-red-50 hover:bg-red-100">
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Active Loans */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Active Loans</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {activeLoans.slice(0, 5).map((application) => (
            <div key={application.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {application.application_id}
                    </p>
                    <p className="text-sm text-gray-500">
                      {application.loan_type.replace('_', ' ')} • Disbursed {formatDate(application.disbursement_date)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    ₹{application.approved_amount?.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">{application.interest_rate}% interest</p>
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

export default FinancierPayments;
