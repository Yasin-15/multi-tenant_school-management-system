import { useEffect, useState } from 'react';
import { BookOpen, Calendar, Award, DollarSign } from 'lucide-react';
import { studentService } from '../../services/studentService';
import { gradeService } from '../../services/gradeService';
import { attendanceService } from '../../services/attendanceService';
import examService from '../../services/examService';
import PerformanceChart from '../../components/PerformanceChart';

const StatCard = ({ icon: Icon, title, value, color, subtitle }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <p className="text-3xl font-bold mt-2">{value}</p>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
      <div className={`p-3 rounded-full ${color}`}>
        <Icon className="w-8 h-8 text-white" />
      </div>
    </div>
  </div>
);

const StudentDashboard = () => {
  const [stats, setStats] = useState({
    attendance: '0%',
    totalClasses: 0,
    averageGrade: 'N/A',
    pendingFees: 0,
  });
  const [recentGrades, setRecentGrades] = useState([]);
  const [examPerformance, setExamPerformance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));

      // Fetch student profile
      const studentRes = await studentService.getProfile();

      // Fetch recent grades
      const gradesRes = await gradeService.getMyGrades({ limit: 5 });
      setRecentGrades(gradesRes.data || []);

      // Fetch exam results for chart
      const examResults = await examService.getResults();
      const chartData = examResults.map(result => ({
        name: result.exam?.title || 'Exam',
        score: result.percentage
      }));
      setExamPerformance(chartData);

      // Calculate average grade
      const grades = gradesRes.data || [];
      let avgGrade = 'N/A';
      if (grades.length > 0) {
        const totalPercentage = grades.reduce((sum, grade) => {
          return sum + (grade.marksObtained / grade.totalMarks) * 100;
        }, 0);
        avgGrade = `${(totalPercentage / grades.length).toFixed(1)}%`;
      }

      setStats({
        attendance: '85%', // This should come from attendance service
        totalClasses: 6,
        averageGrade: avgGrade,
        pendingFees: 0,
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
      <h1 className="text-3xl font-bold mb-8">Student Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={Calendar}
          title="Attendance"
          value={stats.attendance}
          subtitle="This month"
          color="bg-blue-500"
        />
        <StatCard
          icon={BookOpen}
          title="Total Classes"
          value={stats.totalClasses}
          color="bg-green-500"
        />
        <StatCard
          icon={Award}
          title="Average Grade"
          value={stats.averageGrade}
          color="bg-purple-500"
        />
        <StatCard
          icon={DollarSign}
          title="Pending Fees"
          value={`$${stats.pendingFees}`}
          color="bg-yellow-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Grades</h2>
          {recentGrades.length > 0 ? (
            <div className="space-y-3">
              {recentGrades.map((grade) => (
                <div key={grade._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{grade.subject?.name}</p>
                    <p className="text-sm text-gray-500">{grade.examType}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">{grade.marksObtained}/{grade.totalMarks}</p>
                    <span className={`px-2 py-1 text-xs rounded-full ${grade.grade === 'A+' || grade.grade === 'A' ? 'bg-green-100 text-green-800' :
                        grade.grade === 'B' || grade.grade === 'C' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                      }`}>
                      {grade.grade}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No grades available</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Upcoming Events</h2>
          <p className="text-gray-500">No upcoming events</p>
        </div>
      </div>

      {/* Performance Charts */}
      <div className="mb-8">
        <PerformanceChart
          type="bar"
          title="Exam Performance History"
          data={examPerformance}
          xKey="name"
          yKey="score"
        />
      </div>
    </div>
  );
};

export default StudentDashboard;
