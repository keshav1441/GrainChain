import React from 'react';
import { useNavigate } from 'react-router-dom';
import CreateProductForm from '../../components/forms/CreateProductForm';
import { toast } from 'react-hot-toast';

export const CreateProduct: React.FC = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    toast.success('Financial product created successfully!');
    navigate('/financier/loan-products');
  };

  const handleCancel = () => {
    navigate('/financier/loan-products');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-4">
              <li>
                <div>
                  <a href="/financier/dashboard" className="text-gray-400 hover:text-gray-500">
                    Dashboard
                  </a>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <svg
                    className="flex-shrink-0 h-5 w-5 text-gray-300"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                  </svg>
                  <a href="/financier/loan-products" className="ml-4 text-gray-400 hover:text-gray-500">
                    Loan Products
                  </a>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <svg
                    className="flex-shrink-0 h-5 w-5 text-gray-300"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                  </svg>
                  <span className="ml-4 text-gray-500">Create Product</span>
                </div>
              </li>
            </ol>
          </nav>
        </div>

        <CreateProductForm 
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
};

export default CreateProduct;
