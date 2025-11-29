import express from 'express';
import {
    generateStudentReportCard,
    generateClassExcelReport,
    generateSubjectReport,
    generateClassPDFReport,
    generateStudentExcelReport,
    generateStudentAttendanceReport,
    generateStudentFeeReport,
    generateClassFeeReport,
    generateBatchReportCards,
    generateBatchFeeReport
} from '../controllers/reportController.js';
import { protect, authorize } from '../middleware/auth.js';
import { tenantMiddleware } from '../middleware/tenant.js';

const router = express.Router();

// All routes require tenant identification and authentication
router.use(tenantMiddleware);
router.use(protect);

// Student reports
router.get('/student/:studentId/report-card', authorize('admin', 'teacher', 'student', 'parent'), generateStudentReportCard);
router.get('/student/:studentId/excel', authorize('admin', 'teacher', 'student', 'parent'), generateStudentExcelReport);
router.get('/student/:studentId/attendance', authorize('admin', 'teacher', 'student', 'parent'), generateStudentAttendanceReport);
router.get('/student/:studentId/fee', authorize('admin', 'student', 'parent'), generateStudentFeeReport);

// Class reports
router.get('/class/:classId/pdf', authorize('admin', 'teacher'), generateClassPDFReport);
router.get('/class/:classId/excel', authorize('admin', 'teacher'), generateClassExcelReport);
router.get('/class/:classId/fee', authorize('admin'), generateClassFeeReport);

// Subject reports
router.get('/subject/:subjectId/report', authorize('admin', 'teacher'), generateSubjectReport);

// Batch reports
router.post('/batch/report-cards', authorize('admin'), generateBatchReportCards);
router.post('/batch/fees', authorize('admin'), generateBatchFeeReport);

export default router;
