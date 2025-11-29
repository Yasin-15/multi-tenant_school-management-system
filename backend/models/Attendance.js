import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
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
    class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['present', 'absent', 'late', 'excused', 'half_day'],
        required: true
    },
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject'
    },
    period: {
        type: Number
    },
    remarks: {
        type: String
    },
    markedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    markedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Indexes for efficient queries
attendanceSchema.index({ tenant: 1, student: 1, date: 1 });
attendanceSchema.index({ tenant: 1, class: 1, date: 1 });
attendanceSchema.index({ tenant: 1, date: 1 });

export default mongoose.model('Attendance', attendanceSchema);
