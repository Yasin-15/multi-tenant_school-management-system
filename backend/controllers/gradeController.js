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
 * @desc    Get my grades (logged in student)
 * @route   GET /api/grades/my-grades
 * @access  Private (Student)
 */
export const getMyGrades = async (req, res) => {
    try {
        const student = await Student.findOne({
            user: req.user._id,
            tenant: req.tenant._id
        });

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student profile not found'
            });
        }

        const { academicYear, examType } = req.query;

        const query = {
            tenant: req.tenant._id,
            student: student._id
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
        console.error('Get my grades error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching grades',
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

/**
 * @desc    Bulk create grades
 * @route   POST /api/grades/bulk
 * @access  Private (Admin, Teacher)
 */
export const bulkCreateGrades = async (req, res) => {
    try {
        const { grades } = req.body;

        if (!grades || !Array.isArray(grades) || grades.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Grades array is required'
            });
        }

        const results = {
            success: [],
            failed: []
        };

        for (const gradeData of grades) {
            try {
                const {
                    student, class: classId, subject, examType, examName,
                    examDate, month, chapterName, chapterNumber,
                    totalMarks, obtainedMarks, remarks, academicYear
                } = gradeData;

                // Validate required fields
                if (!student || !classId || !subject || !examType || !examName ||
                    !examDate || !totalMarks || obtainedMarks === undefined || !academicYear) {
                    results.failed.push({
                        data: gradeData,
                        error: 'Missing required fields'
                    });
                    continue;
                }

                // Validate marks
                if (obtainedMarks > totalMarks) {
                    results.failed.push({
                        data: gradeData,
                        error: 'Obtained marks cannot exceed total marks'
                    });
                    continue;
                }

                // Verify student exists
                const studentExists = await Student.findOne({
                    _id: student,
                    tenant: req.tenant._id
                });

                if (!studentExists) {
                    results.failed.push({
                        data: gradeData,
                        error: 'Student not found'
                    });
                    continue;
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

                results.success.push(grade);
            } catch (error) {
                results.failed.push({
                    data: gradeData,
                    error: error.message
                });
            }
        }

        res.status(201).json({
            success: true,
            message: `Successfully created ${results.success.length} grades, ${results.failed.length} failed`,
            data: {
                created: results.success.length,
                failed: results.failed.length,
                successfulGrades: results.success,
                failedGrades: results.failed
            }
        });
    } catch (error) {
        console.error('Bulk create grades error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating grades in bulk',
            error: error.message
        });
    }
};

/**
 * @desc    Export grades to CSV (returns JSON with CSV data)
 * @route   GET /api/grades/export
 * @access  Private (Admin, Teacher)
 */
export const exportGrades = async (req, res) => {
    try {
        const { class: classId, subject, examType, academicYear } = req.query;

        console.log('Export grades request:', { classId, subject, examType, academicYear, tenant: req.tenant?._id });

        const query = { tenant: req.tenant._id };

        if (classId) query.class = classId;
        if (subject) query.subject = subject;
        if (examType) query.examType = examType;
        if (academicYear) query.academicYear = academicYear;

        console.log('Export query:', query);

        const grades = await Grade.find(query)
            .populate({
                path: 'student',
                populate: { path: 'user', select: 'firstName lastName' }
            })
            .populate('class', 'name section')
            .populate('subject', 'name')
            .sort({ examDate: -1 });

        console.log('Found grades for export:', grades.length);

        // Create CSV headers
        const csvHeaders = [
            'Student Name',
            'Class',
            'Subject',
            'Exam Type',
            'Exam Name',
            'Exam Date',
            'Total Marks',
            'Obtained Marks',
            'Percentage',
            'Grade',
            'Remarks'
        ];

        // Create CSV rows
        const csvRows = grades.map(grade => {
            const studentName = grade.student?.user
                ? `${grade.student.user.firstName || ''} ${grade.student.user.lastName || ''}`.trim()
                : 'N/A';
            const className = grade.class
                ? `${grade.class.name || ''} - ${grade.class.section || ''}`.trim()
                : 'N/A';
            const subjectName = grade.subject?.name || 'N/A';
            const examDate = grade.examDate
                ? new Date(grade.examDate).toLocaleDateString('en-US')
                : '';

            return [
                studentName,
                className,
                subjectName,
                grade.examType || '',
                grade.examName || '',
                examDate,
                grade.totalMarks || '',
                grade.obtainedMarks || '',
                grade.percentage ? `${grade.percentage}` : '',
                grade.grade || '',
                (grade.remarks || '').replace(/"/g, '""') // Escape quotes in remarks
            ];
        });

        // Build CSV content
        const csvContent = [
            csvHeaders.join(','),
            ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        console.log('CSV content generated, length:', csvContent.length);

        // Return as JSON with CSV content
        res.status(200).json({
            success: true,
            data: csvContent,
            filename: `grades-export-${Date.now()}.csv`
        });
    } catch (error) {
        console.error('Export grades error:', error);
        console.error('Error stack:', error.stack);

        res.status(500).json({
            success: false,
            message: 'Error exporting grades',
            error: error.message
        });
    }
};
