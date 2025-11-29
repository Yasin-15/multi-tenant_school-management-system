import express from 'express';
import { generatePayroll, getPayrollRecords, updatePayrollStatus, getMyPayslips } from '../controllers/payrollController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/generate', protect, authorize('admin', 'superadmin'), generatePayroll);
router.get('/', protect, authorize('admin', 'superadmin'), getPayrollRecords);
router.put('/:id', protect, authorize('admin', 'superadmin'), updatePayrollStatus);
router.get('/my-payslips', protect, authorize('teacher'), getMyPayslips);

export default router;
