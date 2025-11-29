import express from 'express';
import {
    createSubject,
    getSubjects,
    getSubjectById,
    updateSubject,
    deleteSubject
} from '../controllers/subjectController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

router.route('/')
    .get(getSubjects)
    .post(authorize('admin', 'super_admin'), createSubject);

router.route('/:id')
    .get(getSubjectById)
    .put(authorize('admin', 'super_admin'), updateSubject)
    .delete(authorize('admin', 'super_admin'), deleteSubject);

export default router;
