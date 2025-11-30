import React, { useState, useEffect } from 'react';
import examService from '../../services/examService';
import { classService } from '../../services/classService';
import { Search } from 'lucide-react';

const ExamResults = () => {
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [exams, setExams] = useState([]);
    const [selectedExam, setSelectedExam] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchClasses();
    }, []);

    useEffect(() => {
        if (selectedClass) {
            fetchExams();
        } else {
            setExams([]);
            setResults([]);
            setSelectedExam('');
        }
    }, [selectedClass]);

    const fetchClasses = async () => {
        try {
            const res = await classService.getAll();
            setClasses(res.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchExams = async () => {
        try {
            const res = await examService.getExams({ classId: selectedClass });
            setExams(res || []);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchResults = async () => {
        if (!selectedExam) return;
        setLoading(true);
        try {
            const res = await examService.getResults({ examId: selectedExam });
            setResults(res || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">Exam Results</h1>

            <div className="bg-white p-6 rounded-lg shadow mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Class</label>
                        <select
                            className="w-full p-2 border rounded"
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                        >
                            <option value="">Select Class</option>
                            {classes.map(c => <option key={c._id} value={c._id}>{c.name} - {c.section}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Exam</label>
                        <select
                            className="w-full p-2 border rounded"
                            value={selectedExam}
                            onChange={(e) => setSelectedExam(e.target.value)}
                            disabled={!selectedClass}
                        >
                            <option value="">Select Exam</option>
                            {exams.map(e => <option key={e._id} value={e._id}>{e.title} ({e.examType})</option>)}
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={fetchResults}
                            disabled={!selectedExam}
                            className="bg-blue-600 text-white px-4 py-2 rounded w-full flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-blue-700 transition-colors"
                        >
                            <Search size={18} /> View Results
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Percentage</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan="4" className="p-4 text-center">Loading...</td></tr>
                        ) : results.length === 0 ? (
                            <tr><td colSpan="4" className="p-4 text-center text-gray-500">No results found</td></tr>
                        ) : (
                            results.map(r => (
                                <tr key={r._id}>
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        {r.student?.name || 'Unknown'}
                                        <span className="text-gray-500 text-sm ml-2">({r.student?.admissionNumber})</span>
                                    </td>
                                    <td className="px-6 py-4">{r.score} / {r.totalMarks}</td>
                                    <td className="px-6 py-4">{r.percentage?.toFixed(2)}%</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${r.percentage >= 50 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {r.percentage >= 50 ? 'Pass' : 'Fail'}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ExamResults;
