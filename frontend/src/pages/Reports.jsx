import { useState, useEffect } from 'react';
import { reportService } from '../services/reportService';
import { classService } from '../services/classService';
import { subjectService } from '../services/subjectService';
import { studentService } from '../services/studentService';

const Reports = () => {
  const [reportType, setReportType] = useState('student');
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form data
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [academicYear, setAcademicYear] = useState(new Date().getFullYear().toString());
  const [examType, setExamType] = useState('');

  useEffect(() => {
    fetchClasses();
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchStudentsByClass(selectedClass);
    }
  }, [selectedClass]);

  const fetchClasses = async () => {
    try {
      const response = await classService.getAll();
      setClasses(response.data || []);
    } catch (err) {
      console.error('Error fetching classes:', err);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await subjectService.getAll();
      setSubjects(response.data || []);
    } catch (err) {
      console.error('Error fetching subjects:', err);
    }
  };

  const fetchStudentsByClass = async (classId) => {
    try {
      const response = await studentService.getByClass(classId);
      setStudents(response.data || []);
    } catch (err) {
      console.error('Error fetching students:', err);
    }
  };

  const handleDownloadStudentPDF = async () => {
    if (!selectedStudent) {
      setError('Please select a student');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const blob = await reportService.downloadStudentReportCard(selectedStudent, academicYear);
      reportService.triggerDownload(blob, `student-report-card.pdf`);
      setSuccess('Report downloaded successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Error downloading report');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadStudentExcel = async () => {
    if (!selectedStudent) {
      setError('Please select a student');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const blob = await reportService.downloadStudentExcel(selectedStudent, academicYear);
      reportService.triggerDownload(blob, `student-report.xlsx`);
      setSuccess('Report downloaded successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Error downloading report');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadClassPDF = async () => {
    if (!selectedClass) {
      setError('Please select a class');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const blob = await reportService.downloadClassPDF(selectedClass, academicYear);
      reportService.triggerDownload(blob, `class-report.pdf`);
      setSuccess('Report downloaded successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Error downloading report');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadClassExcel = async () => {
    if (!selectedClass) {
      setError('Please select a class');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const filters = {};
      if (selectedSubject) filters.subject = selectedSubject;
      if (examType) filters.examType = examType;
      if (academicYear) filters.academicYear = academicYear;

      const blob = await reportService.downloadClassExcel(selectedClass, filters);
      reportService.triggerDownload(blob, `class-report.xlsx`);
      setSuccess('Report downloaded successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Error downloading report');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadSubjectReport = async () => {
    if (!selectedSubject) {
      setError('Please select a subject');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const filters = {};
      if (selectedClass) filters.classId = selectedClass;
      if (academicYear) filters.academicYear = academicYear;

      const blob = await reportService.downloadSubjectReport(selectedSubject, filters);
      reportService.triggerDownload(blob, `subject-report.pdf`);
      setSuccess('Report downloaded successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Error downloading report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Grade Reports</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      {/* Report Type Selection */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Select Report Type</h2>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => setReportType('student')}
            className={`px-6 py-3 rounded-lg font-medium transition ${
              reportType === 'student'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Student Report
          </button>
          <button
            onClick={() => setReportType('class')}
            className={`px-6 py-3 rounded-lg font-medium transition ${
              reportType === 'class'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Class Report
          </button>
          <button
            onClick={() => setReportType('subject')}
            className={`px-6 py-3 rounded-lg font-medium transition ${
              reportType === 'subject'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Subject Report
          </button>
        </div>
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Enhanced Excel Reports:</strong> All Excel reports now include color-coded performance indicators, 
            detailed summaries, and professional formatting for better analysis.
          </p>
        </div>
      </div>

      {/* Student Report */}
      {reportType === 'student' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Student Performance Report</h2>
          <p className="text-gray-600 mb-4">
            Generate comprehensive grade reports with color-coded performance indicators, subject-wise analysis, and detailed summaries.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Class
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Class</option>
                {classes.map((cls) => (
                  <option key={cls._id} value={cls._id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Student
              </label>
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!selectedClass}
              >
                <option value="">Select Student</option>
                {students.map((student) => (
                  <option key={student._id} value={student._id}>
                    {student.user.firstName} {student.user.lastName} - {student.rollNumber}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Academic Year (Optional)
              </label>
              <input
                type="text"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                placeholder="e.g., 2024-2025"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg mb-4">
            <h3 className="font-semibold text-sm text-gray-700 mb-2">Excel Report Features:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✓ Color-coded performance (Green: 90%+, Yellow: 75-89%, Orange: 60-74%, Red: Below 60%)</li>
              <li>✓ Subject-wise average calculations</li>
              <li>✓ Overall performance summary with pass rate</li>
              <li>✓ Professional formatting with borders and spacing</li>
            </ul>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleDownloadStudentPDF}
              disabled={loading || !selectedStudent}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
            >
              {loading ? 'Generating...' : 'Download PDF Report Card'}
            </button>
            <button
              onClick={handleDownloadStudentExcel}
              disabled={loading || !selectedStudent}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
            >
              {loading ? 'Generating...' : 'Download Enhanced Excel Report'}
            </button>
          </div>
        </div>
      )}

      {/* Class Report */}
      {reportType === 'class' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Class Performance Report</h2>
          <p className="text-gray-600 mb-4">
            Generate class-wide grade reports with alternating row colors, performance statistics, and comprehensive summaries.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Class
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Class</option>
                {classes.map((cls) => (
                  <option key={cls._id} value={cls._id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject (Optional)
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Exam Type (Optional)
              </label>
              <select
                value={examType}
                onChange={(e) => setExamType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                <option value="monthly">Monthly</option>
                <option value="chapter">Chapter</option>
                <option value="midterm">Midterm</option>
                <option value="final">Final</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Academic Year (Optional)
              </label>
              <input
                type="text"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                placeholder="e.g., 2024-2025"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-teal-50 p-4 rounded-lg mb-4">
            <h3 className="font-semibold text-sm text-gray-700 mb-2">Excel Report Includes:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✓ Professional header with class and academic year information</li>
              <li>✓ Alternating row colors for easy reading</li>
              <li>✓ Color-coded percentage cells based on performance</li>
              <li>✓ Summary statistics: Average, Highest, Lowest scores, Pass rate</li>
              <li>✓ Total students and exam count</li>
            </ul>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleDownloadClassPDF}
              disabled={loading || !selectedClass}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
            >
              {loading ? 'Generating...' : 'Download PDF Report'}
            </button>
            <button
              onClick={handleDownloadClassExcel}
              disabled={loading || !selectedClass}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
            >
              {loading ? 'Generating...' : 'Download Enhanced Excel Report'}
            </button>
          </div>
        </div>
      )}

      {/* Subject Report */}
      {reportType === 'subject' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Subject Performance Report</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Subject</option>
                {subjects.map((subject) => (
                  <option key={subject._id} value={subject._id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Class (Optional)
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Classes</option>
                {classes.map((cls) => (
                  <option key={cls._id} value={cls._id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Academic Year (Optional)
              </label>
              <input
                type="text"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                placeholder="e.g., 2023-2024"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleDownloadSubjectReport}
              disabled={loading || !selectedSubject}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
            >
              {loading ? 'Generating...' : 'Download PDF Report'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
