import Exam from '../models/Exam.js';
import ExamResult from '../models/ExamResult.js';

// Create a new exam
export const createExam = async (req, res) => {
    try {
        const { title, examType, subject, class: classId, duration, startTime, endTime, questions } = req.body;

        // Basic validation
        if (!title || !examType || !subject || !classId || !duration || !startTime || !endTime) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const exam = new Exam({
            tenant: req.user.tenant,
            teacher: req.user.userId, // Assuming teacher creates it
            title,
            examType,
            subject,
            class: classId,
            duration,
            startTime,
            endTime,
            questions
        });

        await exam.save();
        res.status(201).json(exam);
    } catch (error) {
        res.status(500).json({ message: 'Error creating exam', error: error.message });
    }
};

// Get exams for a class (Student view) or Teacher view
export const getExams = async (req, res) => {
    try {
        const { classId } = req.query;
        const query = { tenant: req.user.tenant };

        if (classId) {
            query.class = classId;
        }

        // If student, only show active exams or past exams, maybe filter by their class
        if (req.user.role === 'student') {
            // Logic to get student's class could be here or passed in query
        }

        const exams = await Exam.find(query)
            .populate('subject', 'name')
            .populate('class', 'name')
            .sort({ startTime: -1 });

        res.json(exams);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching exams', error: error.message });
    }
};

// Get single exam details (for taking the exam)
export const getExamById = async (req, res) => {
    try {
        const exam = await Exam.findOne({ _id: req.params.id, tenant: req.user.tenant })
            .populate('subject', 'name');

        if (!exam) {
            return res.status(404).json({ message: 'Exam not found' });
        }

        res.json(exam);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching exam', error: error.message });
    }
};

// Submit exam
export const submitExam = async (req, res) => {
    try {
        const { examId, answers } = req.body;
        const studentId = req.user.userId;

        const exam = await Exam.findById(examId);
        if (!exam) {
            return res.status(404).json({ message: 'Exam not found' });
        }

        // Calculate score
        let score = 0;
        const processedAnswers = answers.map(ans => {
            const question = exam.questions.id(ans.questionId);
            if (question && question.correctOption === ans.selectedOption) {
                score += question.marks;
            }
            return {
                questionId: ans.questionId,
                selectedOption: ans.selectedOption
            };
        });

        const percentage = (score / exam.totalMarks) * 100;

        const result = new ExamResult({
            tenant: req.user.tenant,
            exam: examId,
            student: studentId,
            answers: processedAnswers,
            score,
            totalMarks: exam.totalMarks,
            percentage,
            status: 'COMPLETED'
        });

        await result.save();
        res.status(201).json(result);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'You have already submitted this exam' });
        }
        res.status(500).json({ message: 'Error submitting exam', error: error.message });
    }
};

// Get exam results (for student or teacher)
export const getExamResults = async (req, res) => {
    try {
        const { examId, studentId } = req.query;
        const query = { tenant: req.user.tenant };

        if (examId) query.exam = examId;
        if (studentId) query.student = studentId;

        // If student, force their own ID
        if (req.user.role === 'student') {
            query.student = req.user.userId;
        }

        const results = await ExamResult.find(query)
            .populate('exam', 'title totalMarks')
            .populate('student', 'name admissionNumber');

        res.json(results);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching results', error: error.message });
    }
};
