import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Eye, X } from 'lucide-react';
import { studentService } from '../../services/studentService';
import { classService } from '../../services/classService';
import Modal from '../../components/ui/modal';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const initialFormData = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    studentId: '',
    admissionNumber: '',
    admissionDate: '',
    class: '',
    rollNumber: '',
    academicYear: new Date().getFullYear().toString(),
    guardianName: '',
    guardianPhone: '',
    guardianEmail: '',
    guardianRelation: '',
    bloodGroup: '',
    street: '',
    city: '',
    state: '',
    country: '',
    zipCode: '',
    status: 'active',
  };

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      if (!isMounted) return;
      await Promise.all([
        fetchStudents(),
        fetchClasses()
      ]);
    };
    
    loadData();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await studentService.getAll();
      setStudents(response.data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
      alert('Error fetching students');
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await classService.getAll();
      setClasses(response.data || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    
    if (!isEditMode && !formData.password) newErrors.password = 'Password is required';
    else if (!isEditMode && formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    
    if (!formData.studentId.trim()) newErrors.studentId = 'Student ID is required';
    if (!formData.admissionNumber.trim()) newErrors.admissionNumber = 'Admission number is required';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.class) newErrors.class = 'Class is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleOpenAddModal = () => {
    setFormData(initialFormData);
    setIsEditMode(false);
    setErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (student) => {
    setFormData({
      firstName: student.user?.firstName || '',
      lastName: student.user?.lastName || '',
      email: student.user?.email || '',
      password: '',
      phone: student.user?.phone || '',
      dateOfBirth: student.user?.dateOfBirth ? new Date(student.user.dateOfBirth).toISOString().split('T')[0] : '',
      gender: student.user?.gender || '',
      studentId: student.studentId || '',
      admissionNumber: student.admissionNumber || '',
      admissionDate: student.admissionDate ? new Date(student.admissionDate).toISOString().split('T')[0] : '',
      class: student.class?._id || '',
      rollNumber: student.rollNumber || '',
      academicYear: student.academicYear || '',
      guardianName: student.guardianName || '',
      guardianPhone: student.guardianPhone || '',
      guardianEmail: student.guardianEmail || '',
      guardianRelation: student.guardianRelation || '',
      bloodGroup: student.bloodGroup || '',
      street: student.user?.address?.street || '',
      city: student.user?.address?.city || '',
      state: student.user?.address?.state || '',
      country: student.user?.address?.country || '',
      zipCode: student.user?.address?.zipCode || '',
      status: student.status || 'active',
    });
    setSelectedStudent(student);
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
      const studentData = {
        user: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,
          address: {
            street: formData.street,
            city: formData.city,
            state: formData.state,
            country: formData.country,
            zipCode: formData.zipCode,
          },
        },
        studentId: formData.studentId,
        admissionNumber: formData.admissionNumber,
        admissionDate: formData.admissionDate,
        class: formData.class,
        rollNumber: formData.rollNumber,
        academicYear: formData.academicYear,
        guardianName: formData.guardianName,
        guardianPhone: formData.guardianPhone,
        guardianEmail: formData.guardianEmail,
        guardianRelation: formData.guardianRelation,
        bloodGroup: formData.bloodGroup,
        status: formData.status,
      };

      if (!isEditMode && formData.password) {
        studentData.user.password = formData.password;
      }

      if (isEditMode) {
        await studentService.update(selectedStudent._id, studentData);
        alert('Student updated successfully');
      } else {
        await studentService.create(studentData);
        alert('Student created successfully');
      }

      setIsModalOpen(false);
      fetchStudents();
    } catch (error) {
      console.error('Error saving student:', error);
      alert(error.response?.data?.message || 'Error saving student');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
      try {
        await studentService.delete(id);
        alert('Student deleted successfully');
        fetchStudents();
      } catch (error) {
        console.error('Error deleting student:', error);
        alert('Error deleting student');
      }
    }
  };

  const handleViewDetails = (student) => {
    setSelectedStudent(student);
    setIsViewModalOpen(true);
  };

  const filteredStudents = students.filter((student) =>
    `${student.user?.firstName} ${student.user?.lastName} ${student.studentId}`
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
          <h1 className="text-3xl font-bold">Students Management</h1>
          <p className="text-gray-600 mt-1">Manage student records and information</p>
        </div>
        <Button onClick={handleOpenAddModal}>
          <Plus className="w-4 h-4 mr-2" />
          Add Student
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search by name or student ID..."
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Roll No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredStudents.map((student) => (
                <tr key={student._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {student.studentId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold mr-3">
                        {student.user?.firstName?.[0]}{student.user?.lastName?.[0]}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {student.user?.firstName} {student.user?.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{student.admissionNumber}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.user?.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.class?.name ? `${student.class.name} - ${student.class.section}` : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.rollNumber || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full capitalize ${
                      student.status === 'active' ? 'bg-green-100 text-green-800' :
                      student.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                      student.status === 'graduated' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {student.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewDetails(student)}
                        className="text-blue-600 hover:text-blue-800"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenEditModal(student)}
                        className="text-green-600 hover:text-green-800"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(student._id)}
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

        {filteredStudents.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            {searchTerm ? 'No students found matching your search' : 'No students added yet'}
          </div>
        )}
      </div>

      {/* Add/Edit Student Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditMode ? 'Edit Student' : 'Add New Student'}
        size="large"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <Input
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="Enter first name"
                />
                {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <Input
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Enter last name"
                />
                {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="student@example.com"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              {!isEditMode && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter password"
                  />
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <Input
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                />
                {errors.dateOfBirth && <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                <select
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">Select Blood Group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Academic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Student ID <span className="text-red-500">*</span>
                </label>
                <Input
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleInputChange}
                  placeholder="e.g., STU2024001"
                />
                {errors.studentId && <p className="text-red-500 text-xs mt-1">{errors.studentId}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Admission Number <span className="text-red-500">*</span>
                </label>
                <Input
                  name="admissionNumber"
                  value={formData.admissionNumber}
                  onChange={handleInputChange}
                  placeholder="e.g., ADM2024001"
                />
                {errors.admissionNumber && <p className="text-red-500 text-xs mt-1">{errors.admissionNumber}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Admission Date</label>
                <Input
                  type="date"
                  name="admissionDate"
                  value={formData.admissionDate}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Class <span className="text-red-500">*</span>
                </label>
                <select
                  name="class"
                  value={formData.class}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">Select Class</option>
                  {classes.map((cls) => (
                    <option key={cls._id} value={cls._id}>
                      {cls.name} - {cls.section}
                    </option>
                  ))}
                </select>
                {errors.class && <p className="text-red-500 text-xs mt-1">{errors.class}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Roll Number</label>
                <Input
                  name="rollNumber"
                  value={formData.rollNumber}
                  onChange={handleInputChange}
                  placeholder="e.g., 01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
                <Input
                  name="academicYear"
                  value={formData.academicYear}
                  onChange={handleInputChange}
                  placeholder="e.g., 2024"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="graduated">Graduated</option>
                  <option value="transferred">Transferred</option>
                  <option value="expelled">Expelled</option>
                </select>
              </div>
            </div>
          </div>

          {/* Guardian Information */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Guardian Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Guardian Name</label>
                <Input
                  name="guardianName"
                  value={formData.guardianName}
                  onChange={handleInputChange}
                  placeholder="Enter guardian name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Guardian Phone</label>
                <Input
                  name="guardianPhone"
                  value={formData.guardianPhone}
                  onChange={handleInputChange}
                  placeholder="Enter guardian phone"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Guardian Email</label>
                <Input
                  type="email"
                  name="guardianEmail"
                  value={formData.guardianEmail}
                  onChange={handleInputChange}
                  placeholder="guardian@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Relation</label>
                <select
                  name="guardianRelation"
                  value={formData.guardianRelation}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">Select Relation</option>
                  <option value="father">Father</option>
                  <option value="mother">Mother</option>
                  <option value="guardian">Guardian</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Address Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                <Input
                  name="street"
                  value={formData.street}
                  onChange={handleInputChange}
                  placeholder="Enter street address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <Input
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="Enter city"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <Input
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  placeholder="Enter state"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <Input
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  placeholder="Enter country"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code</label>
                <Input
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  placeholder="Enter zip code"
                />
              </div>
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
              {saving ? 'Saving...' : isEditMode ? 'Update Student' : 'Add Student'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Student Details Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Student Details"
        size="large"
      >
        {selectedStudent && (
          <div className="space-y-6">
            {/* Header with Avatar */}
            <div className="flex items-center space-x-4 pb-6 border-b">
              <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-2xl">
                {selectedStudent.user?.firstName?.[0]}{selectedStudent.user?.lastName?.[0]}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {selectedStudent.user?.firstName} {selectedStudent.user?.lastName}
                </h3>
                <p className="text-gray-600">{selectedStudent.studentId}</p>
                <span className={`inline-block px-3 py-1 text-xs rounded-full mt-2 capitalize ${
                  selectedStudent.status === 'active' ? 'bg-green-100 text-green-800' :
                  selectedStudent.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                  selectedStudent.status === 'graduated' ? 'bg-blue-100 text-blue-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {selectedStudent.status}
                </span>
              </div>
            </div>

            {/* Personal Information */}
            <div>
              <h4 className="text-lg font-semibold mb-3 text-gray-900">Personal Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{selectedStudent.user?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{selectedStudent.user?.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date of Birth</p>
                  <p className="font-medium">
                    {selectedStudent.user?.dateOfBirth 
                      ? new Date(selectedStudent.user.dateOfBirth).toLocaleDateString() 
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Gender</p>
                  <p className="font-medium capitalize">{selectedStudent.user?.gender || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Blood Group</p>
                  <p className="font-medium">{selectedStudent.bloodGroup || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Academic Information */}
            <div className="border-t pt-6">
              <h4 className="text-lg font-semibold mb-3 text-gray-900">Academic Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Admission Number</p>
                  <p className="font-medium">{selectedStudent.admissionNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Admission Date</p>
                  <p className="font-medium">
                    {selectedStudent.admissionDate 
                      ? new Date(selectedStudent.admissionDate).toLocaleDateString() 
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Class</p>
                  <p className="font-medium">
                    {selectedStudent.class 
                      ? `${selectedStudent.class.name} - ${selectedStudent.class.section}` 
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Roll Number</p>
                  <p className="font-medium">{selectedStudent.rollNumber || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Academic Year</p>
                  <p className="font-medium">{selectedStudent.academicYear || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Guardian Information */}
            <div className="border-t pt-6">
              <h4 className="text-lg font-semibold mb-3 text-gray-900">Guardian Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Guardian Name</p>
                  <p className="font-medium">{selectedStudent.guardianName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Guardian Phone</p>
                  <p className="font-medium">{selectedStudent.guardianPhone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Guardian Email</p>
                  <p className="font-medium">{selectedStudent.guardianEmail || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Relation</p>
                  <p className="font-medium capitalize">{selectedStudent.guardianRelation || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Address Information */}
            {selectedStudent.user?.address && (
              <div className="border-t pt-6">
                <h4 className="text-lg font-semibold mb-3 text-gray-900">Address Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500">Street Address</p>
                    <p className="font-medium">{selectedStudent.user.address.street || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">City</p>
                    <p className="font-medium">{selectedStudent.user.address.city || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">State</p>
                    <p className="font-medium">{selectedStudent.user.address.state || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Country</p>
                    <p className="font-medium">{selectedStudent.user.address.country || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Zip Code</p>
                    <p className="font-medium">{selectedStudent.user.address.zipCode || 'N/A'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-6 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setIsViewModalOpen(false);
                  handleOpenEditModal(selectedStudent);
                }}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Student
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

export default Students;
