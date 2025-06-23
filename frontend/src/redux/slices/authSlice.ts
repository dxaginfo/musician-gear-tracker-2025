import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

interface User {
  id: string;
  email: string;
  name: string;
  profileImageUrl?: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

const initialState: AuthState = {
  token: localStorage.getItem('token'),
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Check if there's a token and it's valid
if (initialState.token) {
  try {
    const decodedToken: any = jwtDecode(initialState.token);
    const currentTime = Date.now() / 1000;
    
    if (decodedToken.exp < currentTime) {
      // Token has expired
      localStorage.removeItem('token');
      initialState.token = null;
      initialState.isAuthenticated = false;
    } else {
      // Valid token
      initialState.isAuthenticated = true;
      initialState.user = {
        id: decodedToken.userId,
        email: decodedToken.email,
        name: decodedToken.name,
        profileImageUrl: decodedToken.profileImageUrl,
      };
    }
  } catch (e) {
    // Invalid token
    localStorage.removeItem('token');
    initialState.token = null;
    initialState.isAuthenticated = false;
  }
}

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/auth/login', credentials);
      const { token } = response.data;
      
      // Store token in local storage
      localStorage.setItem('token', token);
      
      // Set auth header for future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Decode token to get user data
      const decodedToken: any = jwtDecode(token);
      
      return {
        token,
        user: {
          id: decodedToken.userId,
          email: decodedToken.email,
          name: decodedToken.name,
          profileImageUrl: decodedToken.profileImageUrl,
        },
      };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to login. Please check your credentials.'
      );
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData: RegisterData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/auth/register', userData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Registration failed. Please try again.'
      );
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  localStorage.removeItem('token');
  delete axios.defaults.headers.common['Authorization'];
  return null;
});

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
      // Login cases
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
        state.error = action.payload as string;
      })
      
      // Register cases
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Logout case
      .addCase(logout.fulfilled, (state) => {
        state.token = null;
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      });
  },
});

export const { clearError } = authSlice.actions;

export default authSlice.reducer;