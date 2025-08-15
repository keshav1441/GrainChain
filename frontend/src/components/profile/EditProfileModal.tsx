import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { FileUpload } from '../ui/FileUpload';
import { useAuthStore } from '../../stores/authStore';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ProfileFormData {
  full_name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  profile_image_url: string;
  
  // Farmer specific fields
  farm_name?: string;
  farm_size_acres?: number;
  farming_experience_years?: number;
  primary_crops?: string;
  farming_methods?: string;
  annual_income?: number;
  bank_account_number?: string;
  ifsc_code?: string;
  
  // Buyer specific fields
  company_name?: string;
  company_type?: string;
  gst_number?: string;
  pan_number?: string;
  annual_procurement_volume?: number;
  procurement_categories?: string;
  preferred_regions?: string;
  
  // Financier specific fields
  institution_name?: string;
  institution_type?: string;
  license_number?: string;
  registration_number?: string;
  contact_person_name?: string;
  contact_person_designation?: string;
  contact_email?: string;
  contact_phone?: string;
  years_in_operation?: number;
  total_assets?: number;
  lending_portfolio_size?: number;
  interest_rate_range?: string;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [formData, setFormData] = useState<ProfileFormData>({
    full_name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    profile_image_url: '',
  });

  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        full_name: user.full_name || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        pincode: user.pincode || '',
        profile_image_url: user.profile_image_url || '',
        // Initialize role-specific fields based on user role
        ...(user.role === 'farmer' && {
          farm_name: '',
          farm_size_acres: 0,
          farming_experience_years: 0,
          primary_crops: '',
          farming_methods: '',
          annual_income: 0,
          bank_account_number: '',
          ifsc_code: '',
        }),
        ...(user.role === 'buyer' && {
          company_name: '',
          company_type: '',
          gst_number: '',
          pan_number: '',
          annual_procurement_volume: 0,
          procurement_categories: '',
          preferred_regions: '',
        }),
        ...(user.role === 'financier' && {
          institution_name: '',
          institution_type: '',
          license_number: '',
          registration_number: '',
          contact_person_name: '',
          contact_person_designation: '',
          contact_email: '',
          contact_phone: '',
          years_in_operation: 0,
          total_assets: 0,
          lending_portfolio_size: 0,
          interest_rate_range: '',
        }),
      });
    }
  }, [user, isOpen]);

  const handleInputChange = (field: keyof ProfileFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Upload profile image if changed
      let profileImageUrl = formData.profile_image_url;
      if (profileImage) {
        const imageFormData = new FormData();
        imageFormData.append('file', profileImage);
        imageFormData.append('document_type', 'profile_image');

        const uploadResponse = await fetch('http://localhost:8000/api/v1/users/documents/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: imageFormData,
        });

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          profileImageUrl = uploadData.file_url;
        }
      }

      // Update profile
      const updateData = {
        ...formData,
        profile_image_url: profileImageUrl,
      };

      const response = await fetch('http://localhost:8000/api/v1/users/profile/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const renderRoleSpecificFields = () => {
    if (!user) return null;

    switch (user.role) {
      case 'farmer':
        return (
          <>
            <h4 className="text-md font-medium text-gray-900 mt-6 mb-4">Farm Information</h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Farm Name"
                value={formData.farm_name || ''}
                onChange={(e) => handleInputChange('farm_name', e.target.value)}
              />
              <Input
                label="Farm Size (Acres)"
                type="number"
                value={formData.farm_size_acres || ''}
                onChange={(e) => handleInputChange('farm_size_acres', parseFloat(e.target.value) || 0)}
              />
              <Input
                label="Farming Experience (Years)"
                type="number"
                value={formData.farming_experience_years || ''}
                onChange={(e) => handleInputChange('farming_experience_years', parseInt(e.target.value) || 0)}
              />
              <Input
                label="Primary Crops"
                value={formData.primary_crops || ''}
                onChange={(e) => handleInputChange('primary_crops', e.target.value)}
              />
              <Input
                label="Farming Methods"
                value={formData.farming_methods || ''}
                onChange={(e) => handleInputChange('farming_methods', e.target.value)}
              />
              <Input
                label="Annual Income"
                type="number"
                value={formData.annual_income || ''}
                onChange={(e) => handleInputChange('annual_income', parseFloat(e.target.value) || 0)}
              />
              <Input
                label="Bank Account Number"
                value={formData.bank_account_number || ''}
                onChange={(e) => handleInputChange('bank_account_number', e.target.value)}
              />
              <Input
                label="IFSC Code"
                value={formData.ifsc_code || ''}
                onChange={(e) => handleInputChange('ifsc_code', e.target.value)}
              />
            </div>
          </>
        );

      case 'buyer':
        return (
          <>
            <h4 className="text-md font-medium text-gray-900 mt-6 mb-4">Company Information</h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Company Name"
                value={formData.company_name || ''}
                onChange={(e) => handleInputChange('company_name', e.target.value)}
              />
              <Input
                label="Company Type"
                value={formData.company_type || ''}
                onChange={(e) => handleInputChange('company_type', e.target.value)}
              />
              <Input
                label="GST Number"
                value={formData.gst_number || ''}
                onChange={(e) => handleInputChange('gst_number', e.target.value)}
              />
              <Input
                label="PAN Number"
                value={formData.pan_number || ''}
                onChange={(e) => handleInputChange('pan_number', e.target.value)}
              />
              <Input
                label="Annual Procurement Volume"
                type="number"
                value={formData.annual_procurement_volume || ''}
                onChange={(e) => handleInputChange('annual_procurement_volume', parseFloat(e.target.value) || 0)}
              />
              <Input
                label="Procurement Categories"
                value={formData.procurement_categories || ''}
                onChange={(e) => handleInputChange('procurement_categories', e.target.value)}
              />
              <div className="sm:col-span-2">
                <Input
                  label="Preferred Regions"
                  value={formData.preferred_regions || ''}
                  onChange={(e) => handleInputChange('preferred_regions', e.target.value)}
                />
              </div>
            </div>
          </>
        );

      case 'financier':
        return (
          <>
            <h4 className="text-md font-medium text-gray-900 mt-6 mb-4">Institution Information</h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Institution Name"
                value={formData.institution_name || ''}
                onChange={(e) => handleInputChange('institution_name', e.target.value)}
              />
              <Input
                label="Institution Type"
                value={formData.institution_type || ''}
                onChange={(e) => handleInputChange('institution_type', e.target.value)}
              />
              <Input
                label="License Number"
                value={formData.license_number || ''}
                onChange={(e) => handleInputChange('license_number', e.target.value)}
              />
              <Input
                label="Registration Number"
                value={formData.registration_number || ''}
                onChange={(e) => handleInputChange('registration_number', e.target.value)}
              />
              <Input
                label="Contact Person Name"
                value={formData.contact_person_name || ''}
                onChange={(e) => handleInputChange('contact_person_name', e.target.value)}
              />
              <Input
                label="Contact Person Designation"
                value={formData.contact_person_designation || ''}
                onChange={(e) => handleInputChange('contact_person_designation', e.target.value)}
              />
              <Input
                label="Contact Email"
                type="email"
                value={formData.contact_email || ''}
                onChange={(e) => handleInputChange('contact_email', e.target.value)}
              />
              <Input
                label="Contact Phone"
                value={formData.contact_phone || ''}
                onChange={(e) => handleInputChange('contact_phone', e.target.value)}
              />
              <Input
                label="Years in Operation"
                type="number"
                value={formData.years_in_operation || ''}
                onChange={(e) => handleInputChange('years_in_operation', parseInt(e.target.value) || 0)}
              />
              <Input
                label="Total Assets"
                type="number"
                value={formData.total_assets || ''}
                onChange={(e) => handleInputChange('total_assets', parseFloat(e.target.value) || 0)}
              />
              <Input
                label="Lending Portfolio Size"
                type="number"
                value={formData.lending_portfolio_size || ''}
                onChange={(e) => handleInputChange('lending_portfolio_size', parseFloat(e.target.value) || 0)}
              />
              <Input
                label="Interest Rate Range"
                value={formData.interest_rate_range || ''}
                onChange={(e) => handleInputChange('interest_rate_range', e.target.value)}
              />
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Profile"
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
            {error}
          </div>
        )}

        <h4 className="text-md font-medium text-gray-900">Basic Information</h4>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Full Name"
            required
            value={formData.full_name}
            onChange={(e) => handleInputChange('full_name', e.target.value)}
          />
          <Input
            label="Phone Number"
            required
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
          />
          <div className="sm:col-span-2">
            <Input
              label="Address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
            />
          </div>
          <Input
            label="City"
            value={formData.city}
            onChange={(e) => handleInputChange('city', e.target.value)}
          />
          <Input
            label="State"
            value={formData.state}
            onChange={(e) => handleInputChange('state', e.target.value)}
          />
          <Input
            label="PIN Code"
            value={formData.pincode}
            onChange={(e) => handleInputChange('pincode', e.target.value)}
          />
        </div>

        <div>
          <FileUpload
            label="Profile Picture"
            accept=".jpg,.jpeg,.png"
            maxSize={5}
            value={profileImage || formData.profile_image_url}
            onChange={setProfileImage}
            helperText="Upload a profile picture (JPG, PNG up to 5MB)"
          />
        </div>

        {renderRoleSpecificFields()}

        <div className="flex justify-end space-x-4 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={loading}
          >
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};
