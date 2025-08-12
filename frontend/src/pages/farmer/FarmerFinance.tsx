import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  ArrowLeftIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { LoanApplicationModal } from '../../components/finance/LoanApplicationModal';
import { financeApi } from '../../services/api';

// Interfaces to match backend models
interface LoanApplication {
  id: string;
  application_id: string;
  loan_type: string;
  requested_amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'disbursed';
  created_at: string;
  purpose: string;
  interest_rate?: number;
  tenure_months?: number;
}

interface LoanProduct {
  id: string;
  loan_name: string;
  loan_type: string;

  description: string;
  min_amount: number;
  max_amount: number;
  interest_rate: string;
  tenure_months: string;
  eligibility_criteria: string;
}

interface LoanEligibility {
  eligible: boolean;
  maxAmount: number;
  recommendedAmount: number;
  creditScore: number;
  factors: string[];
}

export const FarmerFinance = (): JSX.Element => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'apply' | 'history'>('overview');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<LoanProduct | null>(null);

  const [eligibility, setEligibility] = useState<LoanEligibility | null>(null);
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [loanProducts, setLoanProducts] = useState<LoanProduct[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [appsRes, eligibilityRes] = await Promise.all([
        financeApi.getMyApplications(),
        financeApi.getCreditScore(),
      ]);

      setApplications(appsRes.data);

      const eligibilityData = eligibilityRes.data;
      const products = eligibilityData.available_products.map((p: any) => ({
        ...p,
        loan_name: p.product_name,
        product_type: p.product_type, // Explicitly map product_type
      })) || [];
      setLoanProducts(products);
      
      setEligibility({
        eligible: eligibilityData.loan_eligible,
        maxAmount: eligibilityData.max_loan_amount,
        creditScore: eligibilityData.credit_score,
        factors: eligibilityData.recommendations,
        recommendedAmount: 0, // Placeholder, adjust if available from API
      });

    } catch (error) {
      console.error("Failed to fetch finance data", error);
      if ((error as any)?.response?.status !== 401) {
        toast.error('Failed to load financial data.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
      case 'disbursed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'rejected':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <InformationCircleIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getLoanStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
      case 'disbursed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleApplyClick = (loan: LoanProduct) => {
    console.log('Selected Loan Product:', loan);
    setSelectedLoan(loan);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedLoan(null);
  };

  const handleApplicationSuccess = () => {
    handleModalClose();
    toast.success('Loan application submitted successfully!');
    fetchData().then(() => {
      setActiveTab('history');
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <p className="text-lg font-medium text-gray-700">Loading Financial Center...</p>
          <p className="text-sm text-gray-500">Please wait a moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <button
            onClick={() => navigate('/farmer/dashboard')}
            className="flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Finance Center</h1>
          <p className="mt-2 text-gray-600">Manage your loans and financial services</p>
        </div>

        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'overview', label: 'Overview', icon: CurrencyDollarIcon },
              { key: 'apply', label: 'Apply for Loan', icon: DocumentTextIcon },
              { key: 'history', label: 'Application History', icon: ClockIcon },
            ].map((tab) => (
              <button
                key={`tab-${tab.key}`}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-5 w-5 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Loan Eligibility</h3>
              {eligibility ? (
                <>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium inline-block mb-4 ${
                    eligibility.eligible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {eligibility.eligible ? 'Eligible' : 'Not Eligible'}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <p className="text-sm text-gray-500">Credit Score</p>
                      <p className="text-2xl font-bold text-gray-900">{eligibility.creditScore}</p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${(eligibility.creditScore / 850) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Max Loan Amount</p>
                      <p className="text-2xl font-bold text-gray-900">{formatCurrency(eligibility.maxAmount)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Recommended Amount</p>
                      <p className="text-2xl font-bold text-primary-600">{formatCurrency(eligibility.recommendedAmount)}</p>
                    </div>
                  </div>
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Eligibility Factors</h4>
                    <ul className="space-y-1">
                      {eligibility.factors.map((factor, index) => (
                        <li key={`factor-${index}`} className="flex items-center text-sm text-gray-600">
                          <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                          {factor}
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              ) : (
                <p>Could not load eligibility data.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'apply' && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <InformationCircleIcon className="h-5 w-5 text-blue-500 mt-0.5 mr-2" />
                <div>
                  <h4 className="text-sm font-medium text-blue-900">Before You Apply</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Ensure you have all required documents ready: Aadhaar, PAN, land records, 
                    bank statements, and crop insurance details.
                  </p>
                </div>
              </div>
            </div>
            {loanProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loanProducts.map((product) => (
                  <div key={product.id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
                    <h4 className="text-lg font-semibold text-gray-800">{product.loan_name}</h4>
                    <p className="text-sm text-gray-600 mt-2">{product.description}</p>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-700"><strong>Interest Rate:</strong> {product.interest_rate}</p>
                      <p className="text-sm text-gray-700"><strong>Amount:</strong> {formatCurrency(product.min_amount)} - {formatCurrency(product.max_amount)}</p>
                      <p className="text-sm text-gray-700"><strong>Tenure:</strong> {product.tenure_months} months</p>
                    </div>
                    <button
                      onClick={() => handleApplyClick(product)}
                      className="mt-6 w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                    >
                      Apply Now
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No loan products available at the moment.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Application History</h3>
            <div className="space-y-4">
              {applications.length > 0 ? applications.map((application) => (
                <div key={application.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(application.status)}
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{application.loan_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h4>
                        <p className="text-sm text-gray-500">{application.purpose}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{formatCurrency(application.requested_amount)}</p>
                      <p className={`text-xs font-semibold px-2 py-1 rounded-full inline-block mt-1 ${getLoanStatusColor(application.status)}`}>
                        {application.status}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Application Date</span>
                      <span>{new Date(application.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span>Interest Rate</span>
                      <span>{application.interest_rate ? `${application.interest_rate}%` : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span>Tenure</span>
                      <span>{application.tenure_months ? `${application.tenure_months} months` : 'N/A'}</span>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">You have no loan applications.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {selectedLoan && (
        <LoanApplicationModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          loanProduct={selectedLoan}
          onApplicationSuccess={handleApplicationSuccess}
        />
      )}
    </div>
  );
};