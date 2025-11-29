import { useState, useEffect } from 'react';
import api from '../../services/api';
import { FaCalendarAlt, FaSave, FaSpinner } from 'react-icons/fa';

const Timetable = () => {
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [subjects, setSubjects] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [schedule, setSchedule] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    const days = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday'];
    const periods = [
        { start: '07:40', end: '08:20' },
        { start: '08:20', end: '09:00' },
        { start: '09:00', end: '09:30' },
        { start: '09:30', end: '10:00', type: 'break' },
        { start: '10:00', end: '10:40' },
        { start: '10:40', end: '11:20' },
    ];

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (selectedClass) {
            fetchTimetable(selectedClass);
        } else {
            setSchedule([]);
        }
    }, [selectedClass]);

    const fetchInitialData = async () => {
        try {
            setInitialLoading(true);
            console.log('Fetching initial data...');

            const [classesRes, subjectsRes, teachersRes] = await Promise.all([
                api.get('/classes'),
                api.get('/subjects'),
                api.get('/teachers')
            ]);

            console.log('Classes response:', classesRes.data);
            console.log('Subjects response:', subjectsRes.data);
            console.log('Teachers response:', teachersRes.data);

            // Handle both array and object responses
            const classesData = classesRes.data?.data || classesRes.data;
            const subjectsData = subjectsRes.data?.data || subjectsRes.data;
            const teachersData = teachersRes.data?.data || teachersRes.data;

            setClasses(Array.isArray(classesData) ? classesData : []);
            setSubjects(Array.isArray(subjectsData) ? subjectsData : []);
            setTeachers(Array.isArray(teachersData) ? teachersData : []);
        } catch (error) {
            console.error('Error fetching initial data:', error);
            console.error('Error details:', error.response?.data);
            alert(`Failed to load data: ${error.response?.data?.message || error.message}`);
            // Set empty arrays on error to prevent map errors
            setClasses([]);
            setSubjects([]);
            setTeachers([]);
        } finally {
            setInitialLoading(false);
        }
    };

    const fetchTimetable = async (classId) => {
        try {
            setLoading(true);
            const response = await api.get(`/timetable/${classId}`);

            let fetchedSchedule = response.data;
            if (!fetchedSchedule || fetchedSchedule.length === 0) {
                fetchedSchedule = days.map(day => ({
                    day,
                    periods: periods.filter(p => p.type !== 'break').map(p => ({
                        startTime: p.start,
                        endTime: p.end,
                        subject: '',
                        teacher: ''
                    }))
                }));
            } else {
                fetchedSchedule = days.map(day => {
                    const existingDay = fetchedSchedule.find(d => d.day === day);
                    return existingDay || {
                        day,
                        periods: periods.filter(p => p.type !== 'break').map(p => ({
                            startTime: p.start,
                            endTime: p.end,
                            subject: '',
                            teacher: ''
                        }))
                    };
                });
            }
            setSchedule(fetchedSchedule);
        } catch (error) {
            console.error('Error fetching timetable:', error);
            alert(`Failed to fetch timetable: ${error.response?.data?.message || error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleCellChange = (dayIndex, periodIndex, field, value) => {
        const newSchedule = [...schedule];
        if (!newSchedule[dayIndex].periods) {
            newSchedule[dayIndex].periods = periods.filter(p => p.type !== 'break').map(p => ({
                startTime: p.start,
                endTime: p.end,
                subject: '',
                teacher: ''
            }));
        }

        if (!newSchedule[dayIndex].periods[periodIndex]) {
            newSchedule[dayIndex].periods[periodIndex] = {
                startTime: periods.filter(p => p.type !== 'break')[periodIndex].start,
                endTime: periods.filter(p => p.type !== 'break')[periodIndex].end,
                subject: '',
                teacher: ''
            };
        }

        newSchedule[dayIndex].periods[periodIndex][field] = value;
        setSchedule(newSchedule);
    };

    const handleSave = async () => {
        if (!selectedClass) return;
        try {
            setSaving(true);

            // Clean the schedule data before sending
            const cleanedSchedule = schedule.map(day => ({
                day: day.day,
                periods: day.periods.map(period => ({
                    startTime: period.startTime,
                    endTime: period.endTime,
                    subject: period.subject && period.subject !== '' ? period.subject : null,
                    teacher: period.teacher && period.teacher !== '' ? period.teacher : null,
                    room: period.room || null
                }))
            }));

            await api.put(`/timetable/${selectedClass}`, { schedule: cleanedSchedule });
            alert('Timetable saved successfully');
        } catch (error) {
            console.error('Error saving timetable:', error);
            alert(`Failed to save timetable: ${error.response?.data?.message || error.message}`);
        } finally {
            setSaving(false);
        }
    };

    if (initialLoading) {
        return (
            <div className="flex justify-center items-center h-96">
                <FaSpinner className="animate-spin text-4xl text-purple-600" />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <FaCalendarAlt className="text-purple-500" />
                    Timetable Generator
                </h1>
                <div className="flex gap-4">
                    <select
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                        className="px-4 py-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white min-w-[200px]"
                        disabled={initialLoading}
                    >
                        <option value="">Select Class</option>
                        {Array.isArray(classes) && classes.map(c => (
                            <option key={c._id} value={c._id}>{c.grade} - {c.section} ({c.name})</option>
                        ))}
                    </select>
                    <button
                        onClick={handleSave}
                        disabled={!selectedClass || saving}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
                    >
                        {saving ? <FaSpinner className="animate-spin" /> : <FaSave />}
                        Save Changes
                    </button>
                </div>
            </div>

            {classes.length === 0 && !initialLoading ? (
                <div className="text-center py-20 text-gray-500 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                    No classes found. Please create classes first.
                </div>
            ) : !selectedClass ? (
                <div className="text-center py-20 text-gray-500 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                    Select a class to manage its timetable
                </div>
            ) : loading ? (
                <div className="text-center py-20">
                    <FaSpinner className="animate-spin text-4xl text-purple-600 mx-auto" />
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-x-auto border border-gray-100 dark:border-gray-700">
                    <table className="w-full min-w-[1000px]">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-700/50">
                                <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300 w-32 sticky left-0 bg-gray-50 dark:bg-gray-700/50 z-10">Day</th>
                                {periods.map((period, index) => (
                                    <th key={index} className="px-4 py-3 text-center font-semibold text-gray-600 dark:text-gray-300">
                                        {period.start} - {period.end}
                                        {period.type === 'break' && <span className="block text-xs text-gray-400 font-normal">BREAK</span>}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {days.map((day, dayIndex) => (
                                <tr key={day} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white sticky left-0 bg-white dark:bg-gray-800 z-10">
                                        {day}
                                    </td>
                                    {periods.map((period, pIndex) => {
                                        if (period.type === 'break') {
                                            return <td key={pIndex} className="bg-gray-100 dark:bg-gray-900/50"></td>;
                                        }

                                        const actualPeriodIndex = periods.slice(0, pIndex).filter(p => p.type !== 'break').length;
                                        const cellData = schedule[dayIndex]?.periods?.[actualPeriodIndex] || {};

                                        return (
                                            <td key={pIndex} className="px-2 py-2 border-l border-gray-100 dark:border-gray-700">
                                                <div className="space-y-2">
                                                    <select
                                                        value={cellData.subject?._id || cellData.subject || ''}
                                                        onChange={(e) => handleCellChange(dayIndex, actualPeriodIndex, 'subject', e.target.value)}
                                                        className="w-full text-xs p-1 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                    >
                                                        <option value="">Subject...</option>
                                                        {Array.isArray(subjects) && subjects.map(s => (
                                                            <option key={s._id} value={s._id}>{s.name}</option>
                                                        ))}
                                                    </select>
                                                    <select
                                                        value={cellData.teacher?._id || cellData.teacher || ''}
                                                        onChange={(e) => handleCellChange(dayIndex, actualPeriodIndex, 'teacher', e.target.value)}
                                                        className="w-full text-xs p-1 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                    >
                                                        <option value="">Teacher...</option>
                                                        {Array.isArray(teachers) && teachers.map(t => (
                                                            <option key={t._id} value={t._id}>{t.user?.name || t.employeeId}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Timetable;
