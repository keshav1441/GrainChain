import { create } from 'zustand';
import { authApi } from '../services/api';

export interface User {
  id: number;
  email: string;
  phone: string;
  full_name: string;
  role: 'farmer' | 'buyer' | 'financier' | 'admin';
  verification_status: 'pending' | 'verified' | 'rejected';
  is_active: boolean;
  profile_image_url?: string;
  created_at: string;
  last_login?: string;
  city?: string;
  state?: string;
  address?: string;
}

// Helper function to decode JWT token
const decodeToken = (token: string) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch (error) {
    return null;
  }
};

interface AuthState {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  initializeAuth: () => Promise<void>;
  isAuthenticated: () => boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  phone: string;
  full_name: string;
  role: 'farmer' | 'buyer' | 'financier';
  city?: string;
  state?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  pincode?: string;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  token: localStorage.getItem('token'),
  user: null,
  isLoading: false,

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const response = await authApi.login({ email, password });
      const { access_token, user } = response.data;
      
      // Store token directly in localStorage
      localStorage.setItem('token', access_token);
      authApi.setAuthToken(access_token);
      
      set({
        token: access_token,
        user,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (userData: RegisterData) => {
    set({ isLoading: true });
    try {
      const response = await authApi.register(userData);
      const { access_token, user } = response.data;
      
      // Store token directly in localStorage
      localStorage.setItem('token', access_token);
      authApi.setAuthToken(access_token);
      
      set({
        token: access_token,
        user,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    // Clear token from localStorage and axios defaults
    localStorage.removeItem('token');
    authApi.clearAuthToken();
    
    set({
      token: null,
      user: null,
      isLoading: false,
    });
  },

  initializeAuth: async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    set({ isLoading: true, token });
    try {
      authApi.setAuthToken(token);
      const response = await authApi.getCurrentUser();
      set({ 
        user: response.data.user,
        isLoading: false 
      });
    } catch (error) {
      get().logout();
      set({ isLoading: false });
    }
  },

  isAuthenticated: () => {
    const token = get().token;
    if (!token) return false;
    
    const decoded = decodeToken(token);
    if (!decoded) return false;
    
    // Check if token is expired
    const now = Math.floor(Date.now() / 1000);
    return decoded.exp > now;
  },
}));

