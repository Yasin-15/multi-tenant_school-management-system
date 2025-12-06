import api from './api';

export const tenantService = {
    // Get tenant by ID
    getTenant: async (id) => {
        const response = await api.get(`/tenants/${id}`);
        return response.data;
    },

    // Update tenant
    updateTenant: async (id, data) => {
        const response = await api.put(`/tenants/${id}`, data);
        return response.data;
    },

    // Upload logo (helper if we need to upload file separately, but for now assuming base64 or url in updateTenant)
    // If we need file upload, we might need a separate endpoint or use FormData
};

export default tenantService;
