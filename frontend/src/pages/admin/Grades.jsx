import { useState, useEffect } from 'react';
import { Search, ArrowUpDown, ArrowUp, ArrowDown, Download, Upload, FileText, X } from 'lucide-react';
import { gradeService } from '../../services/gradeService';
import { classService } from '../../services/classService';
import { subjectService } from '../../services/subjectService';
import { studentService } from '../../services/studentService';
import { Button } from '../../components/ui/button';
import toast from 'react-hot-toast';

const Grades = () => {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedExamType, setSelectedExamType] = useState('');
  const [grades, setGrades] = useState([]);
  const [filteredGrades, setFilteredGrades] = useState([]);
  const [sortedGrades, setSortedGrades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [showBulkEntry, setShowBulkEntry] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    fetchClasses();
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchStudentsByClass();
    }
  }, [selectedClass]);

  useEffect(() => {
    filterGrades();
  }, [grades, selectedExamType]);

  useEffect(() => {
    sortGrades();
  }, [filteredGrades, sortConfig]);

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

  const fetchStudentsByClass = async () => {
    try {
      const response = await studentService.getByClass(selectedClass);
      setStudents(response.data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
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

  const filterGrades = () => {
    let filtered = [...grades];

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
        case 'student':
          aValue = `${a.student?.user?.firstName} ${a.student?.user?.lastName}`.toLowerCase();
          bValue = `${b.student?.user?.firstName} ${b.student?.user?.lastName}`.toLowerCase();
          break;
        case 'subject':
          aValue = a.subject?.name?.toLowerCase() || '';
          bValue = b.subject?.name?.toLowerCase() || '';
          break;
        case 'exam':
          aValue = a.examType?.toLowerCase() || '';
          bValue = b.examType?.toLowerCase() || '';
          break;
        case 'marks':
          aValue = a.obtainedMarks || 0;
          bValue = b.obtainedMarks || 0;
          break;
        case 'grade':
          const gradeOrder = { 'A+': 8, 'A': 7, 'B+': 6, 'B': 5, 'C+': 4, 'C': 3, 'D': 2, 'F': 1 };
          aValue = gradeOrder[a.grade] || 0;
          bValue = gradeOrder[b.grade] || 0;
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

  const handleExport = () => {
    if (!selectedClass) {
      toast.error('Please select a class first');
      return;
    }

    if (sortedGrades.length === 0) {
      toast.error('No grades to export. Please load grades first.');
      return;
    }

    try {
      // Create CSV headers
      const csvHeaders = [
        'Student Name',
        'Class',
        'Subject',
        'Exam Type',
        'Exam Name',
        'Exam Date',
        'Total Marks',
        'Obtained Marks',
        'Percentage',
        'Grade',
        'Remarks'
      ];

      // Create CSV rows from current grades
      const csvRows = sortedGrades.map(grade => {
        const studentName = grade.student?.user 
          ? `${grade.student.user.firstName || ''} ${grade.student.user.lastName || ''}`.trim()
          : 'N/A';
        const className = grade.class 
          ? `${grade.class.name || ''} - ${grade.class.section || ''}`.trim()
          : 'N/A';
        const subjectName = grade.subject?.name || 'N/A';
        const examDate = grade.examDate 
          ? new Date(grade.examDate).toLocaleDateString('en-US')
          : '';
        
        return [
          studentName,
          className,
          subjectName,
          grade.examType || '',
          grade.examName || '',
          examDate,
          grade.totalMarks || '',
          grade.obtainedMarks || '',
          grade.percentage ? `${grade.percentage}` : '',
          grade.grade || '',
          (grade.remarks || '').replace(/"/g, '""') // Escape quotes
        ];
      });

      // Build CSV content
      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `grades-export-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success(`Exported ${sortedGrades.length} grades successfully`);
    } catch (error) {
      console.error('Error exporting grades:', error);
      toast.error('Failed to export grades');
    }
  };

  const handleGenerateReport = async () => {
    if (!selectedClass) {
      toast.error('Please select a class first');
      return;
    }

    try {
      const params = {};
      if (selectedExamType) params.examType = selectedExamType;

      const response = await gradeService.getClassReport(selectedClass, params);
      setReportData(response);
      setShowReport(true);
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report');
    }
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">Grade Management</h1>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setShowBulkEntry(true)} variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Bulk Entry
          </Button>
          <Button onClick={handleExport} variant="outline" size="sm" disabled={!selectedClass}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={handleGenerateReport} variant="outline" size="sm" disabled={!selectedClass}>
            <FileText className="w-4 h-4 mr-2" />
            Report
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 md:p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

          <div>
            <label className="block text-sm font-medium mb-2">Filter by Exam Type</label>
            <select
              value={selectedExamType}
              onChange={(e) => setSelectedExamType(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="">All Exam Types</option>
              <option value="monthly">Monthly</option>
              <option value="chapter">Chapter</option>
              <option value="Midterm">Midterm</option>
              <option value="Final">Final</option>
              <option value="Chapter Exam">Chapter Exam</option>
              <option value="Quiz">Quiz</option>
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
      ) : sortedGrades.length > 0 ? (
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <p className="text-sm text-gray-600">
              Showing <span className="font-semibold">{sortedGrades.length}</span> of <span className="font-semibold">{grades.length}</span> grades
              {selectedExamType && <span className="ml-1">for <span className="font-semibold capitalize">{selectedExamType}</span> exams</span>}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('student')}
                  >
                    Student <SortIcon columnKey="student" />
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('subject')}
                  >
                    Subject <SortIcon columnKey="subject" />
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('exam')}
                  >
                    Exam <SortIcon columnKey="exam" />
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('marks')}
                  >
                    Marks <SortIcon columnKey="marks" />
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('grade')}
                  >
                    Grade <SortIcon columnKey="grade" />
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sortedGrades.map((grade) => (
                  <tr key={grade._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{grade.student?.user?.firstName} {grade.student?.user?.lastName}</td>
                    <td className="px-6 py-4">{grade.subject?.name}</td>
                    <td className="px-6 py-4 capitalize">{grade.examType}</td>
                    <td className="px-6 py-4 font-semibold">{grade.obtainedMarks}/{grade.totalMarks}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full font-semibold ${grade.grade === 'A+' || grade.grade === 'A' ? 'bg-green-100 text-green-800' :
                          grade.grade === 'B+' || grade.grade === 'B' ? 'bg-blue-100 text-blue-800' :
                            grade.grade === 'C+' || grade.grade === 'C' ? 'bg-yellow-100 text-yellow-800' :
                              grade.grade === 'D' ? 'bg-orange-100 text-orange-800' :
                                'bg-red-100 text-red-800'
                        }`}>
                        {grade.grade}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : grades.length > 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          No grades found for the selected exam type
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          Select a class to view grades
        </div>
      )}

      {showBulkEntry && (
        <BulkGradeEntry
          classId={selectedClass}
          students={students}
          subjects={subjects}
          onClose={() => setShowBulkEntry(false)}
          onSuccess={() => {
            setShowBulkEntry(false);
            fetchGrades();
          }}
        />
      )}

      {showReport && reportData && (
        <GradeReport
          data={reportData}
          onClose={() => setShowReport(false)}
        />
      )}
    </div>
  );
};

const BulkGradeEntry = ({ classId, students, subjects, onClose, onSuccess }) => {
  const [bulkGrades, setBulkGrades] = useState([]);
  const [examType, setExamType] = useState('');
  const [examName, setExamName] = useState('');
  const [examDate, setExamDate] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [totalMarks, setTotalMarks] = useState('');
  const [academicYear, setAcademicYear] = useState(new Date().getFullYear().toString());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (students.length > 0) {
      setBulkGrades(students.map(student => ({
        student: student._id,
        studentName: `${student.user?.firstName} ${student.user?.lastName}`,
        obtainedMarks: '',
        remarks: ''
      })));
    }
  }, [students]);

  const handleMarksChange = (studentId, value) => {
    setBulkGrades(prev => prev.map(grade =>
      grade.student === studentId ? { ...grade, obtainedMarks: value } : grade
    ));
  };

  const handleRemarksChange = (studentId, value) => {
    setBulkGrades(prev => prev.map(grade =>
      grade.student === studentId ? { ...grade, remarks: value } : grade
    ));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!examType || !examName || !examDate || !selectedSubject || !totalMarks) {
      toast.error('Please fill all required fields');
      return;
    }

    const gradesToSubmit = bulkGrades
      .filter(g => g.obtainedMarks !== '')
      .map(g => ({
        student: g.student,
        class: classId,
        subject: selectedSubject,
        examType,
        examName,
        examDate,
        totalMarks: parseInt(totalMarks),
        obtainedMarks: parseInt(g.obtainedMarks),
        remarks: g.remarks,
        academicYear
      }));

    if (gradesToSubmit.length === 0) {
      toast.error('Please enter marks for at least one student');
      return;
    }

    setLoading(true);
    try {
      const response = await gradeService.bulkCreate(gradesToSubmit);
      toast.success(`Successfully created ${response.data.created} grades`);
      if (response.data.failed > 0) {
        toast.error(`${response.data.failed} grades failed`);
      }
      onSuccess();
    } catch (error) {
      console.error('Error creating bulk grades:', error);
      toast.error('Failed to create grades');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-4 md:p-6 border-b flex justify-between items-center">
          <h2 className="text-xl md:text-2xl font-bold">Bulk Grade Entry</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Exam Type *</label>
                <select
                  value={examType}
                  onChange={(e) => setExamType(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                >
                  <option value="">Select type</option>
                  <option value="monthly">Monthly</option>
                  <option value="chapter">Chapter</option>
                  <option value="Midterm">Midterm</option>
                  <option value="Final">Final</option>
                  <option value="Quiz">Quiz</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Exam Name *</label>
                <input
                  type="text"
                  value={examName}
                  onChange={(e) => setExamName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Exam Date *</label>
                <input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Subject *</label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                >
                  <option value="">Select subject</option>
                  {subjects.map((subject) => (
                    <option key={subject._id} value={subject._id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Total Marks *</label>
                <input
                  type="number"
                  value={totalMarks}
                  onChange={(e) => setTotalMarks(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Academic Year *</label>
                <input
                  type="text"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Obtained Marks</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {bulkGrades.map((grade) => (
                      <tr key={grade.student}>
                        <td className="px-4 py-3">{grade.studentName}</td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            value={grade.obtainedMarks}
                            onChange={(e) => handleMarksChange(grade.student, e.target.value)}
                            className="w-full px-2 py-1 border rounded"
                            min="0"
                            max={totalMarks || 100}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={grade.remarks}
                            onChange={(e) => handleRemarksChange(grade.student, e.target.value)}
                            className="w-full px-2 py-1 border rounded"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="p-4 md:p-6 border-t flex justify-end gap-2">
            <Button type="button" onClick={onClose} variant="outline">
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Grades'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const GradeReport = ({ data, onClose }) => {
  const { data: grades, stats } = data;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-4 md:p-6 border-b flex justify-between items-center print:hidden">
          <h2 className="text-xl md:text-2xl font-bold">Grade Report</h2>
          <div className="flex gap-2">
            <Button onClick={handlePrint} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Print
            </Button>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Class Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalStudents}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total Exams</p>
                <p className="text-2xl font-bold text-green-600">{stats.totalExams}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Average %</p>
                <p className="text-2xl font-bold text-purple-600">{stats.averagePercentage}%</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Highest Score</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.highestScore}%</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Lowest Score</p>
                <p className="text-2xl font-bold text-red-600">{stats.lowestScore}%</p>
              </div>
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Exam</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Marks</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">%</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {grades.map((grade) => (
                    <tr key={grade._id}>
                      <td className="px-4 py-3">
                        {grade.student?.user?.firstName} {grade.student?.user?.lastName}
                      </td>
                      <td className="px-4 py-3">{grade.subject?.name}</td>
                      <td className="px-4 py-3 capitalize">{grade.examType}</td>
                      <td className="px-4 py-3">{grade.obtainedMarks}/{grade.totalMarks}</td>
                      <td className="px-4 py-3">{grade.percentage}%</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded-full font-semibold ${
                          grade.grade === 'A+' || grade.grade === 'A' ? 'bg-green-100 text-green-800' :
                          grade.grade === 'B+' || grade.grade === 'B' ? 'bg-blue-100 text-blue-800' :
                          grade.grade === 'C+' || grade.grade === 'C' ? 'bg-yellow-100 text-yellow-800' :
                          grade.grade === 'D' ? 'bg-orange-100 text-orange-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {grade.grade}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Grades;
