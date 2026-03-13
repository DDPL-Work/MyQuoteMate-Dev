// admin/src/store/dashboardThunks.js
import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

export const fetchAdminStats = createAsyncThunk(
  'dashboard/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/admin/stats');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to fetch stats'
      );
    }
  }
);

export const fetchUsers = createAsyncThunk(
  'dashboard/fetchUsers',
  async ({ page = 1, limit = 10, search = '', status = 'all' }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({
        page,
        limit,
        ...(search && { search }),
        ...(status !== 'all' && { status })
      });

      const response = await api.get(`/admin/users?${params}`);
      return {
        users: response.data.data,
        total: response.data.pagination?.total || response.data.data.length
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to fetch users'
      );
    }
  }
);

export const fetchPayments = createAsyncThunk(
  'dashboard/fetchPayments',
  async ({ page = 1, limit = 10, status = 'all', tier = 'all' }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({
        page,
        limit,
        ...(status !== 'all' && { status }),
        ...(tier !== 'all' && { tier })
      });

      const response = await api.get(`/admin/payments?${params}`);
      return {
        payments: response.data.data,
        total: response.data.pagination?.total || response.data.data.length
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to fetch payments'
      );
    }
  }
);

export const deleteUser = createAsyncThunk(
  'dashboard/deleteUser',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/admin/users/${userId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to delete user'
      );
    }
  }
);

export const updateUserStatus = createAsyncThunk(
  'dashboard/updateUserStatus',
  async ({ userId, status }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/admin/users/${userId}`, { accountStatus: status });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to update user status'
      );
    }
  }
);
