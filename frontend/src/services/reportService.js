import api from './api';

export const reportService = {
  // Student reports
  downloadStudentReportCard: async (studentId, academicYear) => {
    const params = academicYear ? { academicYear } : {};
    const response = await api.get(`/reports/student/${studentId}/report-card`, {
      params,
      responseType: 'blob',
    });
    return response.data;
  },

  downloadStudentExcel: async (studentId, academicYear) => {
    const params = academicYear ? { academicYear } : {};
    const response = await api.get(`/reports/student/${studentId}/excel`, {
      params,
      responseType: 'blob',
      headers: {
        'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      }
    });
    return response.data;
  },

  // Class reports
  downloadClassPDF: async (classId, filters = {}) => {
    const response = await api.get(`/reports/class/${classId}/pdf`, {
      params: filters,
      responseType: 'blob',
    });
    return response.data;
  },

  downloadClassExcel: async (classId, filters = {}) => {
    const response = await api.get(`/reports/class/${classId}/excel`, {
      params: filters,
      responseType: 'blob',
      headers: {
        'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      }
    });
    return response.data;
  },

  // Subject reports
  downloadSubjectReport: async (subjectId, filters = {}) => {
    const response = await api.get(`/reports/subject/${subjectId}/report`, {
      params: filters,
      responseType: 'blob',
    });
    return response.data;
  },

  // Attendance reports
  downloadStudentAttendanceReport: async (studentId, filters = {}) => {
    const response = await api.get(`/reports/student/${studentId}/attendance`, {
      params: filters,
      responseType: 'blob',
    });
    return response.data;
  },

  // Financial reports
  downloadStudentFeeReport: async (studentId) => {
    const response = await api.get(`/reports/student/${studentId}/fee`, {
      responseType: 'blob',
    });
    return response.data;
  },

  downloadClassFeeReport: async (classId) => {
    const response = await api.get(`/reports/class/${classId}/fee`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Batch reports
  downloadBatchReportCards: async (classId, academicYear) => {
    const response = await api.post('/reports/batch/report-cards', { classId, academicYear }, {
      responseType: 'blob',
    });
    return response.data;
  },

  downloadBatchFeeReport: async (classId) => {
    const response = await api.post('/reports/batch/fees', { classId }, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Helper function to trigger download
  triggerDownload: (blob, filename) => {
    // Ensure the blob is valid
    if (!blob || !(blob instanceof Blob)) {
      console.error('Invalid blob provided to triggerDownload');
      return;
    }

    // Create a proper blob with the correct MIME type based on file extension
    let mimeType = 'application/octet-stream';
    if (filename.endsWith('.pdf')) {
      mimeType = 'application/pdf';
    } else if (filename.endsWith('.xlsx')) {
      mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    } else if (filename.endsWith('.xls')) {
      mimeType = 'application/vnd.ms-excel';
    } else if (filename.endsWith('.zip')) {
      mimeType = 'application/zip';
    }

    // Create a new blob with the correct MIME type
    const properBlob = new Blob([blob], { type: mimeType });
    
    const url = window.URL.createObjectURL(properBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }, 100);
  },
};
