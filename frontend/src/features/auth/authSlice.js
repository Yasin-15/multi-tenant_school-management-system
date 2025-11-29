import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunk for login
export const login = createAsyncThunk(
    'auth/login',
    async ({ email, password, role }, { rejectWithValue }) => {
        try {
            const response = await api.post('/auth/login', { email, password, role });
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                
                // Store user data with tenant ID (not the full tenant object)
                const userData = response.data.user;
                const userToStore = {
                    ...userData,
                    tenant: userData.tenant?._id || userData.tenant // Extract ID if it's an object
                };
                localStorage.setItem('user', JSON.stringify(userToStore));
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Login failed');
        }
    }
);

// Async thunk to fetch user from database
export const fetchCurrentUser = createAsyncThunk(
    'auth/fetchCurrentUser',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/auth/me');
            if (response.data.success && response.data.data) {
                const userData = response.data.data;
                const userToStore = {
                    ...userData,
                    tenant: userData.tenant?._id || userData.tenant
                };
                localStorage.setItem('user', JSON.stringify(userToStore));
                return userToStore;
            }
            throw new Error('Failed to fetch user data');
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch user');
        }
    }
);

const initialState = {
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    isAuthenticated: !!localStorage.getItem('token'),
    loading: false,
    error: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.error = null;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(login.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                // Handle both response formats: data.user or direct user
                state.user = action.payload.data?.user || action.payload.user;
                state.token = action.payload.data?.token || action.payload.token;
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchCurrentUser.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchCurrentUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
                state.isAuthenticated = true;
            })
            .addCase(fetchCurrentUser.rejected, (state) => {
                state.loading = false;
                state.isAuthenticated = false;
                state.user = null;
                state.token = null;
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            });
    },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
