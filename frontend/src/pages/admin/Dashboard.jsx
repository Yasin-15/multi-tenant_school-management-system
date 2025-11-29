import { useEffect, useState } from 'react';
import { Users, GraduationCap, BookOpen, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';
import { studentService } from '../../services/studentService';
import { teacherService } from '../../services/teacherService';
import { classService } from '../../services/classService';
import { feeService } from '../../services/feeService';
import PerformanceChart from '../../components/PerformanceChart';

const StatCard = ({ icon: Icon, title, value, color, subtitle }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <p className="text-3xl font-bold mt-2">{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      </div>
      <div className={`p-3 rounded-full ${color}`}>
        <Icon className="w-8 h-8 text-white" />
      </div>
    </div>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    classes: 0,
    revenue: 0,
    pendingAmount: 0,
    paidInvoices: 0,
    pendingInvoices: 0,
    overdueInvoices: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [studentsRes, teachersRes, classesRes, paymentStats] = await Promise.all([
          studentService.getAll({ limit: 1 }),
          teacherService.getAll({ limit: 1 }),
          classService.getAll({ limit: 1 }),
          feeService.getPaymentStats(),
        ]);

        setStats({
          students: studentsRes.total || 0,
          teachers: teachersRes.total || 0,
          classes: classesRes.total || 0,
          revenue: paymentStats.data?.totalRevenue || 0,
          pendingAmount: paymentStats.data?.totalPending || 0,
          paidInvoices: paymentStats.data?.paidInvoices || 0,
          pendingInvoices: paymentStats.data?.pendingInvoices || 0,
          overdueInvoices: paymentStats.data?.overdueInvoices || 0,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={Users}
          title="Total Students"
          value={stats.students}
          color="bg-blue-500"
        />
        <StatCard
          icon={GraduationCap}
          title="Total Teachers"
          value={stats.teachers}
          color="bg-green-500"
        />
        <StatCard
          icon={BookOpen}
          title="Total Classes"
          value={stats.classes}
          color="bg-purple-500"
        />
        <StatCard
          icon={DollarSign}
          title="Total Revenue"
          value={`$${stats.revenue.toLocaleString()}`}
          color="bg-yellow-500"
          subtitle={`$${stats.pendingAmount.toLocaleString()} pending`}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Paid Invoices</p>
              <p className="text-2xl font-bold mt-2 text-green-600">{stats.paidInvoices}</p>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Pending Invoices</p>
              <p className="text-2xl font-bold mt-2 text-yellow-600">{stats.pendingInvoices}</p>
            </div>
            <div className="p-3 rounded-full bg-yellow-100">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Overdue Invoices</p>
              <p className="text-2xl font-bold mt-2 text-red-600">{stats.overdueInvoices}</p>
            </div>
            <div className="p-3 rounded-full bg-red-100">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <PerformanceChart
          type="bar"
          title="Revenue Overview"
          data={[
            { name: 'Collected', value: stats.revenue },
            { name: 'Pending', value: stats.pendingAmount }
          ]}
          xKey="name"
          yKey="value"
        />
        <PerformanceChart
          type="pie"
          title="Invoice Status"
          data={[
            { name: 'Paid', value: stats.paidInvoices },
            { name: 'Pending', value: stats.pendingInvoices },
            { name: 'Overdue', value: stats.overdueInvoices }
          ]}
          dataKey="value"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Payment Summary</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-green-50 rounded">
              <span className="text-gray-700">Total Collected</span>
              <span className="font-bold text-green-600">${stats.revenue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-yellow-50 rounded">
              <span className="text-gray-700">Pending Collection</span>
              <span className="font-bold text-yellow-600">${stats.pendingAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
              <span className="text-gray-700">Expected Total</span>
              <span className="font-bold text-blue-600">${(stats.revenue + stats.pendingAmount).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <a href="/admin/fees" className="block p-3 bg-blue-50 hover:bg-blue-100 rounded transition">
              <p className="font-medium text-blue-700">Manage Fee Payments</p>
              <p className="text-sm text-gray-600">View and record student payments</p>
            </a>
            <a href="/admin/students" className="block p-3 bg-green-50 hover:bg-green-100 rounded transition">
              <p className="font-medium text-green-700">Manage Students</p>
              <p className="text-sm text-gray-600">Add or edit student information</p>
            </a>
            <a href="/admin/classes" className="block p-3 bg-purple-50 hover:bg-purple-100 rounded transition">
              <p className="font-medium text-purple-700">Manage Classes</p>
              <p className="text-sm text-gray-600">View and organize classes</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
