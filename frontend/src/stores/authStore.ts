import { create } from 'zustand';
import { authApi } from '../services/api';

export interface User {
  id: number;
  email: string;
  phone: string;
  full_name: string;
  role: 'farmer' | 'buyer' | 'financier' | 'admin';
  verification_status: 'pending' | 'verified' | 'rejected';
  pincode: number;
  is_active: boolean;
  profile_image_url?: string;
  created_at: string;
  last_login?: string;
  city?: string;
  state?: string;
  address?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  checkAuth: () => Promise<void>;
  initializeAuth: () => void;
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
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const response = await authApi.login({ email, password });
      const { access_token, user } = response.data;

      // Save to localStorage separately
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(user));

      authApi.setAuthToken(access_token);

      set({
        user,
        token: access_token,
        isAuthenticated: true,
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

      // Save to localStorage separately
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(user));

      authApi.setAuthToken(access_token);

      set({
        user,
        token: access_token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    authApi.clearAuthToken();
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  updateUser: (userData: Partial<User>) => {
    const currentUser = get().user;
    if (currentUser) {
      const updatedUser = { ...currentUser, ...userData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      set({ user: updatedUser });
    }
  },

  checkAuth: async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      authApi.setAuthToken(token);
      const response = await authApi.getCurrentUser();
      const user = response.data.user;

      // Ensure localStorage is synced
      localStorage.setItem('user', JSON.stringify(user));

      set({
        user,
        token,
        isAuthenticated: true,
      });
    } catch (error) {
      get().logout();
    }
  },

  initializeAuth: () => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    if (token && user) {
      authApi.setAuthToken(token);
      set({ token, user, isAuthenticated: true });
    } else {
      set({ isAuthenticated: false });
    }
  },
}));

// Initialize immediately
useAuthStore.getState().initializeAuth();
