import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import examService from '../../services/examService';
import { Clock, CheckCircle, AlertCircle } from 'lucide-react';

const StudentExamList = () => {
    const navigate = useNavigate();
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchExams();
    }, []);

    const fetchExams = async () => {
        try {
            const data = await examService.getExams();
            setExams(data);
        } catch (error) {
            console.error('Error fetching exams:', error);
        } finally {
            setLoading(false);
        }
    };

    const getExamStatus = (exam) => {
        const now = new Date();
        const start = new Date(exam.startTime);
        const end = new Date(exam.endTime);

        if (now < start) return 'upcoming';
        if (now > end) return 'expired';
        return 'active';
    };

    if (loading) return <div className="p-6">Loading...</div>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">My Exams</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {exams.map((exam) => {
                    const status = getExamStatus(exam);

                    return (
                        <div key={exam._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800">{exam.title}</h3>
                                    <p className="text-sm text-gray-500">{exam.subject?.name}</p>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${status === 'active' ? 'bg-green-100 text-green-700' :
                                        status === 'upcoming' ? 'bg-blue-100 text-blue-700' :
                                            'bg-gray-100 text-gray-700'
                                    }`}>
                                    {status.toUpperCase()}
                                </span>
                            </div>

                            <div className="space-y-3 mb-6">
                                <div className="flex items-center text-sm text-gray-600">
                                    <Clock size={16} className="mr-2" />
                                    <span>{exam.duration} minutes</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                    <AlertCircle size={16} className="mr-2" />
                                    <span>Starts: {new Date(exam.startTime).toLocaleString()}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => navigate(`/student/exams/${exam._id}/take`)}
                                disabled={status !== 'active'}
                                className={`w-full py-2 rounded-lg font-medium transition-colors ${status === 'active'
                                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                {status === 'active' ? 'Start Exam' :
                                    status === 'upcoming' ? 'Not Started' : 'Expired'}
                            </button>
                        </div>
                    );
                })}
            </div>

            {exams.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                    No exams scheduled at the moment.
                </div>
            )}
        </div>
    );
};

export default StudentExamList;
