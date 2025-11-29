import express from 'express';
import {
    markAttendance,
    getAttendance,
    getAttendanceStats,
    getDailyAttendanceReport
} from '../controllers/attendanceController.js';
import { protect, authorize } from '../middleware/auth.js';
import { tenantMiddleware, validateTenantAccess } from '../middleware/tenant.js';

const router = express.Router();

// Apply middleware
router.use(tenantMiddleware);
router.use(protect);
router.use(validateTenantAccess);

router.post('/', authorize('admin', 'teacher'), markAttendance);
router.get('/', getAttendance);
router.get('/my-attendance', authorize('student'), getAttendance);
router.get('/stats', getAttendanceStats);
router.get('/daily-report', authorize('admin', 'teacher'), getDailyAttendanceReport);

export default router;
