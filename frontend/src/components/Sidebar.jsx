import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, GraduationCap, BookOpen,
  Calendar, DollarSign, Bell, Settings, LogOut,
  ClipboardList, BarChart, Menu, X
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../features/auth/authSlice';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Sidebar.css';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { t } = useTranslation();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const closeSidebar = () => {
    setIsOpen(false);
  };

  // Define links for each role
  const adminLinks = [
    { path: '/admin', icon: LayoutDashboard, label: t('nav.dashboard') },
    { path: '/admin/students', icon: Users, label: t('nav.students') },
    { path: '/admin/teachers', icon: GraduationCap, label: t('nav.teachers') },
    { path: '/admin/classes', icon: BookOpen, label: t('nav.classes') },
    { path: '/admin/subjects', icon: BookOpen, label: t('nav.subjects') },
    { path: '/admin/attendance', icon: ClipboardList, label: t('nav.attendance') },
    { path: '/admin/grades', icon: BarChart, label: t('nav.grades') },
    { path: '/admin/fees', icon: DollarSign, label: t('nav.fees') },
    { path: '/admin/payroll', icon: DollarSign, label: 'Payroll' },
    { path: '/admin/timetable', icon: Calendar, label: 'Timetable' },
    { path: '/admin/exams', icon: ClipboardList, label: 'Exams' },
    {
      label: 'Reports',
      icon: ClipboardList,
      submenu: [
        { path: '/admin/reports/financial', label: 'Financial Reports' },
        { path: '/admin/reports/attendance', label: 'Attendance Reports' },
        { path: '/admin/reports/academic', label: 'Academic Reports' },
        { path: '/admin/reports/batch', label: 'Batch Operations' },
      ]
    },
    { path: '/admin/notifications', icon: Bell, label: t('nav.notifications') },
    { path: '/admin/settings', icon: Settings, label: t('nav.settings') },
  ];

  const teacherLinks = [
    { path: '/teacher', icon: LayoutDashboard, label: t('nav.dashboard') },
    { path: '/teacher/schedule', icon: Calendar, label: 'My Schedule' },
    { path: '/teacher/classes', icon: Users, label: 'My Classes' },
    { path: '/teacher/subjects', icon: BookOpen, label: 'My Subjects' },
    { path: '/teacher/attendance', icon: ClipboardList, label: t('nav.attendance') },
    { path: '/teacher/grades', icon: BarChart, label: t('nav.grades') },
    { path: '/teacher/notifications', icon: Bell, label: t('nav.notifications') },
    { path: '/teacher/settings', icon: Settings, label: t('nav.settings') },
  ];

  const studentLinks = [
    { path: '/student', icon: LayoutDashboard, label: t('nav.dashboard') },
    { path: '/student/schedule', icon: Calendar, label: 'My Schedule' },
    { path: '/student/grades', icon: BarChart, label: 'My Grades' },
    { path: '/student/attendance', icon: ClipboardList, label: 'My Attendance' },
    { path: '/student/fees', icon: DollarSign, label: 'My Fees' },
    { path: '/student/exams', icon: ClipboardList, label: 'My Exams' },
    { path: '/student/notifications', icon: Bell, label: t('nav.notifications') },
    { path: '/student/settings', icon: Settings, label: t('nav.settings') },
  ];

  let links = [];
  if (user?.role === 'admin') links = adminLinks;
  else if (user?.role === 'teacher') links = teacherLinks;
  else if (user?.role === 'student') links = studentLinks;

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="mobile-menu-button lg:hidden"
        onClick={toggleSidebar}
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar Overlay */}
      <div
        className={`sidebar-overlay ${isOpen ? 'show' : ''}`}
        onClick={closeSidebar}
      />

      {/* Sidebar */}
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-2xl font-bold">School MS</h1>
          <p className="text-sm text-gray-400 mt-1">{user?.role?.toUpperCase()}</p>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul>
            {links.map((link, index) => {
              const Icon = link.icon;

              if (link.submenu) {
                return (
                  <li key={index} className="submenu">
                    <span className="flex items-center px-6 py-3 text-gray-300 hover:text-white transition-colors cursor-pointer">
                      <Icon className="w-5 h-5 mr-3" />
                      {link.label}
                    </span>
                    <ul className="bg-gray-800/50">
                      {link.submenu.map((subItem) => (
                        <li key={subItem.path}>
                          <Link
                            to={subItem.path}
                            onClick={closeSidebar}
                            className={`flex items-center pl-14 pr-6 py-2 hover:bg-gray-800 transition-colors ${location.pathname === subItem.path ? 'bg-gray-800 text-blue-400' : 'text-gray-400'
                              }`}
                          >
                            <span>{subItem.label}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </li>
                );
              }

              const isActive = location.pathname === link.path;
              return (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    onClick={closeSidebar}
                    className={`flex items-center px-6 py-3 hover:bg-gray-800 transition-colors ${isActive ? 'bg-gray-800 border-l-4 border-blue-500' : ''
                      }`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    <span>{link.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-gray-400">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:bg-gray-800 rounded transition-colors"
          >
            <LogOut className="w-4 h-4 mr-2" />
            {t('common.logout')}
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
