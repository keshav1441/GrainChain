import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { Button } from '../../components/ui/Button';
import { financierApi } from '../../services/api';
import { toast } from 'react-hot-toast';

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
  repayment_period_months?: number;
}

export const ApplicationDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [application, setApplication] = useState<LoanApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadApplication();
    }
  }, [id]);

  const loadApplication = async () => {
    try {
      setLoading(true);
      const response = await financierApi.getApplication(id!);
      setApplication(response.data);
    } catch (error) {
      console.error('Error loading application:', error);
      toast.error('Failed to load application details');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      setActionLoading('approve');
      await financierApi.reviewApplication(id!, {
        decision: 'approve',
        notes: 'Application approved after detailed review'
      });
      toast.success('Application approved successfully');
      loadApplication(); // Refresh data
    } catch (error) {
      console.error('Error approving application:', error);
      toast.error('Failed to approve application');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    try {
      setActionLoading('reject');
      await financierApi.reviewApplication(id!, {
        decision: 'reject',
        notes: 'Application rejected after detailed review'
      });
      toast.success('Application rejected');
      loadApplication(); // Refresh data
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
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'disbursed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading application details...</p>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Application Not Found</h2>
          <p className="text-gray-600 mb-6">The requested loan application could not be found.</p>
          <Link
            to="/financier/dashboard"
            className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg bg-primary-600 text-white hover:bg-primary-700"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/financier/dashboard"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Loan Application Details
              </h1>
              <p className="mt-2 text-gray-600">
                Application ID: {application.application_id}
              </p>
            </div>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}
            >
              {application.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>
        </div>

        {/* Application Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Details */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Application Information</h3>
              </div>
              <div className="px-6 py-4 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Loan Type
                    </label>
                    <p className="text-sm text-gray-900">{application.loan_type}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Requested Amount
                    </label>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatCurrency(application.requested_amount)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Loan Purpose
                    </label>
                    <p className="text-sm text-gray-900">{application.loan_purpose}</p>
                  </div>
                  {application.repayment_period_months && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Repayment Period
                      </label>
                      <p className="text-sm text-gray-900">{application.repayment_period_months} months</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Application Date
                    </label>
                    <p className="text-sm text-gray-900">{formatDate(application.created_at)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Updated
                    </label>
                    <p className="text-sm text-gray-900">{formatDate(application.updated_at)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Farmer Details & Actions */}
          <div className="space-y-6">
            {/* Farmer Information */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <UserIcon className="h-5 w-5 mr-2" />
                  Farmer Details
                </h3>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Farmer Name
                  </label>
                  <p className="text-sm text-gray-900">
                    {application.farmer_name || `Farmer ${application.farmer_id.slice(-6)}`}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <p className="text-sm text-gray-900">
                    {application.farmer_location || 'Not specified'}
                  </p>
                </div>
                {application.farm_size && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Farm Size
                    </label>
                    <p className="text-sm text-gray-900">{application.farm_size}</p>
                  </div>
                )}
                {application.credit_score && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Credit Score
                    </label>
                    <p className={`text-sm font-medium ${
                      application.credit_score >= 750 ? 'text-green-600' :
                      application.credit_score >= 650 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {application.credit_score}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            {(application.status === 'submitted' || application.status === 'under_review') && (
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Actions</h3>
                </div>
                <div className="px-6 py-4 space-y-3">
                  <Button
                    variant="primary"
                    onClick={handleApprove}
                    disabled={actionLoading !== null}
                    className="w-full"
                  >
                    <CheckCircleIcon className="h-4 w-4 mr-2" />
                    {actionLoading === 'approve' ? 'Approving...' : 'Approve Application'}
                  </Button>
                  <Button
                    variant="danger"
                    onClick={handleReject}
                    disabled={actionLoading !== null}
                    className="w-full"
                  >
                    <XCircleIcon className="h-4 w-4 mr-2" />
                    {actionLoading === 'reject' ? 'Rejecting...' : 'Reject Application'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
