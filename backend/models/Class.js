import mongoose from 'mongoose';

const classSchema = new mongoose.Schema({
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
    grade: {
        type: Number,
        required: true
    },
    section: {
        type: String,
        required: true
    },
    academicYear: {
        type: String,
        required: true
    },
    classTeacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher'
    },
    subjects: [{
        subject: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Subject'
        },
        teacher: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Teacher'
        }
    }],
    maxStudents: {
        type: Number,
        default: 40
    },
    room: {
        type: String
    },
    schedule: [{
        day: {
            type: String,
            enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        },
        periods: [{
            subject: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Subject',
                default: null
            },
            teacher: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Teacher',
                default: null
            },
            startTime: String,
            endTime: String,
            room: String
        }]
    }],
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Compound index for unique class per tenant
classSchema.index({ tenant: 1, grade: 1, section: 1, academicYear: 1 }, { unique: true });

export default mongoose.model('Class', classSchema);
