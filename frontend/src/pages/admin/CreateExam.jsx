import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import examService from '../../services/examService';
import { classService } from '../../services/classService';
import { subjectService } from '../../services/subjectService';
import { Plus, Trash2, Save, ArrowLeft } from 'lucide-react';

const CreateExam = () => {
    const navigate = useNavigate();
    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        examType: 'Chapter Exam',
        class: '',
        subject: '',
        duration: 60,
        startTime: '',
        endTime: '',
        questions: []
    });

    useEffect(() => {
        fetchMetadata();
    }, []);

    const fetchMetadata = async () => {
        try {
            const [classesRes, subjectsRes] = await Promise.all([
                classService.getAll(),
                subjectService.getAll()
            ]);
            setClasses(classesRes.data || []);
            setSubjects(subjectsRes.data || []);
        } catch (error) {
            console.error('Error fetching metadata:', error);
        }
    };

    const handleAddQuestion = () => {
        setFormData({
            ...formData,
            questions: [
                ...formData.questions,
                {
                    text: '',
                    options: ['', '', '', ''],
                    correctOption: 0,
                    marks: 1
                }
            ]
        });
    };

    const handleQuestionChange = (index, field, value) => {
        const newQuestions = [...formData.questions];
        newQuestions[index][field] = value;
        setFormData({ ...formData, questions: newQuestions });
    };

    const handleOptionChange = (qIndex, oIndex, value) => {
        const newQuestions = [...formData.questions];
        newQuestions[qIndex].options[oIndex] = value;
        setFormData({ ...formData, questions: newQuestions });
    };

    const handleRemoveQuestion = (index) => {
        const newQuestions = formData.questions.filter((_, i) => i !== index);
        setFormData({ ...formData, questions: newQuestions });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await examService.createExam(formData);
            navigate('/admin/exams');
        } catch (error) {
            console.error('Error creating exam:', error);
            alert('Failed to create exam');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <button
                onClick={() => navigate('/admin/exams')}
                className="flex items-center text-gray-600 mb-6 hover:text-gray-900"
            >
                <ArrowLeft size={20} className="mr-2" />
                Back to Exams
            </button>

            <h1 className="text-2xl font-bold text-gray-800 mb-6">Create New Exam</h1>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Details */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Exam Details</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                            <input
                                type="text"
                                required
                                className="w-full p-2 border rounded-lg"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Exam Type *</label>
                            <select
                                required
                                className="w-full p-2 border rounded-lg"
                                value={formData.examType}
                                onChange={(e) => setFormData({ ...formData, examType: e.target.value })}
                            >
                                <option value="Chapter Exam">Chapter Exam</option>
                                <option value="Midterm">Midterm</option>
                                <option value="Final">Final</option>
                                <option value="Quiz">Quiz</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                            <input
                                type="number"
                                required
                                className="w-full p-2 border rounded-lg"
                                value={formData.duration}
                                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                            <select
                                required
                                className="w-full p-2 border rounded-lg"
                                value={formData.class}
                                onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                            >
                                <option value="">Select Class</option>
                                {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                            <select
                                required
                                className="w-full p-2 border rounded-lg"
                                value={formData.subject}
                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                            >
                                <option value="">Select Subject</option>
                                {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                            <input
                                type="datetime-local"
                                required
                                className="w-full p-2 border rounded-lg"
                                value={formData.startTime}
                                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                            <input
                                type="datetime-local"
                                required
                                className="w-full p-2 border rounded-lg"
                                value={formData.endTime}
                                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                {/* Questions */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-gray-800">Questions</h2>
                        <button
                            type="button"
                            onClick={handleAddQuestion}
                            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                        >
                            <Plus size={20} />
                            Add Question
                        </button>
                    </div>

                    {formData.questions.map((question, qIndex) => (
                        <div key={qIndex} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative">
                            <button
                                type="button"
                                onClick={() => handleRemoveQuestion(qIndex)}
                                className="absolute top-4 right-4 text-red-500 hover:text-red-700"
                            >
                                <Trash2 size={20} />
                            </button>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Question Text</label>
                                    <textarea
                                        required
                                        className="w-full p-2 border rounded-lg"
                                        rows="2"
                                        value={question.text}
                                        onChange={(e) => handleQuestionChange(qIndex, 'text', e.target.value)}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {question.options.map((option, oIndex) => (
                                        <div key={oIndex}>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Option {oIndex + 1}</label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="radio"
                                                    name={`correct-${qIndex}`}
                                                    checked={question.correctOption === oIndex}
                                                    onChange={() => handleQuestionChange(qIndex, 'correctOption', oIndex)}
                                                />
                                                <input
                                                    type="text"
                                                    required
                                                    className="w-full p-2 border rounded-lg text-sm"
                                                    value={option}
                                                    onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex justify-end">
                                    <div className="w-32">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Marks</label>
                                        <input
                                            type="number"
                                            min="1"
                                            required
                                            className="w-full p-2 border rounded-lg"
                                            value={question.marks}
                                            onChange={(e) => handleQuestionChange(qIndex, 'marks', parseInt(e.target.value))}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-end pt-6">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                    >
                        <Save size={20} />
                        {loading ? 'Creating...' : 'Create Exam'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateExam;
