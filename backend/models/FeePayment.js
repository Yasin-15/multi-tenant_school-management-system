import mongoose from 'mongoose';

const feePaymentSchema = new mongoose.Schema({
    tenant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tenant',
        required: true,
        index: true
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    feeStructure: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FeeStructure',
        required: true
    },
    invoiceNumber: {
        type: String,
        required: true,
        unique: true
    },
    invoiceDate: {
        type: Date,
        default: Date.now
    },
    dueDate: {
        type: Date,
        required: true
    },
    totalAmount: {
        type: Number,
        required: true
    },
    paidAmount: {
        type: Number,
        default: 0
    },
    discount: {
        type: Number,
        default: 0
    },
    discountReason: {
        type: String
    },
    lateFee: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['pending', 'partial', 'paid', 'overdue', 'cancelled'],
        default: 'pending'
    },
    payments: [{
        amount: {
            type: Number,
            required: true
        },
        paymentDate: {
            type: Date,
            default: Date.now
        },
        paymentMethod: {
            type: String,
            enum: ['cash', 'card', 'bank_transfer', 'cheque', 'online'],
            required: true
        },
        transactionId: String,
        receiptNumber: String,
        remarks: String,
        receivedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }],
    remarks: {
        type: String
    }
}, {
    timestamps: true
});

// Update status based on payment
feePaymentSchema.pre('save', function (next) {
    const totalPaid = this.paidAmount;
    const totalDue = this.totalAmount - this.discount + this.lateFee;

    if (totalPaid >= totalDue) {
        this.status = 'paid';
    } else if (totalPaid > 0) {
        this.status = 'partial';
    } else if (new Date() > this.dueDate) {
        this.status = 'overdue';
    } else {
        this.status = 'pending';
    }

    next();
});

// Indexes
feePaymentSchema.index({ tenant: 1, student: 1 });
feePaymentSchema.index({ tenant: 1, status: 1 });
feePaymentSchema.index({ tenant: 1, invoiceNumber: 1 }, { unique: true });

export default mongoose.model('FeePayment', feePaymentSchema);
