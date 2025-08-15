import axios from 'axios';
import { RegisterData } from '../stores/authStore';

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Immediately try to set the token on module load to prevent race conditions
const storedAuth = localStorage.getItem('grainchain-auth');
if (storedAuth) {
  try {
    const { state } = JSON.parse(storedAuth);
    if (state?.token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
    }
  } catch (error) {
    console.error('Failed to parse stored auth data on init:', error);
  }
}

// Immediately try to set the token on module load
const token = localStorage.getItem('grainchain-auth');
if (token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('grainchain-auth');
    if (token) {
      try {
        const authData = JSON.parse(token);
        if (authData.state?.token) {
          config.headers.Authorization = `Bearer ${authData.state.token}`;
        }
      } catch (error) {
        console.error('Error parsing auth token:', error);
      }
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
      localStorage.removeItem('grainchain-auth');
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
  
  getFarmers: (params?: {
    limit?: number;
    skip?: number;
  }) => api.get('/buyer/farmers', { params }),
  
  getListings: (params?: {
    crop_name?: string;
    category?: string;
    state?: string;
    city?: string;
    min_price?: number;
    max_price?: number;
    min_quantity?: number;
    max_quantity?: number;
    skip?: number;
    limit?: number;
    sort_by?: string;
    sort_order?: string;
  }) => api.get('/buyer/listings', { params }),
  
  getListingDetails: (id: string) => api.get(`/buyer/listings/${id}`),
  
  createInquiry: (data: any) => api.post('/buyer/inquiries', data),
  
  getInquiries: (params?: {
    status?: string;
    skip?: number;
    limit?: number;
  }) => api.get('/buyer/inquiries', { params }),
  
  updateInquiry: (id: string, data: any) => api.put(`/buyer/inquiries/${id}`, data),
  
  cancelInquiry: (id: string) => api.delete(`/buyer/inquiries/${id}`),
  
  getAnalytics: () => api.get('/buyer/analytics'),
};

export default api;
