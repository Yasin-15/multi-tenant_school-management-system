import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema({
    questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
    selectedOption: { type: Number, required: true } // Index of selected option
});

const examResultSchema = new mongoose.Schema({
    tenant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tenant',
        required: true
    },
    exam: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exam',
        required: true
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    answers: [answerSchema],
    score: {
        type: Number,
        default: 0
    },
    totalMarks: {
        type: Number,
        required: true
    },
    percentage: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['PENDING', 'COMPLETED', 'GRADED'],
        default: 'PENDING'
    },
    submittedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Prevent duplicate submissions
examResultSchema.index({ exam: 1, student: 1 }, { unique: true });

const ExamResult = mongoose.model('ExamResult', examResultSchema);

export default ExamResult;
