import Student from '../models/Student.js';
import Exam from '../models/Exam.js';
import Grade from '../models/Grade.js';
import Class from '../models/Class.js';

export const getPromotionEligibility = async (req, res) => {
    try {
        const { classId } = req.query;
        const tenantId = req.user.tenant;

        if (!classId) {
            return res.status(400).json({ message: 'Class ID is required' });
        }

        // Get all students in the class
        const students = await Student.find({ class: classId, tenant: tenantId })
            .populate('user', 'firstName lastName email');

        const eligibilityList = [];

        for (const student of students) {
            // Check grades for Midterm and Final
            const grades = await Grade.find({
                student: student._id,
                tenant: tenantId,
                examType: { $in: ['Midterm', 'Final'] }
            });

            let totalScore = 0;
            let totalMax = 0;

            grades.forEach(g => {
                totalScore += g.obtainedMarks;
                totalMax += g.totalMarks;
            });

            const average = totalMax > 0 ? (totalScore / totalMax) * 100 : 0;
            // Simple pass logic: Average >= 50%
            const passed = average >= 50;

            eligibilityList.push({
                student: {
                    _id: student._id,
                    name: student.user ? `${student.user.firstName} ${student.user.lastName}` : 'Unknown',
                    admissionNumber: student.admissionNumber
                },
                average: parseFloat(average.toFixed(2)),
                passed,
                examsTaken: grades.length,
                details: grades.map(g => ({ type: g.examType, subject: g.subject, score: g.obtainedMarks }))
            });
        }

        res.json(eligibilityList);

    } catch (error) {
        console.error('Error fetching eligibility:', error);
        res.status(500).json({ message: 'Error fetching eligibility', error: error.message });
    }
};

export const promoteStudents = async (req, res) => {
    try {
        const { studentIds, targetClassId } = req.body;
        const tenantId = req.user.tenant;

        if (!studentIds || !Array.isArray(studentIds) || !targetClassId) {
            return res.status(400).json({ message: 'Student IDs (array) and Target Class ID are required' });
        }

        // Verify target class exists
        const targetClass = await Class.findOne({ _id: targetClassId, tenant: tenantId });
        if (!targetClass) {
            return res.status(404).json({ message: 'Target class not found' });
        }

        // Update students
        const result = await Student.updateMany(
            { _id: { $in: studentIds }, tenant: tenantId },
            { $set: { class: targetClassId } }
        );

        res.json({ message: `Successfully promoted ${result.modifiedCount} students to ${targetClass.name}` });

    } catch (error) {
        console.error('Error promoting students:', error);
        res.status(500).json({ message: 'Error promoting students', error: error.message });
    }
};
