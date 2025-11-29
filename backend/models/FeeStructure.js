import mongoose from 'mongoose';

const feeStructureSchema = new mongoose.Schema({
    tenant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tenant',
        required: true,
        index: true
    },
    name: {
        type: String,
        required: true
    },
    class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class'
    },
    academicYear: {
        type: String,
        required: true
    },
    feeComponents: [{
        name: {
            type: String,
            required: true
        },
        amount: {
            type: Number,
            required: true
        },
        frequency: {
            type: String,
            enum: ['one_time', 'monthly', 'quarterly', 'half_yearly', 'yearly'],
            default: 'yearly'
        },
        dueDate: Date,
        isMandatory: {
            type: Boolean,
            default: true
        }
    }],
    totalAmount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'USD'
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Calculate total amount before saving
feeStructureSchema.pre('save', function (next) {
    this.totalAmount = this.feeComponents.reduce((sum, component) => sum + component.amount, 0);
    next();
});

feeStructureSchema.index({ tenant: 1, academicYear: 1 });

export default mongoose.model('FeeStructure', feeStructureSchema);
