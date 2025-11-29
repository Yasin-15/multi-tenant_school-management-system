import express from 'express';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllRead,
  createNotification
} from '../controllers/notificationController.js';
import { protect, authorize } from '../middleware/auth.js';
import { tenantMiddleware, validateTenantAccess } from '../middleware/tenant.js';

const router = express.Router();

// Apply middleware
router.use(tenantMiddleware);
router.use(protect);
router.use(validateTenantAccess);

// Get all notifications
router.get('/', getNotifications);

// Get unread count
router.get('/unread-count', getUnreadCount);

// Mark notification as read
router.patch('/:id/read', markAsRead);

// Mark all as read
router.patch('/read-all', markAllAsRead);

// Delete notification
router.delete('/:id', deleteNotification);

// Delete all read notifications
router.delete('/read/all', deleteAllRead);

// Create notification (admin only)
router.post('/', authorize('admin'), createNotification);

export default router;
