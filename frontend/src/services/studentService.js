import api from './api';

export const studentService = {
  getAll: async (params) => {
    const response = await api.get('/students', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/students/${id}`);
    return response.data;
  },

  create: async (studentData) => {
    const response = await api.post('/students', studentData);
    return response.data;
  },

  update: async (id, studentData) => {
    const response = await api.put(`/students/${id}`, studentData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/students/${id}`);
    return response.data;
  },

  getByClass: async (classId) => {
    const response = await api.get('/students', { params: { class: classId } });
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/students/my-profile');
    return response.data;
  },

  importFromExcel: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/students/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  downloadTemplate: () => {
    // For now, this points to the backend template file
    // You could create an endpoint to serve this file or host it statically
    const link = document.createElement('a');
    link.href = '/templates/student-import-template.xlsx';
    link.download = 'student-import-template.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
};
