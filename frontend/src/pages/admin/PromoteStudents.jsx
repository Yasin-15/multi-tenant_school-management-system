import React, { useState, useEffect } from 'react';
import { classService } from '../../services/classService';
import api from '../../services/api';
import { ArrowRight, Check, X, Users } from 'lucide-react';

const PromoteStudents = () => {
    const [classes, setClasses] = useState([]);
    const [currentClass, setCurrentClass] = useState('');
    const [targetClass, setTargetClass] = useState('');
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [promoting, setPromoting] = useState(false);
    const [selectedStudents, setSelectedStudents] = useState([]);

    useEffect(() => {
        fetchClasses();
    }, []);

    useEffect(() => {
        if (currentClass) {
            fetchEligibility();
        } else {
            setStudents([]);
            setSelectedStudents([]);
        }
    }, [currentClass]);

    const fetchClasses = async () => {
        try {
            const res = await classService.getAll();
            setClasses(res.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchEligibility = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/promotions/eligibility?classId=${currentClass}`);
            setStudents(res.data || []);
            // Auto-select passed students
            const passedIds = res.data.filter(s => s.passed).map(s => s.student._id);
            setSelectedStudents(passedIds);
        } catch (err) {
            console.error(err);
            alert('Failed to fetch student list');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStudent = (studentId) => {
        if (selectedStudents.includes(studentId)) {
            setSelectedStudents(selectedStudents.filter(id => id !== studentId));
        } else {
            setSelectedStudents([...selectedStudents, studentId]);
        }
    };

    const handlePromote = async () => {
        if (!targetClass) {
            alert('Please select a target class');
            return;
        }
        if (selectedStudents.length === 0) {
            alert('Please select at least one student to promote');
            return;
        }

        if (!window.confirm(`Are you sure you want to promote ${selectedStudents.length} students?`)) {
            return;
        }

        setPromoting(true);
        try {
            await api.post('/promotions/promote', {
                studentIds: selectedStudents,
                targetClassId: targetClass
            });
            alert('Students promoted successfully!');
            // Refresh list
            fetchEligibility();
            setSelectedStudents([]);
        } catch (err) {
            console.error(err);
            alert('Failed to promote students');
        } finally {
            setPromoting(false);
        }
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedStudents(students.map(s => s.student._id));
        } else {
            setSelectedStudents([]);
        }
    };

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
                <Users className="w-8 h-8" />
                Promote Students
            </h1>

            <div className="bg-white p-6 rounded-lg shadow mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">Current Class (From)</label>
                        <select
                            className="w-full p-2 border rounded-lg"
                            value={currentClass}
                            onChange={(e) => setCurrentClass(e.target.value)}
                        >
                            <option value="">Select Class</option>
                            {classes.map(c => <option key={c._id} value={c._id}>{c.name} - {c.section}</option>)}
                        </select>
                    </div>

                    <div className="flex justify-center pb-2">
                        <ArrowRight className="text-gray-400 w-8 h-8" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">Target Class (To)</label>
                        <select
                            className="w-full p-2 border rounded-lg"
                            value={targetClass}
                            onChange={(e) => setTargetClass(e.target.value)}
                            disabled={!currentClass}
                        >
                            <option value="">Select Class</option>
                            {classes.filter(c => c._id !== currentClass).map(c => (
                                <option key={c._id} value={c._id}>{c.name} - {c.section}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {currentClass && (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                        <h2 className="font-semibold text-gray-700">Student Eligibility List</h2>
                        <div className="text-sm text-gray-500">
                            Selected: {selectedStudents.length} / {students.length}
                        </div>
                    </div>

                    {loading ? (
                        <div className="p-8 text-center text-gray-500">Loading students...</div>
                    ) : students.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">No students found in this class</div>
                    ) : (
                        <>
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-6 py-3 text-left w-12">
                                            <input
                                                type="checkbox"
                                                onChange={handleSelectAll}
                                                checked={students.length > 0 && selectedStudents.length === students.length}
                                            />
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Exams Taken</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Average Score</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {students.map((item) => (
                                        <tr key={item.student._id} className={selectedStudents.includes(item.student._id) ? 'bg-blue-50' : ''}>
                                            <td className="px-6 py-4">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedStudents.includes(item.student._id)}
                                                    onChange={() => handleToggleStudent(item.student._id)}
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900">{item.student.name}</div>
                                                <div className="text-xs text-gray-500">{item.student.admissionNumber}</div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {item.examsTaken}
                                            </td>
                                            <td className="px-6 py-4 font-medium">
                                                {item.average}%
                                            </td>
                                            <td className="px-6 py-4">
                                                {item.passed ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        <Check className="w-3 h-3 mr-1" /> Pass
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                        <X className="w-3 h-3 mr-1" /> Fail
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div className="p-4 border-t bg-gray-50 flex justify-end">
                                <button
                                    onClick={handlePromote}
                                    disabled={promoting || !targetClass || selectedStudents.length === 0}
                                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {promoting ? 'Promoting...' : 'Promote Selected Students'}
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default PromoteStudents;
