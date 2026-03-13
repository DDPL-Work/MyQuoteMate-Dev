// client/src/store/auth/authThunks.js
import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// -------------------- LOGIN --------------------
export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const res = await api.post('/auth/login', { email, password });

      return res.data.data; // { user, accessToken }
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || 'Login failed'
      );
    }
  }
);

// -------------------- SIGNUP --------------------
export const signupUser = createAsyncThunk(
  'auth/signup',
  async ({ name, email, password }, { rejectWithValue }) => {
    try {
      const res = await api.post('/auth/register', {
        firstName: name,
        email,
        password
      });

      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || 'Signup failed'
      );
    }
  }
);
