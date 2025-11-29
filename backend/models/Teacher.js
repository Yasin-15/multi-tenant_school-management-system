import mongoose from 'mongoose';

const teacherSchema = new mongoose.Schema({
    tenant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tenant',
        required: true,
        index: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    employeeId: {
        type: String,
        required: true,
        unique: true
    },
    joiningDate: {
        type: Date,
        default: Date.now
    },
    designation: {
        type: String,
        required: true
    },
    department: {
        type: String
    },
    qualification: [{
        degree: String,
        institution: String,
        year: Number,
        specialization: String
    }],
    experience: {
        years: Number,
        previousInstitutions: [{
            name: String,
            position: String,
            duration: String
        }]
    },
    subjects: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject'
    }],
    classes: [{
        class: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Class'
        },
        section: String,
        isClassTeacher: {
            type: Boolean,
            default: false
        }
    }],
    salary: {
        basic: Number,
        allowances: Number,
        deductions: Number,
        currency: {
            type: String,
            default: 'USD'
        }
    },
    bankDetails: {
        accountNumber: String,
        bankName: String,
        ifscCode: String,
        accountHolderName: String
    },
    documents: [{
        name: String,
        type: String,
        url: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    emergencyContact: {
        name: String,
        relation: String,
        phone: String
    },
    status: {
        type: String,
        enum: ['active', 'on_leave', 'resigned', 'terminated'],
        default: 'active'
    },
    performanceRatings: [{
        rating: Number,
        feedback: String,
        ratedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        date: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

// Indexes
teacherSchema.index({ tenant: 1, employeeId: 1 }, { unique: true });
teacherSchema.index({ tenant: 1, status: 1 });

export default mongoose.model('Teacher', teacherSchema);
