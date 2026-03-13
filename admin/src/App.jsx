// admin/src/App.jsx
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getAdminProfile } from './store/authThunks';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import SettingsPage from './pages/SettingsPage';
import PaymentPage from './pages/PaymentPage';
import DiscountsPage from './pages/DiscountsPage';
import SuppliersPage from './pages/SuppliersPage';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const dispatch = useDispatch();
  const { isAuthenticated, admin } = useSelector(state => state.auth);

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token && !admin) {
      dispatch(getAdminProfile());
    }
  }, [dispatch, admin]);

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const authPages = ['/login', '/register'];
  const isAuthPage = authPages.includes(location.pathname);

  return (
    <div className="flex bg-gray-50 min-h-screen w-full overflow-x-hidden">
      {/* Sidebar - Fixed on desktop, mobile overlay on small screens */}
      {isAuthenticated && !isAuthPage && (
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      )}

      {/* Main Content Wrapper */}
      <main className={`flex-1 w-full h-screen flex flex-col overflow-hidden ${!isAuthPage ? 'lg:ml-64' : ''}`}>
        {/* Top Padding for Mobile Menu */}
        {!isAuthPage && <div className="h-12 lg:h-0" />}

        {/* Scrollable Content Area */}
        <div className={`flex-1 overflow-y-auto ${!isAuthPage ? 'p-4 lg:p-8' : ''}`}>
          {/* Page Content */}
          <div className={!isAuthPage ? 'max-w-7xl mx-auto w-full' : 'w-full'}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/payment"
                element={
                  <ProtectedRoute>
                    <PaymentPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/discounts"
                element={
                  <ProtectedRoute>
                    <DiscountsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/suppliers"
                element={
                  <ProtectedRoute>
                    <SuppliersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/pricing" element={<Navigate to="/payment" replace />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
