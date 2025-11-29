import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FaCalendarAlt, FaClock, FaBook, FaDoorOpen, FaSpinner, FaChalkboardTeacher } from 'react-icons/fa';
import { timetableService } from '../../services/timetableService';
import { studentService } from '../../services/studentService';

const MySchedule = () => {
    const user = useSelector((state) => state.auth.user);
    const [weeklySchedule, setWeeklySchedule] = useState(null);
    const [selectedDay, setSelectedDay] = useState('');
    const [loading, setLoading] = useState(true);

    const days = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

    useEffect(() => {
        // Set current day
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
        setSelectedDay(today);
        fetchStudentAndSchedule();
    }, []);

    const fetchStudentAndSchedule = async () => {
        try {
            setLoading(true);

            // Get the student profile for the logged-in user
            const response = await studentService.getProfile();
            const myStudent = response.data || response;

            if (!myStudent || !myStudent._id) {
                throw new Error('Student record not found');
            }

            // Fetch the schedule
            const data = await timetableService.getStudentWeeklySchedule(myStudent._id);
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
                    {weeklySchedule?.class && (
                        <span>Grade {weeklySchedule.class.grade} - {weeklySchedule.class.section}</span>
                    )}
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
                            {currentPeriod.teacher && (
                                <div className="flex items-center gap-2 text-purple-100">
                                    <FaChalkboardTeacher />
                                    <span>{currentPeriod.teacher.name}</span>
                                </div>
                            )}
                            {currentPeriod.room && (
                                <div className="flex items-center gap-2 text-purple-100">
                                    <FaDoorOpen />
                                    <span>Room: {currentPeriod.room}</span>
                                </div>
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
                            {nextPeriod.teacher && (
                                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                    <FaChalkboardTeacher />
                                    <span>{nextPeriod.teacher.name}</span>
                                </div>
                            )}
                            {nextPeriod.room && (
                                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                    <FaDoorOpen />
                                    <span>Room: {nextPeriod.room}</span>
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
                                            {period.teacher && (
                                                <div className="flex items-center gap-1">
                                                    <FaChalkboardTeacher />
                                                    <span>{period.teacher.name}</span>
                                                </div>
                                            )}
                                            {period.room && (
                                                <div className="flex items-center gap-1">
                                                    <FaDoorOpen />
                                                    <span>Room: {period.room}</span>
                                                </div>
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
