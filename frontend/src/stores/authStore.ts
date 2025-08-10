import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await authApi.login({ email, password });
          const { access_token, user } = response.data;
          
          // Set token in axios defaults
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
          
          // Set token in axios defaults
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
        // Clear token from axios defaults
        authApi.clearAuthToken();
        
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
          set({
            user: { ...currentUser, ...userData },
          });
        }
      },

      checkAuth: async () => {
        const token = get().token;
        if (!token) return;

        try {
          authApi.setAuthToken(token);
          const response = await authApi.getCurrentUser();
          set({
            user: response.data.user,
            isAuthenticated: true,
          });
        } catch (error) {
          // Token is invalid, clear auth state
          get().logout();
        }
      },
    }),
    {
      name: 'grainchain-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
