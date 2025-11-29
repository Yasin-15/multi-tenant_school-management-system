import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react';
import { teacherService } from '../../services/teacherService';
import { subjectService } from '../../services/subjectService';
import Modal from '../../components/ui/modal';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
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
    employeeId: '',
    joiningDate: '',
    designation: '',
    department: '',
    qualification: '',
    experience: '',
    subjects: [],
    salary: '',
    street: '',
    city: '',
    state: '',
    country: '',
    zipCode: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: '',
    status: 'active',
  };

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      if (!isMounted) return;
      await Promise.all([
        fetchTeachers(),
        fetchSubjects()
      ]);
    };
    
    loadData();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const fetchTeachers = async () => {
    try {
      const response = await teacherService.getAll();
      setTeachers(response.data || []);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      alert('Error fetching teachers');
    } finally {
      setLoading(false);
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

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    
    if (!isEditMode && !formData.password) newErrors.password = 'Password is required';
    else if (!isEditMode && formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    
    if (!formData.employeeId.trim()) newErrors.employeeId = 'Employee ID is required';
    if (!formData.designation.trim()) newErrors.designation = 'Designation is required';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';

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

  const handleOpenEditModal = (teacher) => {
    setFormData({
      firstName: teacher.user?.firstName || '',
      lastName: teacher.user?.lastName || '',
      email: teacher.user?.email || '',
      password: '',
      phone: teacher.user?.phone || '',
      dateOfBirth: teacher.user?.dateOfBirth ? new Date(teacher.user.dateOfBirth).toISOString().split('T')[0] : '',
      gender: teacher.user?.gender || '',
      employeeId: teacher.employeeId || '',
      joiningDate: teacher.joiningDate ? new Date(teacher.joiningDate).toISOString().split('T')[0] : '',
      designation: teacher.designation || '',
      department: teacher.department || '',
      qualification: teacher.qualification?.[0]?.degree || '',
      experience: teacher.experience?.years || '',
      subjects: teacher.subjects?.map(s => s._id) || [],
      salary: teacher.salary?.basic || '',
      street: teacher.user?.address?.street || '',
      city: teacher.user?.address?.city || '',
      state: teacher.user?.address?.state || '',
      country: teacher.user?.address?.country || '',
      zipCode: teacher.user?.address?.zipCode || '',
      emergencyContactName: teacher.emergencyContact?.name || '',
      emergencyContactPhone: teacher.emergencyContact?.phone || '',
      emergencyContactRelation: teacher.emergencyContact?.relation || '',
      status: teacher.status || 'active',
    });
    setSelectedTeacher(teacher);
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
      const teacherData = {
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
        employeeId: formData.employeeId,
        joiningDate: formData.joiningDate,
        designation: formData.designation,
        department: formData.department,
        qualification: formData.qualification ? [{
          degree: formData.qualification,
        }] : [],
        experience: {
          years: parseInt(formData.experience) || 0,
        },
        subjects: formData.subjects,
        salary: {
          basic: parseFloat(formData.salary) || 0,
        },
        emergencyContact: {
          name: formData.emergencyContactName,
          phone: formData.emergencyContactPhone,
          relation: formData.emergencyContactRelation,
        },
        status: formData.status,
      };

      if (!isEditMode && formData.password) {
        teacherData.user.password = formData.password;
      }

      if (isEditMode) {
        await teacherService.update(selectedTeacher._id, teacherData);
        alert('Teacher updated successfully');
      } else {
        await teacherService.create(teacherData);
        alert('Teacher created successfully');
      }

      setIsModalOpen(false);
      fetchTeachers();
    } catch (error) {
      console.error('Error saving teacher:', error);
      alert(error.response?.data?.message || 'Error saving teacher');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this teacher? This action cannot be undone.')) {
      try {
        await teacherService.delete(id);
        alert('Teacher deleted successfully');
        fetchTeachers();
      } catch (error) {
        console.error('Error deleting teacher:', error);
        alert('Error deleting teacher');
      }
    }
  };

  const handleViewDetails = (teacher) => {
    setSelectedTeacher(teacher);
    setIsViewModalOpen(true);
  };

  const filteredTeachers = teachers.filter((teacher) =>
    `${teacher.user?.firstName} ${teacher.user?.lastName} ${teacher.employeeId}`
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
          <h1 className="text-3xl font-bold">Teachers Management</h1>
          <p className="text-gray-600 mt-1">Manage teacher records and information</p>
        </div>
        <Button onClick={handleOpenAddModal}>
          <Plus className="w-4 h-4 mr-2" />
          Add Teacher
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search by name or employee ID..."
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Designation</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTeachers.map((teacher) => (
                <tr key={teacher._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {teacher.employeeId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-semibold mr-3">
                        {teacher.user?.firstName?.[0]}{teacher.user?.lastName?.[0]}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {teacher.user?.firstName} {teacher.user?.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{teacher.user?.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {teacher.user?.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {teacher.designation}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {teacher.department || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full capitalize ${
                      teacher.status === 'active' ? 'bg-green-100 text-green-800' :
                      teacher.status === 'on_leave' ? 'bg-yellow-100 text-yellow-800' :
                      teacher.status === 'resigned' ? 'bg-gray-100 text-gray-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {teacher.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewDetails(teacher)}
                        className="text-blue-600 hover:text-blue-800"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenEditModal(teacher)}
                        className="text-green-600 hover:text-green-800"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(teacher._id)}
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

        {filteredTeachers.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            {searchTerm ? 'No teachers found matching your search' : 'No teachers added yet'}
          </div>
        )}
      </div>

      {/* Add/Edit Teacher Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditMode ? 'Edit Teacher' : 'Add New Teacher'}
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
                  placeholder="teacher@example.com"
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
            </div>
          </div>

          {/* Professional Information */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Professional Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employee ID <span className="text-red-500">*</span>
                </label>
                <Input
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleInputChange}
                  placeholder="e.g., EMP2024001"
                />
                {errors.employeeId && <p className="text-red-500 text-xs mt-1">{errors.employeeId}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Joining Date</label>
                <Input
                  type="date"
                  name="joiningDate"
                  value={formData.joiningDate}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Designation <span className="text-red-500">*</span>
                </label>
                <Input
                  name="designation"
                  value={formData.designation}
                  onChange={handleInputChange}
                  placeholder="e.g., Senior Teacher"
                />
                {errors.designation && <p className="text-red-500 text-xs mt-1">{errors.designation}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <Input
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  placeholder="e.g., Science"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
                <Input
                  name="qualification"
                  value={formData.qualification}
                  onChange={handleInputChange}
                  placeholder="e.g., M.Sc, B.Ed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Experience (Years)</label>
                <Input
                  type="number"
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  placeholder="e.g., 5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Basic Salary</label>
                <Input
                  type="number"
                  name="salary"
                  value={formData.salary}
                  onChange={handleInputChange}
                  placeholder="e.g., 50000"
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
                  <option value="on_leave">On Leave</option>
                  <option value="resigned">Resigned</option>
                  <option value="terminated">Terminated</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Subjects</label>
                <select
                  multiple
                  value={formData.subjects}
                  onChange={handleSubjectsChange}
                  className="w-full px-3 py-2 border rounded-md h-32"
                >
                  {subjects.map((subject) => (
                    <option key={subject._id} value={subject._id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple subjects</p>
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Emergency Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
                <Input
                  name="emergencyContactName"
                  value={formData.emergencyContactName}
                  onChange={handleInputChange}
                  placeholder="Enter contact name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                <Input
                  name="emergencyContactPhone"
                  value={formData.emergencyContactPhone}
                  onChange={handleInputChange}
                  placeholder="Enter contact phone"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Relation</label>
                <Input
                  name="emergencyContactRelation"
                  value={formData.emergencyContactRelation}
                  onChange={handleInputChange}
                  placeholder="e.g., Spouse, Parent"
                />
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
              {saving ? 'Saving...' : isEditMode ? 'Update Teacher' : 'Add Teacher'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Teacher Details Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Teacher Details"
        size="large"
      >
        {selectedTeacher && (
          <div className="space-y-6">
            {/* Header with Avatar */}
            <div className="flex items-center space-x-4 pb-6 border-b">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-2xl">
                {selectedTeacher.user?.firstName?.[0]}{selectedTeacher.user?.lastName?.[0]}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {selectedTeacher.user?.firstName} {selectedTeacher.user?.lastName}
                </h3>
                <p className="text-gray-600">{selectedTeacher.employeeId}</p>
                <span className={`inline-block px-3 py-1 text-xs rounded-full mt-2 capitalize ${
                  selectedTeacher.status === 'active' ? 'bg-green-100 text-green-800' :
                  selectedTeacher.status === 'on_leave' ? 'bg-yellow-100 text-yellow-800' :
                  selectedTeacher.status === 'resigned' ? 'bg-gray-100 text-gray-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {selectedTeacher.status.replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* Personal Information */}
            <div>
              <h4 className="text-lg font-semibold mb-3 text-gray-900">Personal Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{selectedTeacher.user?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{selectedTeacher.user?.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date of Birth</p>
                  <p className="font-medium">
                    {selectedTeacher.user?.dateOfBirth 
                      ? new Date(selectedTeacher.user.dateOfBirth).toLocaleDateString() 
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Gender</p>
                  <p className="font-medium capitalize">{selectedTeacher.user?.gender || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="border-t pt-6">
              <h4 className="text-lg font-semibold mb-3 text-gray-900">Professional Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Designation</p>
                  <p className="font-medium">{selectedTeacher.designation}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Department</p>
                  <p className="font-medium">{selectedTeacher.department || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Joining Date</p>
                  <p className="font-medium">
                    {selectedTeacher.joiningDate 
                      ? new Date(selectedTeacher.joiningDate).toLocaleDateString() 
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Experience</p>
                  <p className="font-medium">{selectedTeacher.experience?.years || 0} years</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Qualification</p>
                  <p className="font-medium">{selectedTeacher.qualification?.[0]?.degree || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Basic Salary</p>
                  <p className="font-medium">${selectedTeacher.salary?.basic || 0}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Subjects</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedTeacher.subjects && selectedTeacher.subjects.length > 0 ? (
                      selectedTeacher.subjects.map((subject) => (
                        <span key={subject._id} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {subject.name}
                        </span>
                      ))
                    ) : (
                      <p className="font-medium">No subjects assigned</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            {selectedTeacher.emergencyContact && (
              <div className="border-t pt-6">
                <h4 className="text-lg font-semibold mb-3 text-gray-900">Emergency Contact</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Contact Name</p>
                    <p className="font-medium">{selectedTeacher.emergencyContact.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Contact Phone</p>
                    <p className="font-medium">{selectedTeacher.emergencyContact.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Relation</p>
                    <p className="font-medium">{selectedTeacher.emergencyContact.relation || 'N/A'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Address Information */}
            {selectedTeacher.user?.address && (
              <div className="border-t pt-6">
                <h4 className="text-lg font-semibold mb-3 text-gray-900">Address Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500">Street Address</p>
                    <p className="font-medium">{selectedTeacher.user.address.street || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">City</p>
                    <p className="font-medium">{selectedTeacher.user.address.city || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">State</p>
                    <p className="font-medium">{selectedTeacher.user.address.state || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Country</p>
                    <p className="font-medium">{selectedTeacher.user.address.country || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Zip Code</p>
                    <p className="font-medium">{selectedTeacher.user.address.zipCode || 'N/A'}</p>
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
                  handleOpenEditModal(selectedTeacher);
                }}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Teacher
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

export default Teachers;
