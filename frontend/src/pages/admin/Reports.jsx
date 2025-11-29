import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { FileText, Download, Filter, Calendar as CalendarIcon, Users, BookOpen, DollarSign, Layers } from 'lucide-react';
import { reportService } from '../../services/reportService';
import { classService } from '../../services/classService';
import { studentService } from '../../services/studentService';
import { subjectService } from '../../services/subjectService';

const Reports = () => {
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('financial');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Data states
    const [classes, setClasses] = useState([]);
    const [students, setStudents] = useState([]);
    const [subjects, setSubjects] = useState([]);

    // Form states
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedStudent, setSelectedStudent] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [academicYear, setAcademicYear] = useState(new Date().getFullYear().toString());
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        const path = location.pathname;
        if (path.includes('financial')) setActiveTab('financial');
        else if (path.includes('attendance')) setActiveTab('attendance');
        else if (path.includes('academic')) setActiveTab('academic');
        else if (path.includes('batch')) setActiveTab('batch');

        fetchInitialData();
    }, [location]);

    const fetchInitialData = async () => {
        try {
            const [classesRes, subjectsRes] = await Promise.all([
                classService.getAll(),
                subjectService.getAll()
            ]);
            // Assuming API returns { success: true, data: [...] } or just the array
            setClasses(classesRes.data || classesRes || []);
            setSubjects(subjectsRes.data || subjectsRes || []);
        } catch (error) {
            console.error('Error fetching initial data:', error);
            setMessage({ type: 'error', text: 'Failed to load dropdown data' });
        }
    };

    // Fetch students when class changes
    useEffect(() => {
        if (selectedClass) {
            fetchStudentsByClass(selectedClass);
        } else {
            setStudents([]);
        }
    }, [selectedClass]);

    const fetchStudentsByClass = async (classId) => {
        try {
            const response = await studentService.getByClass(classId);
            setStudents(response.data || response || []);
        } catch (error) {
            console.error('Error fetching students:', error);
        }
    };

    const handleDownload = async (action, filename) => {
        setLoading(true);
        setMessage({ type: '', text: '' });
        try {
            const blob = await action();
            reportService.triggerDownload(blob, filename);
            setMessage({ type: 'success', text: 'Report generated successfully' });
        } catch (error) {
            console.error('Download error:', error);
            setMessage({ type: 'error', text: 'Failed to generate report' });
        } finally {
            setLoading(false);
        }
    };

    const renderFinancialReports = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Class Fee Report */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg mr-3">
                        <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold">Class Fee Report</h3>
                </div>
                <p className="text-gray-500 text-sm mb-4">Generate a summary of fee payments for an entire class.</p>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Select Class</label>
                        <select
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                        >
                            <option value="">-- Select Class --</option>
                            {classes.map((cls) => (
                                <option key={cls._id} value={cls._id}>{cls.name}</option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={() => handleDownload(
                            () => reportService.downloadClassFeeReport(selectedClass),
                            `class-fee-report.pdf`
                        )}
                        disabled={!selectedClass || loading}
                        className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Download PDF
                    </button>
                </div>
            </div>

            {/* Student Fee Report */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center mb-4">
                    <div className="p-2 bg-green-100 rounded-lg mr-3">
                        <DollarSign className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold">Student Fee Report</h3>
                </div>
                <p className="text-gray-500 text-sm mb-4">Detailed fee statement for a specific student.</p>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Select Class (to filter students)</label>
                        <select
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                        >
                            <option value="">-- Select Class --</option>
                            {classes.map((cls) => (
                                <option key={cls._id} value={cls._id}>{cls.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Select Student</label>
                        <select
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            value={selectedStudent}
                            onChange={(e) => setSelectedStudent(e.target.value)}
                            disabled={!selectedClass}
                        >
                            <option value="">-- Select Student --</option>
                            {students.map((std) => (
                                <option key={std._id} value={std._id}>
                                    {std.user?.firstName} {std.user?.lastName} ({std.rollNumber})
                                </option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={() => handleDownload(
                            () => reportService.downloadStudentFeeReport(selectedStudent),
                            `student-fee-report.pdf`
                        )}
                        disabled={!selectedStudent || loading}
                        className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Download PDF
                    </button>
                </div>
            </div>
        </div>
    );

    const renderAttendanceReports = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 md:col-span-2">
                <div className="flex items-center mb-4">
                    <div className="p-2 bg-purple-100 rounded-lg mr-3">
                        <CalendarIcon className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-semibold">Student Attendance Report</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                        <select
                            className="w-full p-2 border border-gray-300 rounded-md"
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                        >
                            <option value="">-- Select Class --</option>
                            {classes.map((cls) => (
                                <option key={cls._id} value={cls._id}>{cls.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
                        <select
                            className="w-full p-2 border border-gray-300 rounded-md"
                            value={selectedStudent}
                            onChange={(e) => setSelectedStudent(e.target.value)}
                            disabled={!selectedClass}
                        >
                            <option value="">-- Select Student --</option>
                            {students.map((std) => (
                                <option key={std._id} value={std._id}>
                                    {std.user?.firstName} {std.user?.lastName}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                            <input
                                type="date"
                                className="w-full p-2 border border-gray-300 rounded-md"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                            <input
                                type="date"
                                className="w-full p-2 border border-gray-300 rounded-md"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
                <div className="mt-4 flex justify-end">
                    <button
                        onClick={() => handleDownload(
                            () => reportService.downloadStudentAttendanceReport(selectedStudent, { startDate, endDate }),
                            `attendance-report.pdf`
                        )}
                        disabled={!selectedStudent || !startDate || !endDate || loading}
                        className="flex items-center px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-400"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Generate Report
                    </button>
                </div>
            </div>
        </div>
    );

    const renderAcademicReports = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Class Academic Report */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center mb-4">
                    <div className="p-2 bg-orange-100 rounded-lg mr-3">
                        <BookOpen className="w-6 h-6 text-orange-600" />
                    </div>
                    <h3 className="text-lg font-semibold">Class Performance</h3>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                        <select
                            className="w-full p-2 border border-gray-300 rounded-md"
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                        >
                            <option value="">-- Select Class --</option>
                            {classes.map((cls) => (
                                <option key={cls._id} value={cls._id}>{cls.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
                        <input
                            type="text"
                            className="w-full p-2 border border-gray-300 rounded-md"
                            value={academicYear}
                            onChange={(e) => setAcademicYear(e.target.value)}
                            placeholder="e.g. 2024-2025"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleDownload(
                                () => reportService.downloadClassPDF(selectedClass, academicYear),
                                `class-report.pdf`
                            )}
                            disabled={!selectedClass || loading}
                            className="flex-1 flex items-center justify-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:bg-gray-400"
                        >
                            <FileText className="w-4 h-4 mr-2" /> PDF
                        </button>
                        <button
                            onClick={() => handleDownload(
                                () => reportService.downloadClassExcel(selectedClass, { academicYear }),
                                `class-report.xlsx`
                            )}
                            disabled={!selectedClass || loading}
                            className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
                        >
                            <Download className="w-4 h-4 mr-2" /> Excel
                        </button>
                    </div>
                </div>
            </div>

            {/* Student Report Card */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center mb-4">
                    <div className="p-2 bg-indigo-100 rounded-lg mr-3">
                        <GraduationCapIcon className="w-6 h-6 text-indigo-600" />
                    </div>
                    <h3 className="text-lg font-semibold">Student Report Card</h3>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                        <select
                            className="w-full p-2 border border-gray-300 rounded-md"
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                        >
                            <option value="">-- Select Class --</option>
                            {classes.map((cls) => (
                                <option key={cls._id} value={cls._id}>{cls.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
                        <select
                            className="w-full p-2 border border-gray-300 rounded-md"
                            value={selectedStudent}
                            onChange={(e) => setSelectedStudent(e.target.value)}
                            disabled={!selectedClass}
                        >
                            <option value="">-- Select Student --</option>
                            {students.map((std) => (
                                <option key={std._id} value={std._id}>
                                    {std.user?.firstName} {std.user?.lastName}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={() => handleDownload(
                            () => reportService.downloadStudentReportCard(selectedStudent, academicYear),
                            `report-card.pdf`
                        )}
                        disabled={!selectedStudent || loading}
                        className="w-full flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Download Report Card
                    </button>
                </div>
            </div>
        </div>
    );

    const renderBatchReports = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Batch Report Cards */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center mb-4">
                    <div className="p-2 bg-purple-100 rounded-lg mr-3">
                        <Layers className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-semibold">Batch Report Cards</h3>
                </div>
                <p className="text-gray-500 text-sm mb-4">Generate report cards for all students in a class at once.</p>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Select Class</label>
                        <select
                            className="w-full p-2 border border-gray-300 rounded-md"
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                        >
                            <option value="">-- Select Class --</option>
                            {classes.map((cls) => (
                                <option key={cls._id} value={cls._id}>{cls.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
                        <input
                            type="text"
                            className="w-full p-2 border border-gray-300 rounded-md"
                            value={academicYear}
                            onChange={(e) => setAcademicYear(e.target.value)}
                            placeholder="e.g. 2024-2025"
                        />
                    </div>
                    <button
                        onClick={() => handleDownload(
                            () => reportService.downloadBatchReportCards(selectedClass, academicYear),
                            `batch-report-cards-${selectedClass}.pdf`
                        )}
                        disabled={!selectedClass || loading}
                        className="w-full flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-400"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Generate All Report Cards
                    </button>
                </div>
            </div>

            {/* Batch Fee Report */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center mb-4">
                    <div className="p-2 bg-teal-100 rounded-lg mr-3">
                        <DollarSign className="w-6 h-6 text-teal-600" />
                    </div>
                    <h3 className="text-lg font-semibold">Batch Fee Report</h3>
                </div>
                <p className="text-gray-500 text-sm mb-4">Generate fee status report for all students in a class.</p>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Select Class</label>
                        <select
                            className="w-full p-2 border border-gray-300 rounded-md"
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                        >
                            <option value="">-- Select Class --</option>
                            {classes.map((cls) => (
                                <option key={cls._id} value={cls._id}>{cls.name}</option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={() => handleDownload(
                            () => reportService.downloadBatchFeeReport(selectedClass),
                            `batch-fee-report-${selectedClass}.xlsx`
                        )}
                        disabled={!selectedClass || loading}
                        className="w-full flex items-center justify-center px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:bg-gray-400"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Generate Fee Report
                    </button>
                </div>
            </div>
        </div>
    );

    // Helper icon component since GraduationCap is not imported in the main list
    const GraduationCapIcon = ({ className }) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg>
    );

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        {activeTab === 'financial' && 'Financial Reports'}
                        {activeTab === 'attendance' && 'Attendance Reports'}
                        {activeTab === 'academic' && 'Academic Reports'}
                        {activeTab === 'batch' && 'Batch Operations'}
                    </h1>
                    <p className="text-gray-500 mt-1">Generate and download detailed reports</p>
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={() => setActiveTab('financial')}
                        className={`px-4 py-2 rounded-md ${activeTab === 'financial' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}
                    >
                        Financial
                    </button>
                    <button
                        onClick={() => setActiveTab('attendance')}
                        className={`px-4 py-2 rounded-md ${activeTab === 'attendance' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}
                    >
                        Attendance
                    </button>
                    <button
                        onClick={() => setActiveTab('academic')}
                        className={`px-4 py-2 rounded-md ${activeTab === 'academic' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'}`}
                    >
                        Academic
                    </button>
                    <button
                        onClick={() => setActiveTab('batch')}
                        className={`px-4 py-2 rounded-md ${activeTab === 'batch' ? 'bg-teal-100 text-teal-700' : 'bg-gray-100 text-gray-600'}`}
                    >
                        Batch
                    </button>
                </div>
            </div>

            {message.text && (
                <div className={`p-4 rounded-md mb-6 ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                    {message.text}
                </div>
            )}

            {activeTab === 'financial' && renderFinancialReports()}
            {activeTab === 'attendance' && renderAttendanceReports()}
            {activeTab === 'academic' && renderAcademicReports()}
            {activeTab === 'batch' && renderBatchReports()}
        </div>
    );
};

export default Reports;
