import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from './hooks/useAuth';
import { getCurrentUser } from './features/auth/authSlice';
import Navbar from './components/layout/Navbar';
import ProtectedRoute from './components/layout/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import PizzaBuilderPage from './pages/PizzaBuilderPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import MyOrdersPage from './pages/MyOrdersPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminInventoryPage from './pages/admin/AdminInventoryPage';
import OrderDetailPage from './pages/OrderDetailPage';

function App() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, token } = useAppSelector((state) => state.auth);
  const location = useLocation();
  const showFooter = !['/login', '/register', '/forgot-password'].includes(location.pathname)
    && !location.pathname.startsWith('/reset-password');

  // On mount: validate session & refresh user data from server
  useEffect(() => {
    if (token) {
      dispatch(getCurrentUser());
    }
  }, [dispatch, token]);

  return (
    <div className="flex min-h-screen flex-col bg-brand-bg">
      <Navbar />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/menu" />} />
          <Route path="/register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/menu" />} />
          <Route path="/forgot-password" element={!isAuthenticated ? <ForgotPasswordPage /> : <Navigate to="/menu" />} />
          <Route path="/reset-password/:token" element={!isAuthenticated ? <ResetPasswordPage /> : <Navigate to="/menu" />} />
          <Route
            path="/menu"
            element={
              <ProtectedRoute>
                <PizzaBuilderPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <MyOrdersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/:id"
            element={
              <ProtectedRoute>
                <OrderDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/:id/tracking"
            element={
              <ProtectedRoute>
                <OrderTrackingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <ProtectedRoute requireAdmin>
                <AdminOrdersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/inventory"
            element={
              <ProtectedRoute requireAdmin>
                <AdminInventoryPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
      {showFooter && (
        <footer className="border-t border-brand-border bg-brand-surface py-6">
          <div className="mx-auto max-w-6xl px-4 text-center text-sm text-brand-text-muted sm:px-8">
            DailyPizza — Fresh artisan pizza, delivered hot.
          </div>
        </footer>
      )}
    </div>
  );
}

export default App;
