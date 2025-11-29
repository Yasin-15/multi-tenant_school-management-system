import api from './api';

export const subjectService = {
  getAll: async () => {
    const response = await api.get('/subjects');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/subjects/${id}`);
    return response.data;
  },

  create: async (subjectData) => {
    const response = await api.post('/subjects', subjectData);
    return response.data;
  },

  update: async (id, subjectData) => {
    const response = await api.put(`/subjects/${id}`, subjectData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/subjects/${id}`);
    return response.data;
  },
};
