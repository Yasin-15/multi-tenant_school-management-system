import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react';
import { subjectService } from '../../services/subjectService';
import Modal from '../../components/ui/modal';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

const Subjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [saving, setSaving] = useState(false);

  const initialFormData = {
    name: '',
    code: '',
    description: '',
    type: 'core',
    credits: 1,
    passingMarks: 40,
    totalMarks: 100,
    isActive: true,
  };

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    let isMounted = true;
    
    const loadSubjects = async () => {
      if (!isMounted) return;
      await fetchSubjects();
    };
    
    loadSubjects();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const fetchSubjects = async () => {
    try {
      const response = await subjectService.getAll();
      setSubjects(response.data || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      alert('Error fetching subjects');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Subject name is required';
    if (!formData.code.trim()) newErrors.code = 'Subject code is required';
    if (formData.credits < 0) newErrors.credits = 'Credits must be positive';
    if (formData.passingMarks < 0) newErrors.passingMarks = 'Passing marks must be positive';
    if (formData.totalMarks <= 0) newErrors.totalMarks = 'Total marks must be greater than 0';
    if (formData.passingMarks > formData.totalMarks) {
      newErrors.passingMarks = 'Passing marks cannot exceed total marks';
    }

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

  const handleOpenAddModal = () => {
    setFormData(initialFormData);
    setIsEditMode(false);
    setErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (subject) => {
    setFormData({
      name: subject.name || '',
      code: subject.code || '',
      description: subject.description || '',
      type: subject.type || 'core',
      credits: subject.credits || 1,
      passingMarks: subject.passingMarks || 40,
      totalMarks: subject.totalMarks || 100,
      isActive: subject.isActive !== undefined ? subject.isActive : true,
    });
    setSelectedSubject(subject);
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
      const subjectData = {
        name: formData.name,
        code: formData.code,
        description: formData.description,
        type: formData.type,
        credits: parseInt(formData.credits),
        passingMarks: parseInt(formData.passingMarks),
        totalMarks: parseInt(formData.totalMarks),
        isActive: formData.isActive,
      };

      if (isEditMode) {
        await subjectService.update(selectedSubject._id, subjectData);
        alert('Subject updated successfully');
      } else {
        await subjectService.create(subjectData);
        alert('Subject created successfully');
      }

      setIsModalOpen(false);
      fetchSubjects();
    } catch (error) {
      console.error('Error saving subject:', error);
      alert(error.response?.data?.message || 'Error saving subject');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this subject? This action cannot be undone.')) {
      try {
        await subjectService.delete(id);
        alert('Subject deleted successfully');
        fetchSubjects();
      } catch (error) {
        console.error('Error deleting subject:', error);
        alert('Error deleting subject');
      }
    }
  };

  const handleViewDetails = (subject) => {
    setSelectedSubject(subject);
    setIsViewModalOpen(true);
  };

  const filteredSubjects = subjects.filter((subject) =>
    `${subject.name} ${subject.code}`
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
          <h1 className="text-3xl font-bold">Subjects Management</h1>
          <p className="text-gray-600 mt-1">Manage subject records and information</p>
        </div>
        <Button onClick={handleOpenAddModal}>
          <Plus className="w-4 h-4 mr-2" />
          Add Subject
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search by name or code..."
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Credits</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Marks</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredSubjects.map((subject) => (
                <tr key={subject._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {subject.code}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{subject.name}</div>
                    {subject.description && (
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {subject.description}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full capitalize ${
                      subject.type === 'core' ? 'bg-blue-100 text-blue-800' :
                      subject.type === 'elective' ? 'bg-purple-100 text-purple-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {subject.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {subject.credits}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {subject.passingMarks}/{subject.totalMarks}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      subject.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {subject.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewDetails(subject)}
                        className="text-blue-600 hover:text-blue-800"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenEditModal(subject)}
                        className="text-green-600 hover:text-green-800"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(subject._id)}
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

        {filteredSubjects.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            {searchTerm ? 'No subjects found matching your search' : 'No subjects added yet'}
          </div>
        )}
      </div>

      {/* Add/Edit Subject Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditMode ? 'Edit Subject' : 'Add New Subject'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject Name <span className="text-red-500">*</span>
              </label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Mathematics"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject Code <span className="text-red-500">*</span>
              </label>
              <Input
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                placeholder="e.g., MATH101"
                disabled={isEditMode}
              />
              {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter subject description"
                className="w-full px-3 py-2 border rounded-md"
                rows="3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="core">Core</option>
                <option value="elective">Elective</option>
                <option value="extracurricular">Extracurricular</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Credits</label>
              <Input
                type="number"
                name="credits"
                value={formData.credits}
                onChange={handleInputChange}
                min="0"
              />
              {errors.credits && <p className="text-red-500 text-xs mt-1">{errors.credits}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Passing Marks</label>
              <Input
                type="number"
                name="passingMarks"
                value={formData.passingMarks}
                onChange={handleInputChange}
                min="0"
              />
              {errors.passingMarks && <p className="text-red-500 text-xs mt-1">{errors.passingMarks}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Marks</label>
              <Input
                type="number"
                name="totalMarks"
                value={formData.totalMarks}
                onChange={handleInputChange}
                min="1"
              />
              {errors.totalMarks && <p className="text-red-500 text-xs mt-1">{errors.totalMarks}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="rounded"
                />
                <span className="text-sm font-medium text-gray-700">Active</span>
              </label>
            </div>
          </div>

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
              {saving ? 'Saving...' : isEditMode ? 'Update Subject' : 'Add Subject'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Subject Details Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Subject Details"
      >
        {selectedSubject && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-6 border-b">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{selectedSubject.name}</h3>
                <p className="text-gray-600">{selectedSubject.code}</p>
              </div>
              <span className={`px-3 py-1 text-xs rounded-full ${
                selectedSubject.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {selectedSubject.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Type</p>
                <p className="font-medium capitalize">{selectedSubject.type}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Credits</p>
                <p className="font-medium">{selectedSubject.credits}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Passing Marks</p>
                <p className="font-medium">{selectedSubject.passingMarks}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Marks</p>
                <p className="font-medium">{selectedSubject.totalMarks}</p>
              </div>
              {selectedSubject.description && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Description</p>
                  <p className="font-medium">{selectedSubject.description}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setIsViewModalOpen(false);
                  handleOpenEditModal(selectedSubject);
                }}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Subject
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

export default Subjects;
