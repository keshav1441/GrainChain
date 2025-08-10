import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { useAuthStore } from './stores/authStore';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import {Navbar} from './components/layout/Navbar';
import {HomePage} from './pages/HomePage';
import {LoginPage} from './pages/auth/LoginPage';
import {RegisterPage} from './pages/auth/RegisterPage';
import {FarmerDashboard} from './pages/farmer/FarmerDashboard';
import {CreateListing} from './pages/farmer/CreateListing';
import {FarmerAnalytics} from './pages/farmer/FarmerAnalytics';
import {FarmerFinance} from './pages/farmer/FarmerFinance';
import {FarmerProfile} from './pages/farmer/FarmerProfile';
import {BuyerDashboard} from './pages/buyer/BuyerDashboard';
import {FinancierDashboard} from './pages/financier/FinancierDashboard';
import {ProfilePage} from './pages/ProfilePage';
import MarketplacePage from './pages/MarketplacePage';
import FinancePage from './pages/FinancePage';
import NotificationsPage from './pages/NotificationsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import ContactPage from './pages/ContactPage';
import PaymentDashboard from './pages/PaymentDashboard';
import {ProtectedRoute} from './components/auth/ProtectedRoute';
import {Footer} from './components/layout/Footer';
import { Toaster } from 'react-hot-toast';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  const { user, isAuthenticated } = useAuthStore();

  const getDashboardRoute = () => {
    if (!user) return '/';
    
    switch (user.role) {
      case 'farmer':
        return '/farmer/dashboard';
      case 'buyer':
        return '/buyer/dashboard';
      case 'financier':
        return '/financier/dashboard';
      default:
        return '/';
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Navbar />
          
          <main className="flex-1">
            <Routes>
              {/* Public routes */}
              <Route 
                path="/" 
                element={
                  isAuthenticated ? 
                  <Navigate to={getDashboardRoute()} replace /> : 
                  <HomePage />
                } 
              />
              <Route path="/marketplace" element={<MarketplacePage />} />
              <Route path="/marketplace/:id" element={<ProductDetailPage />} />
              <Route path="/finance" element={<FinancePage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route 
                path="/login" 
                element={
                  isAuthenticated ? 
                  <Navigate to={getDashboardRoute()} replace /> : 
                  <LoginPage />
                } 
              />
              <Route 
                path="/register" 
                element={
                  isAuthenticated ? 
                  <Navigate to={getDashboardRoute()} replace /> : 
                  <RegisterPage />
                } 
              />
              
              {/* Protected routes */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/notifications"
                element={
                  <ProtectedRoute>
                    <NotificationsPage />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/payments"
                element={
                  <ProtectedRoute>
                    <PaymentDashboard />
                  </ProtectedRoute>
                }
              />
              
              {/* Role-specific dashboards */}
              <Route
                path="/farmer/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['farmer']}>
                    <FarmerDashboard />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/farmer/listings/new"
                element={
                  <ProtectedRoute allowedRoles={['farmer']}>
                    <CreateListing />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/farmer/analytics"
                element={
                  <ProtectedRoute allowedRoles={['farmer']}>
                    <FarmerAnalytics />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/farmer/finance"
                element={
                  <ProtectedRoute allowedRoles={['farmer']}>
                    <FarmerFinance />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/farmer/profile"
                element={
                  <ProtectedRoute allowedRoles={['farmer']}>
                    <FarmerProfile />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/buyer/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['buyer']}>
                    <BuyerDashboard />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/financier/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['financier']}>
                    <FinancierDashboard />
                  </ProtectedRoute>
                }
              />
              
              {/* Redirect to appropriate dashboard */}
              <Route
                path="/dashboard"
                element={
                  isAuthenticated ? 
                  <Navigate to={getDashboardRoute()} replace /> : 
                  <Navigate to="/login" replace />
                }
              />
              
              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          
          <Footer />
        </div>
        
        {/* Toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              style: {
                background: '#22c55e',
              },
            },
            error: {
              style: {
                background: '#ef4444',
              },
            },
          }}
        />
      </Router>
    </QueryClientProvider>
  );
}
