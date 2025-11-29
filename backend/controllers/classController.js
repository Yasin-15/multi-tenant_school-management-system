import Class from '../models/Class.js';
import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';

// @desc    Create a new class
// @route   POST /api/classes
// @access  Private (Admin)
export const createClass = async (req, res) => {
    try {
        const {
            name,
            grade,
            section,
            academicYear,
            classTeacher,
            maxStudents,
            capacity,
            room,
            schedule,
            subjects,
            isActive,
            description
        } = req.body;

        const tenantId = req.user.tenant;

        // Check if class already exists
        const classExists = await Class.findOne({
            tenant: tenantId,
            grade,
            section,
            academicYear
        });

        if (classExists) {
            return res.status(400).json({
                success: false,
                message: 'Class already exists for this grade, section and academic year'
            });
        }

        // Prepare class data
        const classData = {
            tenant: tenantId,
            name,
            grade,
            section,
            academicYear,
            classTeacher: classTeacher || undefined,
            maxStudents: capacity || maxStudents || 40,
            room,
            isActive: isActive !== undefined ? isActive : true
        };

        // Handle subjects - convert array of IDs to array of objects
        if (subjects && subjects.length > 0) {
            classData.subjects = subjects.map(subjectId => ({
                subject: subjectId,
                teacher: null
            }));
        }

        // Handle schedule - ignore if it's the frontend format (object with startTime/endTime/days)
        // The model expects an array format, so we'll skip it for now
        // if (schedule && Array.isArray(schedule)) {
        //     classData.schedule = schedule;
        // }

        const newClass = await Class.create(classData);

        // Populate the response
        await newClass.populate('classTeacher');
        await newClass.populate('subjects.subject');

        res.status(201).json({
            success: true,
            data: newClass
        });
    } catch (error) {
        console.error('Create Class Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Get all classes
// @route   GET /api/classes
// @access  Private
export const getClasses = async (req, res) => {
    try {
        const {
            grade,
            academicYear,
            isActive
        } = req.query;

        const query = { tenant: req.user.tenant };

        if (grade) query.grade = grade;
        if (academicYear) query.academicYear = academicYear;
        if (isActive !== undefined) query.isActive = isActive === 'true';

        // If user is a teacher, only show their classes
        if (req.user.role === 'teacher') {
            const teacher = await Teacher.findOne({ user: req.user._id });
            if (teacher) {
                query.$or = [
                    { classTeacher: teacher._id },
                    { 'subjects.teacher': teacher._id }
                ];
            }
        }

        const classes = await Class.find(query)
            .populate({
                path: 'classTeacher',
                populate: {
                    path: 'user',
                    select: 'firstName lastName email'
                }
            })
            .populate('subjects.subject')
            .sort({ grade: 1, section: 1 });

        res.status(200).json({
            success: true,
            count: classes.length,
            total: classes.length,
            data: classes
        });
    } catch (error) {
        console.error('Get Classes Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Get single class
// @route   GET /api/classes/:id
// @access  Private
export const getClassById = async (req, res) => {
    try {
        const classObj = await Class.findOne({
            _id: req.params.id,
            tenant: req.user.tenant
        })
            .populate('classTeacher')
            .populate('subjects.subject')
            .populate('subjects.teacher');

        if (!classObj) {
            return res.status(404).json({
                success: false,
                message: 'Class not found'
            });
        }

        // Fetch students for this class
        const students = await Student.find({
            class: req.params.id,
            tenant: req.user.tenant,
            status: 'active'
        })
            .populate('user', 'firstName lastName email gender')
            .sort({ rollNumber: 1 });

        // Convert to object and add students
        const classWithStudents = classObj.toObject();
        classWithStudents.students = students;

        res.status(200).json({
            success: true,
            data: classWithStudents
        });
    } catch (error) {
        console.error('Get Class Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Update class
// @route   PUT /api/classes/:id
// @access  Private (Admin)
export const updateClass = async (req, res) => {
    try {
        const {
            name,
            grade,
            section,
            academicYear,
            classTeacher,
            maxStudents,
            capacity,
            room,
            schedule,
            subjects,
            isActive,
            description
        } = req.body;

        let classObj = await Class.findOne({
            _id: req.params.id,
            tenant: req.user.tenant
        });

        if (!classObj) {
            return res.status(404).json({
                success: false,
                message: 'Class not found'
            });
        }

        // Update fields
        if (name) classObj.name = name;
        if (grade !== undefined) classObj.grade = grade;
        if (section) classObj.section = section;
        if (academicYear) classObj.academicYear = academicYear;
        if (classTeacher !== undefined) classObj.classTeacher = classTeacher || null;
        if (maxStudents) classObj.maxStudents = maxStudents;
        if (capacity) classObj.maxStudents = capacity; // Handle capacity as maxStudents
        if (room !== undefined) classObj.room = room;

        // Handle subjects - convert array of IDs to array of objects
        if (subjects) {
            classObj.subjects = subjects.map(subjectId => ({
                subject: subjectId,
                teacher: null
            }));
        }

        // Handle schedule - ignore if it's the frontend format (object with startTime/endTime/days)
        // The model expects an array format, so we'll skip updating it for now
        // if (schedule && Array.isArray(schedule)) {
        //     classObj.schedule = schedule;
        // }

        if (isActive !== undefined) classObj.isActive = isActive;
        // Note: description field doesn't exist in model, so we ignore it

        await classObj.save();

        // Populate the response
        await classObj.populate('classTeacher');
        await classObj.populate('subjects.subject');

        res.status(200).json({
            success: true,
            data: classObj
        });
    } catch (error) {
        console.error('Update Class Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Delete class
// @route   DELETE /api/classes/:id
// @access  Private (Admin)
export const deleteClass = async (req, res) => {
    try {
        const classObj = await Class.findOneAndDelete({
            _id: req.params.id,
            tenant: req.user.tenant
        });

        if (!classObj) {
            return res.status(404).json({
                success: false,
                message: 'Class not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Class deleted'
        });
    } catch (error) {
        console.error('Delete Class Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};
