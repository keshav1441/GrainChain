import React, { useState } from 'react';
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

interface LoanApplication {
  id: string;
  type: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'disbursed';
  appliedDate: string;
  purpose: string;
  interestRate?: number;
  tenure?: number;
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
  const [loading, setLoading] = useState(false);

  // Mock data
  const eligibility: LoanEligibility = {
    eligible: true,
    maxAmount: 500000,
    recommendedAmount: 300000,
    creditScore: 720,
    factors: [
      'Good payment history',
      'Consistent crop yields',
      'Diversified crop portfolio',
      'Strong market presence'
    ]
  };

  const applications: LoanApplication[] = [
    {
      id: '1',
      type: 'Crop Loan',
      amount: 250000,
      status: 'approved',
      appliedDate: '2024-01-15',
      purpose: 'Wheat cultivation for upcoming season',
      interestRate: 7.5,
      tenure: 12
    },
    {
      id: '2',
      type: 'Equipment Loan',
      amount: 150000,
      status: 'pending',
      appliedDate: '2024-01-20',
      purpose: 'Purchase of new tractor'
    },
    {
      id: '3',
      type: 'Working Capital',
      amount: 100000,
      status: 'disbursed',
      appliedDate: '2023-12-10',
      purpose: 'Operational expenses',
      interestRate: 8.0,
      tenure: 6
    }
  ];

  const loanTypes = [
    {
      type: 'Crop Loan',
      description: 'Short-term loans for crop cultivation expenses',
      maxAmount: 300000,
      interestRate: '7.5% - 9.0%',
      tenure: '6-12 months'
    },
    {
      type: 'Equipment Loan',
      description: 'Loans for purchasing farming equipment and machinery',
      maxAmount: 1000000,
      interestRate: '8.0% - 10.5%',
      tenure: '2-7 years'
    },
    {
      type: 'Working Capital',
      description: 'Loans for day-to-day operational expenses',
      maxAmount: 200000,
      interestRate: '8.5% - 11.0%',
      tenure: '3-12 months'
    },
    {
      type: 'Kisan Credit Card',
      description: 'Flexible credit facility for agricultural needs',
      maxAmount: 500000,
      interestRate: '7.0% - 8.5%',
      tenure: 'Revolving credit'
    }
  ];

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

  const handleLoanApplication = async (loanType: string) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success(`${loanType} application submitted successfully!`);
      setActiveTab('history');
    } catch (error) {
      toast.error('Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Loan Eligibility</h3>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  eligibility.eligible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {eligibility.eligible ? 'Eligible' : 'Not Eligible'}
                </div>
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
              {loanTypes.map((loan) => (
                <div key={loan.type} className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{loan.type}</h3>
                  <p className="text-gray-600 text-sm mb-4">{loan.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Max Amount:</span>
                      <span className="font-medium">{formatCurrency(loan.maxAmount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Interest Rate:</span>
                      <span className="font-medium">{loan.interestRate}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Tenure:</span>
                      <span className="font-medium">{loan.tenure}</span>
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    className="w-full"
                    loading={loading}
                    onClick={() => handleLoanApplication(loan.type)}
                  >
                    Apply Now
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Loan Applications</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {applications.map((app) => (
                <div key={app.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(app.status)}
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{app.type}</h4>
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
                      <p className="font-medium">{new Date(app.appliedDate).toLocaleDateString()}</p>
                    </div>
                    {app.interestRate && (
                      <div>
                        <p className="text-gray-500">Interest Rate</p>
                        <p className="font-medium">{app.interestRate}%</p>
                      </div>
                    )}
                    {app.tenure && (
                      <div>
                        <p className="text-gray-500">Tenure</p>
                        <p className="font-medium">{app.tenure} months</p>
                      </div>
                    )}
                    <div>
                      <p className="text-gray-500">Application ID</p>
                      <p className="font-medium">#{app.id}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
