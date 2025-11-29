import express from 'express';
import {
    createClass,
    getClasses,
    getClassById,
    updateClass,
    deleteClass
} from '../controllers/classController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

router.route('/')
    .get(getClasses)
    .post(authorize('admin', 'super_admin'), createClass);

router.route('/:id')
    .get(getClassById)
    .put(authorize('admin', 'super_admin'), updateClass)
    .delete(authorize('admin', 'super_admin'), deleteClass);

export default router;
