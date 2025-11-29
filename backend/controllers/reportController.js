import Grade from '../models/Grade.js';
import Student from '../models/Student.js';
import Class from '../models/Class.js';
import Subject from '../models/Subject.js';
import Attendance from '../models/Attendance.js';
import FeePayment from '../models/FeePayment.js';
import FeeStructure from '../models/FeeStructure.js';
import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';
import BatchReportService from '../services/BatchReportService.js';

/**
 * @desc    Generate student report card (PDF)
 * @route   GET /api/reports/student/:studentId/report-card
 * @access  Private
 */
export const generateStudentReportCard = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { academicYear } = req.query;

        // Fetch student data
        const student = await Student.findOne({
            _id: studentId,
            tenant: req.tenant._id
        }).populate('user', 'firstName lastName email')
            .populate('class');

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        // Fetch grades
        const query = {
            tenant: req.tenant._id,
            student: studentId
        };
        if (academicYear) query.academicYear = academicYear;

        const grades = await Grade.find(query)
            .populate('subject')
            .populate('class')
            .sort({ examDate: -1 });

        if (grades.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No grades found for this student'
            });
        }

        // Calculate statistics
        const totalPercentage = grades.reduce((sum, g) => sum + g.percentage, 0);
        const averagePercentage = (totalPercentage / grades.length).toFixed(2);

        // Create PDF
        const doc = new PDFDocument({ margin: 50 });

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=report-card-${student.user.firstName}-${student.user.lastName}.pdf`);

        doc.pipe(res);

        // Header
        doc.fontSize(20).text('Student Report Card', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Academic Year: ${academicYear || 'All Years'}`, { align: 'center' });
        doc.moveDown(2);

        // Student Information
        doc.fontSize(14).text('Student Information', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(11);
        doc.text(`Name: ${student.user.firstName} ${student.user.lastName}`);
        doc.text(`Roll Number: ${student.rollNumber}`);
        doc.text(`Class: ${student.class.name}`);
        doc.text(`Email: ${student.user.email}`);
        doc.moveDown(2);

        // Overall Performance
        doc.fontSize(14).text('Overall Performance', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(11);
        doc.text(`Total Exams: ${grades.length}`);
        doc.text(`Average Percentage: ${averagePercentage}%`);
        doc.moveDown(2);

        // Grades Table
        doc.fontSize(14).text('Detailed Grades', { underline: true });
        doc.moveDown(0.5);

        const tableTop = doc.y;
        const col1 = 50;
        const col2 = 150;
        const col3 = 250;
        const col4 = 320;
        const col5 = 390;
        const col6 = 460;

        // Table headers
        doc.fontSize(10).font('Helvetica-Bold');
        doc.text('Subject', col1, tableTop);
        doc.text('Exam', col2, tableTop);
        doc.text('Date', col3, tableTop);
        doc.text('Marks', col4, tableTop);
        doc.text('%', col5, tableTop);
        doc.text('Grade', col6, tableTop);

        doc.font('Helvetica');
        let y = tableTop + 20;

        grades.forEach((grade) => {
            if (y > 700) {
                doc.addPage();
                y = 50;
            }

            const examDate = new Date(grade.examDate).toLocaleDateString();
            const marks = `${grade.obtainedMarks}/${grade.totalMarks}`;

            doc.text(grade.subject.name.substring(0, 15), col1, y);
            doc.text(grade.examName.substring(0, 15), col2, y);
            doc.text(examDate, col3, y);
            doc.text(marks, col4, y);
            doc.text(grade.percentage.toFixed(1), col5, y);
            doc.text(grade.grade, col6, y);

            y += 20;
        });

        doc.end();
    } catch (error) {
        console.error('Generate report card error:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating report card',
            error: error.message
        });
    }
};

/**
 * @desc    Generate class report (Excel)
 * @route   GET /api/reports/class/:classId/excel
 * @access  Private (Admin, Teacher)
 */
export const generateClassExcelReport = async (req, res) => {
    try {
        const { classId } = req.params;
        const { subject, examType, academicYear } = req.query;

        // Fetch class data
        const classData = await Class.findOne({
            _id: classId,
            tenant: req.tenant._id
        });

        if (!classData) {
            return res.status(404).json({
                success: false,
                message: 'Class not found'
            });
        }

        // Build query
        const query = {
            tenant: req.tenant._id,
            class: classId
        };
        if (subject) query.subject = subject;
        if (examType) query.examType = examType;
        if (academicYear) query.academicYear = academicYear;

        // Fetch grades
        const grades = await Grade.find(query)
            .populate({
                path: 'student',
                populate: { path: 'user', select: 'firstName lastName' }
            })
            .populate('subject')
            .sort({ 'student.rollNumber': 1, examDate: -1 });

        if (grades.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No grades found for this class'
            });
        }

        // Create Excel workbook
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Class Grades Report');

        // Set column widths
        worksheet.columns = [
            { header: 'Roll No', key: 'rollNumber', width: 12 },
            { header: 'Student Name', key: 'studentName', width: 25 },
            { header: 'Subject', key: 'subject', width: 20 },
            { header: 'Exam Type', key: 'examType', width: 15 },
            { header: 'Exam Name', key: 'examName', width: 20 },
            { header: 'Exam Date', key: 'examDate', width: 15 },
            { header: 'Total Marks', key: 'totalMarks', width: 12 },
            { header: 'Obtained Marks', key: 'obtainedMarks', width: 15 },
            { header: 'Percentage', key: 'percentage', width: 12 },
            { header: 'Grade', key: 'grade', width: 10 },
            { header: 'Remarks', key: 'remarks', width: 25 }
        ];

        // Style header row
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF4472C4' }
        };
        worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

        // Add data rows
        grades.forEach((grade) => {
            worksheet.addRow({
                rollNumber: grade.student.rollNumber,
                studentName: `${grade.student.user.firstName} ${grade.student.user.lastName}`,
                subject: grade.subject.name,
                examType: grade.examType,
                examName: grade.examName,
                examDate: new Date(grade.examDate).toLocaleDateString(),
                totalMarks: grade.totalMarks,
                obtainedMarks: grade.obtainedMarks,
                percentage: grade.percentage.toFixed(2),
                grade: grade.grade,
                remarks: grade.remarks || ''
            });
        });

        // Add summary statistics
        worksheet.addRow({});
        const summaryRow = worksheet.addRow({
            rollNumber: 'SUMMARY',
            studentName: '',
            subject: '',
            examType: '',
            examName: '',
            examDate: '',
            totalMarks: '',
            obtainedMarks: '',
            percentage: (grades.reduce((sum, g) => sum + g.percentage, 0) / grades.length).toFixed(2),
            grade: 'Avg',
            remarks: ''
        });
        summaryRow.font = { bold: true };
        summaryRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFEB9C' }
        };

        // Set response headers
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=class-${classData.name}-report.xlsx`);

        // Write to response
        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error('Generate Excel report error:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating Excel report',
            error: error.message
        });
    }
};

/**
 * @desc    Generate subject-wise report (PDF)
 * @route   GET /api/reports/subject/:subjectId/report
 * @access  Private (Admin, Teacher)
 */
export const generateSubjectReport = async (req, res) => {
    try {
        const { subjectId } = req.params;
        const { classId, academicYear } = req.query;

        // Fetch subject data
        const subject = await Subject.findOne({
            _id: subjectId,
            tenant: req.tenant._id
        });

        if (!subject) {
            return res.status(404).json({
                success: false,
                message: 'Subject not found'
            });
        }

        // Build query
        const query = {
            tenant: req.tenant._id,
            subject: subjectId
        };
        if (classId) query.class = classId;
        if (academicYear) query.academicYear = academicYear;

        // Fetch grades
        const grades = await Grade.find(query)
            .populate({
                path: 'student',
                populate: { path: 'user', select: 'firstName lastName' }
            })
            .populate('class')
            .sort({ examDate: -1 });

        if (grades.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No grades found for this subject'
            });
        }

        // Calculate statistics
        const totalPercentage = grades.reduce((sum, g) => sum + g.percentage, 0);
        const averagePercentage = (totalPercentage / grades.length).toFixed(2);
        const highestScore = Math.max(...grades.map(g => g.percentage));
        const lowestScore = Math.min(...grades.map(g => g.percentage));

        // Create PDF
        const doc = new PDFDocument({ margin: 50 });

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=subject-report-${subject.name}.pdf`);

        doc.pipe(res);

        // Header
        doc.fontSize(20).text('Subject Performance Report', { align: 'center' });
        doc.moveDown();
        doc.fontSize(14).text(`Subject: ${subject.name}`, { align: 'center' });
        doc.fontSize(12).text(`Academic Year: ${academicYear || 'All Years'}`, { align: 'center' });
        doc.moveDown(2);

        // Statistics
        doc.fontSize(14).text('Overall Statistics', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(11);
        doc.text(`Total Students: ${new Set(grades.map(g => g.student._id.toString())).size}`);
        doc.text(`Total Exams: ${grades.length}`);
        doc.text(`Average Percentage: ${averagePercentage}%`);
        doc.text(`Highest Score: ${highestScore.toFixed(2)}%`);
        doc.text(`Lowest Score: ${lowestScore.toFixed(2)}%`);
        doc.moveDown(2);

        // Grades Table
        doc.fontSize(14).text('Student Performance', { underline: true });
        doc.moveDown(0.5);

        const tableTop = doc.y;
        const col1 = 50;
        const col2 = 150;
        const col3 = 250;
        const col4 = 320;
        const col5 = 390;
        const col6 = 460;

        // Table headers
        doc.fontSize(10).font('Helvetica-Bold');
        doc.text('Student', col1, tableTop);
        doc.text('Exam', col2, tableTop);
        doc.text('Date', col3, tableTop);
        doc.text('Marks', col4, tableTop);
        doc.text('%', col5, tableTop);
        doc.text('Grade', col6, tableTop);

        doc.font('Helvetica');
        let y = tableTop + 20;
        grades.forEach((grade) => {
            if (y > 700) {
                doc.addPage();
                y = 50;
            }

            const studentName = `${grade.student.user.firstName} ${grade.student.user.lastName}`;
            const examDate = new Date(grade.examDate).toLocaleDateString();
            const marks = `${grade.obtainedMarks}/${grade.totalMarks}`;

            doc.text(studentName.substring(0, 15), col1, y);
            doc.text(grade.examName.substring(0, 15), col2, y);
            doc.text(examDate, col3, y);
            doc.text(marks, col4, y);
            doc.text(grade.percentage.toFixed(1), col5, y);
            doc.text(grade.grade, col6, y);

            y += 20;
        });
        doc.end();
    } catch (error) {
        console.error('Generate subject report error:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating subject report',
            error: error.message
        });
    }
};

/**
 * @desc    Generate comprehensive class report (PDF)
 * @route   GET /api/reports/class/:classId/pdf
 * @access  Private (Admin, Teacher)
 */
export const generateClassPDFReport = async (req, res) => {
    try {
        const { classId } = req.params;
        const { academicYear } = req.query;

        // Fetch class data
        const classData = await Class.findOne({
            _id: classId,
            tenant: req.tenant._id
        });

        if (!classData) {
            return res.status(404).json({
                success: false,
                message: 'Class not found'
            });
        }

        // Build query
        const query = {
            tenant: req.tenant._id,
            class: classId
        };
        if (academicYear) query.academicYear = academicYear;

        // Fetch grades
        const grades = await Grade.find(query)
            .populate({
                path: 'student',
                populate: { path: 'user', select: 'firstName lastName' }
            })
            .populate('subject')
            .sort({ 'student.rollNumber': 1, examDate: -1 });

        if (grades.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No grades found for this class'
            });
        }

        // Calculate statistics
        const uniqueStudents = new Set(grades.map(g => g.student._id.toString())).size;
        const totalPercentage = grades.reduce((sum, g) => sum + g.percentage, 0);
        const averagePercentage = (totalPercentage / grades.length).toFixed(2);
        const highestScore = Math.max(...grades.map(g => g.percentage));
        const lowestScore = Math.min(...grades.map(g => g.percentage));

        // Create PDF
        const doc = new PDFDocument({ margin: 50 });

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=class-${classData.name}-report.pdf`);

        doc.pipe(res);

        // Header
        doc.fontSize(20).text('Class Performance Report', { align: 'center' });
        doc.moveDown();
        doc.fontSize(14).text(`Class: ${classData.name}`, { align: 'center' });
        doc.fontSize(12).text(`Academic Year: ${academicYear || 'All Years'}`, { align: 'center' });
        doc.moveDown(2);

        // Statistics
        doc.fontSize(14).text('Class Statistics', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(11);
        doc.text(`Total Students: ${uniqueStudents}`);
        doc.text(`Total Exams Conducted: ${grades.length}`);
        doc.text(`Class Average: ${averagePercentage}%`);
        doc.text(`Highest Score: ${highestScore.toFixed(2)}%`);
        doc.text(`Lowest Score: ${lowestScore.toFixed(2)}%`);
        doc.moveDown(2);

        // Grades Table
        doc.fontSize(14).text('Detailed Performance', { underline: true });
        doc.moveDown(0.5);

        const tableTop = doc.y;
        const col1 = 50;
        const col2 = 100;
        const col3 = 200;
        const col4 = 280;
        const col5 = 350;
        const col6 = 420;
        const col7 = 480;

        // Table headers
        doc.fontSize(9).font('Helvetica-Bold');
        doc.text('Roll', col1, tableTop);
        doc.text('Student', col2, tableTop);
        doc.text('Subject', col3, tableTop);
        doc.text('Exam', col4, tableTop);
        doc.text('Marks', col5, tableTop);
        doc.text('%', col6, tableTop);
        doc.text('Grade', col7, tableTop);

        doc.font('Helvetica');
        let y = tableTop + 20;
        grades.forEach((grade) => {
            if (y > 700) {
                doc.addPage();
                y = 50;
            }

            const studentName = `${grade.student.user.firstName} ${grade.student.user.lastName}`;
            const marks = `${grade.obtainedMarks}/${grade.totalMarks}`;

            doc.fontSize(8);
            doc.text(grade.student.rollNumber, col1, y);
            doc.text(studentName.substring(0, 12), col2, y);
            doc.text(grade.subject.name.substring(0, 10), col3, y);
            doc.text(grade.examName.substring(0, 10), col4, y);
            doc.text(marks, col5, y);
            doc.text(grade.percentage.toFixed(1), col6, y);
            doc.text(grade.grade, col7, y);

            y += 18;
        });

        doc.end();
    } catch (error) {
        console.error('Generate class PDF report error:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating class PDF report',
            error: error.message
        });
    }
};

/**
 * @desc    Generate student performance summary (Excel)
 * @route   GET /api/reports/student/:studentId/excel
 * @access  Private
 */
export const generateStudentExcelReport = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { academicYear } = req.query;

        // Fetch student data
        const student = await Student.findOne({
            _id: studentId,
            tenant: req.tenant._id
        }).populate('user', 'firstName lastName email')
            .populate('class');

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        // Fetch grades
        const query = {
            tenant: req.tenant._id,
            student: studentId
        };
        if (academicYear) query.academicYear = academicYear;

        const grades = await Grade.find(query)
            .populate('subject')
            .populate('class')
            .sort({ examDate: -1 });

        if (grades.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No grades found for this student'
            });
        }

        // Create Excel workbook
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Student Performance');

        // Add student info section
        worksheet.mergeCells('A1:D1');
        worksheet.getCell('A1').value = 'STUDENT PERFORMANCE REPORT';
        worksheet.getCell('A1').font = { size: 16, bold: true };
        worksheet.getCell('A1').alignment = { horizontal: 'center' };

        worksheet.getCell('A3').value = 'Name:';
        worksheet.getCell('B3').value = `${student.user.firstName} ${student.user.lastName}`;
        worksheet.getCell('A4').value = 'Roll Number:';
        worksheet.getCell('B4').value = student.rollNumber;
        worksheet.getCell('A5').value = 'Class:';
        worksheet.getCell('B5').value = student.class.name;
        worksheet.getCell('A6').value = 'Email:';
        worksheet.getCell('B6').value = student.user.email;

        // Style info section
        ['A3', 'A4', 'A5', 'A6'].forEach(cell => {
            worksheet.getCell(cell).font = { bold: true };
        });

        // Add grades table
        worksheet.getCell('A8').value = 'DETAILED GRADES';
        worksheet.getCell('A8').font = { size: 14, bold: true };

        // Set column widths
        worksheet.columns = [
            { key: 'subject', width: 20 },
            { key: 'examType', width: 15 },
            { key: 'examName', width: 20 },
            { key: 'examDate', width: 15 },
            { key: 'totalMarks', width: 12 },
            { key: 'obtainedMarks', width: 15 },
            { key: 'percentage', width: 12 },
            { key: 'grade', width: 10 },
            { key: 'remarks', width: 25 }
        ];

        // Add headers at row 10
        const headerRow = worksheet.getRow(10);
        headerRow.values = ['Subject', 'Exam Type', 'Exam Name', 'Date', 'Total Marks', 'Obtained Marks', 'Percentage', 'Grade', 'Remarks'];
        headerRow.font = { bold: true };
        headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF4472C4' }
        };
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };

        // Add data rows
        let rowNum = 11;
        grades.forEach((grade) => {
            const row = worksheet.getRow(rowNum);
            row.values = [
                grade.subject.name,
                grade.examType,
                grade.examName,
                new Date(grade.examDate).toLocaleDateString(),
                grade.totalMarks,
                grade.obtainedMarks,
                grade.percentage.toFixed(2),
                grade.grade,
                grade.remarks || ''
            ];
            rowNum++;
        });

        // Add summary
        const summaryRow = worksheet.getRow(rowNum + 1);
        summaryRow.values = ['SUMMARY', '', '', '', '', '',
            (grades.reduce((sum, g) => sum + g.percentage, 0) / grades.length).toFixed(2),
            'Average', ''];
        summaryRow.font = { bold: true };
        summaryRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFEB9C' }
        };

        // Set response headers
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=student-${student.user.firstName}-${student.user.lastName}-report.xlsx`);

        // Write to response
        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error('Generate student Excel report error:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating student Excel report',
            error: error.message
        });
    }
};

/**
 * @desc    Generate student attendance report (PDF)
 * @route   GET /api/reports/student/:studentId/attendance
 * @access  Private
 */
export const generateStudentAttendanceReport = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { startDate, endDate, month, year } = req.query;

        // Fetch student data
        const student = await Student.findOne({
            _id: studentId,
            tenant: req.tenant._id
        }).populate('user', 'firstName lastName email')
            .populate('class');

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        // Build query
        const query = {
            tenant: req.tenant._id,
            student: studentId
        };

        // Date filtering
        if (startDate && endDate) {
            query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
        } else if (month && year) {
            const monthStart = new Date(year, month - 1, 1);
            const monthEnd = new Date(year, month, 0);
            query.date = { $gte: monthStart, $lte: monthEnd };
        }

        // Fetch attendance records
        const attendanceRecords = await Attendance.find(query)
            .populate('subject')
            .sort({ date: -1 });

        if (attendanceRecords.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No attendance records found'
            });
        }

        // Create PDF
        const doc = new PDFDocument({ margin: 50 });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=attendance-${student.user.firstName}-${student.user.lastName}.pdf`);
        doc.pipe(res);

        // Header
        doc.fontSize(20).text('Student Attendance Report', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Student: ${student.user.firstName} ${student.user.lastName}`, { align: 'center' });
        doc.text(`Class: ${student.class.name}`, { align: 'center' });
        doc.moveDown(2);

        // Table headers
        const tableTop = doc.y;
        const col1 = 50; // Date
        const col2 = 150; // Subject
        const col3 = 300; // Status
        doc.fontSize(10).font('Helvetica-Bold');
        doc.text('Date', col1, tableTop);
        doc.text('Subject', col2, tableTop);
        doc.text('Status', col3, tableTop);
        doc.font('Helvetica');
        let y = tableTop + 20;
        attendanceRecords.forEach(rec => {
            if (y > 700) { doc.addPage(); y = 50; }
            const dateStr = new Date(rec.date).toLocaleDateString();
            doc.text(dateStr, col1, y);
            doc.text(rec.subject ? rec.subject.name : 'N/A', col2, y);
            doc.text(rec.status || 'Present', col3, y);
            y += 20;
        });
        doc.end();
    } catch (error) {
        console.error('Generate attendance report error:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating attendance report',
            error: error.message
        });
    }
};

/**
 * @desc    Generate student fee report (PDF)
 * @route   GET /api/reports/student/:studentId/fee
 * @access  Private
 */
export const generateStudentFeeReport = async (req, res) => {
    try {
        const { studentId } = req.params;
        const student = await Student.findOne({ _id: studentId, tenant: req.tenant._id })
            .populate('user', 'firstName lastName email')
            .populate('class');
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }
        const payments = await FeePayment.find({ tenant: req.tenant._id, student: studentId })
            .populate('feeStructure');
        const doc = new PDFDocument({ margin: 50 });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=fee-${student.user.firstName}-${student.user.lastName}.pdf`);
        doc.pipe(res);
        doc.fontSize(20).text('Student Fee Report', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Name: ${student.user.firstName} ${student.user.lastName}`);
        doc.text(`Class: ${student.class.name}`);
        doc.moveDown();
        const tableTop = doc.y;
        const col1 = 50; // Invoice
        const col2 = 150; // Date
        const col3 = 250; // Amount
        const col4 = 350; // Paid
        const col5 = 450; // Status
        doc.fontSize(10).font('Helvetica-Bold');
        doc.text('Invoice', col1, tableTop);
        doc.text('Date', col2, tableTop);
        doc.text('Amount', col3, tableTop);
        doc.text('Paid', col4, tableTop);
        doc.text('Status', col5, tableTop);
        doc.font('Helvetica');
        let y = tableTop + 20;
        payments.forEach(p => {
            if (y > 700) { doc.addPage(); y = 50; }
            const dateStr = new Date(p.invoiceDate).toLocaleDateString();
            doc.text(p.invoiceNumber, col1, y);
            doc.text(dateStr, col2, y);
            doc.text(p.totalAmount.toFixed(2), col3, y);
            doc.text(p.paidAmount.toFixed(2), col4, y);
            doc.text(p.status, col5, y);
            y += 20;
        });
        doc.end();
    } catch (error) {
        console.error('Generate student fee report error:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating student fee report',
            error: error.message
        });
    }
};

/**
 * @desc    Generate batch report cards (ZIP of PDFs)
 * @route   POST /api/reports/batch/report-cards
 * @access  Private (Admin)
 */
export const generateBatchReportCards = async (req, res) => {
    try {
        const { classId, academicYear } = req.body;

        if (!classId) {
            return res.status(400).json({
                success: false,
                message: 'Class ID is required'
            });
        }

        const zipBuffer = await BatchReportService.generateBatchReportCards(req.tenant._id, classId, academicYear);

        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename=batch-report-cards-${classId}.zip`);
        res.send(zipBuffer);
    } catch (error) {
        console.error('Batch report cards error:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating batch report cards',
            error: error.message
        });
    }
};

/**
 * @desc    Generate class fee report (PDF)
 * @route   GET /api/reports/class/:classId/fee
 * @access  Private (Admin)
 */
export const generateClassFeeReport = async (req, res) => {
    try {
        const { classId } = req.params;

        // Fetch class data
        const classData = await Class.findOne({
            _id: classId,
            tenant: req.tenant._id
        });

        if (!classData) {
            return res.status(404).json({
                success: false,
                message: 'Class not found'
            });
        }

        // Fetch all students in the class
        const students = await Student.find({
            tenant: req.tenant._id,
            class: classId
        }).populate('user', 'firstName lastName');

        if (students.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No students found in this class'
            });
        }

        // Fetch fee payments for all students
        const studentIds = students.map(s => s._id);
        const payments = await FeePayment.find({
            tenant: req.tenant._id,
            student: { $in: studentIds }
        }).populate('student').populate('feeStructure');

        // Create PDF
        const doc = new PDFDocument({ margin: 50 });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=class-${classData.name}-fee-report.pdf`);
        doc.pipe(res);

        // Header
        doc.fontSize(20).text('Class Fee Report', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Class: ${classData.name}`, { align: 'center' });
        doc.moveDown(2);

        // Table headers
        const tableTop = doc.y;
        const col1 = 50;
        const col2 = 150;
        const col3 = 250;
        const col4 = 320;
        const col5 = 390;
        const col6 = 460;

        doc.fontSize(10).font('Helvetica-Bold');
        doc.text('Roll', col1, tableTop);
        doc.text('Student', col2, tableTop);
        doc.text('Invoice', col3, tableTop);
        doc.text('Amount', col4, tableTop);
        doc.text('Paid', col5, tableTop);
        doc.text('Status', col6, tableTop);

        doc.font('Helvetica');
        let y = tableTop + 20;

        payments.forEach(payment => {
            if (y > 700) {
                doc.addPage();
                y = 50;
            }

            const student = students.find(s => s._id.toString() === payment.student._id.toString());
            if (student) {
                const studentName = `${student.user.firstName} ${student.user.lastName}`;
                doc.text(student.rollNumber || 'N/A', col1, y);
                doc.text(studentName.substring(0, 15), col2, y);
                doc.text(payment.invoiceNumber, col3, y);
                doc.text(payment.totalAmount.toFixed(2), col4, y);
                doc.text(payment.paidAmount.toFixed(2), col5, y);
                doc.text(payment.status, col6, y);
                y += 20;
            }
        });

        doc.end();
    } catch (error) {
        console.error('Generate class fee report error:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating class fee report',
            error: error.message
        });
    }
};

/**
 * @desc    Generate batch fee report (Excel)
 * @route   POST /api/reports/batch/fee
 * @access  Private (Admin)
 */
export const generateBatchFeeReport = async (req, res) => {
    try {
        const { classId } = req.body;

        if (!classId) {
            return res.status(400).json({ message: 'Class ID is required' });
        }

        const workbook = await BatchReportService.generateClassFeeReport(req.tenant._id, classId);

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=batch-fee-report-${classId}.xlsx`);

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error('Batch fee report error:', error);
        res.status(500).json({ message: 'Error generating batch fee report', error: error.message });
    }
};
