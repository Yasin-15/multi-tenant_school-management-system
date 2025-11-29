import Subject from '../models/Subject.js';

// @desc    Create a new subject
// @route   POST /api/subjects
// @access  Private (Admin)
export const createSubject = async (req, res) => {
    try {
        const {
            name,
            code,
            description,
            type,
            credits,
            passingMarks,
            totalMarks
        } = req.body;

        const tenantId = req.user.tenant;

        // Check if subject already exists
        const subjectExists = await Subject.findOne({
            tenant: tenantId,
            code
        });

        if (subjectExists) {
            return res.status(400).json({
                success: false,
                message: 'Subject code already exists'
            });
        }

        const subject = await Subject.create({
            tenant: tenantId,
            name,
            code,
            description,
            type,
            credits,
            passingMarks,
            totalMarks
        });

        res.status(201).json({
            success: true,
            data: subject
        });
    } catch (error) {
        console.error('Create Subject Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Get all subjects
// @route   GET /api/subjects
// @access  Private
export const getSubjects = async (req, res) => {
    try {
        const {
            type,
            isActive
        } = req.query;

        const query = { tenant: req.user.tenant };

        if (type) query.type = type;
        if (isActive !== undefined) query.isActive = isActive === 'true';

        const subjects = await Subject.find(query)
            .sort({ name: 1 });

        res.status(200).json({
            success: true,
            count: subjects.length,
            data: subjects
        });
    } catch (error) {
        console.error('Get Subjects Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Get single subject
// @route   GET /api/subjects/:id
// @access  Private
export const getSubjectById = async (req, res) => {
    try {
        const subject = await Subject.findOne({
            _id: req.params.id,
            tenant: req.user.tenant
        });

        if (!subject) {
            return res.status(404).json({
                success: false,
                message: 'Subject not found'
            });
        }

        res.status(200).json({
            success: true,
            data: subject
        });
    } catch (error) {
        console.error('Get Subject Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Update subject
// @route   PUT /api/subjects/:id
// @access  Private (Admin)
export const updateSubject = async (req, res) => {
    try {
        const {
            name,
            description,
            type,
            credits,
            passingMarks,
            totalMarks,
            isActive
        } = req.body;

        let subject = await Subject.findOne({
            _id: req.params.id,
            tenant: req.user.tenant
        });

        if (!subject) {
            return res.status(404).json({
                success: false,
                message: 'Subject not found'
            });
        }

        // Update fields
        if (name) subject.name = name;
        if (description) subject.description = description;
        if (type) subject.type = type;
        if (credits) subject.credits = credits;
        if (passingMarks) subject.passingMarks = passingMarks;
        if (totalMarks) subject.totalMarks = totalMarks;
        if (isActive !== undefined) subject.isActive = isActive;

        await subject.save();

        res.status(200).json({
            success: true,
            data: subject
        });
    } catch (error) {
        console.error('Update Subject Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Delete subject
// @route   DELETE /api/subjects/:id
// @access  Private (Admin)
export const deleteSubject = async (req, res) => {
    try {
        const subject = await Subject.findOneAndDelete({
            _id: req.params.id,
            tenant: req.user.tenant
        });

        if (!subject) {
            return res.status(404).json({
                success: false,
                message: 'Subject not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Subject deleted'
        });
    } catch (error) {
        console.error('Delete Subject Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};
