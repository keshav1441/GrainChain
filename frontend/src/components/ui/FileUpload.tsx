import React, { useCallback, useState } from 'react';
import { clsx } from 'clsx';
import { DocumentIcon, XMarkIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface FileUploadProps {
  label?: string;
  accept?: string;
  maxSize?: number; // in MB
  error?: string;
  helperText?: string;
  required?: boolean;
  onChange?: (file: File | null) => void;
  value?: File | string | null;
  disabled?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  label,
  accept = '.pdf,.jpg,.jpeg,.png,.doc,.docx',
  maxSize = 10, // 10MB default
  error,
  helperText,
  required,
  onChange,
  value,
  disabled,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState<string>('');

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      return `File size must be less than ${maxSize}MB`;
    }

    // Check file type
    const allowedTypes = accept.split(',').map(type => type.trim());
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowedTypes.includes(fileExtension)) {
      return `File type not allowed. Allowed types: ${accept}`;
    }

    return null;
  };

  const handleFiles = (files: FileList) => {
    const file = files[0];
    if (file) {
      const validationError = validateFile(file);
      if (validationError) {
        setUploadError(validationError);
        return;
      }
      setUploadError('');
      onChange?.(file);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, [disabled, maxSize, accept, onChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const removeFile = () => {
    setUploadError('');
    onChange?.(null);
  };

  const getFileName = (): string => {
    if (value instanceof File) {
      return value.name;
    } else if (typeof value === 'string' && value) {
      return value.split('/').pop() || 'Uploaded file';
    }
    return '';
  };

  const hasFile = value instanceof File || (typeof value === 'string' && value);

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <input
          type="file"
          accept={accept}
          onChange={handleChange}
          disabled={disabled}
          className="sr-only"
          id={`file-upload-${label?.replace(/\s+/g, '-').toLowerCase()}`}
        />
        
        {hasFile ? (
          <div className="flex items-center justify-between p-4 border-2 border-gray-300 border-dashed rounded-lg bg-gray-50">
            <div className="flex items-center space-x-3">
              <CheckCircleIcon className="h-8 w-8 text-green-500 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {getFileName()}
                </p>
                <p className="text-xs text-gray-500">
                  {value instanceof File ? `${(value.size / 1024 / 1024).toFixed(2)} MB` : 'Uploaded'}
                </p>
              </div>
            </div>
            {!disabled && (
              <button
                type="button"
                onClick={removeFile}
                className="ml-3 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            )}
          </div>
        ) : (
          <div
            className={clsx(
              'relative border-2 border-dashed rounded-lg p-6 text-center hover:border-gray-400 transition-colors',
              dragActive ? 'border-primary-400 bg-primary-50' : 'border-gray-300',
              error || uploadError ? 'border-red-300' : '',
              disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <label
              htmlFor={`file-upload-${label?.replace(/\s+/g, '-').toLowerCase()}`}
              className={clsx(
                'cursor-pointer flex flex-col items-center space-y-2',
                disabled && 'cursor-not-allowed'
              )}
            >
              <DocumentIcon className="h-10 w-10 text-gray-400" />
              <div className="text-sm text-gray-600">
                <span className="font-medium text-primary-600 hover:text-primary-500">
                  Click to upload
                </span>{' '}
                or drag and drop
              </div>
              <p className="text-xs text-gray-500">
                {accept.replace(/\./g, '').toUpperCase().replace(/,/g, ', ')} up to {maxSize}MB
              </p>
            </label>
          </div>
        )}
      </div>

      {(error || uploadError) && (
        <p className="mt-1 text-sm text-red-600">{error || uploadError}</p>
      )}
      
      {helperText && !(error || uploadError) && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};
