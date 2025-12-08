import api from './api';

export const gradeService = {
  create: async (gradeData) => {
    const response = await api.post('/grades', gradeData);
    return response.data;
  },

  bulkCreate: async (grades) => {
    const response = await api.post('/grades/bulk', { grades });
    return response.data;
  },

  getAll: async (params) => {
    const response = await api.get('/grades', { params });
    return response.data;
  },

  getByStudent: async (studentId, params) => {
    const response = await api.get(`/grades/student/${studentId}`, { params });
    return response.data;
  },

  getMyGrades: async (params) => {
    const response = await api.get('/grades/my-grades', { params });
    return response.data;
  },

  getByClass: async (classId, params) => {
    const response = await api.get('/grades', {
      params: { class: classId, ...params },
    });
    return response.data;
  },

  getClassReport: async (classId, params) => {
    const response = await api.get(`/grades/class/${classId}/report`, { params });
    return response.data;
  },

  export: async (params) => {
    const response = await api.get('/grades/export', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/grades/${id}`);
    return response.data;
  },

  update: async (id, gradeData) => {
    const response = await api.put(`/grades/${id}`, gradeData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/grades/${id}`);
    return response.data;
  },
};
