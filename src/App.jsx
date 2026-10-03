import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Providers
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { EmergencyRequestProvider } from './context/EmergencyRequestContext';

// Common Components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';
import ErrorBoundary from './components/common/ErrorBoundary';

// Public Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

// Common Profile Page
import ProfilePage from './pages/profile/ProfilePage';

// Customer Pages
import CustomerDashboard from './pages/customer/CustomerDashboard';
import EmergencyRequestPage from './pages/customer/EmergencyRequestPage';
import RequestTrackingPage from './pages/customer/RequestTrackingPage';
import OrderHistoryPage from './pages/customer/OrderHistoryPage';
import HelpSupportPage from './pages/customer/HelpSupportPage';

// Partner Pages
import PartnerDashboard from './pages/partner/PartnerDashboard';
import ActiveDeliveryPage from './pages/partner/ActiveDeliveryPage';
import PartnerHistoryPage from './pages/partner/PartnerHistoryPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagementPage from './pages/admin/UserManagementPage';
import PartnerManagementPage from './pages/admin/PartnerManagementPage';
import RequestManagementPage from './pages/admin/RequestManagementPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <EmergencyRequestProvider>
            <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-brand-500 selection:text-white">
              <Navbar />

              <main className="flex-1">
                <ErrorBoundary>
                  <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />

                  {/* Universal Profile Route for Customer, Partner & Admin */}
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute allowedRoles={['CUSTOMER', 'DELIVERY_PARTNER', 'ADMIN']}>
                        <ProfilePage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/customer/profile"
                    element={
                      <ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN']}>
                        <ProfilePage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Customer Protected Routes */}
                  <Route
                    path="/customer"
                    element={
                      <ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN']}>
                        <CustomerDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/customer/emergency"
                    element={
                      <ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN']}>
                        <EmergencyRequestPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/customer/tracking"
                    element={
                      <ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN']}>
                        <RequestTrackingPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/customer/orders"
                    element={
                      <ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN']}>
                        <OrderHistoryPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/customer/help"
                    element={
                      <ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN']}>
                        <HelpSupportPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Delivery Partner Protected Routes */}
                  <Route
                    path="/partner"
                    element={
                      <ProtectedRoute allowedRoles={['DELIVERY_PARTNER', 'ADMIN']}>
                        <PartnerDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/partner/active"
                    element={
                      <ProtectedRoute allowedRoles={['DELIVERY_PARTNER', 'ADMIN']}>
                        <ActiveDeliveryPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/partner/history"
                    element={
                      <ProtectedRoute allowedRoles={['DELIVERY_PARTNER', 'ADMIN']}>
                        <PartnerHistoryPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Admin Protected Routes */}
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute allowedRoles={['ADMIN']}>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/users"
                    element={
                      <ProtectedRoute allowedRoles={['ADMIN']}>
                        <UserManagementPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/partners"
                    element={
                      <ProtectedRoute allowedRoles={['ADMIN']}>
                        <PartnerManagementPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/requests"
                    element={
                      <ProtectedRoute allowedRoles={['ADMIN']}>
                        <RequestManagementPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/settings"
                    element={
                      <ProtectedRoute allowedRoles={['ADMIN']}>
                        <AdminSettingsPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </ErrorBoundary>
            </main>

              <Footer />
            </div>
          </EmergencyRequestProvider>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}
