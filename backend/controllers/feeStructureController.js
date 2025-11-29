import FeeStructure from '../models/FeeStructure.js';
import Class from '../models/Class.js';

// @desc    Create a new fee structure
// @route   POST /api/fee-structures
// @access  Private (Admin)
export const createFeeStructure = async (req, res) => {
    try {
        const {
            name,
            classId,
            academicYear,
            feeComponents,
            currency
        } = req.body;

        const tenantId = req.user.tenant;

        // Validate class if provided
        if (classId) {
            const classExists = await Class.findOne({ _id: classId, tenant: tenantId });
            if (!classExists) {
                return res.status(404).json({
                    success: false,
                    message: 'Class not found'
                });
            }
        }

        // Calculate total amount
        const totalAmount = feeComponents.reduce((sum, component) => sum + Number(component.amount), 0);

        const feeStructure = await FeeStructure.create({
            tenant: tenantId,
            name,
            class: classId,
            academicYear,
            feeComponents,
            totalAmount,
            currency: currency || 'USD'
        });

        res.status(201).json({
            success: true,
            data: feeStructure
        });
    } catch (error) {
        console.error('Create Fee Structure Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Get all fee structures
// @route   GET /api/fee-structures
// @access  Private
export const getFeeStructures = async (req, res) => {
    try {
        const {
            classId,
            academicYear,
            isActive
        } = req.query;

        const query = { tenant: req.user.tenant };

        if (classId) query.class = classId;
        if (academicYear) query.academicYear = academicYear;
        if (isActive !== undefined) query.isActive = isActive === 'true';

        const feeStructures = await FeeStructure.find(query)
            .populate('class', 'name grade section')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: feeStructures.length,
            data: feeStructures
        });
    } catch (error) {
        console.error('Get Fee Structures Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Get single fee structure
// @route   GET /api/fee-structures/:id
// @access  Private
export const getFeeStructureById = async (req, res) => {
    try {
        const feeStructure = await FeeStructure.findOne({
            _id: req.params.id,
            tenant: req.user.tenant
        }).populate('class', 'name grade section');

        if (!feeStructure) {
            return res.status(404).json({
                success: false,
                message: 'Fee structure not found'
            });
        }

        res.status(200).json({
            success: true,
            data: feeStructure
        });
    } catch (error) {
        console.error('Get Fee Structure Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Update fee structure
// @route   PUT /api/fee-structures/:id
// @access  Private (Admin)
export const updateFeeStructure = async (req, res) => {
    try {
        const {
            name,
            classId,
            academicYear,
            feeComponents,
            currency,
            isActive
        } = req.body;

        let feeStructure = await FeeStructure.findOne({
            _id: req.params.id,
            tenant: req.user.tenant
        });

        if (!feeStructure) {
            return res.status(404).json({
                success: false,
                message: 'Fee structure not found'
            });
        }

        // Update fields
        if (name) feeStructure.name = name;
        if (classId) {
            // Validate new class
            const classExists = await Class.findOne({ _id: classId, tenant: req.user.tenant });
            if (!classExists) {
                return res.status(404).json({
                    success: false,
                    message: 'Class not found'
                });
            }
            feeStructure.class = classId;
        }
        if (academicYear) feeStructure.academicYear = academicYear;
        if (currency) feeStructure.currency = currency;
        if (isActive !== undefined) feeStructure.isActive = isActive;

        if (feeComponents) {
            feeStructure.feeComponents = feeComponents;
            // Recalculate total amount
            feeStructure.totalAmount = feeComponents.reduce((sum, component) => sum + Number(component.amount), 0);
        }

        await feeStructure.save();

        res.status(200).json({
            success: true,
            data: feeStructure
        });
    } catch (error) {
        console.error('Update Fee Structure Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Delete fee structure
// @route   DELETE /api/fee-structures/:id
// @access  Private (Admin)
export const deleteFeeStructure = async (req, res) => {
    try {
        const feeStructure = await FeeStructure.findOneAndDelete({
            _id: req.params.id,
            tenant: req.user.tenant
        });

        if (!feeStructure) {
            return res.status(404).json({
                success: false,
                message: 'Fee structure not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Fee structure deleted'
        });
    } catch (error) {
        console.error('Delete Fee Structure Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};
