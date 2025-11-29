import mongoose from 'mongoose';

const payrollSchema = new mongoose.Schema({
    tenant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tenant',
        required: true,
        index: true
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
        required: true
    },
    month: {
        type: String, // e.g., "October"
        required: true
    },
    year: {
        type: Number, // e.g., 2023
        required: true
    },
    salaryDetails: {
        basic: Number,
        allowances: Number,
        deductions: Number,
        total: Number,
        currency: String
    },
    status: {
        type: String,
        enum: ['pending', 'paid', 'failed'],
        default: 'pending'
    },
    paymentDate: {
        type: Date
    },
    transactionId: {
        type: String
    },
    remarks: {
        type: String
    }
}, {
    timestamps: true
});

// Ensure one payroll record per teacher per month/year
payrollSchema.index({ tenant: 1, teacher: 1, month: 1, year: 1 }, { unique: true });

export default mongoose.model('Payroll', payrollSchema);
