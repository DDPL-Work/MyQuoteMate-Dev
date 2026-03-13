// admin/src/store/dashboardSlice.js
import { createSlice } from '@reduxjs/toolkit';
import { fetchAdminStats, fetchUsers, fetchPayments } from './dashboardThunks';

const initialState = {
  stats: {
    totalUsers: 0,
    standardPurchases: 0,
    premiumPurchases: 0
  },
  users: [],
  payments: [],
  loading: false,
  error: null,
  pagination: {
    users: { page: 1, limit: 10, total: 0 },
    payments: { page: 1, limit: 10, total: 0 }
  }
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearError: state => {
      state.error = null;
    },
    setUsersPage: (state, action) => {
      state.pagination.users.page = action.payload;
    },
    setPaymentsPage: (state, action) => {
      state.pagination.payments.page = action.payload;
    }
  },
  extraReducers: builder => {
    // Fetch Stats
    builder.addCase(fetchAdminStats.pending, state => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchAdminStats.fulfilled, (state, action) => {
      state.loading = false;
      state.stats = action.payload;
    });
    builder.addCase(fetchAdminStats.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Fetch Users
    builder.addCase(fetchUsers.pending, state => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchUsers.fulfilled, (state, action) => {
      state.loading = false;
      state.users = action.payload.users;
      state.pagination.users.total = action.payload.total;
      state.pagination.users.page = action.meta.arg.page || 1;
      state.pagination.users.limit = action.meta.arg.limit || 10;
    });
    builder.addCase(fetchUsers.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Fetch Payments
    builder.addCase(fetchPayments.pending, state => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchPayments.fulfilled, (state, action) => {
      state.loading = false;
      state.payments = action.payload.payments;
      state.pagination.payments.total = action.payload.total;
      state.pagination.payments.page = action.meta.arg.page || 1;
      state.pagination.payments.limit = action.meta.arg.limit || 10;
    });
    builder.addCase(fetchPayments.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
  }
});

export const { clearError, setUsersPage, setPaymentsPage } = dashboardSlice.actions;
export default dashboardSlice.reducer;
