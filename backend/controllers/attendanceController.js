import Attendance from '../models/Attendance.js';
import Student from '../models/Student.js';

/**
 * @desc    Mark attendance
 * @route   POST /api/attendance
 * @access  Private (Admin, Teacher)
 */
export const markAttendance = async (req, res) => {
    try {
        const { students, date, classId, subject, period } = req.body;

        const attendanceRecords = [];

        for (const studentData of students) {
            // Check if attendance already exists
            const existingAttendance = await Attendance.findOne({
                tenant: req.tenant._id,
                student: studentData.studentId,
                date: new Date(date),
                class: classId,
                ...(subject && { subject }),
                ...(period && { period })
            });

            if (existingAttendance) {
                // Update existing attendance
                existingAttendance.status = studentData.status;
                existingAttendance.remarks = studentData.remarks;
                existingAttendance.markedBy = req.user._id;
                existingAttendance.markedAt = new Date();
                await existingAttendance.save();
                attendanceRecords.push(existingAttendance);
            } else {
                // Create new attendance
                const attendance = await Attendance.create({
                    tenant: req.tenant._id,
                    student: studentData.studentId,
                    class: classId,
                    date: new Date(date),
                    status: studentData.status,
                    subject,
                    period,
                    remarks: studentData.remarks,
                    markedBy: req.user._id
                });
                attendanceRecords.push(attendance);
            }
        }

        res.status(201).json({
            success: true,
            message: 'Attendance marked successfully',
            data: attendanceRecords
        });
    } catch (error) {
        console.error('Mark attendance error:', error);
        res.status(500).json({
            success: false,
            message: 'Error marking attendance',
            error: error.message
        });
    }
};

/**
 * @desc    Get attendance records
 * @route   GET /api/attendance
 * @access  Private
 */
export const getAttendance = async (req, res) => {
    try {
        const { classId, studentId, startDate, endDate, status, month, year } = req.query;

        const query = { tenant: req.tenant._id };

        // If student is accessing their own attendance
        if (req.user.role === 'student') {
            const student = await Student.findOne({ user: req.user._id, tenant: req.tenant._id });
            if (student) {
                query.student = student._id;
            }
        } else {
            if (classId) query.class = classId;
            if (studentId) query.student = studentId;
        }

        if (status) query.status = status;

        if (month && year) {
            const startOfMonth = new Date(year, month - 1, 1);
            const endOfMonth = new Date(year, month, 0);
            query.date = {
                $gte: startOfMonth,
                $lte: endOfMonth
            };
        } else if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const attendance = await Attendance.find(query)
            .populate({
                path: 'student',
                populate: { path: 'user', select: 'firstName lastName email' }
            })
            .populate('class')
            .populate('subject')
            .populate('markedBy', 'firstName lastName')
            .sort({ date: -1 });

        res.status(200).json({
            success: true,
            count: attendance.length,
            data: attendance
        });
    } catch (error) {
        console.error('Get attendance error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching attendance',
            error: error.message
        });
    }
};

/**
 * @desc    Get attendance statistics
 * @route   GET /api/attendance/stats
 * @access  Private
 */
export const getAttendanceStats = async (req, res) => {
    try {
        const { studentId, classId, startDate, endDate } = req.query;

        const query = { tenant: req.tenant._id };

        if (studentId) query.student = studentId;
        if (classId) query.class = classId;

        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const attendance = await Attendance.find(query);

        const stats = {
            total: attendance.length,
            present: attendance.filter(a => a.status === 'present').length,
            absent: attendance.filter(a => a.status === 'absent').length,
            late: attendance.filter(a => a.status === 'late').length,
            excused: attendance.filter(a => a.status === 'excused').length,
            halfDay: attendance.filter(a => a.status === 'half_day').length
        };

        stats.attendancePercentage = stats.total > 0
            ? ((stats.present + stats.late + stats.halfDay * 0.5) / stats.total * 100).toFixed(2)
            : 0;

        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Get attendance stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching attendance statistics',
            error: error.message
        });
    }
};

/**
 * @desc    Get daily attendance report
 * @route   GET /api/attendance/daily-report
 * @access  Private (Admin, Teacher)
 */
export const getDailyAttendanceReport = async (req, res) => {
    try {
        const { date, classId } = req.query;

        const query = {
            tenant: req.tenant._id,
            date: new Date(date || new Date())
        };

        if (classId) query.class = classId;

        const attendance = await Attendance.find(query)
            .populate({
                path: 'student',
                populate: { path: 'user', select: 'firstName lastName email' }
            })
            .populate('class');

        const summary = {
            date: query.date,
            totalStudents: attendance.length,
            present: attendance.filter(a => a.status === 'present').length,
            absent: attendance.filter(a => a.status === 'absent').length,
            late: attendance.filter(a => a.status === 'late').length,
            excused: attendance.filter(a => a.status === 'excused').length,
            records: attendance
        };

        res.status(200).json({
            success: true,
            data: summary
        });
    } catch (error) {
        console.error('Get daily report error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching daily attendance report',
            error: error.message
        });
    }
};
