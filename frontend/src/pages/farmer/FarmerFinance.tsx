import React, { useState, useEffect } from 'react';
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
import { Button } from '../../components/ui/Button';
import FarmerPayments from '../../components/payments/FarmerPayments';
import { financeApi } from '../../services/api';

// Interfaces to match backend models
interface LoanApplication {
  id: string;
  loan_type: string; // Changed from 'type'
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'disbursed';
  created_at: string; // Changed from 'appliedDate'
  purpose: string;
  interest_rate?: number; // Changed from 'interestRate'
  tenure_months?: number; // Changed from 'tenure'
}

interface LoanProduct {
  id: string;
  loan_name: string;
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

export const FarmerFinance: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'apply' | 'history'>('overview');
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);

  const [eligibility, setEligibility] = useState<LoanEligibility | null>(null);
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [loanProducts, setLoanProducts] = useState<LoanProduct[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [appsRes, eligibilityRes] = await Promise.all([
          financeApi.getMyApplications(),
          financeApi.getCreditScore(), // This now returns eligibility and available products
        ]);

        setApplications(appsRes.data);

        const eligibilityData = eligibilityRes.data;
        setLoanProducts(eligibilityData.available_products || []);
        
        setEligibility({
          eligible: eligibilityData.loan_eligible,
          maxAmount: eligibilityData.max_loan_amount,
          creditScore: eligibilityData.credit_score,
          factors: eligibilityData.recommendations,
          // recommendedAmount is not in the new model, so we remove it or set a default
          recommendedAmount: 0, 
        });

      } catch (error) {
        console.error("Failed to fetch finance data", error);
        toast.error('Failed to load financial data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  const getStatusColor = (status: string) => {
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

  const handleLoanApplication = async (loan: LoanProduct) => {
    // For simplicity, we'll use a prompt. A real app would have a form.
    const amountStr = prompt(`Enter amount to apply for ${loan.loan_name} (Max: ${formatCurrency(loan.max_amount)}):`);
    const purpose = prompt('Enter the purpose for this loan:');

    if (!amountStr || !purpose) {
      toast.error('Application cancelled.');
      return;
    }

    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0 || amount > loan.max_amount) {
      toast.error('Invalid amount entered.');
      return;
    }

    setApplying(true);
    try {
      await financeApi.applyForLoan({
        loan_product_id: loan.id,
        amount,
        purpose,
        tenure_months: parseInt(loan.tenure_months.split('-')[1]), // Example logic
      });
      toast.success(`Successfully applied for ${loan.loan_name}!`);
      // Refresh history
      const appsRes = await financeApi.getMyApplications();
      setApplications(appsRes.data);
      setActiveTab('history');
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || 'Failed to apply for loan.';
      toast.error(errorMsg);
    } finally {
      setApplying(false);
    }
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
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/farmer/dashboard')}
            className="flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Finance Center</h1>
          <p className="mt-2 text-gray-600">
            Manage your loans and financial services
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'overview', label: 'Overview', icon: CurrencyDollarIcon },
              { key: 'apply', label: 'Apply for Loan', icon: DocumentTextIcon },
              { key: 'history', label: 'Application History', icon: ClockIcon },
            ].map((tab) => (
              <button
                key={tab.key}
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

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Eligibility Card */}
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
                        <li key={index} className="flex items-center text-sm text-gray-600">
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

            {/* Payment Component */}
            <FarmerPayments farmerId="farmer-123" />
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {loanProducts.length > 0 ? loanProducts.map((loan) => (
                <div key={loan.id} className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{loan.loan_name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{loan.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Max Amount:</span>
                      <span className="font-medium">{formatCurrency(loan.max_amount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Interest Rate:</span>
                      <span className="font-medium">{loan.interest_rate}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Tenure:</span>
                      <span className="font-medium">{loan.tenure_months}</span>
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    className="w-full"
                    loading={applying}
                    onClick={() => handleLoanApplication(loan)}
                  >
                    Apply Now
                  </Button>
                </div>
              )) : <p>No loan products available at this time.</p>}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Loan Applications</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {applications.length > 0 ? applications.map((app) => (
                <div key={app.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(app.status)}
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{app.loan_type}</h4>
                        <p className="text-sm text-gray-500">{app.purpose}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{formatCurrency(app.amount)}</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(app.status)}`}>
                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Applied Date</p>
                      <p className="font-medium">{new Date(app.created_at).toLocaleDateString()}</p>
                    </div>
                    {app.interest_rate && (
                      <div>
                        <p className="text-gray-500">Interest Rate</p>
                        <p className="font-medium">{app.interest_rate}%</p>
                      </div>
                    )}
                    {app.tenure_months && (
                      <div>
                        <p className="text-gray-500">Tenure</p>
                        <p className="font-medium">{app.tenure_months} months</p>
                      </div>
                    )}
                    <div>
                      <p className="text-gray-500">Application ID</p>
                      <p className="font-medium">#{app.id.slice(-6)}</p>
                    </div>
                  </div>
                </div>
              )) : <p className="p-6 text-gray-500">No applications found.</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
