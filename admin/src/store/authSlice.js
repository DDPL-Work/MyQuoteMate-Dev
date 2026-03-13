// admin/src/store/authSlice.js
import { createSlice } from '@reduxjs/toolkit';
import { adminLogin, adminRegister, getAdminProfile, updateAdminProfile } from './authThunks';

const initialState = {
  admin: null,
  loading: false,
  error: null,
  isAuthenticated: !!localStorage.getItem('accessToken')
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: state => {
      state.admin = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    },
    clearError: state => {
      state.error = null;
    }
  },
  extraReducers: builder => {
    // Admin Login
    builder.addCase(adminLogin.pending, state => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(adminLogin.fulfilled, (state, action) => {
      state.loading = false;
      state.admin = action.payload.user;
      state.isAuthenticated = true;
      localStorage.setItem('accessToken', action.payload.tokens.accessToken);
      localStorage.setItem('refreshToken', action.payload.tokens.refreshToken);
    });
    builder.addCase(adminLogin.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
    });

    // Admin Register
    builder.addCase(adminRegister.pending, state => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(adminRegister.fulfilled, (state, action) => {
      state.loading = false;
      state.admin = action.payload.user;
      state.isAuthenticated = true;
      localStorage.setItem('accessToken', action.payload.tokens.accessToken);
      localStorage.setItem('refreshToken', action.payload.tokens.refreshToken);
    });
    builder.addCase(adminRegister.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
    });

    // Get Admin Profile
    builder.addCase(getAdminProfile.pending, state => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getAdminProfile.fulfilled, (state, action) => {
      state.loading = false;
      state.admin = action.payload;
    });
    builder.addCase(getAdminProfile.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Update Admin Profile
    builder.addCase(updateAdminProfile.pending, state => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateAdminProfile.fulfilled, (state, action) => {
      state.loading = false;
      state.admin = action.payload;
    });
    builder.addCase(updateAdminProfile.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
  }
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
