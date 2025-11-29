import { useEffect, useState } from 'react';
import { Building2, Users, School, TrendingUp } from 'lucide-react';
import { superAdminService } from '../../services/superAdminService';

const StatCard = ({ icon: Icon, title, value, subtitle, color }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <p className="text-3xl font-bold mt-2">{value}</p>
        {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
      </div>
      <div className={`p-3 rounded-full ${color}`}>
        <Icon className="w-8 h-8 text-white" />
      </div>
    </div>
  </div>
);

const SuperAdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await superAdminService.getSystemStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
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
      <h1 className="text-3xl font-bold mb-8">Super Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={Building2}
          title="Total Tenants"
          value={stats?.tenants?.total || 0}
          subtitle={`${stats?.tenants?.active || 0} active`}
          color="bg-blue-500"
        />
        <StatCard
          icon={Users}
          title="Total Users"
          value={stats?.users?.total || 0}
          color="bg-green-500"
        />
        <StatCard
          icon={School}
          title="Total Students"
          value={stats?.users?.students || 0}
          color="bg-purple-500"
        />
        <StatCard
          icon={TrendingUp}
          title="Total Teachers"
          value={stats?.users?.teachers || 0}
          color="bg-orange-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Subscription Plans</h2>
          <div className="space-y-3">
            {stats?.subscriptions?.map((sub) => (
              <div key={sub._id} className="flex justify-between items-center">
                <span className="capitalize">{sub._id || 'Trial'}</span>
                <span className="font-semibold">{sub.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Tenant Status</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-green-600">Active Tenants</span>
              <span className="font-semibold">{stats?.tenants?.active || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-red-600">Inactive Tenants</span>
              <span className="font-semibold">{stats?.tenants?.inactive || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
