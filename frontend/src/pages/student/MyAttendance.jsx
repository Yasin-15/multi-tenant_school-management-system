import { useState, useEffect } from 'react';
import { Calendar, TrendingUp, AlertCircle } from 'lucide-react';
import { attendanceService } from '../../services/attendanceService';

const MyAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [stats, setStats] = useState({
    totalDays: 0,
    present: 0,
    absent: 0,
    late: 0,
    percentage: 0,
  });
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendance();
  }, [selectedMonth, selectedYear]);

  const fetchAttendance = async () => {
    try {
      const response = await attendanceService.getMyAttendance({
        month: selectedMonth + 1,
        year: selectedYear,
      });
      
      const attendanceData = response.data || [];
      setAttendance(attendanceData);

      // Calculate stats
      const present = attendanceData.filter(a => a.status === 'present').length;
      const absent = attendanceData.filter(a => a.status === 'absent').length;
      const late = attendanceData.filter(a => a.status === 'late').length;
      const total = attendanceData.length;
      const percentage = total > 0 ? ((present + late) / total * 100).toFixed(1) : 0;

      setStats({
        totalDays: total,
        present,
        absent,
        late,
        percentage,
      });
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">My Attendance</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Attendance Rate</p>
              <p className="text-3xl font-bold mt-2">{stats.percentage}%</p>
            </div>
            <div className={`p-3 rounded-full ${
              stats.percentage >= 75 ? 'bg-green-100' : 'bg-red-100'
            }`}>
              <TrendingUp className={`w-8 h-8 ${
                stats.percentage >= 75 ? 'text-green-600' : 'text-red-600'
              }`} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Present Days</p>
              <p className="text-3xl font-bold mt-2">{stats.present}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Calendar className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Absent Days</p>
              <p className="text-3xl font-bold mt-2">{stats.absent}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Late Days</p>
              <p className="text-3xl font-bold mt-2">{stats.late}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <Calendar className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Select Month</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="w-full px-3 py-2 border rounded-md"
            >
              {months.map((month, index) => (
                <option key={month} value={index}>
                  {month}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Select Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="w-full px-3 py-2 border rounded-md"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Attendance Warning */}
      {stats.percentage < 75 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start">
          <AlertCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-800">Low Attendance Warning</h3>
            <p className="text-sm text-red-700 mt-1">
              Your attendance is below 75%. Please ensure regular attendance to meet the minimum requirement.
            </p>
          </div>
        </div>
      )}

      {/* Attendance Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Day</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {attendance.map((record) => {
                const date = new Date(record.date);
                return (
                  <tr key={record._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {date.toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {date.toLocaleDateString('en-US', { weekday: 'long' })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 text-xs rounded-full font-semibold ${
                        record.status === 'present' ? 'bg-green-100 text-green-800' :
                        record.status === 'absent' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {record.remarks || '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {attendance.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No attendance records found for {months[selectedMonth]} {selectedYear}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAttendance;
