import { useState, useEffect } from 'react';
import { Eye, Filter, Download } from 'lucide-react';
import { gradeService } from '../services/gradeService';
import { classService } from '../services/classService';
import { subjectService } from '../services/subjectService';
import { Button } from '../components/ui/button';

const Grades = () => {
  const [grades, setGrades] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Filters
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedExamType, setSelectedExamType] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [academicYear, setAcademicYear] = useState('');

  useEffect(() => {
    fetchClasses();
    fetchSubjects();
    fetchGrades();
  }, []);

  useEffect(() => {
    fetchGrades();
  }, [selectedClass, selectedSubject, selectedExamType, selectedMonth, academicYear]);

  const fetchClasses = async () => {
    try {
      const response = await classService.getAll();
      setClasses(response.data || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
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

  const fetchGrades = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedClass) params.class = selectedClass;
      if (selectedSubject) params.subject = selectedSubject;
      if (selectedExamType) params.examType = selectedExamType;
      if (selectedMonth) params.month = selectedMonth;
      if (academicYear) params.academicYear = academicYear;

      const response = await gradeService.getAll(params);
      setGrades(response.data || []);
    } catch (error) {
      console.error('Error fetching grades:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSelectedClass('');
    setSelectedSubject('');
    setSelectedExamType('');
    setSelectedMonth('');
    setAcademicYear('');
  };

  const getGradeColor = (grade) => {
    switch (grade) {
      case 'A+':
      case 'A':
        return 'bg-green-100 text-green-800';
      case 'B+':
      case 'B':
        return 'bg-blue-100 text-blue-800';
      case 'C+':
      case 'C':
        return 'bg-yellow-100 text-yellow-800';
      case 'D':
        return 'bg-orange-100 text-orange-800';
      case 'F':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Grades</h1>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold">Filters</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="">All Classes</option>
              {classes.map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.name} - {cls.section}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Subject</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="">All Subjects</option>
              {subjects.map((subject) => (
                <option key={subject._id} value={subject._id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Exam Type</label>
            <select
              value={selectedExamType}
              onChange={(e) => setSelectedExamType(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="">All Types</option>
              <option value="monthly">Monthly Exam</option>
              <option value="chapter">Chapter Exam</option>
            </select>
          </div>

          {selectedExamType === 'monthly' && (
            <div>
              <label className="block text-sm font-medium mb-2">Month</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">All Months</option>
                <option value="January">January</option>
                <option value="February">February</option>
                <option value="March">March</option>
                <option value="April">April</option>
                <option value="May">May</option>
                <option value="June">June</option>
                <option value="July">July</option>
                <option value="August">August</option>
                <option value="September">September</option>
                <option value="October">October</option>
                <option value="November">November</option>
                <option value="December">December</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Academic Year</label>
            <input
              type="text"
              placeholder="e.g., 2024-2025"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Button onClick={clearFilters} variant="outline">
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Grades Table */}
      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-2 text-gray-600">Loading grades...</p>
          </div>
        ) : grades.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Exam</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Marks</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {grades.map((grade) => (
                  <tr key={grade._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold text-sm mr-3">
                          {grade.student?.user?.firstName?.[0]}{grade.student?.user?.lastName?.[0]}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {grade.student?.user?.firstName} {grade.student?.user?.lastName}
                          </div>
                          <div className="text-xs text-gray-500">
                            Roll: {grade.student?.rollNumber || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {grade.class?.name} - {grade.class?.section}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {grade.subject?.name}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div>{grade.examName}</div>
                      {grade.examType === 'monthly' && grade.month && (
                        <div className="text-xs text-gray-500">{grade.month}</div>
                      )}
                      {grade.examType === 'chapter' && grade.chapterName && (
                        <div className="text-xs text-gray-500">
                          Ch {grade.chapterNumber ? `${grade.chapterNumber}: ` : ''}{grade.chapterName}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        grade.examType === 'monthly' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-indigo-100 text-indigo-800'
                      }`}>
                        {grade.examType === 'monthly' ? 'Monthly' : 'Chapter'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(grade.examDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {grade.obtainedMarks}/{grade.totalMarks}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 text-xs rounded-full font-semibold ${getGradeColor(grade.grade)}`}>
                        {grade.grade}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {grade.percentage?.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Eye className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>No grades found</p>
            <p className="text-sm mt-2">Try adjusting your filters or add some grades</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Grades;
