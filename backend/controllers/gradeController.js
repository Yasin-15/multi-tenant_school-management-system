import Grade from '../models/Grade.js';
import Student from '../models/Student.js';
import Class from '../models/Class.js';
import Subject from '../models/Subject.js';

/**
 * @desc    Get all grades with filters
 * @route   GET /api/grades
 * @access  Private (Admin, Teacher)
 */
export const getGrades = async (req, res) => {
    try {
        const { 
            student, class: classId, subject, examType, 
            month, academicYear, page = 1, limit = 50 
        } = req.query;

        console.log('Get grades request:', { classId, student, subject, examType, tenant: req.tenant?._id });

        const query = { tenant: req.tenant._id };

        if (student) query.student = student;
        if (classId) query.class = classId;
        if (subject) query.subject = subject;
        if (examType) query.examType = examType;
        if (month) query.month = month;
        if (academicYear) query.academicYear = academicYear;

        console.log('Query:', query);

        const grades = await Grade.find(query)
            .populate({
                path: 'student',
                populate: { path: 'user', select: '-password' }
            })
            .populate('class')
            .populate('subject')
            .populate('enteredBy', 'firstName lastName')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ examDate: -1 });

        console.log('Found grades:', grades.length);

        const count = await Grade.countDocuments(query);

        res.status(200).json({
            success: true,
            count,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            data: grades
        });
    } catch (error) {
        console.error('Get grades error:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Error fetching grades',
            error: error.message
        });
    }
};

/**
 * @desc    Get single grade
 * @route   GET /api/grades/:id
 * @access  Private
 */
export const getGrade = async (req, res) => {
    try {
        const grade = await Grade.findOne({
            _id: req.params.id,
            tenant: req.tenant._id
        })
            .populate({
                path: 'student',
                populate: { path: 'user', select: '-password' }
            })
            .populate('class')
            .populate('subject')
            .populate('enteredBy', 'firstName lastName');

        if (!grade) {
            return res.status(404).json({
                success: false,
                message: 'Grade not found'
            });
        }

        res.status(200).json({
            success: true,
            data: grade
        });
    } catch (error) {
        console.error('Get grade error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching grade',
            error: error.message
        });
    }
};

/**
 * @desc    Get student grades (for student view)
 * @route   GET /api/grades/student/:studentId
 * @access  Private (Student, Parent, Admin, Teacher)
 */
export const getStudentGrades = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { academicYear, examType } = req.query;

        // Verify student exists and belongs to tenant
        const student = await Student.findOne({
            _id: studentId,
            tenant: req.tenant._id
        });

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        const query = { 
            tenant: req.tenant._id,
            student: studentId
        };

        if (academicYear) query.academicYear = academicYear;
        if (examType) query.examType = examType;

        const grades = await Grade.find(query)
            .populate('subject')
            .populate('class')
            .sort({ examDate: -1 });

        // Calculate statistics
        const stats = {
            totalExams: grades.length,
            monthlyExams: grades.filter(g => g.examType === 'monthly').length,
            chapterExams: grades.filter(g => g.examType === 'chapter').length,
            averagePercentage: grades.length > 0 
                ? (grades.reduce((sum, g) => sum + g.percentage, 0) / grades.length).toFixed(2)
                : 0
        };

        res.status(200).json({
            success: true,
            data: grades,
            stats
        });
    } catch (error) {
        console.error('Get student grades error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching student grades',
            error: error.message
        });
    }
};

/**
 * @desc    Create grade
 * @route   POST /api/grades
 * @access  Private (Admin, Teacher)
 */
export const createGrade = async (req, res) => {
    try {
        const {
            student, class: classId, subject, examType, examName,
            examDate, month, chapterName, chapterNumber,
            totalMarks, obtainedMarks, remarks, academicYear
        } = req.body;

        // Validate required fields
        if (!student || !classId || !subject || !examType || !examName || 
            !examDate || !totalMarks || obtainedMarks === undefined || !academicYear) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Validate exam type specific fields
        if (examType === 'monthly' && !month) {
            return res.status(400).json({
                success: false,
                message: 'Month is required for monthly exams'
            });
        }

        if (examType === 'chapter' && !chapterName) {
            return res.status(400).json({
                success: false,
                message: 'Chapter name is required for chapter exams'
            });
        }

        // Validate marks
        if (obtainedMarks > totalMarks) {
            return res.status(400).json({
                success: false,
                message: 'Obtained marks cannot exceed total marks'
            });
        }

        // Verify student exists
        const studentExists = await Student.findOne({
            _id: student,
            tenant: req.tenant._id
        });

        if (!studentExists) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        // Create grade
        const grade = await Grade.create({
            tenant: req.tenant._id,
            student,
            class: classId,
            subject,
            examType,
            examName,
            examDate,
            month,
            chapterName,
            chapterNumber,
            totalMarks,
            obtainedMarks,
            remarks,
            academicYear,
            enteredBy: req.user._id
        });

        const populatedGrade = await Grade.findById(grade._id)
            .populate({
                path: 'student',
                populate: { path: 'user', select: '-password' }
            })
            .populate('class')
            .populate('subject')
            .populate('enteredBy', 'firstName lastName');

        res.status(201).json({
            success: true,
            message: 'Grade created successfully',
            data: populatedGrade
        });
    } catch (error) {
        console.error('Create grade error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating grade',
            error: error.message
        });
    }
};

/**
 * @desc    Update grade
 * @route   PUT /api/grades/:id
 * @access  Private (Admin, Teacher)
 */
export const updateGrade = async (req, res) => {
    try {
        const grade = await Grade.findOne({
            _id: req.params.id,
            tenant: req.tenant._id
        });

        if (!grade) {
            return res.status(404).json({
                success: false,
                message: 'Grade not found'
            });
        }

        const {
            examName, examDate, month, chapterName, chapterNumber,
            totalMarks, obtainedMarks, remarks
        } = req.body;

        // Validate marks if provided
        if (obtainedMarks !== undefined && totalMarks !== undefined && obtainedMarks > totalMarks) {
            return res.status(400).json({
                success: false,
                message: 'Obtained marks cannot exceed total marks'
            });
        }

        const updateData = {};
        if (examName) updateData.examName = examName;
        if (examDate) updateData.examDate = examDate;
        if (month) updateData.month = month;
        if (chapterName) updateData.chapterName = chapterName;
        if (chapterNumber) updateData.chapterNumber = chapterNumber;
        if (totalMarks) updateData.totalMarks = totalMarks;
        if (obtainedMarks !== undefined) updateData.obtainedMarks = obtainedMarks;
        if (remarks !== undefined) updateData.remarks = remarks;

        const updatedGrade = await Grade.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        )
            .populate({
                path: 'student',
                populate: { path: 'user', select: '-password' }
            })
            .populate('class')
            .populate('subject')
            .populate('enteredBy', 'firstName lastName');

        res.status(200).json({
            success: true,
            message: 'Grade updated successfully',
            data: updatedGrade
        });
    } catch (error) {
        console.error('Update grade error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating grade',
            error: error.message
        });
    }
};

/**
 * @desc    Delete grade
 * @route   DELETE /api/grades/:id
 * @access  Private (Admin)
 */
export const deleteGrade = async (req, res) => {
    try {
        const grade = await Grade.findOne({
            _id: req.params.id,
            tenant: req.tenant._id
        });

        if (!grade) {
            return res.status(404).json({
                success: false,
                message: 'Grade not found'
            });
        }

        await Grade.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Grade deleted successfully'
        });
    } catch (error) {
        console.error('Delete grade error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting grade',
            error: error.message
        });
    }
};

/**
 * @desc    Get class grades report
 * @route   GET /api/grades/class/:classId/report
 * @access  Private (Admin, Teacher)
 */
export const getClassGradesReport = async (req, res) => {
    try {
        const { classId } = req.params;
        const { subject, examType, academicYear } = req.query;

        const query = {
            tenant: req.tenant._id,
            class: classId
        };

        if (subject) query.subject = subject;
        if (examType) query.examType = examType;
        if (academicYear) query.academicYear = academicYear;

        const grades = await Grade.find(query)
            .populate({
                path: 'student',
                populate: { path: 'user', select: 'firstName lastName' }
            })
            .populate('subject')
            .sort({ examDate: -1 });

        // Calculate class statistics
        const stats = {
            totalStudents: new Set(grades.map(g => g.student._id.toString())).size,
            totalExams: grades.length,
            averagePercentage: grades.length > 0 
                ? (grades.reduce((sum, g) => sum + g.percentage, 0) / grades.length).toFixed(2)
                : 0,
            highestScore: grades.length > 0 
                ? Math.max(...grades.map(g => g.percentage))
                : 0,
            lowestScore: grades.length > 0 
                ? Math.min(...grades.map(g => g.percentage))
                : 0
        };

        res.status(200).json({
            success: true,
            data: grades,
            stats
        });
    } catch (error) {
        console.error('Get class report error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching class report',
            error: error.message
        });
    }
};
