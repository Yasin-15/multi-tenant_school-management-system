import Student from '../models/Student.js';
import User from '../models/User.js';
import { generateStudentId, generateRollNumber, generateHemisId, getTenantCode } from '../utils/idGenerator.js';

/**
 * @desc    Get all students
 * @route   GET /api/students
 * @access  Private (Admin, Teacher)
 */
export const getStudents = async (req, res) => {
    try {
        // Check if tenant is available
        if (!req.tenant || !req.tenant._id) {
            return res.status(400).json({
                success: false,
                message: 'Tenant information is missing. Please ensure you are logged in properly.'
            });
        }

        const { class: classId, status, search, page = 1, limit = 10 } = req.query;

        const query = { tenant: req.tenant._id };

        if (classId) query.class = classId;
        if (status) query.status = status;

        // Search by name or student ID
        if (search) {
            const users = await User.find({
                tenant: req.tenant._id,
                role: 'student',
                $or: [
                    { firstName: { $regex: search, $options: 'i' } },
                    { lastName: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } }
                ]
            }).select('_id');

            const userIds = users.map(u => u._id);
            query.$or = [
                { user: { $in: userIds } },
                { studentId: { $regex: search, $options: 'i' } }
            ];
        }

        const students = await Student.find(query)
            .populate('user', '-password')
            .populate('class')
            .populate('parents', '-password')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const count = await Student.countDocuments(query);

        res.status(200).json({
            success: true,
            count,
            total: count,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            data: students
        });
    } catch (error) {
        console.error('Get students error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching students',
            error: error.message
        });
    }
};

/**
 * @desc    Get single student
 * @route   GET /api/students/:id
 * @access  Private
 */
export const getStudent = async (req, res) => {
    try {
        let query = { tenant: req.tenant._id };

        // If student is accessing their own profile
        if (req.user.role === 'student') {
            query.user = req.user._id;
        } else {
            query._id = req.params.id;
        }

        const student = await Student.findOne(query)
            .populate('user', '-password')
            .populate('class')
            .populate('parents', '-password');

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        res.status(200).json({
            success: true,
            data: student
        });
    } catch (error) {
        console.error('Get student error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching student',
            error: error.message
        });
    }
};

/**
 * @desc    Create student
 * @route   POST /api/students
 * @access  Private (Admin)
 */
export const createStudent = async (req, res) => {
    try {
        // Handle both flat and nested data structures
        const userData = req.body.user || req.body;
        const studentData = req.body;

        const {
            email, password, firstName, lastName, phone, dateOfBirth, gender, address
        } = userData;

        let {
            studentId, hemisId, admissionNumber, admissionDate, class: classId, section, rollNumber,
            academicYear, guardianName, guardianPhone, guardianEmail, guardianRelation,
            bloodGroup, medicalConditions, previousSchool, status
        } = studentData;

        // Validate required fields
        if (!email || !password || !firstName || !lastName || !admissionNumber) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Check if email already exists
        const existingUser = await User.findOne({ email, tenant: req.tenant._id });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email already exists'
            });
        }

        // Auto-generate IDs if not provided
        const tenantCode = getTenantCode(req.tenant);
        
        if (!studentId) {
            studentId = await generateStudentId(req.tenant._id, tenantCode);
        } else {
            // Check if provided student ID already exists
            const existingStudent = await Student.findOne({ studentId, tenant: req.tenant._id });
            if (existingStudent) {
                return res.status(400).json({
                    success: false,
                    message: 'Student ID already exists'
                });
            }
        }

        if (!hemisId) {
            hemisId = await generateHemisId(req.tenant._id, tenantCode);
        }

        if (!rollNumber && classId && section) {
            rollNumber = await generateRollNumber(req.tenant._id, classId, section);
        }

        // Create user account
        const user = await User.create({
            tenant: req.tenant._id,
            email,
            password,
            role: 'student',
            firstName,
            lastName,
            phone,
            dateOfBirth,
            gender,
            address,
            isActive: true,
            emailVerified: true
        });

        // Create student profile
        const student = await Student.create({
            tenant: req.tenant._id,
            user: user._id,
            studentId,
            hemisId,
            admissionNumber,
            admissionDate,
            class: classId,
            section,
            rollNumber,
            academicYear,
            guardianName,
            guardianPhone,
            guardianEmail,
            guardianRelation,
            bloodGroup,
            medicalConditions,
            previousSchool,
            status: status || 'active'
        });

        const populatedStudent = await Student.findById(student._id)
            .populate('user', '-password')
            .populate('class');

        res.status(201).json({
            success: true,
            message: 'Student created successfully',
            data: populatedStudent
        });
    } catch (error) {
        console.error('Create student error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating student',
            error: error.message
        });
    }
};

/**
 * @desc    Update student
 * @route   PUT /api/students/:id
 * @access  Private (Admin)
 */
export const updateStudent = async (req, res) => {
    try {
        const student = await Student.findOne({
            _id: req.params.id,
            tenant: req.tenant._id
        });

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        // Handle both flat and nested data structures
        const userData = req.body.user || req.body;
        const studentData = req.body;

        const {
            firstName, lastName, phone, dateOfBirth, gender, address
        } = userData;

        const {
            class: classId, section, rollNumber, guardianName, guardianPhone,
            guardianEmail, guardianRelation, bloodGroup, status, academicYear
        } = studentData;

        // Update user
        const userUpdateData = {};
        if (firstName) userUpdateData.firstName = firstName;
        if (lastName) userUpdateData.lastName = lastName;
        if (phone) userUpdateData.phone = phone;
        if (dateOfBirth) userUpdateData.dateOfBirth = dateOfBirth;
        if (gender) userUpdateData.gender = gender;
        if (address) userUpdateData.address = address;

        if (Object.keys(userUpdateData).length > 0) {
            await User.findByIdAndUpdate(student.user, userUpdateData);
        }

        // Update student
        const studentUpdateData = {};
        if (classId) studentUpdateData.class = classId;
        if (section) studentUpdateData.section = section;
        if (rollNumber) studentUpdateData.rollNumber = rollNumber;
        if (guardianName) studentUpdateData.guardianName = guardianName;
        if (guardianPhone) studentUpdateData.guardianPhone = guardianPhone;
        if (guardianEmail) studentUpdateData.guardianEmail = guardianEmail;
        if (guardianRelation) studentUpdateData.guardianRelation = guardianRelation;
        if (bloodGroup) studentUpdateData.bloodGroup = bloodGroup;
        if (status) studentUpdateData.status = status;
        if (academicYear) studentUpdateData.academicYear = academicYear;

        const updatedStudent = await Student.findByIdAndUpdate(
            req.params.id,
            studentUpdateData,
            { new: true, runValidators: true }
        )
            .populate('user', '-password')
            .populate('class');

        res.status(200).json({
            success: true,
            message: 'Student updated successfully',
            data: updatedStudent
        });
    } catch (error) {
        console.error('Update student error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating student',
            error: error.message
        });
    }
};

/**
 * @desc    Delete student
 * @route   DELETE /api/students/:id
 * @access  Private (Admin)
 */
export const deleteStudent = async (req, res) => {
    try {
        const student = await Student.findOne({
            _id: req.params.id,
            tenant: req.tenant._id
        });

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        // Delete user account
        await User.findByIdAndDelete(student.user);

        // Delete student
        await Student.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Student deleted successfully'
        });
    } catch (error) {
        console.error('Delete student error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting student',
            error: error.message
        });
    }
};

/**
 * @desc    Add note to student
 * @route   POST /api/students/:id/notes
 * @access  Private (Admin, Teacher)
 */
export const addStudentNote = async (req, res) => {
    try {
        const { note } = req.body;

        const student = await Student.findOneAndUpdate(
            { _id: req.params.id, tenant: req.tenant._id },
            {
                $push: {
                    notes: {
                        note,
                        createdBy: req.user._id
                    }
                }
            },
            { new: true }
        ).populate('user', '-password');

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Note added successfully',
            data: student
        });
    } catch (error) {
        console.error('Add note error:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding note',
            error: error.message
        });
    }
};
