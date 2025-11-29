import mongoose from 'mongoose';

const gradeSchema = new mongoose.Schema({
    tenant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tenant',
        required: true,
        index: true
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true,
        index: true
    },
    class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
        required: true
    },
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
        required: true
    },
    examType: {
        type: String,
        enum: ['monthly', 'chapter'],
        required: true
    },
    examName: {
        type: String,
        required: true
    },
    examDate: {
        type: Date,
        required: true
    },
    month: {
        type: String,
        enum: ['January', 'February', 'March', 'April', 'May', 'June', 
               'July', 'August', 'September', 'October', 'November', 'December']
    },
    chapterName: {
        type: String
    },
    chapterNumber: {
        type: Number
    },
    totalMarks: {
        type: Number,
        required: true
    },
    obtainedMarks: {
        type: Number,
        required: true
    },
    percentage: {
        type: Number
    },
    grade: {
        type: String,
        enum: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F']
    },
    remarks: {
        type: String
    },
    academicYear: {
        type: String,
        required: true
    },
    enteredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Calculate percentage and grade before saving
gradeSchema.pre('save', function(next) {
    if (this.obtainedMarks && this.totalMarks) {
        this.percentage = (this.obtainedMarks / this.totalMarks) * 100;
        
        // Calculate grade based on percentage
        if (this.percentage >= 90) this.grade = 'A+';
        else if (this.percentage >= 80) this.grade = 'A';
        else if (this.percentage >= 70) this.grade = 'B+';
        else if (this.percentage >= 60) this.grade = 'B';
        else if (this.percentage >= 50) this.grade = 'C+';
        else if (this.percentage >= 40) this.grade = 'C';
        else if (this.percentage >= 33) this.grade = 'D';
        else this.grade = 'F';
    }
    next();
});

// Indexes
gradeSchema.index({ tenant: 1, student: 1, academicYear: 1 });
gradeSchema.index({ tenant: 1, class: 1, subject: 1 });
gradeSchema.index({ tenant: 1, examType: 1, examDate: 1 });

export default mongoose.model('Grade', gradeSchema);
