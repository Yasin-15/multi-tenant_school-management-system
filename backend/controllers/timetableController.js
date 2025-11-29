import Class from '../models/Class.js';
import Teacher from '../models/Teacher.js';

// Get timetable for a specific class
export const getTimetable = async (req, res) => {
    try {
        const { classId } = req.params;

        console.log('=== Get Timetable Debug ===');
        console.log('ClassId:', classId);
        console.log('User:', req.user);
        console.log('User Tenant:', req.user?.tenant);

        if (!req.user || !req.user.tenant) {
            console.error('Missing user or tenant in request');
            return res.status(401).json({ message: 'Authentication error: Missing user or tenant information' });
        }

        const tenantId = req.user.tenant;

        const classData = await Class.findOne({ _id: classId, tenant: tenantId })
            .populate({
                path: 'schedule.periods.subject',
                select: 'name code'
            })
            .populate({
                path: 'schedule.periods.teacher',
                select: 'user',
                populate: { path: 'user', select: 'name' }
            });

        if (!classData) {
            console.log('Class not found for classId:', classId, 'and tenantId:', tenantId);
            return res.status(404).json({ message: 'Class not found' });
        }

        console.log('Timetable found, schedule length:', classData.schedule?.length || 0);
        res.status(200).json(classData.schedule || []);
    } catch (error) {
        console.error('Get Timetable Error:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update timetable for a class
export const updateTimetable = async (req, res) => {
    try {
        const { classId } = req.params;
        const { schedule } = req.body; // Expecting array of { day, periods: [...] }

        console.log('=== Update Timetable Debug ===');
        console.log('ClassId:', classId);
        console.log('User:', req.user);
        console.log('User Tenant:', req.user?.tenant);
        console.log('Schedule data received:', JSON.stringify(schedule, null, 2));

        if (!req.user || !req.user.tenant) {
            console.error('Missing user or tenant in request');
            return res.status(401).json({ message: 'Authentication error: Missing user or tenant information' });
        }

        const tenantId = req.user.tenant;

        const classData = await Class.findOne({ _id: classId, tenant: tenantId });

        if (!classData) {
            console.log('Class not found for classId:', classId, 'and tenantId:', tenantId);
            return res.status(404).json({ message: 'Class not found' });
        }

        // Basic validation could be added here to check for teacher conflicts
        // For now, we'll trust the admin input but we should ideally check if the teacher is free.

        classData.schedule = schedule;
        await classData.save();

        console.log('Timetable updated successfully');
        res.status(200).json({ message: 'Timetable updated successfully', schedule: classData.schedule });
    } catch (error) {
        console.error('Update Timetable Error:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get teacher's schedule for a specific day or full week
export const getTeacherSchedule = async (req, res) => {
    try {
        const { teacherId } = req.params;
        const { day } = req.query; // Optional: filter by specific day
        const tenantId = req.user.tenant;

        // Verify teacher belongs to tenant
        const teacher = await Teacher.findOne({ _id: teacherId, tenant: tenantId });
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        // Find all classes where this teacher teaches
        const classes = await Class.find({
            tenant: tenantId,
            'schedule.periods.teacher': teacherId
        })
            .populate('schedule.periods.subject', 'name code')
            .populate('schedule.periods.teacher', 'user')
            .populate('user', 'name')
            .select('name grade section room schedule');

        // Build teacher's schedule
        let teacherSchedule = [];

        classes.forEach(classData => {
            classData.schedule.forEach(daySchedule => {
                // Filter by day if specified
                if (day && daySchedule.day !== day) return;

                daySchedule.periods.forEach(period => {
                    if (period.teacher && period.teacher._id.toString() === teacherId) {
                        teacherSchedule.push({
                            day: daySchedule.day,
                            startTime: period.startTime,
                            endTime: period.endTime,
                            subject: period.subject,
                            class: {
                                _id: classData._id,
                                name: classData.name,
                                grade: classData.grade,
                                section: classData.section,
                                room: classData.room || period.room
                            }
                        });
                    }
                });
            });
        });

        // Sort by day and time
        const dayOrder = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        teacherSchedule.sort((a, b) => {
            const dayDiff = dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
            if (dayDiff !== 0) return dayDiff;
            return a.startTime.localeCompare(b.startTime);
        });

        res.status(200).json(teacherSchedule);
    } catch (error) {
        console.error('Get Teacher Schedule Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get teacher's weekly schedule grouped by day
export const getTeacherWeeklySchedule = async (req, res) => {
    try {
        const { teacherId } = req.params;
        const tenantId = req.user.tenant;

        // Verify teacher belongs to tenant
        const teacher = await Teacher.findOne({ _id: teacherId, tenant: tenantId })
            .populate('user', 'name email');
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        // Find all classes where this teacher teaches
        const classes = await Class.find({
            tenant: tenantId,
            'schedule.periods.teacher': teacherId
        })
            .populate('schedule.periods.subject', 'name code')
            .select('name grade section room schedule');

        // Build weekly schedule grouped by day
        const weeklySchedule = {
            teacher: {
                _id: teacher._id,
                name: teacher.user?.name,
                email: teacher.user?.email,
                employeeId: teacher.employeeId
            },
            schedule: {}
        };

        const days = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        days.forEach(day => {
            weeklySchedule.schedule[day] = [];
        });

        classes.forEach(classData => {
            classData.schedule.forEach(daySchedule => {
                daySchedule.periods.forEach(period => {
                    if (period.teacher && period.teacher.toString() === teacherId) {
                        weeklySchedule.schedule[daySchedule.day].push({
                            startTime: period.startTime,
                            endTime: period.endTime,
                            subject: period.subject,
                            class: {
                                _id: classData._id,
                                name: classData.name,
                                grade: classData.grade,
                                section: classData.section,
                                room: classData.room || period.room
                            }
                        });
                    }
                });
            });
        });

        // Sort periods within each day
        Object.keys(weeklySchedule.schedule).forEach(day => {
            weeklySchedule.schedule[day].sort((a, b) =>
                a.startTime.localeCompare(b.startTime)
            );
        });

        res.status(200).json(weeklySchedule);
    } catch (error) {
        console.error('Get Teacher Weekly Schedule Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get student's weekly schedule
export const getStudentWeeklySchedule = async (req, res) => {
    try {
        const { studentId } = req.params;
        const tenantId = req.user.tenant;

        // Import Student model
        const Student = (await import('../models/Student.js')).default;

        // Verify student belongs to tenant and get their class
        const student = await Student.findOne({ _id: studentId, tenant: tenantId })
            .populate('user', 'name email')
            .populate('class', 'name grade section room');

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        if (!student.class) {
            return res.status(404).json({ message: 'Student is not assigned to any class' });
        }

        // Get the class timetable
        const classData = await Class.findOne({ _id: student.class._id, tenant: tenantId })
            .populate('schedule.periods.subject', 'name code')
            .populate({
                path: 'schedule.periods.teacher',
                select: 'user',
                populate: { path: 'user', select: 'name' }
            });

        if (!classData || !classData.schedule) {
            return res.status(404).json({ message: 'No schedule found for this class' });
        }

        // Build weekly schedule grouped by day
        const weeklySchedule = {
            student: {
                _id: student._id,
                name: student.user?.name,
                email: student.user?.email,
                studentId: student.studentId,
                rollNumber: student.rollNumber
            },
            class: {
                _id: classData._id,
                name: classData.name,
                grade: classData.grade,
                section: classData.section,
                room: classData.room
            },
            schedule: {}
        };

        const days = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        days.forEach(day => {
            weeklySchedule.schedule[day] = [];
        });

        classData.schedule.forEach(daySchedule => {
            weeklySchedule.schedule[daySchedule.day] = daySchedule.periods.map(period => ({
                startTime: period.startTime,
                endTime: period.endTime,
                subject: period.subject,
                teacher: period.teacher?.user ? {
                    _id: period.teacher._id,
                    name: period.teacher.user.name
                } : null,
                room: period.room || classData.room
            }));
        });

        res.status(200).json(weeklySchedule);
    } catch (error) {
        console.error('Get Student Weekly Schedule Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Check for conflicts (Optional helper endpoint)
export const checkConflicts = async (req, res) => {
    // This would be a more advanced feature to check if a teacher is double-booked
    // across different classes for the same time slot.
    // Not strictly required for MVP but good to have structure.
    res.status(501).json({ message: 'Not implemented yet' });
};
