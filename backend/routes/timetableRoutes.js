import express from 'express';
import { 
    getTimetable, 
    updateTimetable, 
    checkConflicts,
    getTeacherSchedule,
    getTeacherWeeklySchedule,
    getStudentWeeklySchedule
} from '../controllers/timetableController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/:classId', protect, authorize('admin', 'superadmin', 'teacher', 'student', 'parent'), getTimetable);
router.put('/:classId', protect, authorize('admin', 'superadmin'), updateTimetable);
router.post('/check-conflicts', protect, authorize('admin', 'superadmin'), checkConflicts);

// Teacher schedule routes
router.get('/teacher/:teacherId/schedule', protect, authorize('admin', 'superadmin', 'teacher'), getTeacherSchedule);
router.get('/teacher/:teacherId/weekly', protect, authorize('admin', 'superadmin', 'teacher'), getTeacherWeeklySchedule);

// Student schedule routes
router.get('/student/:studentId/weekly', protect, authorize('admin', 'superadmin', 'student', 'parent'), getStudentWeeklySchedule);

export default router;
