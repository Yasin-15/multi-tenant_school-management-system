import express from 'express';
import {
    getStudents,
    getStudent,
    createStudent,
    updateStudent,
    deleteStudent,
    addStudentNote
} from '../controllers/studentController.js';
import { protect, authorize } from '../middleware/auth.js';
import { tenantMiddleware, validateTenantAccess } from '../middleware/tenant.js';

const router = express.Router();

// Apply middleware
router.use(tenantMiddleware);
router.use(protect);
router.use(validateTenantAccess);

router.route('/')
    .get(authorize('admin', 'teacher'), getStudents)
    .post(authorize('admin'), createStudent);

router.get('/my-profile', authorize('student'), getStudent);

router.route('/:id')
    .get(getStudent)
    .put(authorize('admin'), updateStudent)
    .delete(authorize('admin'), deleteStudent);

router.post('/:id/notes', authorize('admin', 'teacher'), addStudentNote);

export default router;
