import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { AuthState } from '../../types';
import { authApi } from '../../api/auth.api';
import { getApiErrorMessage, isApiError } from '../../utils/errors';
import { readStoredUser } from '../../utils/storage';

// Try to hydrate user from localStorage for instant display
const initialState: AuthState = {
  user: readStoredUser(),
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
  error: null,
};

export const register = createAsyncThunk(
  'auth/register',
  async (data: { name: string; email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await authApi.register(data);
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Registration failed'));
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async (data: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await authApi.login(data);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      return response.data;
    } catch (error: unknown) {
      const status = error instanceof Error && 'response' in error ? (error as { response?: { status?: number } }).response?.status : undefined;
      const message = error instanceof Error && 'response' in error ? (error as { response?: { data?: { message?: string } } }).response?.data?.message : undefined;
      if (status === 403) {
        return rejectWithValue('EMAIL_NOT_VERIFIED');
      }
      if (status === 401) {
        return rejectWithValue('INVALID_CREDENTIALS');
      }
      if (!isApiError(error)) {
        return rejectWithValue('NETWORK_ERROR');
      }
      return rejectWithValue(message || getApiErrorMessage(error, 'Login failed'));
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authApi.getCurrentUser();
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to fetch user'));
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  return null;
});

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await authApi.forgotPassword(email);
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to send reset email'));
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (data: { token: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await authApi.resetPassword(data.token, data.password);
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Password reset failed'));
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Get Current User
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        localStorage.setItem('user', JSON.stringify(action.payload));
      })
      .addCase(getCurrentUser.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })
      // Forgot Password
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Reset Password
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
