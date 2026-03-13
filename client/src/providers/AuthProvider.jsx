// client/src/providers/AuthProvider.jsx
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import AuthModal from "../pages/AuthModel";
import { toast } from "react-hot-toast";

export const AuthContext = createContext(null);


import api, { apiBaseURL } from "../services/api";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Start with loading true
  const [error, setError] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [redirectPath, setRedirectPath] = useState(null);
  const navigate = useNavigate();

  // ----------------------------------
  // Load user from localStorage and validate
  // ----------------------------------
  useEffect(() => {
    const loadUser = async () => {
      const saved = localStorage.getItem("auth_user");
      const token = localStorage.getItem("auth_token");

      if (saved && token) {
        try {
          const parsedUser = JSON.parse(saved);

          // Validate token by fetching profile
          try {
            const { data } = await api.get(`/users/me`);
            if (data?.data) {
              setUser(data.data);
            } else {
              localStorage.removeItem("auth_user");
              localStorage.removeItem("auth_token");
              setUser(null);
            }
          } catch (validationError) {
            console.error('Token validation failed:', validationError);
            setUser(null);
          }
        } catch (e) {
          console.error("Error parsing saved user:", e);
          localStorage.removeItem("auth_user");
          localStorage.removeItem("auth_token");
          setUser(null);
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  // ----------------------------------
  // REFRESH USER
  // ----------------------------------
  const refreshUser = async () => {
    const token = localStorage.getItem("auth_token");
    if (!token) return null;

    try {
      const { data } = await api.get(`/users/me`);
      if (data?.data) {
        setUser(data.data);
        localStorage.setItem("auth_user", JSON.stringify(data.data));
        return data.data;
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }

    return null;
  };

  // ----------------------------------
  // UPDATE USER FUNCTION
  // ----------------------------------
  const updateUser = useCallback(async (updates) => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return false;

      const { data } = await api.put(`/users/me`, updates);

      if (data?.success) {
        // Update local state
        setUser(prev => ({
          ...prev,
          ...data.data.user
        }));

        // Update localStorage
        localStorage.setItem("auth_user", JSON.stringify({
          ...user,
          ...data.data.user
        }));

        return true;
      } else {
        throw new Error(data.error || "Failed to update user");
      }
    } catch (error) {
      console.error('Failed to update user:', error);
      return false;
    }
  }, [user]);

  // ----------------------------------
  // LOGIN - Production Ready
  // ----------------------------------
  const login = async ({ email, password }) => {
    const loginErrorMessage = "wrong credentials";
    setLoading(true);
    setError(null);

    try {
      const { data } = await api.post(`/auth/login`, {
        email: email.toLowerCase(),
        password: password
      });

      if (!data) {
        throw new Error(loginErrorMessage);
      }

      if (!data?.success || !data?.data?.user) {
        throw new Error(loginErrorMessage);
      }

      const { user: userDataResponse, tokens } = data.data;
      const { accessToken, refreshToken } = tokens || {};

      // Set user state
      setUser(userDataResponse);

      // Store in localStorage
      localStorage.setItem("auth_user", JSON.stringify(userDataResponse));
      if (accessToken) localStorage.setItem("auth_token", accessToken);
      if (refreshToken) localStorage.setItem("refresh_token", refreshToken);

      const hydratedUser = accessToken ? await refreshUser() : null;

      setShowAuthModal(false);
      return { success: true, user: hydratedUser || userDataResponse };
    } catch (err) {
      console.error('Login error:', err);
      setError(loginErrorMessage);
      return {
        success: false,
        error: loginErrorMessage
      };
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------
  // VERIFY OTP DURING LOGIN/SIGNUP
  // ----------------------------------
  const verifyOtpDuringLogin = async (phone, code) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post(`/auth/verify-otp`, { phone, code });

      if (!data?.success) {
        throw new Error(data?.error || "Verification failed");
      }

      const { user: userData, tokens } = data.data;

      if (!tokens) {
        throw new Error("Verification successful but no tokens received");
      }

      // Set user state
      setUser(userData);

      // Store in localStorage
      localStorage.setItem("auth_user", JSON.stringify(userData));
      localStorage.setItem("auth_token", tokens.accessToken);
      localStorage.setItem("refresh_token", tokens.refreshToken);

      const hydratedUser = await refreshUser();

      // Close modal and handle redirect
      setShowAuthModal(false);
      if (redirectPath) {
        navigate(redirectPath);
        setRedirectPath(null);
      }

      return { success: true, user: hydratedUser || userData };
    } catch (error) {
      console.error('OTP verification failed:', error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------
  // SIGNUP - Production Ready
  // ----------------------------------
  const signup = async (userData) => {
    setLoading(true);
    setError(null);

    try {
      const payload = {
        email: userData.email.toLowerCase(),
        password: userData.password,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone || undefined,
        isPhoneVerified: Boolean(userData.isPhoneVerified)
      };

      const { data } = await api.post(`/auth/register`, payload);

      if (!data) {
        throw new Error("Registration failed");
      }

      if (data.requiresOtp) {
        setLoading(false);
        return { requiresOtp: true, phone: data.data.phone };
      }

      if (!data.success || !data.data?.user) {
        throw new Error("Invalid response from server");
      }

      const { user: userDataResponse, tokens } = data.data;
      const { accessToken, refreshToken } = tokens || {};

      // Set user state
      setUser(userDataResponse);

      // Store in localStorage
      localStorage.setItem("auth_user", JSON.stringify(userDataResponse));
      if (accessToken) localStorage.setItem("auth_token", accessToken);
      if (refreshToken) localStorage.setItem("refresh_token", refreshToken);

      const hydratedUser = accessToken ? await refreshUser() : null;

      setShowAuthModal(false);
      return { success: true, user: hydratedUser || userDataResponse };
    } catch (err) {
      console.error('Signup error:', err);
      setError(err.message || "Registration failed. Please try again.");
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------
  // SEND OTP
  // ----------------------------------
  const sendOtp = async (phone) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post(`/auth/send-otp`, { phone });
      if (!data?.success) {
        throw new Error(data?.error || "Failed to send verification code");
      }

      return { success: true };
    } catch (err) {
      console.error('Send OTP error:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------
  // VERIFY OTP
  // ----------------------------------
  const verifyOtp = async (phone, code) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post(`/auth/verify-otp`, { phone, code });
      if (!data?.success) {
        throw new Error(data?.error || "Verification failed");
      }

      const verifiedUser = data?.data?.user || null;
      const tokens = data?.data?.tokens || null;

      if (verifiedUser && tokens?.accessToken && tokens?.refreshToken) {
        setUser(verifiedUser);
        localStorage.setItem("auth_user", JSON.stringify(verifiedUser));
        localStorage.setItem("auth_token", tokens.accessToken);
        localStorage.setItem("refresh_token", tokens.refreshToken);

        const hydratedUser = await refreshUser();
        return { success: true, user: hydratedUser || verifiedUser, existingUser: true };
      }

      return { success: true, user: null, existingUser: false };
    } catch (err) {
      console.error('Verify OTP error:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------
  // LOGOUT - Production Ready
  // ----------------------------------
  const logout = () => {
    const token = localStorage.getItem("auth_token");
    setUser(null);
    localStorage.removeItem("auth_user");
    localStorage.removeItem("auth_token");
    localStorage.removeItem("refresh_token");
    // Optional: Call backend logout endpoint
    if (!token) {
      return;
    }

    api.post(`/auth/logout`).catch((error) => {
      if (error?.status && error.status !== 401) {
        console.error('Logout request failed:', error);
      }
    });
  };

  // ----------------------------------
  // REQUIRE LOGIN (FOR PROTECTED ROUTES)
  // ----------------------------------
  const requestLogin = useCallback((path) => {
    if (user) return; // Already logged in

    setRedirectPath(path);
    setShowAuthModal(true);
  }, [user]); // Removed showAuthModal to stabilize identity and stop loops

  // ----------------------------------
  // CLEAR ERROR
  // ----------------------------------
  const clearError = useCallback(() => {
    setError(null);
  }, []);


  // ----------------------------------
  // SHOW AUTH MODAL
  // ----------------------------------
  const openAuthModal = () => {
    setShowAuthModal(true);
    clearError();
  };

  // ----------------------------------
  // UPLOAD AVATAR
  // ----------------------------------
  const uploadAvatar = async (file) => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return null;

      const formData = new FormData();
      formData.append('avatar', file);

      const { data } = await api.post(`/users/me/avatar`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (data?.success) {
        // Update user state
        setUser(prev => ({
          ...prev,
          ...data.data.user
        }));

        // Update localStorage
        localStorage.setItem("auth_user", JSON.stringify({
          ...user,
          ...data.data.user
        }));

        return data.data.avatarUrl;
      } else {
        throw new Error(data.error || "Failed to upload avatar");
      }
    } catch (error) {
      console.error('Avatar upload error:', error);
      throw error;
    }
  };

  // ----------------------------------
  // REMOVE AVATAR
  // ----------------------------------
  const removeAvatar = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return false;

      const { data } = await api.delete(`/users/me/avatar`);

      if (data?.success) {
        // Update user state
        setUser(prev => ({
          ...prev,
          avatarUrl: null
        }));

        // Update localStorage
        localStorage.setItem("auth_user", JSON.stringify({
          ...user,
          avatarUrl: null
        }));

        return true;
      } else {
        throw new Error(data.error || "Failed to remove avatar");
      }
    } catch (error) {
      console.error('Avatar removal error:', error);
      return false;
    }
  };

  // ----------------------------------
  // CHANGE PASSWORD
  // ----------------------------------
  const changePassword = async (passwordData) => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return false;

      const { data } = await api.put(`/users/me/password`, passwordData);

      if (data?.success) {
        return true;
      } else {
        throw new Error(data.error || "Failed to change password");
      }
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  };

  // ----------------------------------
  // DELETE ACCOUNT
  // ----------------------------------
  const deleteAccount = async (confirmPassword) => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return false;

      const { data } = await api.delete(`/users/me`, { data: { confirmPassword } });

      if (data?.success) {
        // Logout after successful deletion
        logout();
        return true;
      } else {
        throw new Error(data.error || "Failed to delete account");
      }
    } catch (error) {
      console.error('Delete account error:', error);
      throw error;
    }
  };

  // Context value memoized to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    user,
    loading,
    error,
    login,
    signup,
    logout,
    updateUser,
    refreshUser,
    uploadAvatar,
    removeAvatar,
    changePassword,
    deleteAccount,
    sendOtp,
    verifyOtp,
    verifyOtpDuringLogin,
    isAuthenticated: !!user,
    requestLogin,
    clearError,
    showLogin: openAuthModal
  }), [
    user, loading, error, login, signup, logout,
    updateUser, refreshUser, uploadAvatar, removeAvatar,
    changePassword, deleteAccount, requestLogin, sendOtp, verifyOtp, verifyOtpDuringLogin, clearError

  ]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}

      {/* Global initial loading spinner - only show if no user and loading */}
      {loading && !user && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-[9999] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
      )}

      <AuthModal
        isOpen={showAuthModal}
        login={login}
        signup={signup}
        loading={loading}
        error={error}
        clearError={clearError}
        verifyOtpDuringLogin={verifyOtpDuringLogin}
        onClose={() => {
          setShowAuthModal(false);
          clearError();
          // If on a protected route and closing modal, redirect to home
          const protectedRoutes = ['/profile'];
          if (protectedRoutes.some(route => window.location.pathname.startsWith(route)) && !user) {
            navigate('/');
          }
          setRedirectPath(null);
        }}
      />

    </AuthContext.Provider>
  );
};
