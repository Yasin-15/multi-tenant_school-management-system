import Teacher from '../models/Teacher.js';
import User from '../models/User.js';
import { generateTeacherId, getTenantCode } from '../utils/idGenerator.js';

// @desc    Create a new teacher
// @route   POST /api/teachers
// @access  Private (Admin)
export const createTeacher = async (req, res) => {
    try {
        // Handle both nested user object and flat structure
        const userData = req.body.user || req.body;
        const {
            email,
            password,
            firstName,
            lastName,
            phone,
            dateOfBirth,
            gender,
            address
        } = userData;

        let {
            employeeId,
            joiningDate,
            designation,
            department,
            qualification,
            experience,
            salary,
            bankDetails,
            emergencyContact,
            subjects,
            status
        } = req.body;

        const tenantId = req.user.tenant;

        // Check if user already exists
        const userExists = await User.findOne({ email, tenant: tenantId });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Auto-generate employee ID if not provided
        if (!employeeId) {
            // Get tenant info for code generation
            const Tenant = (await import('../models/Tenant.js')).default;
            const tenant = await Tenant.findById(tenantId);
            const tenantCode = getTenantCode(tenant);
            employeeId = await generateTeacherId(tenantId, tenantCode);
        } else {
            // Check if provided employee ID already exists
            const teacherExists = await Teacher.findOne({ employeeId, tenant: tenantId });
            if (teacherExists) {
                return res.status(400).json({
                    success: false,
                    message: 'Teacher with this Employee ID already exists'
                });
            }
        }

        // Create User
        const user = await User.create({
            tenant: tenantId,
            email,
            password,
            role: 'teacher',
            firstName,
            lastName,
            phone,
            dateOfBirth,
            gender,
            address
        });

        // Create Teacher Profile
        const teacher = await Teacher.create({
            tenant: tenantId,
            user: user._id,
            employeeId,
            joiningDate,
            designation,
            department,
            qualification,
            experience,
            salary,
            bankDetails,
            emergencyContact,
            subjects: subjects || [],
            status: status || 'active'
        });

        res.status(201).json({
            success: true,
            data: teacher
        });
    } catch (error) {
        console.error('Create Teacher Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Get all teachers
// @route   GET /api/teachers
// @access  Private
export const getTeachers = async (req, res) => {
    try {
        const {
            department,
            status,
            search
        } = req.query;

        const query = { tenant: req.user.tenant };

        if (department) query.department = department;
        if (status) query.status = status;

        // Search by name or employee ID
        if (search) {
            const users = await User.find({
                tenant: req.user.tenant,
                role: 'teacher',
                $or: [
                    { firstName: { $regex: search, $options: 'i' } },
                    { lastName: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } }
                ]
            }).select('_id');

            const userIds = users.map(u => u._id);
            query.$or = [
                { user: { $in: userIds } },
                { employeeId: { $regex: search, $options: 'i' } }
            ];
        }

        const teachers = await Teacher.find(query)
            .populate('user', '-password')
            .populate('subjects')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: teachers.length,
            total: teachers.length,
            data: teachers
        });
    } catch (error) {
        console.error('Get Teachers Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Get single teacher
// @route   GET /api/teachers/:id
// @access  Private
export const getTeacherById = async (req, res) => {
    try {
        const teacher = await Teacher.findOne({
            _id: req.params.id,
            tenant: req.user.tenant
        })
            .populate('user', '-password')
            .populate('subjects')
            .populate('classes.class');

        if (!teacher) {
            return res.status(404).json({
                success: false,
                message: 'Teacher not found'
            });
        }

        res.status(200).json({
            success: true,
            data: teacher
        });
    } catch (error) {
        console.error('Get Teacher Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Update teacher
// @route   PUT /api/teachers/:id
// @access  Private (Admin)
export const updateTeacher = async (req, res) => {
    try {
        // Handle both nested user object and flat structure
        const userData = req.body.user || {};
        const {
            firstName,
            lastName,
            phone,
            dateOfBirth,
            gender,
            address
        } = userData;

        const {
            designation,
            department,
            qualification,
            experience,
            salary,
            bankDetails,
            emergencyContact,
            subjects,
            status
        } = req.body;

        let teacher = await Teacher.findOne({
            _id: req.params.id,
            tenant: req.user.tenant
        });

        if (!teacher) {
            return res.status(404).json({
                success: false,
                message: 'Teacher not found'
            });
        }

        // Update User info
        if (firstName || lastName || phone || dateOfBirth || gender || address) {
            const updateData = {};
            if (firstName) updateData.firstName = firstName;
            if (lastName) updateData.lastName = lastName;
            if (phone) updateData.phone = phone;
            if (dateOfBirth) updateData.dateOfBirth = dateOfBirth;
            if (gender) updateData.gender = gender;
            if (address) updateData.address = address;
            
            await User.findByIdAndUpdate(teacher.user, updateData);
        }

        // Update Teacher info
        if (designation) teacher.designation = designation;
        if (department) teacher.department = department;
        if (qualification) teacher.qualification = qualification;
        if (experience) teacher.experience = experience;
        if (salary) teacher.salary = salary;
        if (bankDetails) teacher.bankDetails = bankDetails;
        if (emergencyContact) teacher.emergencyContact = emergencyContact;
        if (subjects) teacher.subjects = subjects;
        if (status) teacher.status = status;

        await teacher.save();

        // Return updated teacher with user info
        const updatedTeacher = await Teacher.findById(teacher._id)
            .populate('user', '-password');

        res.status(200).json({
            success: true,
            data: updatedTeacher
        });
    } catch (error) {
        console.error('Update Teacher Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Delete teacher
// @route   DELETE /api/teachers/:id
// @access  Private (Admin)
export const deleteTeacher = async (req, res) => {
    try {
        const teacher = await Teacher.findOne({
            _id: req.params.id,
            tenant: req.user.tenant
        });

        if (!teacher) {
            return res.status(404).json({
                success: false,
                message: 'Teacher not found'
            });
        }

        // Delete User
        await User.findByIdAndDelete(teacher.user);

        // Delete Teacher
        await Teacher.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Teacher and associated user account deleted'
        });
    } catch (error) {
        console.error('Delete Teacher Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};
