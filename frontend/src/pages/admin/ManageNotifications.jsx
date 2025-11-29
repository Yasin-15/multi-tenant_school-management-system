import { useState, useEffect } from 'react';
import { Bell, Plus, Send, Users, X } from 'lucide-react';
import notificationService from '../../services/notificationService';
import { studentService } from '../../services/studentService';
import { teacherService } from '../../services/teacherService';
import api from '../../services/api';

const ManageNotifications = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);

  const [formData, setFormData] = useState({
    recipientType: 'all',
    recipients: [],
    classId: '',
    type: 'info',
    title: '',
    message: '',
    link: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [studentsRes, teachersRes, classesRes] = await Promise.all([
        studentService.getAll(),
        teacherService.getAll(),
        api.get('/classes')
      ]);

      const studentData = studentsRes.data || studentsRes;
      const teacherData = teachersRes.data || teachersRes;
      const classData = classesRes.data.data || classesRes.data;

      setStudents(Array.isArray(studentData) ? studentData : []);
      setTeachers(Array.isArray(teacherData) ? teacherData : []);
      setClasses(Array.isArray(classData) ? classData : []);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRecipientTypeChange = (type) => {
    setFormData(prev => ({
      ...prev,
      recipientType: type,
      recipients: [],
      classId: ''
    }));
  };

  const handleRecipientToggle = (userId) => {
    setFormData(prev => ({
      ...prev,
      recipients: prev.recipients.includes(userId)
        ? prev.recipients.filter(id => id !== userId)
        : [...prev.recipients, userId]
    }));
  };

  const handleSelectAll = (type) => {
    if (type === 'students') {
      const allStudentIds = students.map(s => s.user?._id || s.user).filter(Boolean);
      setFormData(prev => ({
        ...prev,
        recipients: allStudentIds
      }));
    } else if (type === 'teachers') {
      const allTeacherIds = teachers.map(t => t.user?._id || t.user).filter(Boolean);
      setFormData(prev => ({
        ...prev,
        recipients: allTeacherIds
      }));
    }
  };

  const handleClassChange = (classId) => {
    setFormData(prev => ({ ...prev, classId }));
    
    if (classId) {
      const studentsInClass = students
        .filter(s => (s.class?._id || s.class) === classId)
        .map(s => s.user?._id || s.user)
        .filter(Boolean);
      
      setFormData(prev => ({
        ...prev,
        recipients: studentsInClass
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.message) {
      alert('Please fill in all required fields');
      return;
    }

    let recipients = [];

    if (formData.recipientType === 'all') {
      const allUserIds = [
        ...students.map(s => s.user?._id || s.user),
        ...teachers.map(t => t.user?._id || t.user)
      ].filter(Boolean);
      recipients = allUserIds;
    } else {
      recipients = formData.recipients;
    }

    if (recipients.length === 0) {
      alert('Please select at least one recipient');
      return;
    }

    try {
      setLoading(true);
      await notificationService.createNotification({
        recipients,
        type: formData.type,
        title: formData.title,
        message: formData.message,
        link: formData.link || undefined
      });

      alert(`Notification sent to ${recipients.length} recipient(s)`);
      setShowCreateModal(false);
      setFormData({
        recipientType: 'all',
        recipients: [],
        classId: '',
        type: 'info',
        title: '',
        message: '',
        link: ''
      });
    } catch (error) {
      console.error('Error creating notification:', error);
      alert('Failed to send notification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Notifications</h1>
          <p className="text-gray-600 mt-2">Send notifications to students and teachers</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          Create Notification
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Students</p>
              <p className="text-3xl font-bold mt-2">{students.length}</p>
            </div>
            <Users className="w-12 h-12 text-blue-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Teachers</p>
              <p className="text-3xl font-bold mt-2">{teachers.length}</p>
            </div>
            <Users className="w-12 h-12 text-green-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Classes</p>
              <p className="text-3xl font-bold mt-2">{classes.length}</p>
            </div>
            <Bell className="w-12 h-12 text-purple-500 opacity-20" />
          </div>
        </div>
      </div>

      {/* Create Notification Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-2xl font-bold">Create Notification</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Recipient Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Send To
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => handleRecipientTypeChange('all')}
                    className={`px-4 py-2 rounded-lg border ${
                      formData.recipientType === 'all'
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Everyone
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRecipientTypeChange('students')}
                    className={`px-4 py-2 rounded-lg border ${
                      formData.recipientType === 'students'
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Students
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRecipientTypeChange('teachers')}
                    className={`px-4 py-2 rounded-lg border ${
                      formData.recipientType === 'teachers'
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Teachers
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRecipientTypeChange('class')}
                    className={`px-4 py-2 rounded-lg border ${
                      formData.recipientType === 'class'
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    By Class
                  </button>
                </div>
              </div>

              {/* Class Selection */}
              {formData.recipientType === 'class' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Class
                  </label>
                  <select
                    value={formData.classId}
                    onChange={(e) => handleClassChange(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Choose a class...</option>
                    {classes.map(cls => (
                      <option key={cls._id} value={cls._id}>
                        Grade {cls.grade} - {cls.section}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Individual Selection */}
              {(formData.recipientType === 'students' || formData.recipientType === 'teachers') && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Select Recipients ({formData.recipients.length} selected)
                    </label>
                    <button
                      type="button"
                      onClick={() => handleSelectAll(formData.recipientType)}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      Select All
                    </button>
                  </div>
                  <div className="border border-gray-300 rounded-lg max-h-48 overflow-y-auto p-2">
                    {formData.recipientType === 'students' ? (
                      students.map(student => (
                        <label
                          key={student._id}
                          className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={formData.recipients.includes(student.user?._id || student.user)}
                            onChange={() => handleRecipientToggle(student.user?._id || student.user)}
                            className="rounded"
                          />
                          <span className="text-sm">
                            {student.user?.firstName} {student.user?.lastName} - {student.studentId}
                          </span>
                        </label>
                      ))
                    ) : (
                      teachers.map(teacher => (
                        <label
                          key={teacher._id}
                          className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={formData.recipients.includes(teacher.user?._id || teacher.user)}
                            onChange={() => handleRecipientToggle(teacher.user?._id || teacher.user)}
                            className="rounded"
                          />
                          <span className="text-sm">
                            {teacher.user?.firstName} {teacher.user?.lastName} - {teacher.employeeId}
                          </span>
                        </label>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Notification Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="info">Info</option>
                  <option value="success">Success</option>
                  <option value="warning">Warning</option>
                  <option value="error">Error</option>
                  <option value="announcement">Announcement</option>
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter notification title"
                  required
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter notification message"
                  required
                />
              </div>

              {/* Link (Optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Link (Optional)
                </label>
                <input
                  type="text"
                  name="link"
                  value={formData.link}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="/path/to/page"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  <Send className="w-5 h-5" />
                  {loading ? 'Sending...' : 'Send Notification'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageNotifications;
