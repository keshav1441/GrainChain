import React, { useState } from 'react';
import { 
  ShieldCheckIcon, 
  SparklesIcon, 
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { aiService } from '../../services/aiService';
import toast from 'react-hot-toast';

const CreditScoreCard: React.FC = () => {
  const [formData, setFormData] = useState({
    annual_income: '',
    loan_amount: '',
    credit_history: 'good',
    collateral_value: '',
    farm_size: '',
    years_farming: ''
  });
  const [creditScore, setCreditScore] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAssessCredit = async () => {
    if (!formData.annual_income || !formData.loan_amount) {
      toast.error('Please fill in annual income and loan amount');
      return;
    }

    setLoading(true);
    try {
      const result = await aiService.getCreditScore({
        annual_income: parseFloat(formData.annual_income),
        loan_amount: parseFloat(formData.loan_amount),
        credit_history: formData.credit_history,
        collateral_value: parseFloat(formData.collateral_value) || 0,
        farm_size: parseFloat(formData.farm_size) || 1,
        years_farming: parseFloat(formData.years_farming) || 1
      });
      setCreditScore(result);
      toast.success('Credit score assessed successfully!');
    } catch (error) {
      toast.error('Failed to assess credit score');
      console.error('Credit score error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 750) return 'text-green-600 bg-green-100';
    if (score >= 650) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center mb-6">
        <div className="p-3 bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl mr-4">
          <ShieldCheckIcon className="h-6 w-6 text-purple-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Credit Score Assessment</h3>
          <p className="text-gray-600">AI-powered credit evaluation using Gemini</p>
        </div>
      </div>

      {/* Input Form */}
      <div className="space-y-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Annual Income (₹) *
            </label>
            <input
              type="number"
              name="annual_income"
              value={formData.annual_income}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter annual income"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loan Amount (₹) *
            </label>
            <input
              type="number"
              name="loan_amount"
              value={formData.loan_amount}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter requested loan amount"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Credit History
            </label>
            <select
              name="credit_history"
              value={formData.credit_history}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="excellent">Excellent</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="poor">Poor</option>
              <option value="none">No Credit History</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Farm Size (acres)
            </label>
            <input
              type="number"
              name="farm_size"
              value={formData.farm_size}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter farm size"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Years of Farming Experience
            </label>
            <input
              type="number"
              name="years_farming"
              value={formData.years_farming}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter farming experience"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Collateral Value (₹)
            </label>
            <input
              type="number"
              name="collateral_value"
              value={formData.collateral_value}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter collateral value (optional)"
            />
          </div>
        </div>

        <button
          onClick={handleAssessCredit}
          disabled={loading}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Assessing Credit...
            </>
          ) : (
            <>
              <SparklesIcon className="h-5 w-5 mr-2" />
              Assess Credit Score
            </>
          )}
        </button>
      </div>

      {/* Credit Score Results */}
      {creditScore && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-lg font-bold text-gray-900">Credit Assessment</h4>
              <div className="text-sm text-gray-600">
                AI-Powered Analysis
              </div>
            </div>

            {/* Credit Score Display */}
            <div className="text-center mb-6">
              <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full ${getScoreColor(creditScore.credit_score)} mb-4`}>
                <div className="text-center">
                  <div className="text-3xl font-bold">{creditScore.credit_score}</div>
                  <div className="text-sm font-medium">Score</div>
                </div>
              </div>
              <div className="flex items-center justify-center space-x-4 text-sm">
                <span className="text-gray-600">Range: {creditScore.score_range || '300-850'}</span>
                <span className={`px-3 py-1 rounded-full font-medium ${getRiskColor(creditScore.risk_category)}`}>
                  {creditScore.risk_category} Risk
                </span>
              </div>
            </div>

            {/* Loan Eligibility */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-lg p-4 border border-purple-200">
                <div className="flex items-center mb-2">
                  {creditScore.loan_eligibility ? (
                    <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                  ) : (
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-2" />
                  )}
                  <h5 className="font-semibold text-gray-900">Loan Eligibility</h5>
                </div>
                <p className={`text-sm font-medium ${creditScore.loan_eligibility ? 'text-green-600' : 'text-red-600'}`}>
                  {creditScore.loan_eligibility ? 'Eligible for Loan' : 'Not Eligible'}
                </p>
              </div>

              <div className="bg-white rounded-lg p-4 border border-purple-200">
                <div className="flex items-center mb-2">
                  <CurrencyDollarIcon className="h-5 w-5 text-blue-600 mr-2" />
                  <h5 className="font-semibold text-gray-900">Recommended Amount</h5>
                </div>
                <p className="text-sm font-medium text-blue-600">
                  ₹{creditScore.recommended_amount?.toLocaleString() || 'N/A'}
                </p>
              </div>
            </div>

            {/* Key Factors */}
            <div className="mb-6">
              <h5 className="font-semibold text-gray-900 mb-3">Key Factors</h5>
              <div className="space-y-2">
                {creditScore.factors?.map((factor: string, index: number) => (
                  <div key={index} className="flex items-start p-3 bg-white rounded-lg border border-purple-200">
                    <div className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-semibold mr-3 flex-shrink-0">
                      {index + 1}
                    </div>
                    <span className="text-gray-700 text-sm">{factor}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            {creditScore.recommendations && (
              <div>
                <h5 className="font-semibold text-gray-900 mb-3">Recommendations</h5>
                <div className="space-y-2">
                  {creditScore.recommendations.map((recommendation: string, index: number) => (
                    <div key={index} className="flex items-start p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <CheckCircleIcon className="h-5 w-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 text-sm">{recommendation}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CreditScoreCard;
