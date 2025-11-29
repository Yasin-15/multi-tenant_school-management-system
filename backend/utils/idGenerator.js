import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';

/**
 * Generate automatic Student ID
 * Format: STU-{YEAR}-{TENANT_CODE}-{SEQUENCE}
 * Example: STU-2025-ABC-0001
 */
export const generateStudentId = async (tenantId, tenantCode = 'SCH') => {
    const year = new Date().getFullYear();
    const prefix = `STU-${year}-${tenantCode}`;
    
    // Find the last student ID for this tenant and year
    const lastStudent = await Student.findOne({
        tenant: tenantId,
        studentId: { $regex: `^${prefix}` }
    }).sort({ studentId: -1 });
    
    let sequence = 1;
    if (lastStudent && lastStudent.studentId) {
        const lastSequence = parseInt(lastStudent.studentId.split('-').pop());
        sequence = lastSequence + 1;
    }
    
    return `${prefix}-${sequence.toString().padStart(4, '0')}`;
};

/**
 * Generate automatic Roll Number
 * Format: {CLASS}-{SECTION}-{SEQUENCE}
 * Example: 10-A-001
 */
export const generateRollNumber = async (tenantId, classId, section) => {
    if (!classId || !section) {
        return null;
    }
    
    // Find the last roll number for this class and section
    const lastStudent = await Student.findOne({
        tenant: tenantId,
        class: classId,
        section: section
    }).sort({ rollNumber: -1 });
    
    let sequence = 1;
    if (lastStudent && lastStudent.rollNumber) {
        const parts = lastStudent.rollNumber.split('-');
        if (parts.length === 3) {
            sequence = parseInt(parts[2]) + 1;
        }
    }
    
    // Get class name from classId (you might need to populate this)
    const className = classId.toString().slice(-2); // Simplified - adjust based on your needs
    
    return `${className}-${section}-${sequence.toString().padStart(3, '0')}`;
};

/**
 * Generate automatic HEMIS ID (Higher Education Management Information System)
 * Format: HEMIS-{YEAR}-{TENANT_CODE}-{SEQUENCE}
 * Example: HEMIS-2025-ABC-00001
 */
export const generateHemisId = async (tenantId, tenantCode = 'SCH') => {
    const year = new Date().getFullYear();
    const prefix = `HEMIS-${year}-${tenantCode}`;
    
    // Find the last HEMIS ID for this tenant and year
    const lastStudent = await Student.findOne({
        tenant: tenantId,
        hemisId: { $regex: `^${prefix}` }
    }).sort({ hemisId: -1 });
    
    let sequence = 1;
    if (lastStudent && lastStudent.hemisId) {
        const lastSequence = parseInt(lastStudent.hemisId.split('-').pop());
        sequence = lastSequence + 1;
    }
    
    return `${prefix}-${sequence.toString().padStart(5, '0')}`;
};

/**
 * Generate automatic Teacher/Employee ID
 * Format: TCH-{YEAR}-{TENANT_CODE}-{SEQUENCE}
 * Example: TCH-2025-ABC-0001
 */
export const generateTeacherId = async (tenantId, tenantCode = 'SCH') => {
    const year = new Date().getFullYear();
    const prefix = `TCH-${year}-${tenantCode}`;
    
    // Find the last teacher ID for this tenant and year
    const lastTeacher = await Teacher.findOne({
        tenant: tenantId,
        employeeId: { $regex: `^${prefix}` }
    }).sort({ employeeId: -1 });
    
    let sequence = 1;
    if (lastTeacher && lastTeacher.employeeId) {
        const lastSequence = parseInt(lastTeacher.employeeId.split('-').pop());
        sequence = lastSequence + 1;
    }
    
    return `${prefix}-${sequence.toString().padStart(4, '0')}`;
};

/**
 * Get tenant code from tenant subdomain or name
 */
export const getTenantCode = (tenant) => {
    if (!tenant) return 'SCH';
    
    // Use first 3 letters of subdomain in uppercase
    if (tenant.subdomain) {
        return tenant.subdomain.substring(0, 3).toUpperCase();
    }
    
    // Fallback to first 3 letters of name
    if (tenant.name) {
        return tenant.name.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, '');
    }
    
    return 'SCH';
};
