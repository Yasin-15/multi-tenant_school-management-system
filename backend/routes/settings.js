import express from 'express';
import {
  getSettings,
  updateSettings,
  updateProfile,
  changePassword
} from '../controllers/settingsController.js';
import { protect } from '../middleware/auth.js';
import { tenantMiddleware, validateTenantAccess } from '../middleware/tenant.js';

const router = express.Router();

// Apply middleware
router.use(tenantMiddleware);
router.use(protect);
router.use(validateTenantAccess);

// Get user settings
router.get('/', getSettings);

// Update user settings
router.put('/', updateSettings);

// Update user profile
router.put('/profile', updateProfile);

// Change password
router.put('/password', changePassword);

export default router;
