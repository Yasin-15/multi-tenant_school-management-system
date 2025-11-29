import api from './api';

export const timetableService = {
  // Get timetable for a specific class
  getByClass: async (classId) => {
    const response = await api.get(`/timetable/${classId}`);
    return response.data;
  },

  // Update timetable for a class
  update: async (classId, schedule) => {
    const response = await api.put(`/timetable/${classId}`, { schedule });
    return response.data;
  },

  // Get teacher's schedule for a specific day
  getTeacherSchedule: async (teacherId, day) => {
    const response = await api.get(`/timetable/teacher/${teacherId}/schedule`, {
      params: { day }
    });
    return response.data;
  },

  // Get teacher's full weekly schedule
  getTeacherWeeklySchedule: async (teacherId) => {
    const response = await api.get(`/timetable/teacher/${teacherId}/weekly`);
    return response.data;
  },

  // Check for scheduling conflicts
  checkConflicts: async () => {
    const response = await api.post('/timetable/check-conflicts');
    return response.data;
  },

  // Get student's full weekly schedule
  getStudentWeeklySchedule: async (studentId) => {
    const response = await api.get(`/timetable/student/${studentId}/weekly`);
    return response.data;
  }
};
