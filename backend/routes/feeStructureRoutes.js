import express from 'express';
import {
    createFeeStructure,
    getFeeStructures,
    getFeeStructureById,
    updateFeeStructure,
    deleteFeeStructure
} from '../controllers/feeStructureController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

router.route('/')
    .get(getFeeStructures)
    .post(authorize('admin', 'super_admin'), createFeeStructure);

router.route('/:id')
    .get(getFeeStructureById)
    .put(authorize('admin', 'super_admin'), updateFeeStructure)
    .delete(authorize('admin', 'super_admin'), deleteFeeStructure);

export default router;
