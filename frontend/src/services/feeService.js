import api from './api';

export const feeService = {
  // Fee Structures
  getAllStructures: async () => {
    const response = await api.get('/fee-structures');
    return response.data;
  },

  createStructure: async (structureData) => {
    const response = await api.post('/fee-structures', structureData);
    return response.data;
  },

  updateStructure: async (id, structureData) => {
    const response = await api.put(`/fee-structures/${id}`, structureData);
    return response.data;
  },

  deleteStructure: async (id) => {
    const response = await api.delete(`/fee-structures/${id}`);
    return response.data;
  },

  // Fee Payments
  getAllPayments: async (params) => {
    const response = await api.get('/fee-payments', { params });
    return response.data;
  },

  createInvoice: async (invoiceData) => {
    const response = await api.post('/fee-payments', invoiceData);
    return response.data;
  },

  createPayment: async (paymentData) => {
    const response = await api.post('/fee-payments', paymentData);
    return response.data;
  },

  addPayment: async (id, paymentData) => {
    const response = await api.post(`/fee-payments/${id}/pay`, paymentData);
    return response.data;
  },

  getStudentPayments: async (studentId) => {
    const response = await api.get(`/fee-payments/student/${studentId}`);
    return response.data;
  },

  getPaymentReceipt: async (paymentId) => {
    const response = await api.get(`/fee-payments/${paymentId}/receipt`, {
      responseType: 'blob',
    });
    return response.data;
  },

  getMyPayments: async (params) => {
    const response = await api.get('/fee-payments/my-payments', { params });
    return response.data;
  },

  getPaymentStats: async () => {
    const response = await api.get('/fee-payments/stats');
    return response.data;
  },
};
