import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  ArrowLeftIcon,
  UserIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  CameraIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { Button } from '../../components/ui/Button';

interface FarmerProfileData {
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    gender: string;
    profileImage?: string;
  };
  farmInfo: {
    farmName: string;
    farmSize: number;
    farmSizeUnit: string;
    location: {
      address: string;
      city: string;
      state: string;
      pincode: string;
    };
    soilType: string;
    irrigationType: string;
    organicCertified: boolean;
  };
  documents: {
    aadhaar: string;
    pan: string;
    landRecords: boolean;
    bankAccount: string;
    kisanCard: string;
  };
  preferences: {
    language: string;
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
    marketUpdates: boolean;
    weatherAlerts: boolean;
  };
}

export const FarmerProfile: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('personal');

  // Mock profile data
  const [profileData, setProfileData] = useState<FarmerProfileData>({
    personalInfo: {
      firstName: 'Rajesh',
      lastName: 'Kumar',
      email: 'rajesh.kumar@email.com',
      phone: '+91 9876543210',
      dateOfBirth: '1985-06-15',
      gender: 'male',
    },
    farmInfo: {
      farmName: 'Kumar Organic Farm',
      farmSize: 25,
      farmSizeUnit: 'acres',
      location: {
        address: 'Village Rampur',
        city: 'Meerut',
        state: 'Uttar Pradesh',
        pincode: '250001',
      },
      soilType: 'Alluvial',
      irrigationType: 'Drip Irrigation',
      organicCertified: true,
    },
    documents: {
      aadhaar: '1234-5678-9012',
      pan: 'ABCDE1234F',
      landRecords: true,
      bankAccount: 'HDFC Bank - ****1234',
      kisanCard: 'KCC123456789',
    },
    preferences: {
      language: 'english',
      notifications: {
        email: true,
        sms: true,
        push: false,
      },
      marketUpdates: true,
      weatherAlerts: true,
    },
  });

  const handleInputChange = (section: keyof FarmerProfileData, field: string, value: any) => {
    setProfileData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleNestedInputChange = (section: keyof FarmerProfileData, nestedField: string, field: string, value: any) => {
    setProfileData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [nestedField]: {
          ...(prev[section] as any)[nestedField],
          [field]: value,
        },
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const sections = [
    { key: 'personal', label: 'Personal Info', icon: UserIcon },
    { key: 'farm', label: 'Farm Details', icon: MapPinIcon },
    { key: 'documents', label: 'Documents', icon: DocumentTextIcon },
    { key: 'preferences', label: 'Preferences', icon: CheckCircleIcon },
  ];

  const renderPersonalInfo = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-6">
        <div className="relative">
          <div className="h-24 w-24 bg-gray-200 rounded-full flex items-center justify-center">
            {profileData.personalInfo.profileImage ? (
              <img
                src={profileData.personalInfo.profileImage}
                alt="Profile"
                className="h-24 w-24 rounded-full object-cover"
              />
            ) : (
              <UserIcon className="h-12 w-12 text-gray-400" />
            )}
          </div>
          <button className="absolute bottom-0 right-0 bg-primary-600 text-white rounded-full p-2 hover:bg-primary-700">
            <CameraIcon className="h-4 w-4" />
          </button>
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-900">Profile Picture</h3>
          <p className="text-sm text-gray-500">Upload a clear photo of yourself</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">First Name *</label>
          <input
            type="text"
            value={profileData.personalInfo.firstName}
            onChange={(e) => handleInputChange('personalInfo', 'firstName', e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Last Name *</label>
          <input
            type="text"
            value={profileData.personalInfo.lastName}
            onChange={(e) => handleInputChange('personalInfo', 'lastName', e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Email *</label>
          <input
            type="email"
            value={profileData.personalInfo.email}
            onChange={(e) => handleInputChange('personalInfo', 'email', e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Phone Number *</label>
          <input
            type="tel"
            value={profileData.personalInfo.phone}
            onChange={(e) => handleInputChange('personalInfo', 'phone', e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
          <input
            type="date"
            value={profileData.personalInfo.dateOfBirth}
            onChange={(e) => handleInputChange('personalInfo', 'dateOfBirth', e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Gender</label>
          <select
            value={profileData.personalInfo.gender}
            onChange={(e) => handleInputChange('personalInfo', 'gender', e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderFarmInfo = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Farm Name *</label>
          <input
            type="text"
            value={profileData.farmInfo.farmName}
            onChange={(e) => handleInputChange('farmInfo', 'farmName', e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Farm Size *</label>
            <input
              type="number"
              value={profileData.farmInfo.farmSize}
              onChange={(e) => handleInputChange('farmInfo', 'farmSize', parseFloat(e.target.value))}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Unit</label>
            <select
              value={profileData.farmInfo.farmSizeUnit}
              onChange={(e) => handleInputChange('farmInfo', 'farmSizeUnit', e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="acres">Acres</option>
              <option value="hectares">Hectares</option>
              <option value="bigha">Bigha</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Address *</label>
          <input
            type="text"
            value={profileData.farmInfo.location.address}
            onChange={(e) => handleNestedInputChange('farmInfo', 'location', 'address', e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">City *</label>
          <input
            type="text"
            value={profileData.farmInfo.location.city}
            onChange={(e) => handleNestedInputChange('farmInfo', 'location', 'city', e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">State *</label>
          <input
            type="text"
            value={profileData.farmInfo.location.state}
            onChange={(e) => handleNestedInputChange('farmInfo', 'location', 'state', e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">PIN Code *</label>
          <input
            type="text"
            value={profileData.farmInfo.location.pincode}
            onChange={(e) => handleNestedInputChange('farmInfo', 'location', 'pincode', e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Soil Type</label>
          <select
            value={profileData.farmInfo.soilType}
            onChange={(e) => handleInputChange('farmInfo', 'soilType', e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="Alluvial">Alluvial</option>
            <option value="Black">Black</option>
            <option value="Red">Red</option>
            <option value="Laterite">Laterite</option>
            <option value="Desert">Desert</option>
            <option value="Mountain">Mountain</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Irrigation Type</label>
          <select
            value={profileData.farmInfo.irrigationType}
            onChange={(e) => handleInputChange('farmInfo', 'irrigationType', e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="Drip Irrigation">Drip Irrigation</option>
            <option value="Sprinkler">Sprinkler</option>
            <option value="Flood Irrigation">Flood Irrigation</option>
            <option value="Rain-fed">Rain-fed</option>
          </select>
        </div>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          checked={profileData.farmInfo.organicCertified}
          onChange={(e) => handleInputChange('farmInfo', 'organicCertified', e.target.checked)}
          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
        />
        <label className="ml-2 block text-sm text-gray-900">
          Organic Certified Farm
        </label>
      </div>
    </div>
  );

  const renderDocuments = () => (
    <div className="space-y-6">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mt-0.5 mr-2" />
          <div>
            <h4 className="text-sm font-medium text-yellow-900">Document Verification</h4>
            <p className="text-sm text-yellow-700 mt-1">
              Keep your documents updated for seamless loan applications and transactions.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Aadhaar Number</label>
          <input
            type="text"
            value={profileData.documents.aadhaar}
            onChange={(e) => handleInputChange('documents', 'aadhaar', e.target.value)}
            placeholder="1234-5678-9012"
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">PAN Number</label>
          <input
            type="text"
            value={profileData.documents.pan}
            onChange={(e) => handleInputChange('documents', 'pan', e.target.value)}
            placeholder="ABCDE1234F"
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Bank Account</label>
          <input
            type="text"
            value={profileData.documents.bankAccount}
            onChange={(e) => handleInputChange('documents', 'bankAccount', e.target.value)}
            placeholder="Bank Name - Account Number"
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Kisan Credit Card</label>
          <input
            type="text"
            value={profileData.documents.kisanCard}
            onChange={(e) => handleInputChange('documents', 'kisanCard', e.target.value)}
            placeholder="KCC Number"
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          checked={profileData.documents.landRecords}
          onChange={(e) => handleInputChange('documents', 'landRecords', e.target.checked)}
          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
        />
        <label className="ml-2 block text-sm text-gray-900">
          Land Records Verified
        </label>
      </div>
    </div>
  );

  const renderPreferences = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">Preferred Language</label>
        <select
          value={profileData.preferences.language}
          onChange={(e) => handleInputChange('preferences', 'language', e.target.value)}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="english">English</option>
          <option value="hindi">Hindi</option>
          <option value="punjabi">Punjabi</option>
          <option value="gujarati">Gujarati</option>
          <option value="marathi">Marathi</option>
          <option value="tamil">Tamil</option>
          <option value="telugu">Telugu</option>
          <option value="kannada">Kannada</option>
          <option value="bengali">Bengali</option>
        </select>
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-4">Notification Preferences</h4>
        <div className="space-y-3">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={profileData.preferences.notifications.email}
              onChange={(e) => handleNestedInputChange('preferences', 'notifications', 'email', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-900">
              Email Notifications
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              checked={profileData.preferences.notifications.sms}
              onChange={(e) => handleNestedInputChange('preferences', 'notifications', 'sms', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-900">
              SMS Notifications
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              checked={profileData.preferences.notifications.push}
              onChange={(e) => handleNestedInputChange('preferences', 'notifications', 'push', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-900">
              Push Notifications
            </label>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-4">Content Preferences</h4>
        <div className="space-y-3">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={profileData.preferences.marketUpdates}
              onChange={(e) => handleInputChange('preferences', 'marketUpdates', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-900">
              Market Price Updates
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              checked={profileData.preferences.weatherAlerts}
              onChange={(e) => handleInputChange('preferences', 'weatherAlerts', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-900">
              Weather Alerts
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/farmer/dashboard')}
            className="flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="mt-2 text-gray-600">
            Manage your personal information and preferences
          </p>
        </div>

        <div className="bg-white shadow rounded-lg">
          {/* Navigation Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {sections.map((section) => (
                <button
                  key={section.key}
                  onClick={() => setActiveSection(section.key)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeSection === section.key
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <section.icon className="h-5 w-5 mr-2" />
                  {section.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-6">
            {activeSection === 'personal' && renderPersonalInfo()}
            {activeSection === 'farm' && renderFarmInfo()}
            {activeSection === 'documents' && renderDocuments()}
            {activeSection === 'preferences' && renderPreferences()}

            {/* Submit Button */}
            <div className="mt-8 flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/farmer/dashboard')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={loading}
              >
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
