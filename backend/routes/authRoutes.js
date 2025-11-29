import express from 'express';
import {
    register,
    login,
    getMe,
    updateProfile,
    changePassword
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { tenantMiddleware } from '../middleware/tenant.js';

const router = express.Router();

// Apply tenant middleware to all routes
router.use(tenantMiddleware);

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

export default router;
