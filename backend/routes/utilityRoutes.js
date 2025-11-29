import express from 'express';
import { previewNextIds } from '../controllers/utilityController.js';
import { protect, authorize } from '../middleware/auth.js';
import { tenantMiddleware } from '../middleware/tenant.js';

const router = express.Router();

// Preview next available IDs
router.get('/preview-ids', tenantMiddleware, protect, authorize('admin'), previewNextIds);

export default router;
