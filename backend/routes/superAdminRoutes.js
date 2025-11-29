import express from 'express';
import {
    getAllTenants,
    getTenantById,
    createTenant,
    updateTenant,
    deleteTenant,
    toggleTenantStatus,
    getSystemStats,
    getTenantUsers,
    getAllUsers,
    toggleUserStatus,
    deleteUser,
} from '../controllers/superAdminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes require super_admin role
router.use(protect);
router.use(authorize('super_admin'));

router.get('/stats', getSystemStats);
router.get('/tenants', getAllTenants);
router.post('/tenants', createTenant);
router.get('/tenants/:id', getTenantById);
router.put('/tenants/:id', updateTenant);
router.delete('/tenants/:id', deleteTenant);
router.patch('/tenants/:id/toggle-status', toggleTenantStatus);
router.get('/tenants/:id/users', getTenantUsers);

// User management routes
router.get('/users', getAllUsers);
router.patch('/users/:id/toggle-status', toggleUserStatus);
router.delete('/users/:id', deleteUser);

export default router;
