import React from 'react';
import { useAuthStore } from '../stores/authStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import {
  UserCircleIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

export const ProfilePage: React.FC = () => {
  const { user } = useAuthStore();

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
                <Button variant="primary">Edit Profile</Button>
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
              <Button variant="outline" className="w-full justify-start">
                <UserCircleIcon className="h-5 w-5 mr-2" />
                Update Profile Picture
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <MapPinIcon className="h-5 w-5 mr-2" />
                Update Location
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <ShieldCheckIcon className="h-5 w-5 mr-2" />
                Complete Verification
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <CalendarIcon className="h-5 w-5 mr-2" />
                View Activity History
              </Button>
            </div>
          </div>
        </div>

        {/* Verification Notice */}
        {user.verification_status === 'pending' && (
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <ShieldCheckIcon className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Verification Pending
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    Your account is currently under review. Complete your profile and upload required documents to speed up the verification process.
                  </p>
                </div>
                <div className="mt-4">
                  <Button variant="outline" size="sm">
                    Complete Verification
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
