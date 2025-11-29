import Payroll from '../models/Payroll.js';
import Teacher from '../models/Teacher.js';

// Generate payroll for a specific month and year for all active teachers
export const generatePayroll = async (req, res) => {
    try {
        const { month, year } = req.body;
        const tenantId = req.user.tenant;

        if (!month || !year) {
            return res.status(400).json({ message: 'Month and year are required' });
        }

        // Get all active teachers for the tenant
        const teachers = await Teacher.find({ tenant: tenantId, 'status': 'active' });

        if (teachers.length === 0) {
            return res.status(404).json({ message: 'No active teachers found' });
        }

        const payrollsCreated = [];
        const errors = [];

        for (const teacher of teachers) {
            try {
                // Check if payroll already exists
                const existingPayroll = await Payroll.findOne({
                    tenant: tenantId,
                    teacher: teacher._id,
                    month,
                    year
                });

                if (existingPayroll) {
                    continue; // Skip if already exists
                }

                const salary = teacher.salary || { basic: 0, allowances: 0, deductions: 0, currency: 'USD' };
                const total = (salary.basic || 0) + (salary.allowances || 0) - (salary.deductions || 0);

                const newPayroll = new Payroll({
                    tenant: tenantId,
                    teacher: teacher._id,
                    month,
                    year,
                    salaryDetails: {
                        basic: salary.basic || 0,
                        allowances: salary.allowances || 0,
                        deductions: salary.deductions || 0,
                        currency: salary.currency || 'USD',
                        total
                    },
                    status: 'pending'
                });

                await newPayroll.save();
                payrollsCreated.push(newPayroll);
            } catch (err) {
                console.error(`Error creating payroll for teacher ${teacher._id}:`, err);
                errors.push({ teacherId: teacher._id, error: err.message });
            }
        }

        res.status(201).json({
            message: `Generated ${payrollsCreated.length} payroll records`,
            payrolls: payrollsCreated,
            errors: errors.length > 0 ? errors : undefined
        });

    } catch (error) {
        console.error('Generate Payroll Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get payroll records with filters
export const getPayrollRecords = async (req, res) => {
    try {
        const { month, year, status, teacherId } = req.query;
        const tenantId = req.user.tenant;

        const query = { tenant: tenantId };
        if (month) query.month = month;
        if (year) query.year = year;
        if (status) query.status = status;
        if (teacherId) query.teacher = teacherId;

        const payrolls = await Payroll.find(query)
            .populate('teacher', 'user employeeId designation')
            .populate({
                path: 'teacher',
                populate: { path: 'user', select: 'name email' }
            })
            .sort({ createdAt: -1 });

        res.status(200).json(payrolls);
    } catch (error) {
        console.error('Get Payroll Records Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update payroll status (e.g., mark as paid)
export const updatePayrollStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, transactionId, remarks } = req.body;
        const tenantId = req.user.tenant;

        const payroll = await Payroll.findOne({ _id: id, tenant: tenantId });

        if (!payroll) {
            return res.status(404).json({ message: 'Payroll record not found' });
        }

        if (status) payroll.status = status;
        if (transactionId) payroll.transactionId = transactionId;
        if (remarks) payroll.remarks = remarks;

        if (status === 'paid' && !payroll.paymentDate) {
            payroll.paymentDate = new Date();
        }

        await payroll.save();

        res.status(200).json({ message: 'Payroll updated successfully', payroll });
    } catch (error) {
        console.error('Update Payroll Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get payslips for the logged-in teacher
export const getMyPayslips = async (req, res) => {
    try {
        const tenantId = req.user.tenant;
        // Assuming the user is linked to a teacher record. 
        // We need to find the teacher record associated with this user.
        const teacher = await Teacher.findOne({ tenant: tenantId, user: req.user.userId });

        if (!teacher) {
            return res.status(404).json({ message: 'Teacher profile not found for this user' });
        }

        const payrolls = await Payroll.find({ tenant: tenantId, teacher: teacher._id })
            .sort({ year: -1, month: -1 });

        res.status(200).json(payrolls);
    } catch (error) {
        console.error('Get My Payslips Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
