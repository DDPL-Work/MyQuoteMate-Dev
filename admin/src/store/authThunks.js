// admin/src/store/authThunks.js
import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

export const adminLogin = createAsyncThunk(
  'auth/adminLogin',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post('/admin/auth/login', credentials);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Login failed. Please try again.'
      );
    }
  }
);

export const adminRegister = createAsyncThunk(
  'auth/adminRegister',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post('/admin/auth/register', formData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Registration failed. Please try again.'
      );
    }
  }
);

export const getAdminProfile = createAsyncThunk(
  'auth/getAdminProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/admin/me');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to fetch profile'
      );
    }
  }
);

export const updateAdminProfile = createAsyncThunk(
  'auth/updateAdminProfile',
  async (updates, { rejectWithValue }) => {
    try {
      const response = await api.put('/admin/me', updates);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to update profile'
      );
    }
  }
);
