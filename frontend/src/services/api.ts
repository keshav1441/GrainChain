import axios from 'axios';
import { RegisterData } from '../stores/authStore';

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API endpoints
export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),
  
  register: (userData: RegisterData) =>
    api.post('/auth/register', userData),
  
  getCurrentUser: () =>
    api.get('/auth/me'),
  
  completeProfile: {
    farmer: (data: any) => api.post('/auth/complete-profile/farmer', data),
    buyer: (data: any) => api.post('/auth/complete-profile/buyer', data),
    financier: (data: any) => api.post('/auth/complete-profile/financier', data),
  },
  
  setAuthToken: (token: string) => {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  },
  
  clearAuthToken: () => {
    delete api.defaults.headers.common['Authorization'];
  },
};

// Crop API endpoints
export const cropApi = {
  getMarketplaceListings: (limit: number = 20) => api.get('/crops/marketplace', { params: { limit } }),

  searchListings: (params?: {
    crop_type?: string;
    location?: string;
    min_price?: number;
    max_price?: number;
    skip?: number;
    limit?: number;
  }) => api.get('/crops/listings', { params }),
  
  createListing: (data: any) => api.post('/crops/listings', data),
  
  updateListing: (id: number, data: any) => api.put(`/crops/listings/${id}`, data),
  
  deleteListing: (id: number) => api.delete(`/crops/listings/${id}`),
  
  getListing: (id: string) => api.get(`/crops/listings/${id}`),
  
  getMyListings: () => api.get('/crops/my-listings'),
  
  createInquiry: (listingId: number, data: any) =>
    api.post(`/crops/listings/${listingId}/inquiries`, data),
  
  getInquiries: () => api.get('/crops/inquiries'),
  
  respondToInquiry: (inquiryId: number, data: any) =>
    api.put(`/crops/inquiries/${inquiryId}/respond`, data),
};

// Market data API
export const marketApi = {
  getPrices: (params?: {
    crop_name?: string;
    state?: string;
    days?: number;
  }) => api.get('/market/prices', { params }),
  
  getPriceAlerts: () => api.get('/market/price-alerts'),
  
  createPriceAlert: (data: any) => api.post('/market/price-alerts', data),
  
  deletePriceAlert: (id: number) => api.delete(`/market/price-alerts/${id}`),
};

// Finance API endpoints
export const financeApi = {
  getLoanProducts: (params?: {
    loan_type?: string;
    min_amount?: number;
    max_amount?: number;
  }) => api.get('/finance/loan-products', { params }),
  
  applyForLoan: (data: any) => api.post('/finance/loan-applications', data),
  
  getMyApplications: () => api.get('/finance/loan-applications'),
  
  getApplication: (id: number) => api.get(`/finance/loan-applications/${id}`),
  
  getCreditScore: () => api.get('/finance/eligibility'),
  
  getFinanciers: () => api.get('/finance/financiers'),
};

// Transaction API endpoints
export const transactionApi = {
  getMyTransactions: () => api.get('/transactions/my-transactions'),
  
  getTransaction: (id: number) => api.get(`/transactions/${id}`),
  
  createTransaction: (data: any) => api.post('/transactions', data),
  
  updateTransactionStatus: (id: number, status: string) =>
    api.put(`/transactions/${id}/status`, { status }),
  
  rateTransaction: (id: number, data: any) =>
    api.post(`/transactions/${id}/rate`, data),
};

// Notification API endpoints
export const notificationApi = {
  getNotifications: () => api.get('/notifications'),
  
  markAsRead: (id: number) => api.put(`/notifications/${id}/read`),
  
  markAllAsRead: () => api.put('/notifications/mark-all-read'),
  
  deleteNotification: (id: number) => api.delete(`/notifications/${id}`),
};

// File upload API
export const uploadApi = {
  uploadFile: (file: File, type: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    
    return api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  uploadMultipleFiles: (files: File[], type: string) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    formData.append('type', type);
    
    return api.post('/upload/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

// Buyer API endpoints
export const buyerApi = {
  getDashboardStats: () => api.get('/buyer/dashboard/stats'),
  getAnalytics: (period?: string) => api.get('/buyer/analytics', { params: { period } }),
  getFarmers: (params?: any) => api.get('/buyer/farmers', { params }),
  getListings: (params?: any) => api.get('/buyer/listings', { params }),
  
  // Inquiry management
  getInquiries: (params?: any) => api.get('/inquiries', { params }),
  
  createInquiry: (data: {
    listing_id: string;
    quantity_requested: number;
    proposed_price?: number;
    message?: string;
    delivery_location?: string;
    preferred_delivery_date?: string;
  }) => api.post('/inquiries', data),
  
  updateInquiry: (inquiryId: string, data: {
    quantity_requested?: number;
    proposed_price?: number;
    message?: string;
    delivery_location?: string;
    preferred_delivery_date?: string;
  }) => api.put(`/buyer/inquiries/${inquiryId}`, data),
  
  cancelInquiry: (inquiryId: string) => api.delete(`/buyer/inquiries/${inquiryId}`),
  
  getInquiry: (inquiryId: string) => api.get(`/buyer/inquiries/${inquiryId}`),
};

// Financier API endpoints
export const financierApi = {
  getDashboardStats: () => api.get('/finance/financier/dashboard/stats'),
  
  getPendingApplications: (params?: {
    limit?: number;
  }) => api.get('/finance/financier/dashboard/pending-applications', { params }),
  
  getRecentDisbursements: (params?: {
    limit?: number;
  }) => api.get('/finance/financier/dashboard/recent-disbursements', { params }),
  
  getAllApplications: (params?: {
    status_filter?: string;
  }) => api.get('/finance/loan-applications', { params }),
  
  getApplication: (id: string) => api.get(`/finance/loan-applications/${id}`),
  
  reviewApplication: (id: string, data: {
    decision: 'approve' | 'reject';
    notes?: string;
  }) => api.post(`/finance/loan-applications/${id}/review`, data),
  
  disburseApplication: (id: string) => api.post(`/finance/loan-applications/${id}/disburse`),
  
  postInquiry: (data: {
    listing_id: string;
    quantity_requested: number;
    proposed_price: number;
    message?: string;
    delivery_location?: string;
    preferred_delivery_date?: string;
  }) => api.post('/finance/financier/inquiries', data),
  
  getInquiries: (params?: {
    status?: string;
    limit?: number;
    skip?: number;
  }) => api.get('/finance/financier/inquiries', { params }),
  
  getInquiry: (inquiryId: string) => api.get(`/finance/financier/inquiries/${inquiryId}`),
  
  updateInquiry: (inquiryId: string, data: {
    quantity_requested?: number;
    proposed_price?: number;
    message?: string;
    delivery_location?: string;
    preferred_delivery_date?: string;
  }) => api.put(`/finance/financier/inquiries/${inquiryId}`, data),
  
  cancelInquiry: (inquiryId: string) => api.delete(`/finance/financier/inquiries/${inquiryId}`),
  
  // Loan products
  getLoanProducts: () => api.get('/finance/products'),
  
  // Payment history
  getPaymentHistory: (applicationId: number) => api.get(`/finance/applications/${applicationId}/payments`),
  
  // Farmers data
  getFarmersData: (params?: { search?: string; location?: string; credit_score_min?: number }) => 
    api.get('/finance/financier/farmers', { params }),
  
  // Analytics data
  getAnalyticsData: (period?: string) => 
    api.get('/finance/financier/analytics', { params: { period } }),
  
  // Loan products management
  getLoanProductsManagement: (status_filter?: string) => 
    api.get('/finance/financier/loan-products', { params: { status_filter } }),
  
  updateLoanProduct: (id: string, data: any) => 
    api.put(`/finance/financier/loan-products/${id}`, data),
  
  getAIInsights: () => 
    api.get('/finance/financier/analytics/insights'),
  
  // Create financial product
  createFinancialProduct: (data: any) => 
    api.post('/finance/financier/financial-products', data),
};

// Cart API endpoints
export const cartApi = {
  // Cart management
  addToCart: (data: {
    crop_listing_id: string;
    quantity: number;
  }) => api.post('/cart/add', data),
  
  getCart: () => api.get('/cart'),
  
  updateCartItem: (itemId: string, data: { quantity: number }) => 
    api.put(`/cart/${itemId}`, data),
  
  removeCartItem: (itemId: string) => 
    api.delete(`/cart/${itemId}`),
  
  clearCart: () => api.delete('/cart/clear'),
  
  // Order management
  // Backend expects OrderCreate schema
  // {
  //   items: { crop_listing_id: string; quantity: number }[];
  //   delivery_address: { name: string; phone: string; address: string; city: string; state: string; pincode: string; landmark?: string };
  //   payment_method: 'upi' | 'card' | 'netbanking' | 'wallet' | 'cod';
  //   order_notes?: string;
  //   special_instructions?: string;
  // }
  createOrder: (data: {
    items: { crop_listing_id: string; quantity: number }[];
    delivery_address: {
      name: string;
      phone: string;
      address: string;
      city: string;
      state: string;
      pincode: string;
      landmark?: string;
    };
    payment_method: 'upi' | 'card' | 'netbanking' | 'wallet' | 'cod';
    order_notes?: string;
    special_instructions?: string;
  }) => api.post('/orders', data),
  
  getOrders: (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }) => api.get('/orders', { params }),
  
  getOrder: (orderId: string) => api.get(`/orders/${orderId}`),
  
  cancelOrder: (orderId: string, reason?: string) => 
    api.put(`/orders/${orderId}/cancel`, { reason }),
  
  getOrderStats: () => api.get('/orders/stats'),
};

// Payment API endpoints
export const paymentApi = {
  createPayment: (data: {
    order_id: string;
    payment_method: string;
    gateway_name?: string;
  }) => api.post('/payments/create', data),

  // UPI specific endpoints
  initiateUPIPayment: (data: {
    order_id: string;
    upi_id?: string;
    upi_provider?: string;
  }) => api.post('/payments/upi/initiate', data),

  verifyUPIPayment: (data: {
    payment_id: string;
    upi_transaction_id?: string;
    upi_ref_id?: string;
  }) => api.post('/payments/upi/verify', data),

  // Card endpoints (covers both debit and credit)
  initiateCardPayment: (data: {
    order_id: string;
    card_type?: 'visa' | 'mastercard' | 'rupay' | 'amex';
    card_number?: string;
    card_holder_name?: string;
    expiry_month?: string;
    expiry_year?: string;
    cvv?: string;
  }) => api.post('/payments/card/initiate', data),

  verifyCardPayment: (data: {
    payment_id: string;
    gateway_payment_id?: string;
    gateway_signature?: string;
    auth_code?: string;
  }) => api.post('/payments/card/verify', data),

  // Net Banking endpoints
  initiateNetBankingPayment: (data: {
    order_id: string;
    bank_code: 'sbi' | 'hdfc' | 'icici' | 'axis' | 'kotak' | 'pnb';
    account_holder_name?: string;
  }) => api.post('/payments/netbanking/initiate', data),

  verifyNetBankingPayment: (data: {
    payment_id: string;
    bank_transaction_id?: string;
    cvv?: string;
  }) => api.post('/payments/card/initiate', data),

  // Payment gateway and method info
  getAvailableGateways: () => api.get('/payments/gateways'),
  
  getPaymentMethods: () => api.get('/payments/methods'),

  // Payment verification and status
  verifyPayment: (data: {
    payment_id: string;
    gateway_payment_id: string;
    gateway_order_id: string;
    gateway_signature: string;
  }) => api.post('/payments/verify', data),
  
  getPayment: (paymentId: string) => api.get(`/payments/${paymentId}`),
  
  processRefund: (paymentId: string, reason?: string) => 
    api.post(`/payments/${paymentId}/refund`, { reason }),
  
  // Testing endpoints
  simulateSuccess: (paymentId: string) => 
    api.post(`/payments/simulate/success/${paymentId}`),
  
  simulateFailure: (paymentId: string) => 
    api.post(`/payments/simulate/failure/${paymentId}`),
};

export default api;
