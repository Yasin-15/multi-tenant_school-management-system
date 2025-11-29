import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
    text: { type: String, required: true },
    options: [{ type: String, required: true }], // e.g., ["A", "B", "C", "D"]
    correctOption: { type: Number, required: true }, // Index of correct option (0-3)
    marks: { type: Number, default: 1 }
});

const examSchema = new mongoose.Schema({
    tenant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tenant',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
        required: true
    },
    class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
        required: true
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
        required: true
    },
    duration: {
        type: Number, // in minutes
        required: true
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    questions: [questionSchema],
    totalMarks: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Calculate total marks before saving
examSchema.pre('save', function (next) {
    if (this.questions && this.questions.length > 0) {
        this.totalMarks = this.questions.reduce((sum, q) => sum + q.marks, 0);
    }
    next();
});

const Exam = mongoose.model('Exam', examSchema);

export default Exam;
