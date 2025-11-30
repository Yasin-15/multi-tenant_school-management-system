import { useState, useEffect } from 'react';
import { Award, TrendingUp, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { gradeService } from '../../services/gradeService';
import { Select } from '../../components/ui/select';

const MyGrades = () => {
  const [grades, setGrades] = useState([]);
  const [filteredGrades, setFilteredGrades] = useState([]);
  const [sortedGrades, setSortedGrades] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedExamType, setSelectedExamType] = useState('');
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [stats, setStats] = useState({
    average: 0,
    highest: 0,
    lowest: 0,
  });

  useEffect(() => {
    fetchGrades();
  }, []);

  useEffect(() => {
    filterGrades();
  }, [selectedSubject, selectedExamType, grades]);

  useEffect(() => {
    sortGrades();
  }, [filteredGrades, sortConfig]);

  const fetchGrades = async () => {
    try {
      const response = await gradeService.getMyGrades();
      const gradesData = response.data || [];
      setGrades(gradesData);

      // Extract unique subjects
      const uniqueSubjects = [...new Set(gradesData.map(g => g.subject?.name))].filter(Boolean);
      setSubjects(uniqueSubjects);

      // Calculate stats using obtainedMarks
      if (gradesData.length > 0) {
        const percentages = gradesData.map(g => (g.obtainedMarks / g.totalMarks) * 100);
        setStats({
          average: (percentages.reduce((a, b) => a + b, 0) / percentages.length).toFixed(1),
          highest: Math.max(...percentages).toFixed(1),
          lowest: Math.min(...percentages).toFixed(1),
        });
      }
    } catch (error) {
      console.error('Error fetching grades:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterGrades = () => {
    let filtered = [...grades];

    if (selectedSubject) {
      filtered = filtered.filter(g => g.subject?.name === selectedSubject);
    }

    if (selectedExamType) {
      filtered = filtered.filter(g => g.examType === selectedExamType);
    }

    setFilteredGrades(filtered);
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortGrades = () => {
    if (!sortConfig.key) {
      setSortedGrades([...filteredGrades]);
      return;
    }

    const sorted = [...filteredGrades].sort((a, b) => {
      let aValue, bValue;

      switch (sortConfig.key) {
        case 'subject':
          aValue = a.subject?.name?.toLowerCase() || '';
          bValue = b.subject?.name?.toLowerCase() || '';
          break;
        case 'examType':
          aValue = a.examType?.toLowerCase() || '';
          bValue = b.examType?.toLowerCase() || '';
          break;
        case 'marks':
          aValue = a.obtainedMarks || 0;
          bValue = b.obtainedMarks || 0;
          break;
        case 'percentage':
          aValue = (a.obtainedMarks / a.totalMarks) * 100;
          bValue = (b.obtainedMarks / b.totalMarks) * 100;
          break;
        case 'grade':
          const gradeOrder = { 'A+': 8, 'A': 7, 'B+': 6, 'B': 5, 'C+': 4, 'C': 3, 'D': 2, 'F': 1 };
          aValue = gradeOrder[a.grade] || 0;
          bValue = gradeOrder[b.grade] || 0;
          break;
        case 'date':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    setSortedGrades(sorted);
  };

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) {
      return <ArrowUpDown className="w-4 h-4 ml-1 inline opacity-30" />;
    }
    return sortConfig.direction === 'asc'
      ? <ArrowUp className="w-4 h-4 ml-1 inline" />
      : <ArrowDown className="w-4 h-4 ml-1 inline" />;
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">My Grades</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Average Score</p>
              <p className="text-3xl font-bold mt-2">{stats.average}%</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Highest Score</p>
              <p className="text-3xl font-bold mt-2">{stats.highest}%</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Award className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Lowest Score</p>
              <p className="text-3xl font-bold mt-2">{stats.lowest}%</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <Award className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Filter by Subject</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="">All Subjects</option>
              {subjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Filter by Exam Type</label>
            <select
              value={selectedExamType}
              onChange={(e) => setSelectedExamType(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="">All Exam Types</option>
              <option value="Midterm">Midterm</option>
              <option value="Final">Final</option>
              <option value="Chapter Exam">Chapter Exam</option>
              <option value="Quiz">Quiz</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        </div>
        {(selectedSubject || selectedExamType) && (
          <div className="mt-3 pt-3 border-t">
            <p className="text-sm text-gray-600">
              Showing <span className="font-semibold">{sortedGrades.length}</span> of <span className="font-semibold">{grades.length}</span> grades
            </p>
          </div>
        )}
      </div>

      {/* Grades Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('subject')}
                >
                  Subject <SortIcon columnKey="subject" />
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('examType')}
                >
                  Exam Type <SortIcon columnKey="examType" />
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('marks')}
                >
                  Marks <SortIcon columnKey="marks" />
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('percentage')}
                >
                  Percentage <SortIcon columnKey="percentage" />
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('grade')}
                >
                  Grade <SortIcon columnKey="grade" />
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('date')}
                >
                  Date <SortIcon columnKey="date" />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedGrades.map((grade) => {
                const percentage = ((grade.obtainedMarks / grade.totalMarks) * 100).toFixed(1);
                return (
                  <tr key={grade._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium">
                      {grade.subject?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap capitalize">
                      {grade.examType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-semibold">
                      {grade.obtainedMarks}/{grade.totalMarks}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {percentage}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 text-xs rounded-full font-semibold ${grade.grade === 'A+' || grade.grade === 'A' ? 'bg-green-100 text-green-800' :
                        grade.grade === 'B' || grade.grade === 'C' ? 'bg-blue-100 text-blue-800' :
                          grade.grade === 'D' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                        }`}>
                        {grade.grade}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(grade.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {grade.remarks || '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {sortedGrades.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No grades found
          </div>
        )}
      </div>
    </div>
  );
};

export default MyGrades;
