import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import examService from '../../services/examService';
import { Plus, Calendar, Clock, FileText } from 'lucide-react';

const ExamList = () => {
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

    if (loading) return <div className="p-6">Loading...</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Online Exams</h1>
                <Link
                    to="/admin/exams/create"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
                >
                    <Plus size={20} />
                    Create Exam
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {exams.map((exam) => (
                    <div key={exam._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800">{exam.title}</h3>
                                <p className="text-sm text-gray-500">{exam.subject?.name} • {exam.class?.name}</p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs ${new Date(exam.endTime) < new Date() ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-600'
                                }`}>
                                {new Date(exam.endTime) < new Date() ? 'Ended' : 'Active'}
                            </span>
                        </div>

                        <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                                <Calendar size={16} />
                                <span>{new Date(exam.startTime).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock size={16} />
                                <span>{exam.duration} mins</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <FileText size={16} />
                                <span>{exam.questions.length} Questions</span>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-700">Total Marks: {exam.totalMarks}</span>
                            {/* Add View Results button here later */}
                        </div>
                    </div>
                ))}
            </div>

            {exams.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                    No exams found. Create one to get started.
                </div>
            )}
        </div>
    );
};

export default ExamList;
