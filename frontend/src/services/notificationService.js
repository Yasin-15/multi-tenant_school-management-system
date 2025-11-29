import api from './api';

export const notificationService = {
  // Get all notifications
  getNotifications: async (params = {}) => {
    const response = await api.get('/notifications', { params });
    return response.data;
  },

  // Get unread count
  getUnreadCount: async () => {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  },

  // Mark as read
  markAsRead: async (id) => {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  },

  // Mark all as read
  markAllAsRead: async () => {
    const response = await api.patch('/notifications/read-all');
    return response.data;
  },

  // Delete notification
  deleteNotification: async (id) => {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  },

  // Delete all read
  deleteAllRead: async () => {
    const response = await api.delete('/notifications/read/all');
    return response.data;
  },

  // Create notification (admin only)
  createNotification: async (data) => {
    const response = await api.post('/notifications', data);
    return response.data;
  }
};

export default notificationService;
