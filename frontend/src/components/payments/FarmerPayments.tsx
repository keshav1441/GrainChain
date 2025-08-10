import React, { useState, useEffect } from 'react';
import { 
  BanknotesIcon, 
  DocumentTextIcon, 
  CreditCardIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import PaymentModal from './PaymentModal';
import { paymentService, LoanApplication, LoanEligibility } from '../../services/paymentService';

interface FarmerPaymentsProps {
  farmerId: string;
}

const FarmerPayments: React.FC<FarmerPaymentsProps> = ({ farmerId }) => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [loanApplications, setLoanApplications] = useState<LoanApplication[]>([]);
  const [loanEligibility, setLoanEligibility] = useState<LoanEligibility | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFarmerData();
  }, [farmerId]);

  const fetchFarmerData = async () => {
    try {
      setLoading(true);
      
      // Fetch loan applications and eligibility
      const [applications, eligibility] = await Promise.all([
        paymentService.getLoanApplications(),
        paymentService.getLoanEligibility()
      ]);
      
      setLoanApplications(applications);
      setLoanEligibility(eligibility);
    } catch (error) {
      console.error('Error fetching farmer data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoanProcessingPayment = (application: LoanApplication) => {
    if (application.processing_fee) {
      setSelectedPayment({
        amount: application.processing_fee,
        recipient: application.financier_id || 'Financier',
        description: `Loan processing fee for ${application.application_id}`,
        paymentType: 'loan_processing'
      });
      setShowPaymentModal(true);
    }
  };

  const handlePaymentSubmit = async (paymentData: any) => {
    try {
      await paymentService.createPayment({
        payee_id: paymentData.recipient,
        amount: paymentData.amount,
        payment_type: paymentData.paymentType,
        description: paymentData.description
      });
      
      // Refresh data after payment
      await fetchFarmerData();
    } catch (error) {
      console.error('Payment failed:', error);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Loan Eligibility Card */}
      {loanEligibility && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Loan Eligibility</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4">
                  <DocumentTextIcon className="h-8 w-8 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-blue-600">{loanEligibility.credit_score}</p>
                <p className="text-sm text-gray-600">Credit Score</p>
                <p className="text-xs text-gray-500 mt-1">({loanEligibility.credit_range})</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto mb-4">
                  <BanknotesIcon className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-green-600">
                  ₹{loanEligibility.max_loan_amount.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">Max Loan Amount</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mx-auto mb-4">
                  <ArrowTrendingUpIcon className="h-8 w-8 text-purple-600" />
                </div>
                <p className="text-2xl font-bold text-purple-600">
                  {loanEligibility.interest_rate_range.min}% - {loanEligibility.interest_rate_range.max}%
                </p>
                <p className="text-sm text-gray-600">Interest Rate</p>
              </div>
            </div>
            
            {loanEligibility.available_products.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-4">Available Loan Products</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {loanEligibility.available_products.map((product, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="font-medium text-gray-900">{product.product_name}</h5>
                        <span className="text-sm font-semibold text-green-600">
                          {product.interest_rate}%
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">{product.description}</p>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>₹{product.min_amount.toLocaleString()} - ₹{product.max_amount.toLocaleString()}</span>
                        <span>{product.tenure_months} months</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Active Loan Applications */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Loan Applications</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {loanApplications.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <DocumentTextIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No loan applications found</p>
              <button className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700">
                Apply for Loan
              </button>
            </div>
          ) : (
            loanApplications.map((application) => (
              <div key={application.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h4 className="text-sm font-medium text-gray-900">
                        {application.application_id}
                      </h4>
                      {getStatusBadge(application.status)}
                    </div>
                    
                    <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
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
                      {application.approved_amount && (
                        <div>
                          <span className="text-gray-500">Approved:</span>
                          <p className="font-medium text-green-600">
                            ₹{application.approved_amount.toLocaleString()}
                          </p>
                        </div>
                      )}
                      {application.interest_rate && (
                        <div>
                          <span className="text-gray-500">Interest Rate:</span>
                          <p className="font-medium">{application.interest_rate}%</p>
                        </div>
                      )}
                    </div>
                    
                    {application.credit_score && (
                      <div className="mt-2 flex items-center space-x-4 text-sm">
                        <span className="text-gray-500">Credit Score: {application.credit_score}</span>
                        <span className="text-gray-500">Risk: {application.risk_assessment}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    {application.status === 'approved' && application.processing_fee && (
                      <button
                        onClick={() => handleLoanProcessingPayment(application)}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700"
                      >
                        <CreditCardIcon className="h-4 w-4 mr-1" />
                        Pay Processing Fee
                      </button>
                    )}
                    
                    {application.status === 'draft' && (
                      <button
                        onClick={() => {/* Handle submit */}}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700"
                      >
                        Submit Application
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Payment Actions */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">
              <BanknotesIcon className="h-5 w-5 text-gray-500 mr-2" />
              <span className="text-sm font-medium text-gray-700">Apply for Loan</span>
            </button>
            
            <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">
              <DocumentTextIcon className="h-5 w-5 text-gray-500 mr-2" />
              <span className="text-sm font-medium text-gray-700">Upload Documents</span>
            </button>
            
            <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">
              <ArrowTrendingUpIcon className="h-5 w-5 text-gray-500 mr-2" />
              <span className="text-sm font-medium text-gray-700">Check Eligibility</span>
            </button>
          </div>
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

export default FarmerPayments;
