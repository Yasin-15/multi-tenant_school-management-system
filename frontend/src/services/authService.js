import api from './api';

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Fetch fresh user data from database
  fetchUserFromDatabase: async () => {
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
    return null;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token, password) => {
    const response = await api.post('/auth/reset-password', { token, password });
    return response.data;
  },
};
