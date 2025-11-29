import express from 'express';
import {
    createTeacher,
    getTeachers,
    getTeacherById,
    updateTeacher,
    deleteTeacher
} from '../controllers/teacherController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

router.route('/')
    .get(getTeachers)
    .post(authorize('admin', 'super_admin'), createTeacher);

router.route('/:id')
    .get(getTeacherById)
    .put(authorize('admin', 'super_admin'), updateTeacher)
    .delete(authorize('admin', 'super_admin'), deleteTeacher);

export default router;
