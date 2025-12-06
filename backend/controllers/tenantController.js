import Tenant from '../models/Tenant.js';
import User from '../models/User.js';

// @desc    Create a new tenant (School)
// @route   POST /api/tenants
// @access  Private (Super Admin)
export const createTenant = async (req, res) => {
    try {
        const {
            name,
            subdomain,
            domain,
            contactEmail,
            contactPhone,
            address,
            adminUser // { firstName, lastName, email, password }
        } = req.body;

        // Check if subdomain exists
        const tenantExists = await Tenant.findOne({ subdomain });
        if (tenantExists) {
            return res.status(400).json({
                success: false,
                message: 'Subdomain already taken'
            });
        }

        // Create Tenant
        const tenant = await Tenant.create({
            name,
            subdomain,
            domain,
            contactEmail,
            contactPhone,
            address,
            createdBy: req.user._id
        });

        // Create Admin User for this Tenant
        if (adminUser) {
            const user = await User.create({
                tenant: tenant._id,
                firstName: adminUser.firstName,
                lastName: adminUser.lastName,
                email: adminUser.email,
                password: adminUser.password,
                role: 'admin',
                phone: contactPhone,
                address
            });

            // Update tenant with admin user
            tenant.admin = user._id;
            await tenant.save();
        }

        res.status(201).json({
            success: true,
            data: tenant
        });
    } catch (error) {
        console.error('Create Tenant Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Get all tenants
// @route   GET /api/tenants
// @access  Private (Super Admin)
export const getTenants = async (req, res) => {
    try {
        const tenants = await Tenant.find()
            .populate('admin', 'firstName lastName email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: tenants.length,
            data: tenants
        });
    } catch (error) {
        console.error('Get Tenants Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Get single tenant
// @route   GET /api/tenants/:id
// @access  Private (Super Admin or Admin of that tenant)
export const getTenantById = async (req, res) => {
    try {
        // If not super admin, ensure they are accessing their own tenant
        if (req.user.role !== 'super_admin' && req.user.tenant.toString() !== req.params.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to access this tenant'
            });
        }

        const tenant = await Tenant.findById(req.params.id)
            .populate('admin', 'firstName lastName email');

        if (!tenant) {
            return res.status(404).json({
                success: false,
                message: 'Tenant not found'
            });
        }

        res.status(200).json({
            success: true,
            data: tenant
        });
    } catch (error) {
        console.error('Get Tenant Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Update tenant
// @route   PUT /api/tenants/:id
// @access  Private (Super Admin or Admin of that tenant)
export const updateTenant = async (req, res) => {
    try {
        // If not super admin, ensure they are accessing their own tenant
        if (req.user.role !== 'super_admin' && req.user.tenant.toString() !== req.params.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this tenant'
            });
        }

        const {
            name,
            subdomain,
            logo,
            contactEmail,
            contactPhone,
            address,
            settings,
            isActive
        } = req.body;

        let tenant = await Tenant.findById(req.params.id);

        if (!tenant) {
            return res.status(404).json({
                success: false,
                message: 'Tenant not found'
            });
        }

        // Check subdomain uniqueness if changing
        if (subdomain && subdomain !== tenant.subdomain) {
            const subdomainExists = await Tenant.findOne({ subdomain });
            if (subdomainExists) {
                return res.status(400).json({
                    success: false,
                    message: 'Subdomain already taken'
                });
            }
            tenant.subdomain = subdomain;
        }

        if (name) tenant.name = name;
        if (logo) tenant.logo = logo;
        if (contactEmail) tenant.contactEmail = contactEmail;
        if (contactPhone) tenant.contactPhone = contactPhone;
        if (address) tenant.address = address;
        if (settings) tenant.settings = { ...tenant.settings, ...settings };

        // Only super admin can change status
        if (req.user.role === 'super_admin' && isActive !== undefined) {
            tenant.isActive = isActive;
        }

        await tenant.save();

        res.status(200).json({
            success: true,
            data: tenant
        });
    } catch (error) {
        console.error('Update Tenant Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Delete tenant
// @route   DELETE /api/tenants/:id
// @access  Private (Super Admin)
export const deleteTenant = async (req, res) => {
    try {
        const tenant = await Tenant.findByIdAndDelete(req.params.id);

        if (!tenant) {
            return res.status(404).json({
                success: false,
                message: 'Tenant not found'
            });
        }

        // TODO: Delete all associated data (users, students, etc.)
        // This is a dangerous operation and should be handled with care.
        // For now, we just delete the tenant record.

        res.status(200).json({
            success: true,
            message: 'Tenant deleted'
        });
    } catch (error) {
        console.error('Delete Tenant Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};
