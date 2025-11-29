import { useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Menu } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import NotificationBell from '../components/NotificationBell';
import LanguageSwitcher from '../components/LanguageSwitcher';

const DashboardLayout = ({ allowedRoles }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm z-10">
          <div className="flex items-center justify-between px-6 py-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-md hover:bg-gray-100 md:hidden"
            >
              <Menu className="w-6 h-6 text-gray-600" />
            </button>

            <div className="flex items-center gap-4 ml-auto">
              <LanguageSwitcher />
              <NotificationBell />
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
