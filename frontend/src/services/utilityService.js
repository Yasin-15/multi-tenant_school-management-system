import api from './api';

export const utilityService = {
  /**
   * Preview next available IDs
   * @param {string} classId - Optional class ID for roll number generation
   * @param {string} section - Optional section for roll number generation
   * @returns {Promise} Response with next available IDs
   */
  previewNextIds: async (classId = null, section = null) => {
    const params = {};
    if (classId) params.classId = classId;
    if (section) params.section = section;
    
    const response = await api.get('/utilities/preview-ids', { params });
    return response.data;
  },
};
