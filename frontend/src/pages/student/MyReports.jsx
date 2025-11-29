import { useState, useEffect } from 'react';
import { reportService } from '../../services/reportService';
import { useAuth } from '../../context/AuthContext';

const MyReports = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [academicYear, setAcademicYear] = useState('');

  const studentId = user?.student?._id;

  const handleDownloadPDF = async () => {
    if (!studentId) {
      setError('Student information not found');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const blob = await reportService.downloadStudentReportCard(studentId, academicYear);
      reportService.triggerDownload(blob, `my-report-card.pdf`);
      setSuccess('Report card downloaded successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Error downloading report card');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadExcel = async () => {
    if (!studentId) {
      setError('Student information not found');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const blob = await reportService.downloadStudentExcel(studentId, academicYear);
      reportService.triggerDownload(blob, `my-performance-report.xlsx`);
      setSuccess('Performance report downloaded successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Error downloading report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Reports</h1>

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

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Download Your Performance Reports</h2>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Academic Year (Optional)
          </label>
          <input
            type="text"
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            placeholder="e.g., 2023-2024 (leave empty for all years)"
            className="w-full md:w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-sm text-gray-500 mt-1">
            Leave empty to download reports for all academic years
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <svg
                className="w-12 h-12 text-red-600 mr-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              <div>
                <h3 className="text-lg font-semibold">PDF Report Card</h3>
                <p className="text-sm text-gray-600">
                  Comprehensive report card with all grades
                </p>
              </div>
            </div>
            <button
              onClick={handleDownloadPDF}
              disabled={loading}
              className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
            >
              {loading ? 'Generating...' : 'Download PDF'}
            </button>
          </div>

          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <svg
                className="w-12 h-12 text-green-600 mr-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <div>
                <h3 className="text-lg font-semibold">Excel Report</h3>
                <p className="text-sm text-gray-600">
                  Detailed performance data in spreadsheet format
                </p>
              </div>
            </div>
            <button
              onClick={handleDownloadExcel}
              disabled={loading}
              className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
            >
              {loading ? 'Generating...' : 'Download Excel'}
            </button>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">Report Information</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• PDF Report Card: A formatted document with your complete academic performance</li>
            <li>• Excel Report: Detailed data that you can analyze and filter in spreadsheet software</li>
            <li>• Both reports include all your exam scores, percentages, and grades</li>
            <li>• Filter by academic year to get specific period reports</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MyReports;
