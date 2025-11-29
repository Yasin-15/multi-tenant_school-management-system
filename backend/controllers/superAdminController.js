import Tenant from '../models/Tenant.js';
import User from '../models/User.js';
import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';
import Class from '../models/Class.js';

// Get all tenants
export const getAllTenants = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const query = {};
        if (req.query.search) {
            query.$or = [
                { name: { $regex: req.query.search, $options: 'i' } },
                { subdomain: { $regex: req.query.search, $options: 'i' } },
            ];
        }

        const tenants = await Tenant.find(query)
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const total = await Tenant.countDocuments(query);

        res.status(200).json({
            success: true,
            data: tenants,
            total,
            page,
            pages: Math.ceil(total / limit),
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Get tenant by ID
export const getTenantById = async (req, res) => {
    try {
        const tenant = await Tenant.findById(req.params.id);

        if (!tenant) {
            return res.status(404).json({
                success: false,
                message: 'Tenant not found',
            });
        }

        // Get tenant statistics
        const [studentCount, teacherCount, classCount, adminCount] = await Promise.all([
            Student.countDocuments({ tenant: tenant._id }),
            Teacher.countDocuments({ tenant: tenant._id }),
            Class.countDocuments({ tenant: tenant._id }),
            User.countDocuments({ tenant: tenant._id, role: 'admin' }),
        ]);

        res.status(200).json({
            success: true,
            data: {
                ...tenant.toObject(),
                stats: {
                    students: studentCount,
                    teachers: teacherCount,
                    classes: classCount,
                    admins: adminCount,
                },
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Create new tenant
export const createTenant = async (req, res) => {
    try {
        const {
            name,
            subdomain,
            domain,
            contactEmail,
            contactPhone,
            address,
            settings,
            subscription,
            adminUser,
        } = req.body;

        // Check if subdomain already exists
        const existingTenant = await Tenant.findOne({ subdomain });
        if (existingTenant) {
            return res.status(400).json({
                success: false,
                message: 'Subdomain already exists',
            });
        }

        // Create tenant
        const tenant = await Tenant.create({
            name,
            subdomain,
            domain,
            contactEmail,
            contactPhone,
            address,
            settings,
            subscription,
            createdBy: req.user._id,
        });

        // Create admin user for the tenant
        if (adminUser) {
            await User.create({
                tenant: tenant._id,
                email: adminUser.email,
                password: adminUser.password,
                role: 'admin',
                firstName: adminUser.firstName,
                lastName: adminUser.lastName,
                phone: adminUser.phone,
                isActive: true,
                emailVerified: true,
            });
        }

        res.status(201).json({
            success: true,
            data: tenant,
            message: 'Tenant created successfully',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Update tenant
export const updateTenant = async (req, res) => {
    try {
        const tenant = await Tenant.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!tenant) {
            return res.status(404).json({
                success: false,
                message: 'Tenant not found',
            });
        }

        res.status(200).json({
            success: true,
            data: tenant,
            message: 'Tenant updated successfully',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Delete tenant
export const deleteTenant = async (req, res) => {
    try {
        const tenant = await Tenant.findById(req.params.id);

        if (!tenant) {
            return res.status(404).json({
                success: false,
                message: 'Tenant not found',
            });
        }

        // Delete all tenant data
        await Promise.all([
            User.deleteMany({ tenant: tenant._id }),
            Student.deleteMany({ tenant: tenant._id }),
            Teacher.deleteMany({ tenant: tenant._id }),
            Class.deleteMany({ tenant: tenant._id }),
        ]);

        await tenant.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Tenant and all associated data deleted successfully',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Toggle tenant status
export const toggleTenantStatus = async (req, res) => {
    try {
        const tenant = await Tenant.findById(req.params.id);

        if (!tenant) {
            return res.status(404).json({
                success: false,
                message: 'Tenant not found',
            });
        }

        tenant.isActive = !tenant.isActive;
        await tenant.save();

        res.status(200).json({
            success: true,
            data: tenant,
            message: `Tenant ${tenant.isActive ? 'activated' : 'deactivated'} successfully`,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Get system statistics
export const getSystemStats = async (req, res) => {
    try {
        const [
            totalTenants,
            activeTenants,
            totalUsers,
            totalStudents,
            totalTeachers,
        ] = await Promise.all([
            Tenant.countDocuments(),
            Tenant.countDocuments({ isActive: true }),
            User.countDocuments(),
            Student.countDocuments(),
            Teacher.countDocuments(),
        ]);

        // Get subscription breakdown
        const subscriptionStats = await Tenant.aggregate([
            {
                $group: {
                    _id: '$subscription.plan',
                    count: { $sum: 1 },
                },
            },
        ]);

        res.status(200).json({
            success: true,
            data: {
                tenants: {
                    total: totalTenants,
                    active: activeTenants,
                    inactive: totalTenants - activeTenants,
                },
                users: {
                    total: totalUsers,
                    students: totalStudents,
                    teachers: totalTeachers,
                },
                subscriptions: subscriptionStats,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Get tenant users
export const getTenantUsers = async (req, res) => {
    try {
        const users = await User.find({ tenant: req.params.id })
            .select('-password')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: users,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Get all users across all tenants
export const getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const query = {};
        
        // Search filter
        if (req.query.search) {
            query.$or = [
                { firstName: { $regex: req.query.search, $options: 'i' } },
                { lastName: { $regex: req.query.search, $options: 'i' } },
                { email: { $regex: req.query.search, $options: 'i' } },
            ];
        }

        // Tenant filter
        if (req.query.tenant) {
            query.tenant = req.query.tenant;
        }

        // Role filter
        if (req.query.role) {
            query.role = req.query.role;
        }

        const users = await User.find(query)
            .select('-password')
            .populate('tenant', 'name subdomain')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const total = await User.countDocuments(query);

        res.status(200).json({
            success: true,
            data: users,
            total,
            page,
            pages: Math.ceil(total / limit),
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Toggle user status
export const toggleUserStatus = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        // Prevent deactivating super admins
        if (user.role === 'super_admin') {
            return res.status(403).json({
                success: false,
                message: 'Cannot deactivate super admin users',
            });
        }

        user.isActive = !user.isActive;
        await user.save();

        res.status(200).json({
            success: true,
            data: user,
            message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Delete user
export const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        // Prevent deleting super admins
        if (user.role === 'super_admin') {
            return res.status(403).json({
                success: false,
                message: 'Cannot delete super admin users',
            });
        }

        // Delete related records
        if (user.role === 'student') {
            await Student.deleteOne({ user: user._id });
        } else if (user.role === 'teacher') {
            await Teacher.deleteOne({ user: user._id });
        }

        await user.deleteOne();

        res.status(200).json({
            success: true,
            message: 'User deleted successfully',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
