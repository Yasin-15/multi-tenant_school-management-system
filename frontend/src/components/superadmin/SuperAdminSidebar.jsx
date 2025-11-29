import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Building2, Users, Settings, LogOut, Bell } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../features/auth/authSlice';

const SuperAdminSidebar = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const links = [
    { path: '/super-admin', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/super-admin/tenants', icon: Building2, label: 'Tenants' },
    { path: '/super-admin/users', icon: Users, label: 'All Users' },
    { path: '/super-admin/notifications', icon: Bell, label: 'Notifications' },
    { path: '/super-admin/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="h-screen w-64 bg-gray-900 text-white flex flex-col">
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-2xl font-bold">Super Admin</h1>
        <p className="text-sm text-gray-400 mt-1">System Management</p>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;
          
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center px-6 py-3 hover:bg-gray-800 transition-colors ${
                isActive ? 'bg-gray-800 border-l-4 border-blue-500' : ''
              }`}
            >
              <Icon className="w-5 h-5 mr-3" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center mb-4 px-2">
          <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
            SA
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
          Logout
        </button>
      </div>
    </div>
  );
};

export default SuperAdminSidebar;
