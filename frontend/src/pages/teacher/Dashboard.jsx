import { useEffect, useState } from 'react';
import { Users, BookOpen, Calendar, ClipboardCheck } from 'lucide-react';
import { teacherService } from '../../services/teacherService';
import { classService } from '../../services/classService';
import { attendanceService } from '../../services/attendanceService';

const StatCard = ({ icon: Icon, title, value, color }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <p className="text-3xl font-bold mt-2">{value}</p>
      </div>
      <div className={`p-3 rounded-full ${color}`}>
        <Icon className="w-8 h-8 text-white" />
      </div>
    </div>
  </div>
);

const TeacherDashboard = () => {
  const [stats, setStats] = useState({
    myClasses: 0,
    totalStudents: 0,
    todayClasses: 0,
    pendingTasks: 0,
  });
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [classesRes] = await Promise.all([
        classService.getAll(),
      ]);

      const myClasses = classesRes.data || [];
      setClasses(myClasses);

      const totalStudents = myClasses.reduce((sum, cls) => sum + (cls.students?.length || 0), 0);

      setStats({
        myClasses: myClasses.length,
        totalStudents,
        todayClasses: myClasses.length,
        pendingTasks: 0,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Teacher Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={BookOpen}
          title="My Classes"
          value={stats.myClasses}
          color="bg-blue-500"
        />
        <StatCard
          icon={Users}
          title="Total Students"
          value={stats.totalStudents}
          color="bg-green-500"
        />
        <StatCard
          icon={Calendar}
          title="Today's Classes"
          value={stats.todayClasses}
          color="bg-purple-500"
        />
        <StatCard
          icon={ClipboardCheck}
          title="Pending Tasks"
          value={stats.pendingTasks}
          color="bg-yellow-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">My Classes</h2>
          {classes.length > 0 ? (
            <div className="space-y-3">
              {classes.map((cls) => (
                <div key={cls._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{cls.name} - {cls.section}</p>
                    <p className="text-sm text-gray-500">Grade {cls.grade}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Room {cls.room || 'N/A'}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No classes assigned</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Today's Schedule</h2>
          <p className="text-gray-500">No classes scheduled for today</p>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
