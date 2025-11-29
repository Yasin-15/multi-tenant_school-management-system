import { useState } from 'react';
import { reportService } from '../services/reportService';

const ReportDownloadButton = ({ 
  type, // 'student', 'class', or 'subject'
  id, // studentId, classId, or subjectId
  format = 'pdf', // 'pdf' or 'excel'
  filters = {}, // additional filters like academicYear, examType, etc.
  label, // custom button label
  className = '', // custom styling
  size = 'md' // 'sm', 'md', 'lg'
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  const formatColors = {
    pdf: 'bg-red-600 hover:bg-red-700',
    excel: 'bg-green-600 hover:bg-green-700'
  };

  const getDefaultLabel = () => {
    if (label) return label;
    const formatLabel = format.toUpperCase();
    return `Download ${formatLabel}`;
  };

  const handleDownload = async () => {
    if (!id) {
      setError('Invalid ID provided');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let blob;
      let filename;

      switch (type) {
        case 'student':
          if (format === 'pdf') {
            blob = await reportService.downloadStudentReportCard(id, filters.academicYear);
            filename = 'student-report-card.pdf';
          } else {
            blob = await reportService.downloadStudentExcel(id, filters.academicYear);
            filename = 'student-report.xlsx';
          }
          break;

        case 'class':
          if (format === 'pdf') {
            blob = await reportService.downloadClassPDF(id, filters.academicYear);
            filename = 'class-report.pdf';
          } else {
            blob = await reportService.downloadClassExcel(id, filters);
            filename = 'class-report.xlsx';
          }
          break;

        case 'subject':
          blob = await reportService.downloadSubjectReport(id, filters);
          filename = 'subject-report.pdf';
          break;

        default:
          throw new Error('Invalid report type');
      }

      reportService.triggerDownload(blob, filename);
    } catch (err) {
      console.error('Download error:', err);
      setError(err.response?.data?.message || 'Error downloading report');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="inline-block">
      <button
        onClick={handleDownload}
        disabled={loading}
        className={`
          ${sizeClasses[size]}
          ${formatColors[format]}
          text-white rounded-lg font-medium
          disabled:bg-gray-400 disabled:cursor-not-allowed
          transition-colors duration-200
          flex items-center gap-2
          ${className}
        `}
        title={error || getDefaultLabel()}
      >
        {loading ? (
          <>
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Generating...</span>
          </>
        ) : (
          <>
            {format === 'pdf' ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            )}
            <span>{getDefaultLabel()}</span>
          </>
        )}
      </button>
      {error && (
        <div className="absolute mt-1 text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
          {error}
        </div>
      )}
    </div>
  );
};

export default ReportDownloadButton;
