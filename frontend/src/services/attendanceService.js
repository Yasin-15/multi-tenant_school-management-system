import api from './api';

export const attendanceService = {
  markAttendance: async (attendanceData) => {
    const response = await api.post('/attendance', attendanceData);
    return response.data;
  },

  getByClass: async (classId, date) => {
    const response = await api.get('/attendance', {
      params: { classId, startDate: date, endDate: date },
    });
    return response.data;
  },

  getByStudent: async (studentId, startDate, endDate) => {
    const response = await api.get('/attendance', {
      params: { studentId, startDate, endDate },
    });
    return response.data;
  },

  getMyAttendance: async (params) => {
    const response = await api.get('/attendance/my-attendance', { params });
    return response.data;
  },

  getStats: async (params) => {
    const response = await api.get('/attendance/stats', { params });
    return response.data;
  },

  getDailyReport: async (date, classId) => {
    const response = await api.get('/attendance/daily-report', {
      params: { date, classId },
    });
    return response.data;
  },
};
