import React from 'react';
import { Link } from 'react-router-dom';
import {
  CurrencyDollarIcon,
  DocumentTextIcon,
  UserGroupIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { Button } from '../../components/ui/Button';

export const FinancierDashboard: React.FC = () => {
  const stats = [
    {
      name: 'Active Loans',
      value: '₹2.5 Cr',
      change: '+12% this month',
      changeType: 'positive',
      icon: CurrencyDollarIcon,
    },
    {
      name: 'Loan Applications',
      value: '45',
      change: '8 pending review',
      changeType: 'neutral',
      icon: DocumentTextIcon,
    },
    {
      name: 'Active Farmers',
      value: '234',
      change: '+18 new this month',
      changeType: 'positive',
      icon: UserGroupIcon,
    },
    {
      name: 'Default Rate',
      value: '2.1%',
      change: '-0.3% from last month',
      changeType: 'positive',
      icon: ChartBarIcon,
    },
  ];

  const pendingApplications = [
    {
      id: 1,
      farmer: 'Rajesh Kumar',
      location: 'Punjab',
      loanType: 'Crop Loan',
      requestedAmount: '₹5,00,000',
      purpose: 'Wheat cultivation',
      creditScore: 720,
      farmSize: '15 acres',
      submittedDate: '2024-04-08',
      status: 'Under Review',
    },
    {
      id: 2,
      farmer: 'Priya Sharma',
      location: 'Haryana',
      loanType: 'Equipment Loan',
      requestedAmount: '₹8,50,000',
      purpose: 'Tractor purchase',
      creditScore: 680,
      farmSize: '25 acres',
      submittedDate: '2024-04-07',
      status: 'Documentation Pending',
    },
    {
      id: 3,
      farmer: 'Amit Patel',
      location: 'Gujarat',
      loanType: 'Working Capital',
      requestedAmount: '₹3,00,000',
      purpose: 'Seasonal expenses',
      creditScore: 750,
      farmSize: '10 acres',
      submittedDate: '2024-04-06',
      status: 'Ready for Approval',
    },
  ];

  const recentDisbursements = [
    {
      id: 1,
      farmer: 'Suresh Singh',
      amount: '₹4,50,000',
      loanType: 'Crop Loan',
      disbursedDate: '2024-04-05',
      tenure: '12 months',
      interestRate: '9.5%',
      status: 'Active',
    },
    {
      id: 2,
      farmer: 'Meera Devi',
      amount: '₹6,00,000',
      loanType: 'Equipment Loan',
      disbursedDate: '2024-04-03',
      tenure: '36 months',
      interestRate: '11.2%',
      status: 'Active',
    },
  ];

  const getCreditScoreColor = (score: number) => {
    if (score >= 750) return 'text-green-600 bg-green-100';
    if (score >= 650) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Financier Dashboard
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Manage loan applications and support farmers with financial solutions.
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <Button as={Link} to="/financier/products" variant="primary">
              <DocumentTextIcon className="h-5 w-5 mr-2" />
              Manage Products
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-8">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((item) => (
              <div
                key={item.name}
                className="relative bg-white pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden"
              >
                <dt>
                  <div className="absolute bg-yellow-500 rounded-md p-3">
                    <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  <p className="ml-16 text-sm font-medium text-gray-500 truncate">
                    {item.name}
                  </p>
                </dt>
                <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
                  <p className="text-2xl font-semibold text-gray-900">{item.value}</p>
                  <p
                    className={`ml-2 flex items-baseline text-sm font-semibold ${
                      item.changeType === 'positive'
                        ? 'text-green-600'
                        : item.changeType === 'negative'
                        ? 'text-red-600'
                        : 'text-gray-500'
                    }`}
                  >
                    {item.change}
                  </p>
                </dd>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="mt-8 grid grid-cols-1 gap-8 xl:grid-cols-3">
          {/* Pending Applications */}
          <div className="xl:col-span-2">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Pending Loan Applications
                  </h3>
                  <Link
                    to="/financier/applications"
                    className="text-sm text-primary-600 hover:text-primary-500"
                  >
                    View all
                  </Link>
                </div>
                <div className="space-y-4">
                  {pendingApplications.map((application) => (
                    <div
                      key={application.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="text-lg font-medium text-gray-900">
                              {application.farmer}
                            </h4>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCreditScoreColor(
                                application.creditScore
                              )}`}
                            >
                              Credit: {application.creditScore}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">
                            {application.loanType} • {application.location}
                          </p>
                          <p className="text-sm text-gray-600 mb-1">
                            Farm Size: {application.farmSize} • Purpose: {application.purpose}
                          </p>
                          <p className="text-sm text-gray-600 mb-2">
                            Submitted: {application.submittedDate}
                          </p>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-lg font-semibold text-gray-900">
                                {application.requestedAmount}
                              </p>
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  application.status === 'Ready for Approval'
                                    ? 'bg-green-100 text-green-800'
                                    : application.status === 'Under Review'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}
                              >
                                {application.status}
                              </span>
                            </div>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm">
                                View Details
                              </Button>
                              {application.status === 'Ready for Approval' && (
                                <>
                                  <Button variant="primary" size="sm">
                                    <CheckCircleIcon className="h-4 w-4 mr-1" />
                                    Approve
                                  </Button>
                                  <Button variant="danger" size="sm">
                                    <XCircleIcon className="h-4 w-4 mr-1" />
                                    Reject
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Disbursements */}
          <div className="xl:col-span-1">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Recent Disbursements
                  </h3>
                  <Link
                    to="/financier/loans"
                    className="text-sm text-primary-600 hover:text-primary-500"
                  >
                    View all
                  </Link>
                </div>
                <div className="space-y-4">
                  {recentDisbursements.map((loan) => (
                    <div
                      key={loan.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-900">
                          {loan.farmer}
                        </h4>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {loan.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        {loan.loanType}
                      </p>
                      <p className="text-sm font-medium text-gray-900 mb-1">
                        {loan.amount}
                      </p>
                      <p className="text-sm text-gray-600 mb-1">
                        Rate: {loan.interestRate} • Tenure: {loan.tenure}
                      </p>
                      <div className="flex items-center text-xs text-gray-500">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        Disbursed: {loan.disbursedDate}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Button as={Link} to="/financier/applications" variant="outline" className="justify-start">
                <DocumentTextIcon className="h-5 w-5 mr-2" />
                Review Applications
              </Button>
              <Button as={Link} to="/financier/farmers" variant="outline" className="justify-start">
                <UserGroupIcon className="h-5 w-5 mr-2" />
                Find Farmers
              </Button>
              <Button as={Link} to="/financier/analytics" variant="outline" className="justify-start">
                <ChartBarIcon className="h-5 w-5 mr-2" />
                View Analytics
              </Button>
              <Button as={Link} to="/financier/products" variant="outline" className="justify-start">
                <CurrencyDollarIcon className="h-5 w-5 mr-2" />
                Loan Products
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
