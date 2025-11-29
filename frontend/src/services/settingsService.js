import api from './api';

export const settingsService = {
  // Get user settings
  getSettings: async () => {
    const response = await api.get('/settings');
    return response.data;
  },

  // Update settings
  updateSettings: async (data) => {
    const response = await api.put('/settings', data);
    return response.data;
  },

  // Update profile
  updateProfile: async (data) => {
    const response = await api.put('/settings/profile', data);
    return response.data;
  },

  // Change password
  changePassword: async (data) => {
    const response = await api.put('/settings/password', data);
    return response.data;
  }
};

export default settingsService;
