import express from 'express';
import {
    createInvoice,
    getFeePayments,
    getFeePaymentById,
    addPayment,
    updateFeePayment,
    deleteFeePayment,
    getPaymentStats
} from '../controllers/feePaymentController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

router.route('/')
    .get(getFeePayments)
    .post(authorize('admin', 'super_admin'), createInvoice);

router.get('/stats', authorize('admin', 'super_admin'), getPaymentStats);
router.get('/my-payments', authorize('student'), getFeePayments);

router.route('/:id')
    .get(getFeePaymentById)
    .put(authorize('admin', 'super_admin'), updateFeePayment)
    .delete(authorize('admin', 'super_admin'), deleteFeePayment);

router.route('/:id/pay')
    .post(authorize('admin', 'super_admin', 'student'), addPayment);

export default router;
