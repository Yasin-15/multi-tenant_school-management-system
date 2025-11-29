import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import examService from '../../services/examService';
import { Timer, AlertTriangle } from 'lucide-react';

const TakeExam = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [exam, setExam] = useState(null);
    const [answers, setAnswers] = useState({}); // { questionId: selectedOptionIndex }
    const [timeLeft, setTimeLeft] = useState(0); // in seconds
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchExam();
    }, [id]);

    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        handleSubmit(); // Auto-submit
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [timeLeft]);

    const fetchExam = async () => {
        try {
            const data = await examService.getExamById(id);
            setExam(data);

            // Calculate time left based on end time or duration
            const now = new Date();
            const endTime = new Date(data.endTime);
            const durationSeconds = data.duration * 60;

            // Use the lesser of (EndTime - Now) or Duration
            // In a real app, backend should tell us exactly how much time is left for this specific attempt
            // For simplicity, we'll just use the duration, but cap it at the exam end time

            const secondsUntilEnd = Math.floor((endTime - now) / 1000);
            const initialTime = Math.min(durationSeconds, secondsUntilEnd);

            if (initialTime <= 0) {
                alert('Exam has ended');
                navigate('/student/exams');
                return;
            }

            setTimeLeft(initialTime);
        } catch (error) {
            console.error('Error fetching exam:', error);
            alert('Failed to load exam');
            navigate('/student/exams');
        } finally {
            setLoading(false);
        }
    };

    const handleOptionSelect = (questionId, optionIndex) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: optionIndex
        }));
    };

    const handleSubmit = useCallback(async () => {
        if (submitting) return;
        setSubmitting(true);

        try {
            const submissionData = {
                examId: id,
                answers: Object.entries(answers).map(([questionId, selectedOption]) => ({
                    questionId,
                    selectedOption
                }))
            };

            await examService.submitExam(submissionData);
            alert('Exam submitted successfully!');
            navigate('/student/exams');
        } catch (error) {
            console.error('Error submitting exam:', error);
            alert('Failed to submit exam. Please try again.');
            setSubmitting(false);
        }
    }, [answers, id, navigate, submitting]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading || !exam) return <div className="p-6">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <div className="bg-white shadow-sm border-b px-6 py-4 sticky top-0 z-10 flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-bold text-gray-800">{exam.title}</h1>
                    <p className="text-sm text-gray-500">{exam.subject?.name}</p>
                </div>

                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono font-bold text-lg ${timeLeft < 300 ? 'bg-red-100 text-red-600' : 'bg-blue-50 text-blue-600'
                    }`}>
                    <Timer size={20} />
                    {formatTime(timeLeft)}
                </div>
            </div>

            {/* Questions */}
            <div className="flex-1 max-w-3xl mx-auto w-full p-6 space-y-8">
                {exam.questions.map((question, index) => (
                    <div key={question._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg font-medium text-gray-800">
                                <span className="text-gray-400 mr-2">{index + 1}.</span>
                                {question.text}
                            </h3>
                            <span className="text-sm text-gray-500 bg-gray-50 px-2 py-1 rounded">
                                {question.marks} marks
                            </span>
                        </div>

                        <div className="space-y-3">
                            {question.options.map((option, oIndex) => (
                                <label
                                    key={oIndex}
                                    className={`flex items-center p-4 rounded-lg border cursor-pointer transition-all ${answers[question._id] === oIndex
                                            ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                                            : 'border-gray-200 hover:bg-gray-50'
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name={question._id}
                                        className="w-4 h-4 text-blue-600"
                                        checked={answers[question._id] === oIndex}
                                        onChange={() => handleOptionSelect(question._id, oIndex)}
                                    />
                                    <span className="ml-3 text-gray-700">{option}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div className="bg-white border-t p-6 sticky bottom-0 z-10">
                <div className="max-w-3xl mx-auto flex justify-between items-center">
                    <div className="flex items-center text-yellow-600 text-sm">
                        <AlertTriangle size={16} className="mr-2" />
                        <span>Please review all answers before submitting.</span>
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
                    >
                        {submitting ? 'Submitting...' : 'Submit Exam'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TakeExam;
