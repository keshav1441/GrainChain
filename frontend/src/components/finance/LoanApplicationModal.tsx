import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { toast } from 'react-hot-toast';
import { financeApi } from '../../services/api';

// This should match the interface in FarmerFinance.tsx
interface LoanProduct {
  id: string;
  loan_name: string;
  loan_type: string;

  description: string;
  min_amount: number;
  max_amount: number;
  interest_rate: string;
  tenure_months: string;
  eligibility_criteria: string;
}

interface LoanApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  loanProduct: LoanProduct;
  onApplicationSuccess: () => void;
}

export const LoanApplicationModal = ({ isOpen, onClose, loanProduct, onApplicationSuccess }: LoanApplicationModalProps): JSX.Element | null => {
  const [amount, setAmount] = useState('');
  const [purpose, setPurpose] = useState('');
  const [loading, setLoading] = useState(false);



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const applicationData = {
      loan_type: loanProduct.loan_type, // Use the correct property
      requested_amount: parseFloat(amount),
      loan_purpose: purpose,
      repayment_period_months: parseInt(loanProduct.tenure_months),
    };

    try {
      await financeApi.applyForLoan(applicationData);
      toast.success('Loan application submitted successfully!');
      onApplicationSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to submit loan application', error);
      toast.error('Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Apply for {loanProduct.loan_name}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Loan Amount</label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              min={loanProduct.min_amount}
              max={loanProduct.max_amount}
              required
            />
            <p className="text-xs text-gray-500 mt-1">Min: {loanProduct.min_amount}, Max: {loanProduct.max_amount}</p>
          </div>
          <div className="mb-4">
            <label htmlFor="purpose" className="block text-sm font-medium text-gray-700">Purpose of Loan</label>
            <textarea
              id="purpose"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              rows={3}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="primary" loading={loading}>Submit Application</Button>
          </div>
        </form>
      </div>
    </div>
  );
};
