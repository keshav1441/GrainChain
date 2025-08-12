import api from './api';

// Types
export interface PaymentRequest {
  payee_id: string;
  amount: number;
  payment_type: string;
  description?: string;
}

export interface Transaction {
  id: string;
  payment_id: string;
  amount: number;
  currency: string;
  payment_type: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  payer_user_id: string;
  payee_user_id: string;
  description: string;
  initiated_at: string;
  completed_at?: string;
  failed_at?: string;
  gateway_provider?: string;
}

export interface LoanApplication {
  id: string;
  application_id: string;
  farmer_id: string;
  financier_id?: string;
  loan_type: string;
  requested_amount: number;
  approved_amount?: number;
  interest_rate?: number;
  processing_fee?: number;
  status: string;
  credit_score?: number;
  credit_score_range?: string;
  risk_assessment?: string;
  application_date?: string;
  approval_date?: string;
  disbursement_date?: string;
}

export interface LoanEligibility {
  farmer_id: string;
  credit_score: number;
  credit_range: string;
  loan_eligible: boolean;
  max_loan_amount: number;
  interest_rate_range: { min: number; max: number };
  available_products: Array<{
    product_name: string;
    loan_type: string;
    min_amount: number;
    max_amount: number;
    interest_rate: number;
    tenure_months: number;
    description: string;
  }>;
  recommendations: string[];
  risk_assessment: string;
}

class PaymentService {

  // Payment Methods
  async createPayment(paymentData: PaymentRequest): Promise<{ payment_id: string; status: string }> {
    try {
      const response = await api.post('/finance/payments', paymentData);
      return response.data;
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  }

  async getPaymentHistory(limit: number = 50): Promise<Transaction[]> {
    try {
      const response = await api.get(`/finance/payments?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching payment history:', error);
      throw error;
    }
  }

  async getPaymentDetails(paymentId: string): Promise<Transaction> {
    try {
      const response = await api.get(`/finance/payments/${paymentId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching payment details:', error);
      throw error;
    }
  }

  // Loan Methods
  async createLoanApplication(loanData: {
    loan_type: string;
    requested_amount: number;
    loan_purpose: string;
    repayment_period_months: number;
    income_proof_doc?: string;
    land_documents?: string;
    bank_statements?: string;
    crop_insurance_doc?: string;
    other_documents?: string[];
  }): Promise<LoanApplication> {
    try {
      const response = await api.post('/finance/loan-applications', loanData);
      return response.data;
    } catch (error) {
      console.error('Error creating loan application:', error);
      throw error;
    }
  }

  async submitLoanApplication(applicationId: string): Promise<LoanApplication> {
    try {
      const response = await api.post(`/finance/loan-applications/${applicationId}/submit`, {});
      return response.data;
    } catch (error) {
      console.error('Error submitting loan application:', error);
      throw error;
    }
  }

  async reviewLoanApplication(
    applicationId: string,
    decision: 'approve' | 'reject',
    notes?: string
  ): Promise<LoanApplication> {
    try {
      const response = await api.put(`/finance/loan-applications/${applicationId}/review`, { decision, notes });
      return response.data;
    } catch (error) {
      console.error('Error reviewing loan application:', error);
      throw error;
    }
  }

  async disburseLoan(applicationId: string): Promise<{
    application_id: string;
    payment_id: string;
    amount: number;
    status: string;
  }> {
    try {
      const response = await api.post(`/finance/loan-applications/${applicationId}/disburse`, {});
      return response.data;
    } catch (error) {
      console.error('Error disbursing loan:', error);
      throw error;
    }
  }

  async getLoanApplications(statusFilter?: string): Promise<LoanApplication[]> {
    try {
      const url = statusFilter
        ? `/finance/loan-applications?status=${statusFilter}`
        : `/finance/loan-applications`;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching loan applications:', error);
      throw error;
    }
  }

  async getLoanApplication(applicationId: string): Promise<LoanApplication> {
    try {
      const response = await api.get(`/finance/loan-applications/${applicationId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching loan application:', error);
      throw error;
    }
  }

  async getLoanEligibility(): Promise<LoanEligibility> {
    try {
      const response = await api.get('/finance/eligibility');
      return response.data;
    } catch (error) {
      console.error('Error fetching loan eligibility:', error);
      throw error;
    }
  }

  // AI/ML Integration
  async getPricePrediction(cropData: {
    crop_type: string;
    quantity: number;
    location: string;
    quality_grade: string;
  }): Promise<{
    predicted_price: number;
    price_range: { min: number; max: number };
    confidence_score: number;
    market_trend: string;
    recommendation: string;
    factors: string[];
  }> {
    try {
      const response = await api.post('/ai-ml/predict-price', cropData);
      return response.data;
    } catch (error) {
      console.error('Error getting price prediction:', error);
      throw error;
    }
  }

  async getRecommendations(requestData: {
    recommendation_type: 'crop' | 'buyer' | 'financier';
    location?: string;
    farm_size?: number;
    budget?: number;
  }): Promise<{
    recommendations: string[];
    confidence_score: number;
    expected_roi?: number;
    risk_level: string;
    reasoning: string[];
  }> {
    try {
      const response = await api.post('/ai-ml/recommendations', requestData);
      return response.data;
    } catch (error) {
      console.error('Error getting recommendations:', error);
      throw error;
    }
  }

  // Utility Methods
  formatCurrency(amount: number, currency: string = 'INR'): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getPaymentStatusColor(status: string): string {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      case 'processing':
        return 'text-yellow-600 bg-yellow-100';
      case 'pending':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  }

  getLoanStatusColor(status: string): string {
    switch (status) {
      case 'approved':
      case 'disbursed':
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'rejected':
      case 'defaulted':
        return 'text-red-600 bg-red-100';
      case 'under_review':
      case 'submitted':
        return 'text-yellow-600 bg-yellow-100';
      case 'draft':
        return 'text-gray-600 bg-gray-100';
      case 'active':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  }
}

export const paymentService = new PaymentService();
export default paymentService;
