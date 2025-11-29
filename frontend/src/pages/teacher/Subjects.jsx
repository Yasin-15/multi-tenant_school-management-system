import { useState, useEffect } from 'react';
import { Search, Eye, BookOpen } from 'lucide-react';
import { subjectService } from '../../services/subjectService';
import Modal from '../../components/ui/modal';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

const Subjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    fetchSubjects();
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

  const handleViewDetails = (subject) => {
    setSelectedSubject(subject);
    setIsViewModalOpen(true);
  };

  const filteredSubjects = subjects.filter((subject) => {
    const matchesSearch = `${subject.name} ${subject.code}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || subject.type === filterType;
    
    return matchesSearch && matchesType && subject.isActive;
  });

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Subjects</h1>
          <p className="text-gray-600 mt-1">View all available subjects</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4 border-b">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search by name or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="w-full md:w-48">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="all">All Types</option>
                <option value="core">Core</option>
                <option value="elective">Elective</option>
                <option value="extracurricular">Extracurricular</option>
              </select>
            </div>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredSubjects.map((subject) => (
                <tr key={subject._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {subject.code}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{subject.name}</div>
                        {subject.description && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {subject.description}
                          </div>
                        )}
                      </div>
                    </div>
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleViewDetails(subject)}
                      className="text-blue-600 hover:text-blue-800"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredSubjects.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            {searchTerm ? 'No subjects found matching your search' : 'No subjects available'}
          </div>
        )}
      </div>

      {/* View Subject Details Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Subject Details"
      >
        {selectedSubject && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-6 border-b">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <BookOpen className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{selectedSubject.name}</h3>
                  <p className="text-gray-600">{selectedSubject.code}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Type</p>
                <span className={`inline-block px-3 py-1 text-sm rounded-full capitalize mt-1 ${
                  selectedSubject.type === 'core' ? 'bg-blue-100 text-blue-800' :
                  selectedSubject.type === 'elective' ? 'bg-purple-100 text-purple-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {selectedSubject.type}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Credits</p>
                <p className="font-medium text-lg">{selectedSubject.credits}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Passing Marks</p>
                <p className="font-medium text-lg">{selectedSubject.passingMarks}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Marks</p>
                <p className="font-medium text-lg">{selectedSubject.totalMarks}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Pass Percentage</p>
                <p className="font-medium text-lg">
                  {((selectedSubject.passingMarks / selectedSubject.totalMarks) * 100).toFixed(0)}%
                </p>
              </div>
              {selectedSubject.description && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-500 mb-2">Description</p>
                  <p className="font-medium text-gray-700">{selectedSubject.description}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-6 border-t">
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
