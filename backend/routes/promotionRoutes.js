import express from 'express';
import { getPromotionEligibility, promoteStudents } from '../controllers/promotionController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

// Get students eligible for promotion in a class
router.get('/eligibility', authorize('admin', 'teacher'), getPromotionEligibility);

// Promote selected students to a new class
router.post('/promote', authorize('admin'), promoteStudents);

export default router;
