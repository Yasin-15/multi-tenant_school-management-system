import express from 'express';
import {
    createTenant,
    getTenants,
    getTenantById,
    updateTenant,
    deleteTenant
} from '../controllers/tenantController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

router.route('/')
    .get(authorize('super_admin'), getTenants)
    .post(authorize('super_admin'), createTenant);

router.route('/:id')
    .get(authorize('super_admin', 'admin'), getTenantById)
    .put(authorize('super_admin', 'admin'), updateTenant)
    .delete(authorize('super_admin'), deleteTenant);

export default router;
