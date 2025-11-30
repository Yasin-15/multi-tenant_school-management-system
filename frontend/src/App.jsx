import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchCurrentUser } from './features/auth/authSlice';
import { ToastProvider } from './context/ToastContext';
import './i18n/config';
import Login from './pages/Login';
import DashboardLayout from './layouts/DashboardLayout';
import SuperAdminLayout from './layouts/SuperAdminLayout';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import Students from './pages/admin/Students';
import Teachers from './pages/admin/Teachers';
import Classes from './pages/admin/Classes';
import AdminSubjects from './pages/admin/Subjects';
import Attendance from './pages/admin/Attendance';
import Grades from './pages/admin/Grades';
import Fees from './pages/admin/Fees';
import Reports from './pages/admin/Reports';
import ExamList from './pages/admin/ExamList';
import CreateExam from './pages/admin/CreateExam';
import ExamResults from './pages/admin/ExamResults';
import PromoteStudents from './pages/admin/PromoteStudents';
import Payroll from './pages/admin/Payroll';
import Timetable from './pages/admin/Timetable';
import ManageNotifications from './pages/admin/ManageNotifications';

// Super Admin Pages
import SuperAdminDashboard from './pages/superadmin/Dashboard';
import Tenants from './pages/superadmin/Tenants';
import AllUsers from './pages/superadmin/AllUsers';
import SuperAdminSettings from './pages/superadmin/Settings';
import SuperAdminManageNotifications from './pages/superadmin/ManageNotifications';

// Teacher Pages
import TeacherDashboard from './pages/teacher/Dashboard';
import TeacherAttendance from './pages/teacher/Attendance';
import TeacherGrades from './pages/teacher/Grades';
import MyClasses from './pages/teacher/MyClasses';
import ClassDetails from './pages/teacher/ClassDetails';
import TeacherSubjects from './pages/teacher/Subjects';
import MySchedule from './pages/teacher/MySchedule';

// Student Pages
import StudentDashboard from './pages/student/Dashboard';
import MyGrades from './pages/student/MyGrades';
import MyAttendance from './pages/student/MyAttendance';
import MyFees from './pages/student/MyFees';
import StudentExamList from './pages/student/StudentExamList';
import TakeExam from './pages/student/TakeExam';
import StudentMySchedule from './pages/student/MySchedule';

// Common Pages
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';

// Placeholder components
const Unauthorized = () => <h1 className="text-3xl font-bold text-red-500 p-8">Unauthorized</h1>;


function App() {
  const dispatch = useDispatch();

  // Fetch user data from database on app load if token exists
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch]);

  return (
    <ToastProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Super Admin Routes */}
          <Route element={<SuperAdminLayout />}>
            <Route path="/super-admin" element={<SuperAdminDashboard />} />
            <Route path="/super-admin/tenants" element={<Tenants />} />
            <Route path="/super-admin/users" element={<AllUsers />} />
            <Route path="/super-admin/notifications" element={<SuperAdminManageNotifications />} />
            <Route path="/super-admin/settings" element={<SuperAdminSettings />} />
          </Route>

          {/* Admin Routes */}
          <Route element={<DashboardLayout allowedRoles={['admin']} />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/students" element={<Students />} />
            <Route path="/admin/teachers" element={<Teachers />} />
            <Route path="/admin/classes" element={<Classes />} />
            <Route path="/admin/subjects" element={<AdminSubjects />} />
            <Route path="/admin/attendance" element={<Attendance />} />
            <Route path="/admin/grades" element={<Grades />} />
            <Route path="/admin/fees" element={<Fees />} />
            <Route path="/admin/reports/financial" element={<Reports />} />
            <Route path="/admin/reports/attendance" element={<Reports />} />
            <Route path="/admin/reports/academic" element={<Reports />} />
            <Route path="/admin/notifications" element={<Notifications />} />
            <Route path="/admin/notifications/manage" element={<ManageNotifications />} />
            <Route path="/admin/exams" element={<ExamList />} />
            <Route path="/admin/exams/create" element={<CreateExam />} />
            <Route path="/admin/exams/results" element={<ExamResults />} />
            <Route path="/admin/promote" element={<PromoteStudents />} />
            <Route path="/admin/payroll" element={<Payroll />} />
            <Route path="/admin/timetable" element={<Timetable />} />
            <Route path="/admin/settings" element={<Settings />} />
          </Route>

          {/* Teacher Routes */}
          <Route element={<DashboardLayout allowedRoles={['teacher']} />}>
            <Route path="/teacher" element={<TeacherDashboard />} />
            <Route path="/teacher/schedule" element={<MySchedule />} />
            <Route path="/teacher/classes" element={<MyClasses />} />
            <Route path="/teacher/classes/:id" element={<ClassDetails />} />
            <Route path="/teacher/subjects" element={<TeacherSubjects />} />
            <Route path="/teacher/attendance" element={<TeacherAttendance />} />
            <Route path="/teacher/grades" element={<TeacherGrades />} />
            <Route path="/teacher/notifications" element={<Notifications />} />
            <Route path="/teacher/settings" element={<Settings />} />
          </Route>

          {/* Student Routes */}
          <Route element={<DashboardLayout allowedRoles={['student']} />}>
            <Route path="/student" element={<StudentDashboard />} />
            <Route path="/student/schedule" element={<StudentMySchedule />} />
            <Route path="/student/grades" element={<MyGrades />} />
            <Route path="/student/attendance" element={<MyAttendance />} />
            <Route path="/student/fees" element={<MyFees />} />
            <Route path="/student/notifications" element={<Notifications />} />
            <Route path="/student/exams" element={<StudentExamList />} />
            <Route path="/student/exams/:id/take" element={<TakeExam />} />
            <Route path="/student/settings" element={<Settings />} />
          </Route>

          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </ToastProvider>
  );
}

export default App;
