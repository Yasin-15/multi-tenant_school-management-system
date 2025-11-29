import { generateStudentId, generateRollNumber, generateHemisId, generateTeacherId, getTenantCode } from '../utils/idGenerator.js';

/**
 * @desc    Preview next available IDs
 * @route   GET /api/utilities/preview-ids
 * @access  Private (Admin)
 */
export const previewNextIds = async (req, res) => {
    try {
        const { classId, section } = req.query;
        const tenantCode = getTenantCode(req.tenant);

        const nextIds = {
            studentId: await generateStudentId(req.tenant._id, tenantCode),
            hemisId: await generateHemisId(req.tenant._id, tenantCode),
            teacherId: await generateTeacherId(req.tenant._id, tenantCode)
        };

        // Only generate roll number if class and section are provided
        if (classId && section) {
            nextIds.rollNumber = await generateRollNumber(req.tenant._id, classId, section);
        }

        res.status(200).json({
            success: true,
            data: nextIds,
            tenantCode
        });
    } catch (error) {
        console.error('Preview IDs error:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating preview IDs',
            error: error.message
        });
    }
};
