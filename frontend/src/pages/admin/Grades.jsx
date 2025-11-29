import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { gradeService } from '../../services/gradeService';
import { classService } from '../../services/classService';
import { Button } from '../../components/ui/button';

const Grades = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await classService.getAll();
      setClasses(response.data || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchGrades = async () => {
    if (!selectedClass) return;
    
    setLoading(true);
    try {
      const response = await gradeService.getByClass(selectedClass);
      setGrades(response.data || []);
    } catch (error) {
      console.error('Error fetching grades:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Grade Management</h1>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Select Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="">Choose a class</option>
              {classes.map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.name} - {cls.section}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <Button onClick={fetchGrades} className="w-full">
              <Search className="w-4 h-4 mr-2" />
              View Grades
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : grades.length > 0 ? (
        <div className="bg-white rounded-lg shadow">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Exam</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Marks</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {grades.map((grade) => (
                  <tr key={grade._id}>
                    <td className="px-6 py-4">{grade.student?.user?.firstName} {grade.student?.user?.lastName}</td>
                    <td className="px-6 py-4">{grade.subject?.name}</td>
                    <td className="px-6 py-4">{grade.examType}</td>
                    <td className="px-6 py-4">{grade.marksObtained}/{grade.totalMarks}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                        {grade.grade}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          Select a class to view grades
        </div>
      )}
    </div>
  );
};

export default Grades;
