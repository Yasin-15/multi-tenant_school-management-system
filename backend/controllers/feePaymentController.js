import FeePayment from '../models/FeePayment.js';
import Student from '../models/Student.js';
import FeeStructure from '../models/FeeStructure.js';

// @desc    Create a new fee invoice
// @route   POST /api/fee-payments/invoice
// @access  Private (Admin/Accountant)
export const createInvoice = async (req, res) => {
    try {
        const {
            studentId,
            feeStructureId,
            dueDate,
            amount, // Optional override
            discount,
            discountReason,
            lateFee
        } = req.body;

        const tenantId = req.user.tenant;

        // Validate student
        const student = await Student.findOne({ _id: studentId, tenant: tenantId });
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        // Validate fee structure
        const feeStructure = await FeeStructure.findOne({ _id: feeStructureId, tenant: tenantId });
        if (!feeStructure) {
            return res.status(404).json({
                success: false,
                message: 'Fee structure not found'
            });
        }

        // Generate invoice number (simple format: INV-YYYYMMDD-RANDOM)
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const randomStr = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        const invoiceNumber = `INV-${dateStr}-${randomStr}`;

        // Calculate total amount from fee structure if not provided
        const totalAmount = amount || feeStructure.totalAmount;

        const feePayment = await FeePayment.create({
            tenant: tenantId,
            student: studentId,
            feeStructure: feeStructureId,
            invoiceNumber,
            dueDate,
            totalAmount,
            discount: discount || 0,
            discountReason,
            lateFee: lateFee || 0,
            status: 'pending' // Default status
        });

        res.status(201).json({
            success: true,
            data: feePayment
        });
    } catch (error) {
        console.error('Create Invoice Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Get all fee payments
// @route   GET /api/fee-payments
// @access  Private
export const getFeePayments = async (req, res) => {
    try {
        const {
            studentId,
            status,
            startDate,
            endDate,
            page = 1,
            limit = 10
        } = req.query;

        const query = { tenant: req.user.tenant };

        // If student is accessing their own payments
        if (req.user.role === 'student') {
            const student = await Student.findOne({ user: req.user._id, tenant: req.user.tenant });
            if (student) {
                query.student = student._id;
            }
        } else {
            if (studentId) query.student = studentId;
        }

        if (status) query.status = status;

        if (startDate && endDate) {
            query.invoiceDate = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const feePayments = await FeePayment.find(query)
            .populate({
                path: 'student',
                populate: { path: 'user', select: 'firstName lastName email' }
            })
            .populate('feeStructure', 'name')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await FeePayment.countDocuments(query);

        res.status(200).json({
            success: true,
            count: feePayments.length,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit)
            },
            data: feePayments
        });
    } catch (error) {
        console.error('Get Fee Payments Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Get single fee payment
// @route   GET /api/fee-payments/:id
// @access  Private
export const getFeePaymentById = async (req, res) => {
    try {
        const feePayment = await FeePayment.findOne({
            _id: req.params.id,
            tenant: req.user.tenant
        })
            .populate('student')
            .populate('feeStructure')
            .populate('payments.receivedBy', 'name email');

        if (!feePayment) {
            return res.status(404).json({
                success: false,
                message: 'Fee payment record not found'
            });
        }

        res.status(200).json({
            success: true,
            data: feePayment
        });
    } catch (error) {
        console.error('Get Fee Payment Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Add payment to invoice
// @route   POST /api/fee-payments/:id/pay
// @access  Private
export const addPayment = async (req, res) => {
    try {
        const {
            amount,
            paymentMethod,
            transactionId,
            receiptNumber,
            remarks,
            paymentDate
        } = req.body;

        const feePayment = await FeePayment.findOne({
            _id: req.params.id,
            tenant: req.user.tenant
        }).populate('student');

        if (!feePayment) {
            return res.status(404).json({
                success: false,
                message: 'Fee payment record not found'
            });
        }

        // If student is making payment, verify it's their own fee
        if (req.user.role === 'student') {
            const student = await Student.findOne({ user: req.user._id, tenant: req.user.tenant });
            if (!student || feePayment.student._id.toString() !== student._id.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'You can only pay your own fees'
                });
            }
        }

        // Validate payment amount
        const remainingAmount = feePayment.totalAmount - feePayment.paidAmount;
        if (Number(amount) > remainingAmount) {
            return res.status(400).json({
                success: false,
                message: `Payment amount cannot exceed remaining balance of $${remainingAmount}`
            });
        }

        // Create payment object
        const newPayment = {
            amount,
            paymentMethod,
            transactionId,
            receiptNumber,
            remarks,
            paymentDate: paymentDate || Date.now(),
            receivedBy: req.user._id
        };

        // Add to payments array
        feePayment.payments.push(newPayment);

        // Update paid amount
        feePayment.paidAmount += Number(amount);

        // Save (pre-save hook will update status)
        await feePayment.save();

        res.status(200).json({
            success: true,
            message: 'Payment added successfully',
            data: feePayment
        });
    } catch (error) {
        console.error('Add Payment Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Update fee payment details
// @route   PUT /api/fee-payments/:id
// @access  Private
export const updateFeePayment = async (req, res) => {
    try {
        const {
            dueDate,
            discount,
            discountReason,
            lateFee,
            remarks
        } = req.body;

        let feePayment = await FeePayment.findOne({
            _id: req.params.id,
            tenant: req.user.tenant
        });

        if (!feePayment) {
            return res.status(404).json({
                success: false,
                message: 'Fee payment record not found'
            });
        }

        // Update fields if provided
        if (dueDate) feePayment.dueDate = dueDate;
        if (discount !== undefined) feePayment.discount = discount;
        if (discountReason) feePayment.discountReason = discountReason;
        if (lateFee !== undefined) feePayment.lateFee = lateFee;
        if (remarks) feePayment.remarks = remarks;

        await feePayment.save();

        res.status(200).json({
            success: true,
            data: feePayment
        });
    } catch (error) {
        console.error('Update Fee Payment Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Delete fee payment
// @route   DELETE /api/fee-payments/:id
// @access  Private (Admin only)
export const deleteFeePayment = async (req, res) => {
    try {
        const feePayment = await FeePayment.findOneAndDelete({
            _id: req.params.id,
            tenant: req.user.tenant
        });

        if (!feePayment) {
            return res.status(404).json({
                success: false,
                message: 'Fee payment record not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Fee payment record deleted'
        });
    } catch (error) {
        console.error('Delete Fee Payment Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Get payment statistics
// @route   GET /api/fee-payments/stats
// @access  Private (Admin/Super Admin)
export const getPaymentStats = async (req, res) => {
    try {
        const tenantId = req.user.tenant;

        // Get total revenue (all paid amounts)
        const revenueResult = await FeePayment.aggregate([
            { $match: { tenant: tenantId } },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$paidAmount' },
                    totalPending: {
                        $sum: {
                            $cond: [
                                { $in: ['$status', ['pending', 'partial', 'overdue']] },
                                { $subtract: ['$totalAmount', '$paidAmount'] },
                                0
                            ]
                        }
                    },
                    totalInvoices: { $sum: 1 },
                    paidInvoices: {
                        $sum: { $cond: [{ $eq: ['$status', 'paid'] }, 1, 0] }
                    },
                    pendingInvoices: {
                        $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
                    },
                    overdueInvoices: {
                        $sum: { $cond: [{ $eq: ['$status', 'overdue'] }, 1, 0] }
                    }
                }
            }
        ]);

        const stats = revenueResult[0] || {
            totalRevenue: 0,
            totalPending: 0,
            totalInvoices: 0,
            paidInvoices: 0,
            pendingInvoices: 0,
            overdueInvoices: 0
        };

        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Get Payment Stats Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};
