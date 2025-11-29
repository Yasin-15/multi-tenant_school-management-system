import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FaCalendarAlt, FaClock, FaBook, FaDoorOpen, FaSpinner } from 'react-icons/fa';
import { timetableService } from '../../services/timetableService';
import api from '../../services/api';

const MySchedule = () => {
    const user = useSelector((state) => state.auth.user);
    const [weeklySchedule, setWeeklySchedule] = useState(null);
    const [selectedDay, setSelectedDay] = useState('');
    const [loading, setLoading] = useState(true);
    const [teacherId, setTeacherId] = useState(null);

    const days = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

    useEffect(() => {
        // Set current day
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
        setSelectedDay(today);
        fetchTeacherAndSchedule();
    }, []);

    const fetchTeacherAndSchedule = async () => {
        try {
            setLoading(true);

            // First, get the teacher record for the logged-in user
            const teacherResponse = await api.get('/teachers');

            const teacherData = teacherResponse.data;
            const teachers = teacherData.data || teacherData;

            // Find the teacher record that matches the current user
            const myTeacher = Array.isArray(teachers)
                ? teachers.find(t => t.user?._id === user._id || t.user === user._id)
                : null;

            if (!myTeacher) {
                throw new Error('Teacher record not found');
            }

            setTeacherId(myTeacher._id);

            // Now fetch the schedule
            const data = await timetableService.getTeacherWeeklySchedule(myTeacher._id);
            setWeeklySchedule(data);
        } catch (error) {
            console.error('Error fetching schedule:', error);
            alert(`Failed to load schedule: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const getTodaySchedule = () => {
        if (!weeklySchedule || !selectedDay) return [];
        return weeklySchedule.schedule[selectedDay] || [];
    };

    const getCurrentPeriod = () => {
        const now = new Date();
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        const todaySchedule = getTodaySchedule();

        return todaySchedule.find(period =>
            currentTime >= period.startTime && currentTime <= period.endTime
        );
    };

    const getNextPeriod = () => {
        const now = new Date();
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        const todaySchedule = getTodaySchedule();

        return todaySchedule.find(period => currentTime < period.startTime);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <FaSpinner className="animate-spin text-4xl text-purple-600" />
            </div>
        );
    }

    const currentPeriod = getCurrentPeriod();
    const nextPeriod = getNextPeriod();
    const todaySchedule = getTodaySchedule();

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <FaCalendarAlt className="text-purple-500" />
                    My Schedule
                </h1>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                    {weeklySchedule?.teacher?.name}
                </div>
            </div>

            {/* Current & Next Period Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Current Period */}
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6 shadow-lg">
                    <div className="flex items-center gap-2 mb-3">
                        <FaClock className="text-xl" />
                        <h3 className="font-semibold">Current Period</h3>
                    </div>
                    {currentPeriod ? (
                        <div className="space-y-2">
                            <div className="text-2xl font-bold">{currentPeriod.subject?.name}</div>
                            <div className="text-purple-100">
                                {currentPeriod.startTime} - {currentPeriod.endTime}
                            </div>
                            <div className="flex items-center gap-2 text-purple-100">
                                <FaDoorOpen />
                                <span>Grade {currentPeriod.class.grade} - {currentPeriod.class.section}</span>
                            </div>
                            {currentPeriod.class.room && (
                                <div className="text-purple-100">Room: {currentPeriod.class.room}</div>
                            )}
                        </div>
                    ) : (
                        <div className="text-purple-100">No class right now</div>
                    )}
                </div>

                {/* Next Period */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 mb-3">
                        <FaClock className="text-xl text-gray-600 dark:text-gray-400" />
                        <h3 className="font-semibold text-gray-800 dark:text-white">Next Period</h3>
                    </div>
                    {nextPeriod ? (
                        <div className="space-y-2">
                            <div className="text-2xl font-bold text-gray-800 dark:text-white">
                                {nextPeriod.subject?.name}
                            </div>
                            <div className="text-gray-600 dark:text-gray-400">
                                {nextPeriod.startTime} - {nextPeriod.endTime}
                            </div>
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                <FaDoorOpen />
                                <span>Grade {nextPeriod.class.grade} - {nextPeriod.class.section}</span>
                            </div>
                            {nextPeriod.class.room && (
                                <div className="text-gray-600 dark:text-gray-400">
                                    Room: {nextPeriod.class.room}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-gray-500 dark:text-gray-400">No more classes today</div>
                    )}
                </div>
            </div>

            {/* Day Selector */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {days.map(day => (
                    <button
                        key={day}
                        onClick={() => setSelectedDay(day)}
                        className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${selectedDay === day
                            ? 'bg-purple-600 text-white'
                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                    >
                        {day}
                    </button>
                ))}
            </div>

            {/* Schedule for Selected Day */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                        {selectedDay}'s Schedule
                    </h2>
                </div>
                <div className="p-6">
                    {todaySchedule.length > 0 ? (
                        <div className="space-y-4">
                            {todaySchedule.map((period, index) => (
                                <div
                                    key={index}
                                    className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                >
                                    <div className="flex-shrink-0 w-24 text-center">
                                        <div className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                                            {period.startTime}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">to</div>
                                        <div className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                                            {period.endTime}
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <FaBook className="text-purple-500" />
                                            <h3 className="font-semibold text-gray-800 dark:text-white">
                                                {period.subject?.name}
                                            </h3>
                                            {period.subject?.code && (
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    ({period.subject.code})
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                            <div className="flex items-center gap-1">
                                                <FaDoorOpen />
                                                <span>
                                                    Grade {period.class.grade} - {period.class.section}
                                                </span>
                                            </div>
                                            {period.class.room && (
                                                <div>Room: {period.class.room}</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                            <FaCalendarAlt className="text-4xl mx-auto mb-3 opacity-50" />
                            <p>No classes scheduled for {selectedDay}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Weekly Overview */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                        Weekly Overview
                    </h2>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {days.map(day => {
                            const daySchedule = weeklySchedule?.schedule[day] || [];
                            return (
                                <div
                                    key={day}
                                    className="p-4 rounded-lg border border-gray-200 dark:border-gray-700"
                                >
                                    <h3 className="font-semibold text-gray-800 dark:text-white mb-2">
                                        {day}
                                    </h3>
                                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                        {daySchedule.length}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        {daySchedule.length === 1 ? 'period' : 'periods'}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MySchedule;
