import api from './api';

export const superAdminService = {
  // System Stats
  getSystemStats: async () => {
    const response = await api.get('/super-admin/stats');
    return response.data;
  },

  // Tenants
  getAllTenants: async (params) => {
    const response = await api.get('/super-admin/tenants', { params });
    return response.data;
  },

  getTenantById: async (id) => {
    const response = await api.get(`/super-admin/tenants/${id}`);
    return response.data;
  },

  createTenant: async (tenantData) => {
    const response = await api.post('/super-admin/tenants', tenantData);
    return response.data;
  },

  updateTenant: async (id, tenantData) => {
    const response = await api.put(`/super-admin/tenants/${id}`, tenantData);
    return response.data;
  },

  deleteTenant: async (id) => {
    const response = await api.delete(`/super-admin/tenants/${id}`);
    return response.data;
  },

  toggleTenantStatus: async (id) => {
    const response = await api.patch(`/super-admin/tenants/${id}/toggle-status`);
    return response.data;
  },

  getTenantUsers: async (id) => {
    const response = await api.get(`/super-admin/tenants/${id}/users`);
    return response.data;
  },

  // Users
  getAllUsers: async (params) => {
    const response = await api.get('/super-admin/users', { params });
    return response.data;
  },

  toggleUserStatus: async (id) => {
    const response = await api.patch(`/super-admin/users/${id}/toggle-status`);
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await api.delete(`/super-admin/users/${id}`);
    return response.data;
  },
};
