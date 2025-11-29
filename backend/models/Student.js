import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
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
    studentId: {
        type: String,
        required: true,
        unique: true
    },
    admissionNumber: {
        type: String,
        required: true
    },
    admissionDate: {
        type: Date,
        default: Date.now
    },
    class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class'
    },
    section: {
        type: String
    },
    rollNumber: {
        type: String
    },
    academicYear: {
        type: String,
        required: true
    },
    parents: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    guardianName: {
        type: String
    },
    guardianPhone: {
        type: String
    },
    guardianEmail: {
        type: String
    },
    guardianRelation: {
        type: String
    },
    bloodGroup: {
        type: String,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    },
    medicalConditions: [{
        condition: String,
        description: String,
        medications: String
    }],
    previousSchool: {
        name: String,
        address: String,
        lastClass: String
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
    status: {
        type: String,
        enum: ['active', 'inactive', 'graduated', 'transferred', 'expelled'],
        default: 'active'
    },
    notes: [{
        note: String,
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

// Indexes
studentSchema.index({ tenant: 1, studentId: 1 }, { unique: true });
studentSchema.index({ tenant: 1, class: 1 });
studentSchema.index({ tenant: 1, status: 1 });

export default mongoose.model('Student', studentSchema);
