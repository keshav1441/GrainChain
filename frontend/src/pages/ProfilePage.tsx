import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { EditProfileModal } from '../components/profile/EditProfileModal';
import { VerificationModal } from '../components/profile/VerificationModal';
import {
  UserCircleIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

export const ProfilePage: React.FC = () => {
  const { user, token } = useAuthStore();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<any>(null);

  useEffect(() => {
    if (user && user.role !== 'buyer' && token) {
      fetchVerificationStatus();
    }
  }, [user, token]);

  const fetchVerificationStatus = async () => {
    try {
      console.log('Fetching verification status with token:', token ? 'Present' : 'Missing');
      
      if (!token) {
        console.warn('No authentication token available');
        return;
      }
      
      const response = await fetch('http://localhost:8000/api/v1/users/verification/status', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      console.log('Verification status response status:', response.status);
      
      if (response.ok) {
        const status = await response.json();
        console.log('Verification status data:', status);
        setVerificationStatus(status);
      } else {
        const errorText = await response.text();
        console.error('Verification status error:', response.status, errorText);
      }
    } catch (err) {
      console.error('Error fetching verification status:', err);
    }
  };

  const handleProfileUpdate = () => {
    // Refresh user data and verification status
    const { initializeAuth } = useAuthStore.getState();
    initializeAuth(); // This will fetch fresh user data from /api/v1/auth/me
    fetchVerificationStatus();
  };

  const handleVerificationSuccess = () => {
    // Refresh verification status
    fetchVerificationStatus();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  const getVerificationStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'farmer':
        return 'Farmer';
      case 'buyer':
        return 'Buyer';
      case 'financier':
        return 'Financier';
      default:
        return 'User';
    }
  };

  const renderVerificationNotice = () => {
    if (user.role === 'buyer') return null;

    if (!verificationStatus) {
      return (
        <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <ClockIcon className="h-5 w-5 text-gray-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-gray-800">
                Loading Verification Status...
              </h3>
            </div>
          </div>
        </div>
      );
    }

    const { status, message, submitted_at } = verificationStatus;

    const noticeConfig: { [key: string]: any } = {
      not_submitted: {
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        iconColor: 'text-blue-400',
        titleColor: 'text-blue-800',
        textColor: 'text-blue-700',
        icon: ExclamationTriangleIcon,
        showButton: true,
      },
      submitted: {
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        iconColor: 'text-yellow-400',
        titleColor: 'text-yellow-800',
        textColor: 'text-yellow-700',
        icon: ClockIcon,
        showButton: false,
      },
      under_review: {
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        iconColor: 'text-yellow-400',
        titleColor: 'text-yellow-800',
        textColor: 'text-yellow-700',
        icon: ClockIcon,
        showButton: false,
      },
      approved: {
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        iconColor: 'text-green-400',
        titleColor: 'text-green-800',
        textColor: 'text-green-700',
        icon: ShieldCheckIcon,
        showButton: false,
      },
      rejected: {
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        iconColor: 'text-red-400',
        titleColor: 'text-red-800',
        textColor: 'text-red-700',
        icon: ExclamationTriangleIcon,
        showButton: true,
      },
    };

    const config = noticeConfig[status];
    if (!config) return null;

    const IconComponent = config.icon;

    return (
      <div className={`mt-8 ${config.bgColor} border ${config.borderColor} rounded-lg p-6`}>
        <div className="flex">
          <div className="flex-shrink-0">
            <IconComponent className={`h-5 w-5 ${config.iconColor}`} />
          </div>
          <div className="ml-3">
            <h3 className={`text-sm font-medium ${config.titleColor} capitalize`}>
              {status === 'not_submitted' ? 'Verification Required' : 
               status === 'approved' ? 'Verification Complete' :
               status.replace(/_/g, ' ')}
            </h3>
            <div className={`mt-2 text-sm ${config.textColor}`}>
              <p>{message}</p>
              {submitted_at && (
                <p className="mt-1 text-xs opacity-75">
                  Submitted: {new Date(submitted_at).toLocaleDateString()}
                </p>
              )}
            </div>
            {config.showButton && (
              <div className="mt-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsVerificationModalOpen(true)}
                >
                  {status === 'not_submitted' ? 'Start Verification' : 'Resubmit Documents'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-6 py-8">
            <div className="flex items-center space-x-6">
              <div className="flex-shrink-0">
                {user.profile_image_url ? (
                  <img
                    className="h-20 w-20 rounded-full"
                    src={user.profile_image_url}
                    alt={user.full_name}
                  />
                ) : (
                  <UserCircleIcon className="h-20 w-20 text-gray-400" />
                )}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">{user.full_name}</h1>
                <div className="flex items-center space-x-4 mt-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
                    {getRoleDisplayName(user.role)}
                  </span>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getVerificationStatusColor(
                      user.verification_status
                    )}`}
                  >
                    <ShieldCheckIcon className="h-4 w-4 mr-1" />
                    {user.verification_status.charAt(0).toUpperCase() + user.verification_status.slice(1)}
                  </span>
                </div>
                <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                  <div className="flex items-center">
                    <EnvelopeIcon className="h-4 w-4 mr-1" />
                    {user.email}
                  </div>
                  <div className="flex items-center">
                    <PhoneIcon className="h-4 w-4 mr-1" />
                    {user.phone}
                  </div>
                  {(user.city || user.state) && (
                    <div className="flex items-center">
                      <MapPinIcon className="h-4 w-4 mr-1" />
                      {user.city && user.state ? `${user.city}, ${user.state}` : user.city || user.state}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-shrink-0">
                <Button variant="primary" onClick={() => setIsEditModalOpen(true)}>Edit Profile</Button>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Personal Information */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Personal Information</h2>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <Input
                  label="Full Name"
                  value={user.full_name}
                  disabled
                />
              </div>
              <div>
                <Input
                  label="Email Address"
                  value={user.email}
                  disabled
                />
              </div>
              <div>
                <Input
                  label="Phone Number"
                  value={user.phone}
                  disabled
                />
              </div>
              <div>
                <Input
                  label="Role"
                  value={getRoleDisplayName(user.role)}
                  disabled
                />
              </div>
            </div>
          </div>

          {/* Location Information */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Location Information</h2>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <Input
                  label="City"
                  value={user.city || 'Not provided'}
                  disabled
                />
              </div>
              <div>
                <Input
                  label="State"
                  value={user.state || 'Not provided'}
                  disabled
                />
              </div>
              <div>
                <Input
                  label="Address"
                  value={user.address || 'Not provided'}
                  disabled
                />
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Account Information</h2>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Account Status</span>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}
                >
                  {user.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Verification Status</span>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getVerificationStatusColor(
                    user.verification_status
                  )}`}
                >
                  {user.verification_status.charAt(0).toUpperCase() + user.verification_status.slice(1)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Member Since</span>
                <span className="text-sm text-gray-500">
                  {new Date(user.created_at).toLocaleDateString()}
                </span>
              </div>
              {user.last_login && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Last Login</span>
                  <span className="text-sm text-gray-500">
                    {new Date(user.last_login).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
            </div>
            <div className="px-6 py-4 space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setIsEditModalOpen(true)}
              >
                <UserCircleIcon className="h-5 w-5 mr-2" />
                Edit Profile
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setIsVerificationModalOpen(true)}
                disabled={user.role === 'buyer'}
              >
                <ShieldCheckIcon className="h-5 w-5 mr-2" />
                {user.role === 'buyer' ? 'No Verification Required' : 'Manage Verification'}
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <CalendarIcon className="h-5 w-5 mr-2" />
                View Activity History
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Verification Notices */}
        {renderVerificationNotice()}
        
        {/* Modals */}
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={handleProfileUpdate}
        />
        
        <VerificationModal
          isOpen={isVerificationModalOpen}
          onClose={() => setIsVerificationModalOpen(false)}
          onSuccess={handleVerificationSuccess}
        />
      </div>
    </div>
  );
};
