import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { FileUpload } from '../ui/FileUpload';
import { useAuthStore } from '../../stores/authStore';
import { 
  DocumentIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface VerificationDocuments {
  // Farmer documents
  land_ownership_doc?: File | null;
  land_photo_with_farmer?: File | null;
  address_proof?: File | null;
  aadhar_card?: File | null;
  pan_card?: File | null;
  
  // Financier documents  
  company_id_docs?: File[];
}

export const VerificationModal: React.FC<VerificationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: boolean }>({});
  const [documents, setDocuments] = useState<VerificationDocuments>({});
  const [verificationStatus, setVerificationStatus] = useState<any>(null);

  useEffect(() => {
    if (isOpen && user) {
      fetchVerificationStatus();
    }
  }, [isOpen, user]);

  const fetchVerificationStatus = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users/verification/status`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (response.ok) {
        const status = await response.json();
        setVerificationStatus(status);
      }
    } catch (err) {
      console.error('Error fetching verification status:', err);
    }
  };

  const uploadDocument = async (file: File, documentType: string): Promise<string> => {
    setUploadProgress(prev => ({ ...prev, [documentType]: true }));
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type', documentType);

    const response = await fetch(`${import.meta.env.VITE_API_URL}/users/documents/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: formData,
    });

    setUploadProgress(prev => ({ ...prev, [documentType]: false }));

    if (!response.ok) {
      throw new Error(`Failed to upload ${documentType}`);
    }

    const result = await response.json();
    return result.file_url;
  };

  const handleDocumentChange = (documentType: string, file: File | null) => {
    setDocuments(prev => ({
      ...prev,
      [documentType]: file,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!user) throw new Error('User not found');

      const uploadedDocs: { [key: string]: string | string[] } = {};

      // Upload all documents
      for (const [docType, file] of Object.entries(documents)) {
        if (file) {
          if (docType === 'company_id_docs' && Array.isArray(file)) {
            // Handle multiple company ID documents for financiers
            const urls = await Promise.all(
              file.map(f => uploadDocument(f, 'company_id_doc'))
            );
            uploadedDocs[docType] = urls;
          } else if (file instanceof File) {
            uploadedDocs[docType] = await uploadDocument(file, docType);
          }
        }
      }

      // Submit verification based on user role
      let endpoint = '';
      let submitData: { [key: string]: string | string[] | undefined } = {};

      if (user.role === 'farmer') {
        endpoint = `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/users/verification/farmer/submit`;
        submitData = {
          land_ownership_doc: uploadedDocs.land_ownership_doc as string,
          land_photo_with_farmer: uploadedDocs.land_photo_with_farmer as string,
          address_proof: uploadedDocs.address_proof as string,
          aadhar_card: uploadedDocs.aadhar_card as string,
          pan_card: uploadedDocs.pan_card as string,
        };
      } else if (user.role === 'financier') {
        endpoint = `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/users/verification/financier/submit`;
        submitData = {
          aadhar_card: uploadedDocs.aadhar_card as string,
          pan_card: uploadedDocs.pan_card as string,
          company_id_docs: uploadedDocs.company_id_docs as string[] || [],
        };
      } else {
        throw new Error('Buyers do not require verification');
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit verification');
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit verification');
    } finally {
      setLoading(false);
    }
  };

  const renderFarmerVerificationForm = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Required Documents for Farmer Verification</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Land ownership documents (Sale deed, Patta, etc.)</li>
          <li>• Photo with your land (showing you at your farm)</li>
          <li>• Permanent address proof (Electricity bill, Bank statement, etc.)</li>
          <li>• Aadhar card (both sides)</li>
          <li>• PAN card</li>
        </ul>
      </div>

      <FileUpload
        label="Land Ownership Document"
        required
        value={documents.land_ownership_doc}
        onChange={(file) => handleDocumentChange('land_ownership_doc', file)}
        helperText="Upload land ownership documents like sale deed, patta, etc."
      />

      <FileUpload
        label="Photo with Land"
        required
        accept=".jpg,.jpeg,.png"
        value={documents.land_photo_with_farmer}
        onChange={(file) => handleDocumentChange('land_photo_with_farmer', file)}
        helperText="Upload a photo of yourself at your farm/land"
      />

      <FileUpload
        label="Address Proof"
        required
        value={documents.address_proof}
        onChange={(file) => handleDocumentChange('address_proof', file)}
        helperText="Upload electricity bill, bank statement, or other address proof"
      />

      <FileUpload
        label="Aadhar Card"
        required
        value={documents.aadhar_card}
        onChange={(file) => handleDocumentChange('aadhar_card', file)}
        helperText="Upload both sides of Aadhar card in a single document"
      />

      <FileUpload
        label="PAN Card"
        required
        value={documents.pan_card}
        onChange={(file) => handleDocumentChange('pan_card', file)}
        helperText="Upload clear image of PAN card"
      />
    </div>
  );

  const renderFinancierVerificationForm = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Required Documents for Financial Partner Verification</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Aadhar card of authorized representative</li>
          <li>• PAN card of company/individual</li>
          <li>• Company registration documents, GST certificate, license documents, etc.</li>
        </ul>
      </div>

      <FileUpload
        label="Aadhar Card"
        required
        value={documents.aadhar_card}
        onChange={(file) => handleDocumentChange('aadhar_card', file)}
        helperText="Upload both sides of authorized representative's Aadhar card"
      />

      <FileUpload
        label="PAN Card"
        required
        value={documents.pan_card}
        onChange={(file) => handleDocumentChange('pan_card', file)}
        helperText="Upload company/individual PAN card"
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Company ID Documents <span className="text-red-500">*</span>
        </label>
        <p className="text-sm text-gray-500 mb-4">
          Upload company registration documents, GST certificate, license documents, etc. You can upload multiple files.
        </p>
        <FileUpload
          value={documents.company_id_docs?.[0]}
          onChange={(file) => {
            if (file) {
              setDocuments(prev => ({
                ...prev,
                company_id_docs: [file, ...(prev.company_id_docs?.slice(1) || [])]
              }));
            }
          }}
        />
        {/* For simplicity, we'll just handle one company document. In a real app, you'd want multiple file upload */}
      </div>
    </div>
  );

  const renderVerificationStatus = () => {
    if (!verificationStatus) return null;

    const statusConfig = {
      not_submitted: {
        icon: DocumentIcon,
        color: 'text-gray-500',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200',
      },
      submitted: {
        icon: CheckCircleIcon,
        color: 'text-blue-500',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
      },
      under_review: {
        icon: CheckCircleIcon,
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
      },
      approved: {
        icon: CheckCircleIcon,
        color: 'text-green-500',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
      },
      rejected: {
        icon: ExclamationTriangleIcon,
        color: 'text-red-500',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
      },
      not_required: {
        icon: CheckCircleIcon,
        color: 'text-green-500',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
      },
    };

    const config = statusConfig[verificationStatus.status as keyof typeof statusConfig];
    if (!config) return null;

    const IconComponent = config.icon;

    return (
      <div className={`p-4 rounded-lg border ${config.bgColor} ${config.borderColor}`}>
        <div className="flex items-start space-x-3">
          <IconComponent className={`h-6 w-6 ${config.color} flex-shrink-0 mt-0.5`} />
          <div>
            <h4 className="text-sm font-medium text-gray-900 capitalize">
              {verificationStatus.status.replace(/_/g, ' ')} Status
            </h4>
            <p className="text-sm text-gray-700 mt-1">
              {verificationStatus.message}
            </p>
            {verificationStatus.submitted_at && (
              <p className="text-xs text-gray-500 mt-2">
                Submitted: {new Date(verificationStatus.submitted_at).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Show upload progress when uploading
  const renderUploadProgress = () => {
    const activeUploads = Object.entries(uploadProgress).filter(([, isUploading]) => isUploading);
    
    if (activeUploads.length === 0) return null;

    return (
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Uploading Documents...</h4>
        <div className="space-y-1">
          {activeUploads.map(([docType]) => (
            <div key={docType} className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
              <span className="text-xs text-blue-700 capitalize">{docType.replace(/_/g, ' ')}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (!user) return null;

  // If user is buyer, show message that verification is not required
  if (user.role === 'buyer') {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Verification"
        size="md"
      >
        <div className="text-center py-8">
          <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Verification Required</h3>
          <p className="text-gray-600">
            Buyers do not require document verification to use the platform.
          </p>
        </div>
      </Modal>
    );
  }

  // If verification is already approved, show success message
  if (verificationStatus?.status === 'approved') {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Verification Status"
        size="md"
      >
        <div className="text-center py-8">
          <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Verification Complete!</h3>
          <p className="text-gray-600">
            Your profile has been successfully verified.
          </p>
        </div>
      </Modal>
    );
  }

  const canSubmit = user.role === 'farmer' ? 
    documents.land_ownership_doc && documents.land_photo_with_farmer && documents.address_proof && documents.aadhar_card && documents.pan_card :
    documents.aadhar_card && documents.pan_card && documents.company_id_docs?.length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Document Verification"
      size="lg"
    >
      <div className="space-y-6">
        {error && (
          <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
            {error}
          </div>
        )}

        {renderUploadProgress()}
        {renderVerificationStatus()}

        {verificationStatus?.status === 'not_submitted' && (
          <form onSubmit={handleSubmit}>
            {user.role === 'farmer' && renderFarmerVerificationForm()}
            {user.role === 'financier' && renderFinancierVerificationForm()}

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
                disabled={!canSubmit}
              >
                Submit for Verification
              </Button>
            </div>
          </form>
        )}

        {(verificationStatus?.status === 'submitted' || verificationStatus?.status === 'under_review') && (
          <div className="flex justify-end">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
};