import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import SuperAdminSidebar from '../components/superadmin/SuperAdminSidebar';
import LanguageSwitcher from '../components/LanguageSwitcher';

const SuperAdminLayout = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'super_admin') {
    return <Navigate to="/unauthorized" replace />;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <SuperAdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm z-10">
          <div className="flex items-center justify-end gap-4 px-6 py-3">
            <LanguageSwitcher />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SuperAdminLayout;
