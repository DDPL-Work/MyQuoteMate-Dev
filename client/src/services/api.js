// client/src/services/api.js
import axios from 'axios';

// Centralized API configuration
export const API_BASE = import.meta.env.VITE_API_BASE || '/api';
export const API_VERSION = import.meta.env.VITE_API_VERSION || 'v1';
export const apiBaseURL = `${API_BASE}/${API_VERSION}`;

const api = axios.create({
  baseURL: apiBaseURL,
  withCredentials: true,
  timeout: 60000, // 60 second timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add request ID for tracking (fallback when crypto is unavailable)
    try {
      // eslint-disable-next-line no-undef
      const id = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      config.headers['X-Request-ID'] = id;
    } catch (_) {
      // no-op
    }

    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log(`[API] ${response.config.method?.toUpperCase()} ${response.config.url}:`, response.data);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config || {};

    if (import.meta.env.DEV) {
      console.error(`[API Error] ${originalRequest?.method?.toUpperCase?.() || ''} ${originalRequest?.url || ''}:`, error.response?.data || error.message);
    }

    // Handle 401 Unauthorized (token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await api.post('/auth/refresh', { refreshToken });
          const { accessToken } = response.data.data || {};
          if (accessToken) {
            localStorage.setItem('auth_token', accessToken);
            // Retry original request with new token
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('auth_user');

        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }

    if (error.response?.status === 429) {
      console.warn('Rate limited. Please try again later.');
    }

    const formattedError = {
      message: error.response?.data?.error || error.response?.data?.message || error.message || 'An error occurred',
      status: error.response?.status,
      data: error.response?.data
    };

    return Promise.reject(formattedError);
  }
);

export default api;
