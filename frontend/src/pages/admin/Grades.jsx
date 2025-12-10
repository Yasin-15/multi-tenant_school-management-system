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
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'class-organized'
  const [organizedGrades, setOrganizedGrades] = useState({});

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

  const fetchGrades = async (organizeByClass = false) => {
    if (!selectedClass && !organizeByClass) return;

    setLoading(true);
    try {
      const params = organizeByClass ? { organizeByClass: 'true' } : { class: selectedClass };
      if (selectedExamType) params.examType = selectedExamType;
      
      const response = await gradeService.getAll(params);
      
      if (response.organizedByClass) {
        setOrganizedGrades(response.data || {});
        setGrades([]);
      } else {
        setGrades(response.data || []);
        setOrganizedGrades({});
      }
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

  const handleExport = async (separateBySubject = false) => {
    if (!selectedClass) {
      toast.error('Please select a class first');
      return;
    }

    if (sortedGrades.length === 0) {
      toast.error('No grades to export. Please load grades first.');
      return;
    }

    try {
      const params = {
        class: selectedClass,
        separateBySubject: separateBySubject.toString()
      };
      
      if (selectedExamType) params.examType = selectedExamType;

      const response = await gradeService.export(params);
      
      if (response.success) {
        if (response.type === 'subject-separated') {
          // Handle multiple CSV files (one per subject)
          const csvFiles = response.data;
          const subjects = Object.keys(csvFiles);
          
          if (subjects.length === 1) {
            // Single subject - download directly
            const subjectName = subjects[0];
            const csvContent = csvFiles[subjectName];
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${subjectName}-grades-${Date.now()}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
          } else {
            // Multiple subjects - download each separately
            subjects.forEach((subjectName, index) => {
              setTimeout(() => {
                const csvContent = csvFiles[subjectName];
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `${subjectName}-grades-${Date.now()}.csv`);
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(url);
              }, index * 500); // Stagger downloads
            });
          }
          
          toast.success(`Exported grades for ${subjects.length} subject(s) successfully`);
        } else {
          // Handle single CSV file
          const csvContent = response.data;
          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', response.filename);
          document.body.appendChild(link);
          link.click();
          link.remove();
          window.URL.revokeObjectURL(url);
          
          toast.success(`Exported ${sortedGrades.length} grades successfully`);
        }
      }
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
          <div className="relative group">
            <Button onClick={() => handleExport(false)} variant="outline" size="sm" disabled={!selectedClass}>
              <Download className="w-4 h-4 mr-2" />
              Export All
            </Button>
          </div>
          <Button onClick={() => handleExport(true)} variant="outline" size="sm" disabled={!selectedClass}>
            <Download className="w-4 h-4 mr-2" />
            Export by Subject
          </Button>
          <Button onClick={handleGenerateReport} variant="outline" size="sm" disabled={!selectedClass}>
            <FileText className="w-4 h-4 mr-2" />
            Report
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 md:p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Select Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

          <div>
            <label className="block text-sm font-medium mb-2">View Mode</label>
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="list">List View</option>
              <option value="class-organized">Organized by Class</option>
            </select>
          </div>

          <div className="flex items-end">
            <Button 
              onClick={() => fetchGrades(viewMode === 'class-organized')} 
              className="w-full"
            >
              <Search className="w-4 h-4 mr-2" />
              View Grades
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading grades...</span>
        </div>
      ) : viewMode === 'class-organized' && Object.keys(organizedGrades).length > 0 ? (
        <ClassOrganizedView grades={organizedGrades} />
      ) : sortedGrades.length > 0 ? (
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b bg-gray-50">
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
                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('student')}
                  >
                    Student <SortIcon columnKey="student" />
                  </th>
                  <th
                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('subject')}
                  >
                    Subject <SortIcon columnKey="subject" />
                  </th>
                  <th
                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('exam')}
                  >
                    Exam <SortIcon columnKey="exam" />
                  </th>
                  <th
                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('marks')}
                  >
                    Marks <SortIcon columnKey="marks" />
                  </th>
                  <th
                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('grade')}
                  >
                    Grade <SortIcon columnKey="grade" />
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedGrades.map((grade) => (
                  <tr key={grade._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {grade.student?.user?.firstName} {grade.student?.user?.lastName}
                      </div>
                      {grade.student?.rollNumber && (
                        <div className="text-sm text-gray-500">Roll: {grade.student.rollNumber}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{grade.subject?.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 capitalize">{grade.examType}</div>
                      <div className="text-sm text-gray-500">{grade.examName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">{grade.obtainedMarks}/{grade.totalMarks}</div>
                      <div className="text-sm text-gray-500">{grade.percentage}%</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
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
      ) : grades.length > 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          <div className="text-gray-400 mb-2">📊</div>
          <p>No grades found for the selected exam type</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          <div className="text-gray-400 mb-2">📚</div>
          <p>Select a class and view mode to see grades</p>
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

const ClassOrganizedView = ({ grades }) => {
  const [expandedClasses, setExpandedClasses] = useState({});
  const [expandedStudents, setExpandedStudents] = useState({});

  const toggleClass = (classKey) => {
    setExpandedClasses(prev => ({
      ...prev,
      [classKey]: !prev[classKey]
    }));
  };

  const toggleStudent = (classKey, studentId) => {
    const key = `${classKey}-${studentId}`;
    setExpandedStudents(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="space-y-6">
      {Object.entries(grades).map(([classKey, classData]) => (
        <div key={classKey} className="bg-white rounded-lg shadow-sm border">
          <div 
            className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b cursor-pointer hover:from-blue-100 hover:to-indigo-100 transition-colors"
            onClick={() => toggleClass(classKey)}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {classData.classInfo?.name} - {classData.classInfo?.section}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {classData.stats.totalStudents} students • {classData.stats.totalGrades} grades • 
                  Avg: {classData.stats.averagePercentage}%
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{classData.subjects.length} Subjects</div>
                  <div className="text-xs text-gray-500">{classData.subjects.join(', ')}</div>
                </div>
                <div className={`transform transition-transform ${expandedClasses[classKey] ? 'rotate-180' : ''}`}>
                  <ArrowDown className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {expandedClasses[classKey] && (
            <div className="p-4">
              <div className="space-y-4">
                {classData.studentsArray.map((studentData) => (
                  <div key={studentData.student._id} className="border rounded-lg">
                    <div 
                      className="p-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => toggleStudent(classKey, studentData.student._id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {studentData.student.user?.firstName} {studentData.student.user?.lastName}
                          </h4>
                          {studentData.student.rollNumber && (
                            <p className="text-sm text-gray-500">Roll: {studentData.student.rollNumber}</p>
                          )}
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900">
                              {studentData.grades.length} grades
                            </div>
                            <div className="text-xs text-gray-500">
                              Avg: {studentData.grades.length > 0 
                                ? (studentData.grades.reduce((sum, g) => sum + (g.percentage || 0), 0) / studentData.grades.length).toFixed(1)
                                : 0}%
                            </div>
                          </div>
                          <div className={`transform transition-transform ${expandedStudents[`${classKey}-${studentData.student._id}`] ? 'rotate-180' : ''}`}>
                            <ArrowDown className="w-4 h-4 text-gray-400" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {expandedStudents[`${classKey}-${studentData.student._id}`] && (
                      <div className="p-3 border-t">
                        {/* Subject-wise grades */}
                        <div className="space-y-3">
                          {Object.entries(studentData.subjectGrades).map(([subjectName, subjectGrades]) => (
                            <div key={subjectName} className="bg-white border rounded p-3">
                              <h5 className="font-medium text-gray-800 mb-2">{subjectName}</h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                {subjectGrades.map((grade) => (
                                  <div key={grade._id} className="bg-gray-50 rounded p-2">
                                    <div className="flex justify-between items-center">
                                      <div>
                                        <div className="text-sm font-medium capitalize">{grade.examType}</div>
                                        <div className="text-xs text-gray-500">{grade.examName}</div>
                                      </div>
                                      <div className="text-right">
                                        <div className="text-sm font-semibold">{grade.obtainedMarks}/{grade.totalMarks}</div>
                                        <span className={`inline-flex px-1.5 py-0.5 text-xs font-semibold rounded ${
                                          grade.grade === 'A+' || grade.grade === 'A' ? 'bg-green-100 text-green-800' :
                                          grade.grade === 'B+' || grade.grade === 'B' ? 'bg-blue-100 text-blue-800' :
                                          grade.grade === 'C+' || grade.grade === 'C' ? 'bg-yellow-100 text-yellow-800' :
                                          grade.grade === 'D' ? 'bg-orange-100 text-orange-800' :
                                          'bg-red-100 text-red-800'
                                        }`}>
                                          {grade.grade}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
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
      <div className="bg-white rounded-xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Bulk Grade Entry</h2>
              <p className="text-blue-100 mt-1">Enter grades for multiple students at once</p>
            </div>
            <button 
              onClick={onClose} 
              className="text-blue-100 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          {/* Exam Details Section */}
          <div className="p-6 bg-gray-50 border-b">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Exam Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Exam Type *</label>
                <select
                  value={examType}
                  onChange={(e) => setExamType(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                >
                  <option value="">Select exam type</option>
                  <option value="monthly">Monthly Exam</option>
                  <option value="chapter">Chapter Test</option>
                  <option value="Midterm">Midterm Exam</option>
                  <option value="Final">Final Exam</option>
                  <option value="Quiz">Quiz</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Exam Name *</label>
                <input
                  type="text"
                  value={examName}
                  onChange={(e) => setExamName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="e.g., Mathematics Monthly Test"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Exam Date *</label>
                <input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Subject *</label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Total Marks *</label>
                <input
                  type="number"
                  value={totalMarks}
                  onChange={(e) => setTotalMarks(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="100"
                  required
                  min="1"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Academic Year *</label>
                <input
                  type="text"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="2024"
                  required
                />
              </div>
            </div>
          </div>

          {/* Student Grades Section */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Student Grades</h3>
              <div className="text-sm text-gray-500">
                {bulkGrades.filter(g => g.obtainedMarks !== '').length} of {bulkGrades.length} students have grades entered
              </div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Student Name
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Obtained Marks
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Percentage
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Remarks
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {bulkGrades.map((grade, index) => {
                      const percentage = totalMarks && grade.obtainedMarks 
                        ? ((parseFloat(grade.obtainedMarks) / parseFloat(totalMarks)) * 100).toFixed(1)
                        : '';
                      
                      return (
                        <tr key={grade.student} className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900">{grade.studentName}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <input
                                type="number"
                                value={grade.obtainedMarks}
                                onChange={(e) => handleMarksChange(grade.student, e.target.value)}
                                className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-center"
                                min="0"
                                max={totalMarks || 100}
                                placeholder="0"
                              />
                              <span className="text-gray-500">/ {totalMarks || '100'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {percentage && (
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                parseFloat(percentage) >= 90 ? 'bg-green-100 text-green-800' :
                                parseFloat(percentage) >= 80 ? 'bg-blue-100 text-blue-800' :
                                parseFloat(percentage) >= 70 ? 'bg-yellow-100 text-yellow-800' :
                                parseFloat(percentage) >= 60 ? 'bg-orange-100 text-orange-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {percentage}%
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <input
                              type="text"
                              value={grade.remarks}
                              onChange={(e) => handleRemarksChange(grade.student, e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                              placeholder="Optional remarks"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 bg-gray-50 border-t flex justify-between items-center">
            <div className="text-sm text-gray-600">
              <span className="font-medium">
                {bulkGrades.filter(g => g.obtainedMarks !== '').length}
              </span> students ready to save
            </div>
            <div className="flex gap-3">
              <Button 
                type="button" 
                onClick={onClose} 
                variant="outline"
                className="px-6 py-2"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading || bulkGrades.filter(g => g.obtainedMarks !== '').length === 0}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </div>
                ) : (
                  `Save ${bulkGrades.filter(g => g.obtainedMarks !== '').length} Grades`
                )}
              </Button>
            </div>
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
