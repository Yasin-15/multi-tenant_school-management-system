import express from 'express';
import {
    createNotification,
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllRead
} from '../controllers/notificationController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

router.route('/')
    .get(getNotifications)
    .post(authorize('admin', 'teacher', 'superadmin'), createNotification);

router.get('/unread-count', getUnreadCount);
router.patch('/read-all', markAllAsRead);
router.delete('/read/all', deleteAllRead);

router.route('/:id')
    .delete(deleteNotification);

router.patch('/:id/read', markAsRead);

export default router;
