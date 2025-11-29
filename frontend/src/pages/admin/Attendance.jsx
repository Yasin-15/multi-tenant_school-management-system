import { useState, useEffect } from 'react';
import { Calendar, Search } from 'lucide-react';
import { attendanceService } from '../../services/attendanceService';
import { classService } from '../../services/classService';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

const Attendance = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await classService.getAll();
      setClasses(response.data || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchAttendance = async () => {
    if (!selectedClass) return;
    
    setLoading(true);
    try {
      const response = await attendanceService.getByClass(selectedClass, selectedDate);
      setAttendance(response.data || []);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Attendance Management</h1>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Select Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="">Choose a class</option>
              {classes.map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.name} - {cls.section}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Select Date</label>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          <div className="flex items-end">
            <Button onClick={fetchAttendance} className="w-full">
              <Search className="w-4 h-4 mr-2" />
              View Attendance
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : attendance.length > 0 ? (
        <div className="bg-white rounded-lg shadow">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {attendance.map((record) => (
                  <tr key={record._id}>
                    <td className="px-6 py-4">{record.student?.user?.firstName} {record.student?.user?.lastName}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        record.status === 'present' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">{record.remarks || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          Select a class and date to view attendance
        </div>
      )}
    </div>
  );
};

export default Attendance;
