import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

import { useAuthStore, RegisterData } from '../../stores/authStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export const RegisterPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'farmer' | 'buyer' | 'financier'>('farmer');
  const { register: registerUser, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterData>();

  const password = watch('password');

  const onSubmit = async (data: RegisterData) => {
    try {
      await registerUser({ ...data, role: selectedRole });
      toast.success('Registration successful!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Registration failed');
    }
  };

  const roleOptions = [
    {
      id: 'farmer',
      title: 'Farmer',
      description: 'Sell your crops directly to buyers',
      icon: '🌾',
      benefits: ['Better prices', 'Direct sales', 'Access to finance'],
    },
    {
      id: 'buyer',
      title: 'Buyer',
      description: 'Source quality crops from verified farmers',
      icon: '🏢',
      benefits: ['Quality assurance', 'Direct sourcing', 'Bulk procurement'],
    },
    {
      id: 'financier',
      title: 'Financier',
      description: 'Provide financial services to farmers',
      icon: '💰',
      benefits: ['Credit scoring', 'Risk assessment', 'Loan management'],
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary-100">
            <span className="text-2xl font-bold text-primary-600">G</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Join GrainChain
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link
              to="/login"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              sign in to your existing account
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Choose your role
            </label>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {roleOptions.map((role) => (
                <div
                  key={role.id}
                  className={`relative rounded-lg border p-4 cursor-pointer focus:outline-none ${
                    selectedRole === role.id
                      ? 'border-primary-500 ring-2 ring-primary-500 bg-primary-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onClick={() => setSelectedRole(role.id as any)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="text-2xl mr-3">{role.icon}</div>
                      <div className="text-sm">
                        <p className="font-medium text-gray-900">{role.title}</p>
                        <p className="text-gray-500">{role.description}</p>
                      </div>
                    </div>
                    <div
                      className={`h-4 w-4 rounded-full border ${
                        selectedRole === role.id
                          ? 'border-primary-600 bg-primary-600'
                          : 'border-gray-300'
                      }`}
                    >
                      {selectedRole === role.id && (
                        <div className="h-2 w-2 rounded-full bg-white mx-auto mt-1" />
                      )}
                    </div>
                  </div>
                  <div className="mt-2">
                    <ul className="text-xs text-gray-500 space-y-1">
                      {role.benefits.map((benefit, index) => (
                        <li key={index}>• {benefit}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Personal Information */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Input
                label="Full Name"
                type="text"
                autoComplete="name"
                required
                {...register('full_name', {
                  required: 'Full name is required',
                  minLength: {
                    value: 2,
                    message: 'Name must be at least 2 characters',
                  },
                })}
                error={errors.full_name?.message}
              />
            </div>

            <div>
              <Input
                label="Email Address"
                type="email"
                autoComplete="email"
                required
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: 'Invalid email address',
                  },
                })}
                error={errors.email?.message}
              />
            </div>

            <div>
              <Input
                label="Phone Number"
                type="tel"
                autoComplete="tel"
                required
                {...register('phone', {
                  required: 'Phone number is required',
                  pattern: {
                    value: /^[6-9]\d{9}$/,
                    message: 'Invalid Indian phone number',
                  },
                })}
                error={errors.phone?.message}
                placeholder="10-digit mobile number"
              />
            </div>

            <div>
              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters',
                    },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                      message: 'Password must contain uppercase, lowercase, and number',
                    },
                  })}
                  error={errors.password?.message}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 top-6 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Location Information */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Input
                label="City"
                type="text"
                {...register('city')}
                error={errors.city?.message}
              />
            </div>

            <div>
              <Input
                label="State"
                type="text"
                {...register('state')}
                error={errors.state?.message}
              />
            </div>
          </div>

          <div>
            <Input
              label="Address"
              type="text"
              {...register('address')}
              error={errors.address?.message}
              placeholder="Complete address (optional)"
            />
          </div>

          {/* Terms and Conditions */}
          <div className="flex items-center">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              required
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
              I agree to the{' '}
              <a href="#" className="text-primary-600 hover:text-primary-500">
                Terms and Conditions
              </a>{' '}
              and{' '}
              <a href="#" className="text-primary-600 hover:text-primary-500">
                Privacy Policy
              </a>
            </label>
          </div>

          <div>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              loading={isLoading}
            >
              Create Account
            </Button>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500">
                  Why choose GrainChain?
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="text-center">
                <div className="text-2xl mb-2">🤝</div>
                <p className="text-sm font-medium text-gray-900">Direct Connect</p>
                <p className="text-xs text-gray-500">No middlemen</p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">🔒</div>
                <p className="text-sm font-medium text-gray-900">Secure</p>
                <p className="text-xs text-gray-500">Verified users</p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">🚀</div>
                <p className="text-sm font-medium text-gray-900">AI-Powered</p>
                <p className="text-xs text-gray-500">Smart pricing</p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
