import React, { useState, useEffect } from 'react';
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
import { financierApi } from '../../services/api';
import { toast } from 'react-hot-toast';

interface DashboardStats {
  active_loans_value: number;
  active_loans_count: number;
  loan_applications_count: number;
  pending_applications_count: number;
  active_farmers_count: number;
  new_farmers_this_month: number;
  default_rate: number;
  default_rate_change: number;
}

interface LoanApplication {
  application_id: string;
  farmer_id: string;
  loan_type: string;
  requested_amount: number;
  loan_purpose: string;
  status: string;
  created_at: string;
  updated_at: string;
  farmer_name?: string;
  farmer_location?: string;
  credit_score?: number;
  farm_size?: string;
}

export const FinancierDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [pendingApplications, setPendingApplications] = useState<LoanApplication[]>([]);
  const [recentDisbursements, setRecentDisbursements] = useState<LoanApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsResponse, pendingResponse, disbursementsResponse] = await Promise.all([
        financierApi.getDashboardStats(),
        financierApi.getPendingApplications({ limit: 10 }),
        financierApi.getRecentDisbursements({ limit: 5 })
      ]);

      setStats(statsResponse.data);
      setPendingApplications(pendingResponse.data);
      setRecentDisbursements(disbursementsResponse.data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveApplication = async (applicationId: string) => {
    try {
      setActionLoading(applicationId);
      await financierApi.reviewApplication(applicationId, {
        decision: 'approve',
        notes: 'Application approved from dashboard'
      });
      toast.success('Application approved successfully');
      loadDashboardData(); // Refresh data
    } catch (error) {
      console.error('Error approving application:', error);
      toast.error('Failed to approve application');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectApplication = async (applicationId: string) => {
    try {
      setActionLoading(applicationId);
      await financierApi.reviewApplication(applicationId, {
        decision: 'reject',
        notes: 'Application rejected from dashboard'
      });
      toast.success('Application rejected');
      loadDashboardData(); // Refresh data
    } catch (error) {
      console.error('Error rejecting application:', error);
      toast.error('Failed to reject application');
    } finally {
      setActionLoading(null);
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(1)} Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)} L`;
    } else {
      return `₹${amount.toLocaleString()}`;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'submitted':
      case 'ready for approval':
        return 'bg-green-100 text-green-800';
      case 'under_review':
      case 'under review':
        return 'bg-blue-100 text-blue-800';
      case 'documentation_pending':
      case 'documentation pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'disbursed':
      case 'active':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const dashboardStats = stats ? [
    {
      name: 'Active Loans',
      value: formatCurrency(stats.active_loans_value),
      change: `${stats.active_loans_count} loans active`,
      changeType: 'neutral',
      icon: CurrencyDollarIcon,
    },
    {
      name: 'Loan Applications',
      value: stats.loan_applications_count.toString(),
      change: `${stats.pending_applications_count} pending review`,
      changeType: 'neutral',
      icon: DocumentTextIcon,
    },
    {
      name: 'Active Farmers',
      value: stats.active_farmers_count.toString(),
      change: `+${stats.new_farmers_this_month} new this month`,
      changeType: 'positive',
      icon: UserGroupIcon,
    },
    {
      name: 'Default Rate',
      value: `${stats.default_rate}%`,
      change: `${stats.default_rate_change > 0 ? '+' : ''}${stats.default_rate_change}% from last month`,
      changeType: stats.default_rate_change < 0 ? 'positive' : 'negative',
      icon: ChartBarIcon,
    },
  ] : [];


  const getCreditScoreColor = (score?: number) => {
    if (!score) return 'text-gray-600 bg-gray-100';
    if (score >= 750) return 'text-green-600 bg-green-100';
    if (score >= 650) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

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
            <Link 
              to="/financier/products" 
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg bg-primary-600 text-white hover:bg-primary-700 focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
            >
              <DocumentTextIcon className="h-5 w-5 mr-2" />
              Manage Products
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-8">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {dashboardStats.map((item) => (
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
                  {pendingApplications.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <DocumentTextIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No pending applications</p>
                    </div>
                  ) : (
                    pendingApplications.map((application) => (
                      <div
                        key={application.application_id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="text-lg font-medium text-gray-900">
                                {application.farmer_name || `Farmer ${application.farmer_id.slice(-6)}`}
                              </h4>
                              {application.credit_score && (
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCreditScoreColor(
                                    application.credit_score
                                  )}`}
                                >
                                  Credit: {application.credit_score}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-1">
                              {application.loan_type} • {application.farmer_location || 'Location not specified'}
                            </p>
                            <p className="text-sm text-gray-600 mb-1">
                              {application.farm_size && `Farm Size: ${application.farm_size} • `}Purpose: {application.loan_purpose}
                            </p>
                            <p className="text-sm text-gray-600 mb-2">
                              Submitted: {formatDate(application.created_at)}
                            </p>
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-lg font-semibold text-gray-900">
                                  {formatCurrency(application.requested_amount)}
                                </p>
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}
                                >
                                  {application.status.replace('_', ' ')}
                                </span>
                              </div>
                              <div className="flex space-x-2">
                                <Link 
                                  to={`/financier/applications/${application.application_id}`}
                                  className="inline-flex items-center justify-center px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                                >
                                  View Details
                                </Link>
                                {(application.status === 'submitted' || application.status === 'Ready for Approval') && (
                                  <>
                                    <Button 
                                      variant="primary" 
                                      size="sm"
                                      onClick={() => handleApproveApplication(application.application_id)}
                                      disabled={actionLoading === application.application_id}
                                    >
                                      <CheckCircleIcon className="h-4 w-4 mr-1" />
                                      {actionLoading === application.application_id ? 'Processing...' : 'Approve'}
                                    </Button>
                                    <Button 
                                      variant="danger" 
                                      size="sm"
                                      onClick={() => handleRejectApplication(application.application_id)}
                                      disabled={actionLoading === application.application_id}
                                    >
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
                    ))
                  )}
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
                  {recentDisbursements.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <CurrencyDollarIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No recent disbursements</p>
                    </div>
                  ) : (
                    recentDisbursements.map((loan) => (
                      <div
                        key={loan.application_id}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium text-gray-900">
                            {loan.farmer_name || `Farmer ${loan.farmer_id.slice(-6)}`}
                          </h4>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Active
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          {loan.loan_type}
                        </p>
                        <p className="text-sm font-medium text-gray-900 mb-1">
                          {formatCurrency(loan.requested_amount)}
                        </p>
                        <p className="text-sm text-gray-600 mb-1">
                          Purpose: {loan.loan_purpose}
                        </p>
                        <div className="flex items-center text-xs text-gray-500">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          Disbursed: {formatDate(loan.updated_at)}
                        </div>
                      </div>
                    ))
                  )}
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
              <Link to="/financier/applications" className="inline-flex items-center justify-start px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors">
                <DocumentTextIcon className="h-5 w-5 mr-2" />
                Review Applications
              </Link>
              <Link to="/financier/farmers" className="inline-flex items-center justify-start px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors">
                <UserGroupIcon className="h-5 w-5 mr-2" />
                Find Farmers
              </Link>
              <Link to="/financier/analytics" className="inline-flex items-center justify-start px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors">
                <ChartBarIcon className="h-5 w-5 mr-2" />
                View Analytics
              </Link>
              <Link to="/financier/products" className="inline-flex items-center justify-start px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors">
                <CurrencyDollarIcon className="h-5 w-5 mr-2" />
                Loan Products
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
