import express from 'express';
import {
    getGrades,
    getGrade,
    getStudentGrades,
    createGrade,
    updateGrade,
    deleteGrade,
    getClassGradesReport,
    bulkCreateGrades,
    exportGrades,
    getMyGrades
} from '../controllers/gradeController.js';
import { protect, authorize } from '../middleware/auth.js';
import { tenantMiddleware } from '../middleware/tenant.js';

const router = express.Router();

// All routes require tenant identification and authentication
router.use(tenantMiddleware);
router.use(protect);

// Export grades (admin, teacher)
router.get('/export', authorize('admin', 'teacher'), exportGrades);

// Get my grades (student only)
router.get('/my-grades', authorize('student'), getMyGrades);

// Get all grades (admin, teacher)
router.get('/', authorize('admin', 'teacher'), getGrades);

// Get student grades
router.get('/student/:studentId', authorize('admin', 'teacher', 'student', 'parent'), getStudentGrades);

// Get class report
router.get('/class/:classId/report', authorize('admin', 'teacher'), getClassGradesReport);

// Get single grade
router.get('/:id', getGrade);

// Bulk create grades (admin, teacher)
router.post('/bulk', authorize('admin', 'teacher'), bulkCreateGrades);

// Create grade (admin, teacher)
router.post('/', authorize('admin', 'teacher'), createGrade);

// Update grade (admin, teacher)
router.put('/:id', authorize('admin', 'teacher'), updateGrade);

// Delete grade (admin only)
router.delete('/:id', authorize('admin'), deleteGrade);

export default router;
