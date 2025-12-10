import Grade from '../models/Grade.js';
import Student from '../models/Student.js';

/**
 * @desc    Get all grades with filters and optional class organization
 * @route   GET /api/grades
 * @access  Private (Admin, Teacher)
 */
export const getGrades = async (req, res) => {
    try {
        const {
            student, class: classId, subject, examType,
            month, academicYear, page = 1, limit = 50, organizeByClass
        } = req.query;

        console.log('Get grades request:', { classId, student, subject, examType, organizeByClass, tenant: req.tenant?._id });

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
            .populate('class', 'name section')
            .populate('subject', 'name')
            .populate('enteredBy', 'firstName lastName')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ 'class.name': 1, 'class.section': 1, 'student.rollNumber': 1, 'subject.name': 1, examDate: -1 });

        console.log('Found grades:', grades.length);

        const count = await Grade.countDocuments(query);

        let responseData = grades;

        // If organizing by class, group the grades
        if (organizeByClass === 'true') {
            const gradesByClass = {};
            
            grades.forEach(grade => {
                const classKey = grade.class ? `${grade.class.name}-${grade.class.section}` : 'Unknown Class';
                const classId = grade.class?._id?.toString() || 'unknown';
                
                if (!gradesByClass[classKey]) {
                    gradesByClass[classKey] = {
                        classInfo: grade.class,
                        classId: classId,
                        students: {},
                        totalGrades: 0,
                        subjects: new Set()
                    };
                }
                
                const studentKey = grade.student?._id?.toString() || 'unknown';
                if (!gradesByClass[classKey].students[studentKey]) {
                    gradesByClass[classKey].students[studentKey] = {
                        student: grade.student,
                        grades: [],
                        subjectGrades: {}
                    };
                }
                
                gradesByClass[classKey].students[studentKey].grades.push(grade);
                gradesByClass[classKey].totalGrades++;
                
                // Group by subject for each student
                const subjectName = grade.subject?.name || 'Unknown Subject';
                gradesByClass[classKey].subjects.add(subjectName);
                
                if (!gradesByClass[classKey].students[studentKey].subjectGrades[subjectName]) {
                    gradesByClass[classKey].students[studentKey].subjectGrades[subjectName] = [];
                }
                gradesByClass[classKey].students[studentKey].subjectGrades[subjectName].push(grade);
            });

            // Convert sets to arrays and calculate statistics
            Object.keys(gradesByClass).forEach(classKey => {
                gradesByClass[classKey].subjects = Array.from(gradesByClass[classKey].subjects);
                gradesByClass[classKey].studentsArray = Object.values(gradesByClass[classKey].students);
                
                // Calculate class statistics
                const allGrades = gradesByClass[classKey].studentsArray.flatMap(s => s.grades);
                gradesByClass[classKey].stats = {
                    totalStudents: gradesByClass[classKey].studentsArray.length,
                    totalGrades: allGrades.length,
                    averagePercentage: allGrades.length > 0 
                        ? (allGrades.reduce((sum, g) => sum + (g.percentage || 0), 0) / allGrades.length).toFixed(2)
                        : 0
                };
            });

            responseData = gradesByClass;
        }

        res.status(200).json({
            success: true,
            count,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            data: responseData,
            organizedByClass: organizeByClass === 'true'
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
 * @desc    Get class grades report organized by class
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
            .populate('class', 'name section')
            .sort({ 'student.rollNumber': 1, 'subject.name': 1, examDate: -1 });

        // Group grades by student for better organization
        const gradesByStudent = {};
        grades.forEach(grade => {
            const studentId = grade.student._id.toString();
            if (!gradesByStudent[studentId]) {
                gradesByStudent[studentId] = {
                    student: grade.student,
                    grades: []
                };
            }
            gradesByStudent[studentId].grades.push(grade);
        });

        // Calculate individual student statistics
        const studentsWithStats = Object.values(gradesByStudent).map(studentData => {
            const studentGrades = studentData.grades;
            const totalPercentage = studentGrades.reduce((sum, g) => sum + g.percentage, 0);
            const averagePercentage = studentGrades.length > 0 ? (totalPercentage / studentGrades.length) : 0;
            
            // Group by subject for subject-wise performance
            const subjectPerformance = {};
            studentGrades.forEach(grade => {
                const subjectName = grade.subject.name;
                if (!subjectPerformance[subjectName]) {
                    subjectPerformance[subjectName] = [];
                }
                subjectPerformance[subjectName].push(grade);
            });

            return {
                student: studentData.student,
                grades: studentGrades,
                averagePercentage: averagePercentage.toFixed(2),
                totalExams: studentGrades.length,
                subjectPerformance,
                highestScore: studentGrades.length > 0 ? Math.max(...studentGrades.map(g => g.percentage)) : 0,
                lowestScore: studentGrades.length > 0 ? Math.min(...studentGrades.map(g => g.percentage)) : 0
            };
        });

        // Sort students by roll number
        studentsWithStats.sort((a, b) => {
            const rollA = a.student.rollNumber || '';
            const rollB = b.student.rollNumber || '';
            return rollA.localeCompare(rollB, undefined, { numeric: true });
        });

        // Calculate overall class statistics
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
                : 0,
            subjectBreakdown: {}
        };

        // Calculate subject-wise class statistics
        const subjectStats = {};
        grades.forEach(grade => {
            const subjectName = grade.subject.name;
            if (!subjectStats[subjectName]) {
                subjectStats[subjectName] = {
                    totalMarks: 0,
                    count: 0,
                    grades: []
                };
            }
            subjectStats[subjectName].totalMarks += grade.percentage;
            subjectStats[subjectName].count += 1;
            subjectStats[subjectName].grades.push(grade);
        });

        Object.keys(subjectStats).forEach(subjectName => {
            const subjectData = subjectStats[subjectName];
            stats.subjectBreakdown[subjectName] = {
                averagePercentage: (subjectData.totalMarks / subjectData.count).toFixed(2),
                totalExams: subjectData.count,
                highestScore: Math.max(...subjectData.grades.map(g => g.percentage)),
                lowestScore: Math.min(...subjectData.grades.map(g => g.percentage))
            };
        });

        res.status(200).json({
            success: true,
            data: grades,
            studentsWithStats,
            stats,
            classInfo: grades.length > 0 ? grades[0].class : null
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
 * @desc    Export grades to CSV with subject separation (returns JSON with CSV data)
 * @route   GET /api/grades/export
 * @access  Private (Admin, Teacher)
 */
export const exportGrades = async (req, res) => {
    try {
        const { class: classId, subject, examType, academicYear, separateBySubject } = req.query;

        console.log('Export grades request:', { classId, subject, examType, academicYear, separateBySubject, tenant: req.tenant?._id });

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
            .sort({ 'class.name': 1, 'subject.name': 1, 'student.rollNumber': 1, examDate: -1 });

        console.log('Found grades for export:', grades.length);

        if (separateBySubject === 'true') {
            // Group grades by subject
            const gradesBySubject = {};
            grades.forEach(grade => {
                const subjectName = grade.subject?.name || 'Unknown Subject';
                if (!gradesBySubject[subjectName]) {
                    gradesBySubject[subjectName] = [];
                }
                gradesBySubject[subjectName].push(grade);
            });

            // Create separate CSV files for each subject
            const csvFiles = {};
            
            Object.keys(gradesBySubject).forEach(subjectName => {
                const subjectGrades = gradesBySubject[subjectName];
                
                // Create CSV headers
                const csvHeaders = [
                    'Roll Number',
                    'Student Name',
                    'Class',
                    'Exam Type',
                    'Exam Name',
                    'Exam Date',
                    'Total Marks',
                    'Obtained Marks',
                    'Percentage',
                    'Grade',
                    'Remarks'
                ];

                // Create CSV rows for this subject
                const csvRows = subjectGrades.map(grade => {
                    const studentName = grade.student?.user
                        ? `${grade.student.user.firstName || ''} ${grade.student.user.lastName || ''}`.trim()
                        : 'N/A';
                    const className = grade.class
                        ? `${grade.class.name || ''} - ${grade.class.section || ''}`.trim()
                        : 'N/A';
                    const examDate = grade.examDate
                        ? new Date(grade.examDate).toLocaleDateString('en-US')
                        : '';

                    return [
                        grade.student?.rollNumber || 'N/A',
                        studentName,
                        className,
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

                // Build CSV content for this subject
                const csvContent = [
                    csvHeaders.join(','),
                    ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
                ].join('\n');

                csvFiles[subjectName] = csvContent;
            });

            console.log('Subject-separated CSV files generated:', Object.keys(csvFiles).length);

            // Return as JSON with multiple CSV files
            res.status(200).json({
                success: true,
                data: csvFiles,
                type: 'subject-separated',
                filename: `grades-by-subject-${Date.now()}`
            });
        } else {
            // Single CSV file with all grades
            const csvHeaders = [
                'Roll Number',
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
                    grade.student?.rollNumber || 'N/A',
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
                type: 'single',
                filename: `grades-export-${Date.now()}.csv`
            });
        }
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
