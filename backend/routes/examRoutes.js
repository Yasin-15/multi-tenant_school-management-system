import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
    createExam,
    getExams,
    getExamById,
    submitExam,
    getExamResults
} from '../controllers/examController.js';

const router = express.Router();

// Public routes (protected by auth)
router.use(protect);

// Student routes
router.get('/', getExams); // Students see their exams, Teachers see all/filtered
router.get('/:id', getExamById); // Get exam details (for taking it)
router.post('/submit', authorize('student'), submitExam); // Submit exam
router.get('/results', getExamResults); // Get results

// Admin/Teacher routes
router.post('/', authorize('admin', 'teacher'), createExam);

export default router;
