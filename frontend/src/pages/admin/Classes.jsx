import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Eye, Users } from 'lucide-react';
import { classService } from '../../services/classService';
import { teacherService } from '../../services/teacherService';
import { subjectService } from '../../services/subjectService';
import Modal from '../../components/ui/modal';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

const Classes = () => {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [saving, setSaving] = useState(false);

  const initialFormData = {
    name: '',
    grade: '',
    section: '',
    academicYear: new Date().getFullYear().toString(),
    classTeacher: '',
    subjects: [],
    room: '',
    capacity: '',
    schedule: {
      startTime: '',
      endTime: '',
      days: [],
    },
    description: '',
    isActive: true,
  };

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday','Sunday'];

  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      if (!isMounted) return;
      await Promise.all([
        fetchClasses(),
        fetchTeachers(),
        fetchSubjects()
      ]);
    };
    
    loadData();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await classService.getAll();
      setClasses(response.data || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
      alert('Error fetching classes');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await teacherService.getAll();
      setTeachers(response.data || []);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await subjectService.getAll();
      setSubjects(response.data || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name || !formData.name.toString().trim()) newErrors.name = 'Class name is required';
    if (!formData.grade || !formData.grade.toString().trim()) newErrors.grade = 'Grade is required';
    if (!formData.section || !formData.section.toString().trim()) newErrors.section = 'Section is required';
    if (!formData.academicYear || !formData.academicYear.toString().trim()) newErrors.academicYear = 'Academic year is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleScheduleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [name]: value
      }
    }));
  };

  const handleDayToggle = (day) => {
    setFormData(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        days: prev.schedule.days.includes(day)
          ? prev.schedule.days.filter(d => d !== day)
          : [...prev.schedule.days, day]
      }
    }));
  };

  const handleSubjectsChange = (e) => {
    const options = e.target.options;
    const selected = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selected.push(options[i].value);
      }
    }
    setFormData(prev => ({ ...prev, subjects: selected }));
  };

  const handleOpenAddModal = () => {
    setFormData(initialFormData);
    setIsEditMode(false);
    setErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (classItem) => {
    setFormData({
      name: classItem.name || '',
      grade: classItem.grade ? classItem.grade.toString() : '',
      section: classItem.section || '',
      academicYear: classItem.academicYear ? classItem.academicYear.toString() : new Date().getFullYear().toString(),
      classTeacher: classItem.classTeacher?._id || '',
      subjects: classItem.subjects?.map(s => s.subject?._id || s._id) || [],
      room: classItem.room || '',
      capacity: classItem.maxStudents ? classItem.maxStudents.toString() : '',
      schedule: {
        startTime: classItem.schedule?.startTime || '',
        endTime: classItem.schedule?.endTime || '',
        days: classItem.schedule?.days || [],
      },
      description: classItem.description || '',
      isActive: classItem.isActive !== undefined ? classItem.isActive : true,
    });
    setSelectedClass(classItem);
    setIsEditMode(true);
    setErrors({});
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    try {
      const classData = {
        name: formData.name,
        grade: formData.grade,
        section: formData.section,
        academicYear: formData.academicYear,
        classTeacher: formData.classTeacher || undefined,
        subjects: formData.subjects,
        room: formData.room,
        capacity: parseInt(formData.capacity) || undefined,
        schedule: {
          startTime: formData.schedule.startTime,
          endTime: formData.schedule.endTime,
          days: formData.schedule.days,
        },
        description: formData.description,
        isActive: formData.isActive,
      };

      if (isEditMode) {
        await classService.update(selectedClass._id, classData);
        alert('Class updated successfully');
      } else {
        await classService.create(classData);
        alert('Class created successfully');
      }

      setIsModalOpen(false);
      fetchClasses();
    } catch (error) {
      console.error('Error saving class:', error);
      alert(error.response?.data?.message || 'Error saving class');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this class? This action cannot be undone.')) {
      try {
        await classService.delete(id);
        alert('Class deleted successfully');
        fetchClasses();
      } catch (error) {
        console.error('Error deleting class:', error);
        alert('Error deleting class');
      }
    }
  };

  const handleViewDetails = (classItem) => {
    setSelectedClass(classItem);
    setIsViewModalOpen(true);
  };

  const filteredClasses = classes.filter((cls) =>
    `${cls.name} ${cls.section} ${cls.grade}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Classes Management</h1>
          <p className="text-gray-600 mt-1">Manage class schedules and assignments</p>
        </div>
        <Button onClick={handleOpenAddModal}>
          <Plus className="w-4 h-4 mr-2" />
          Add Class
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search by class name, section, or grade..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Section</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class Teacher</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Capacity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredClasses.map((cls) => (
                <tr key={cls._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-semibold mr-3">
                        {cls.grade}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{cls.name}</div>
                        <div className="text-sm text-gray-500">{cls.academicYear}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {cls.grade}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {cls.section}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {cls.classTeacher 
                      ? `${cls.classTeacher.user?.firstName} ${cls.classTeacher.user?.lastName}`
                      : 'Not Assigned'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {cls.room || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1 text-gray-400" />
                      {cls.maxStudents || cls.capacity || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      cls.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {cls.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewDetails(cls)}
                        className="text-blue-600 hover:text-blue-800"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenEditModal(cls)}
                        className="text-green-600 hover:text-green-800"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(cls._id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredClasses.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            {searchTerm ? 'No classes found matching your search' : 'No classes added yet'}
          </div>
        )}
      </div>

      {/* Add/Edit Class Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditMode ? 'Edit Class' : 'Add New Class'}
        size="large"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Class Name <span className="text-red-500">*</span>
                </label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Class 10"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Grade <span className="text-red-500">*</span>
                </label>
                <Input
                  name="grade"
                  value={formData.grade}
                  onChange={handleInputChange}
                  placeholder="e.g., 10"
                />
                {errors.grade && <p className="text-red-500 text-xs mt-1">{errors.grade}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Section <span className="text-red-500">*</span>
                </label>
                <Input
                  name="section"
                  value={formData.section}
                  onChange={handleInputChange}
                  placeholder="e.g., A"
                />
                {errors.section && <p className="text-red-500 text-xs mt-1">{errors.section}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Academic Year <span className="text-red-500">*</span>
                </label>
                <Input
                  name="academicYear"
                  value={formData.academicYear}
                  onChange={handleInputChange}
                  placeholder="e.g., 2024"
                />
                {errors.academicYear && <p className="text-red-500 text-xs mt-1">{errors.academicYear}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Room Number</label>
                <Input
                  name="room"
                  value={formData.room}
                  onChange={handleInputChange}
                  placeholder="e.g., 101"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                <Input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  placeholder="e.g., 40"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Class Teacher</label>
                <select
                  name="classTeacher"
                  value={formData.classTeacher}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">Select Class Teacher</option>
                  {teachers.map((teacher) => (
                    <option key={teacher._id} value={teacher._id}>
                      {teacher.user?.firstName} {teacher.user?.lastName} - {teacher.employeeId}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <div className="flex items-center mt-2">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label className="ml-2 text-sm text-gray-700">Active</label>
                </div>
              </div>
            </div>
          </div>

          {/* Subjects */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Subjects</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assign Subjects</label>
              <select
                multiple
                value={formData.subjects}
                onChange={handleSubjectsChange}
                className="w-full px-3 py-2 border rounded-md h-40"
              >
                {subjects.map((subject) => (
                  <option key={subject._id} value={subject._id}>
                    {subject.name} {subject.code ? `(${subject.code})` : ''}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple subjects</p>
            </div>
          </div>

          {/* Schedule */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Schedule</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                <Input
                  type="time"
                  name="startTime"
                  value={formData.schedule.startTime}
                  onChange={handleScheduleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                <Input
                  type="time"
                  name="endTime"
                  value={formData.schedule.endTime}
                  onChange={handleScheduleChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Class Days</label>
              <div className="flex flex-wrap gap-2">
                {weekDays.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleDayToggle(day)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      formData.schedule.days.includes(day)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Additional Information</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Enter class description or notes..."
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : isEditMode ? 'Update Class' : 'Add Class'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Class Details Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Class Details"
        size="large"
      >
        {selectedClass && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center space-x-4 pb-6 border-b">
              <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-3xl">
                {selectedClass.grade}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{selectedClass.name}</h3>
                <p className="text-gray-600">Section {selectedClass.section} • {selectedClass.academicYear}</p>
                <span className={`inline-block px-3 py-1 text-xs rounded-full mt-2 ${
                  selectedClass.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {selectedClass.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            {/* Basic Information */}
            <div>
              <h4 className="text-lg font-semibold mb-3 text-gray-900">Basic Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Grade</p>
                  <p className="font-medium">{selectedClass.grade}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Section</p>
                  <p className="font-medium">{selectedClass.section}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Room Number</p>
                  <p className="font-medium">{selectedClass.room || 'Not Assigned'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Capacity</p>
                  <p className="font-medium">{selectedClass.maxStudents || selectedClass.capacity || 'Not Set'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Academic Year</p>
                  <p className="font-medium">{selectedClass.academicYear}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Class Teacher</p>
                  <p className="font-medium">
                    {selectedClass.classTeacher 
                      ? `${selectedClass.classTeacher.user?.firstName} ${selectedClass.classTeacher.user?.lastName}`
                      : 'Not Assigned'}
                  </p>
                </div>
              </div>
            </div>

            {/* Subjects */}
            {selectedClass.subjects && selectedClass.subjects.length > 0 && (
              <div className="border-t pt-6">
                <h4 className="text-lg font-semibold mb-3 text-gray-900">Subjects</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedClass.subjects.map((subjectItem, index) => {
                    const subject = subjectItem.subject || subjectItem;
                    return (
                      <span key={subject._id || index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                        {subject.name} {subject.code ? `(${subject.code})` : ''}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Schedule */}
            {selectedClass.schedule && (
              <div className="border-t pt-6">
                <h4 className="text-lg font-semibold mb-3 text-gray-900">Schedule</h4>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Start Time</p>
                    <p className="font-medium">{selectedClass.schedule.startTime || 'Not Set'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">End Time</p>
                    <p className="font-medium">{selectedClass.schedule.endTime || 'Not Set'}</p>
                  </div>
                </div>
                {selectedClass.schedule.days && selectedClass.schedule.days.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Class Days</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedClass.schedule.days.map((day) => (
                        <span key={day} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-md">
                          {day}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Description */}
            {selectedClass.description && (
              <div className="border-t pt-6">
                <h4 className="text-lg font-semibold mb-3 text-gray-900">Description</h4>
                <p className="text-gray-700">{selectedClass.description}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-6 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setIsViewModalOpen(false);
                  handleOpenEditModal(selectedClass);
                }}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Class
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsViewModalOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Classes;
