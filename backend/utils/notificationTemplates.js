/**
 * Notification Templates
 * Pre-defined notification templates for common scenarios
 */

export const notificationTemplates = {
  // Grade notifications
  gradePosted: (subjectName, grade, percentage) => ({
    type: 'success',
    title: 'New Grade Posted',
    message: `Your grade for ${subjectName} has been posted: ${grade} (${percentage}%)`,
    link: '/student/grades'
  }),

  gradeUpdated: (subjectName) => ({
    type: 'info',
    title: 'Grade Updated',
    message: `Your grade for ${subjectName} has been updated`,
    link: '/student/grades'
  }),

  // Attendance notifications
  attendanceMarked: (date, status) => ({
    type: status === 'present' ? 'success' : 'warning',
    title: 'Attendance Marked',
    message: `Your attendance for ${date} has been marked as ${status}`,
    link: '/student/attendance'
  }),

  lowAttendance: (percentage) => ({
    type: 'warning',
    title: 'Low Attendance Alert',
    message: `Your attendance is ${percentage}%. Please improve your attendance.`,
    link: '/student/attendance'
  }),

  // Fee notifications
  feePaymentReceived: (amount, feeType) => ({
    type: 'success',
    title: 'Payment Received',
    message: `Your payment of $${amount} for ${feeType} has been received`,
    link: '/student/fees'
  }),

  feePaymentDue: (amount, feeType, dueDate) => ({
    type: 'warning',
    title: 'Payment Due',
    message: `Payment of $${amount} for ${feeType} is due on ${dueDate}`,
    link: '/student/fees'
  }),

  feePaymentOverdue: (amount, feeType) => ({
    type: 'error',
    title: 'Payment Overdue',
    message: `Payment of $${amount} for ${feeType} is overdue. Please pay immediately.`,
    link: '/student/fees'
  }),

  // Class notifications
  classAssigned: (className) => ({
    type: 'info',
    title: 'Class Assignment',
    message: `You have been assigned to ${className}`,
    link: '/student'
  }),

  classScheduleChanged: (className, newTime) => ({
    type: 'warning',
    title: 'Schedule Change',
    message: `${className} schedule has been changed to ${newTime}`,
    link: '/student'
  }),

  // Teacher notifications
  newStudentEnrolled: (studentName, className) => ({
    type: 'info',
    title: 'New Student Enrolled',
    message: `${studentName} has been enrolled in ${className}`,
    link: '/teacher/classes'
  }),

  assignmentSubmitted: (studentName, assignmentName) => ({
    type: 'info',
    title: 'Assignment Submitted',
    message: `${studentName} has submitted ${assignmentName}`,
    link: '/teacher/grades'
  }),

  // Admin notifications
  newTeacherRegistered: (teacherName) => ({
    type: 'info',
    title: 'New Teacher Registered',
    message: `${teacherName} has been registered as a teacher`,
    link: '/admin/teachers'
  }),

  newStudentRegistered: (studentName) => ({
    type: 'info',
    title: 'New Student Registered',
    message: `${studentName} has been registered as a student`,
    link: '/admin/students'
  }),

  // General announcements
  schoolAnnouncement: (title, message) => ({
    type: 'announcement',
    title: title,
    message: message,
    link: '/announcements'
  }),

  systemMaintenance: (date, time) => ({
    type: 'warning',
    title: 'System Maintenance',
    message: `System will be under maintenance on ${date} at ${time}`,
    link: null
  }),

  // Exam notifications
  examScheduled: (examName, date, time) => ({
    type: 'info',
    title: 'Exam Scheduled',
    message: `${examName} is scheduled for ${date} at ${time}`,
    link: '/student'
  }),

  examResultPublished: (examName) => ({
    type: 'success',
    title: 'Exam Results Published',
    message: `Results for ${examName} have been published`,
    link: '/student/grades'
  })
};

/**
 * Helper function to create notification from template
 * @param {string} templateName - Name of the template
 * @param {Array} params - Parameters for the template
 * @returns {Object} Notification object
 */
export const createFromTemplate = (templateName, ...params) => {
  const template = notificationTemplates[templateName];
  if (!template) {
    throw new Error(`Notification template '${templateName}' not found`);
  }
  return template(...params);
};

export default notificationTemplates;
