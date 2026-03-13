// client/src/App.jsx
import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import HeaderFooter from "./Layout/HeaderFooter";
import { useAuth } from "./hooks/useAuth";
import { AuthProvider } from "./providers/AuthProvider";

import Landing from "./pages/Landing";
import HowItWorks from "./pages/HowItWorks";
import Pricing from "./pages/Pricing";
import Guides from "./pages/Guides";
import Contact from "./pages/Contact";
import CheckQuote from "./pages/CheckQuote";
import AboutUs from "./pages/AboutUs";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import FAQ from "./pages/FAQ";
import Profile from "./pages/Profile";
import AnalysisPage from "./pages/AnalysisPage";

// ------------------------------------
// Protected Route (modal-based auth)
// ------------------------------------
const ProtectedRoute = ({ children }) => {
  const { user, requestLogin } = useAuth();

  useEffect(() => {
    if (!user) {
      requestLogin(window.location.pathname);
    }
  }, [user, requestLogin]);

  if (!user) return null;

  return children;
};

import ScrollToTop from "./components/ScrollToTop";

function AppContent() {
  return (
    <>
      <ScrollToTop />
      <HeaderFooter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/guides" element={<Guides />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/check-quote" element={<CheckQuote />} />

          {/* Protected routes */}
          <Route path="/pricing" element={<Pricing />} />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/analysis/:jobId"
            element={
              <ProtectedRoute>
                <AnalysisPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </HeaderFooter>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
