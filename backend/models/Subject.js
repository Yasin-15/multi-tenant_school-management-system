import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema({
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
    code: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    type: {
        type: String,
        enum: ['core', 'elective', 'extracurricular'],
        default: 'core'
    },
    credits: {
        type: Number,
        default: 1
    },
    passingMarks: {
        type: Number,
        default: 40
    },
    totalMarks: {
        type: Number,
        default: 100
    },
    grades: [{
        grade: Number,
        minMarks: Number,
        maxMarks: Number
    }],
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Compound index for unique subject per tenant
subjectSchema.index({ tenant: 1, code: 1 }, { unique: true });

export default mongoose.model('Subject', subjectSchema);
