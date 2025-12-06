import { useState, useEffect } from 'react';
import { Calendar, Save, Users } from 'lucide-react';
import { classService } from '../../services/classService';
import { attendanceService } from '../../services/attendanceService';
import { studentService } from '../../services/studentService';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

const TeacherAttendance = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchStudents();
      fetchExistingAttendance();
    }
  }, [selectedClass, selectedDate]);

  const fetchClasses = async () => {
    try {
      const response = await classService.getAll();
      setClasses(response.data || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await studentService.getAll({ class: selectedClass, limit: 1000 });
      setStudents(response.data || []);

      const initialAttendance = {};
      response.data.forEach(student => {
        initialAttendance[student._id] = {
          status: 'present',
          remarks: ''
        };
      });
      setAttendance(initialAttendance);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchExistingAttendance = async () => {
    try {
      const response = await attendanceService.getByClass(selectedClass, selectedDate);
      if (response.data && response.data.length > 0) {
        const existingAttendance = {};
        response.data.forEach(record => {
          existingAttendance[record.student._id] = {
            status: record.status,
            remarks: record.remarks || ''
          };
        });
        setAttendance(existingAttendance);
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  const handleAttendanceChange = (studentId, field, value) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value
      }
    }));
  };

  const handleSaveAttendance = async () => {
    if (!selectedClass) {
      alert('Please select a class');
      return;
    }

    setSaving(true);
    try {
      const attendanceData = {
        students: Object.entries(attendance).map(([studentId, data]) => ({
          studentId: studentId,
          status: data.status,
          remarks: data.remarks
        })),
        date: selectedDate,
        classId: selectedClass
      };

      await attendanceService.markAttendance(attendanceData);
      alert('Attendance saved successfully');
    } catch (error) {
      console.error('Error saving attendance:', error);
      alert('Error saving attendance');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Mark Attendance</h1>

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
            <Button
              onClick={handleSaveAttendance}
              disabled={!selectedClass || saving}
              className="w-full"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Attendance'}
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading students...</div>
      ) : students.length > 0 ? (
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <div className="flex items-center">
              <Users className="w-5 h-5 mr-2 text-gray-600" />
              <h2 className="text-lg font-semibold">{students.length} Students</h2>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Roll No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {students.map((student) => (
                  <tr key={student._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {student.rollNumber || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold text-sm mr-3">
                          {student.user?.firstName?.[0]}{student.user?.lastName?.[0]}
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {student.user?.firstName} {student.user?.lastName}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleAttendanceChange(student._id, 'status', 'present')}
                          className={`px-3 py-1 text-xs rounded-full ${attendance[student._id]?.status === 'present'
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                          Present
                        </button>
                        <button
                          onClick={() => handleAttendanceChange(student._id, 'status', 'absent')}
                          className={`px-3 py-1 text-xs rounded-full ${attendance[student._id]?.status === 'absent'
                              ? 'bg-red-500 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                          Absent
                        </button>
                        <button
                          onClick={() => handleAttendanceChange(student._id, 'status', 'late')}
                          className={`px-3 py-1 text-xs rounded-full ${attendance[student._id]?.status === 'late'
                              ? 'bg-yellow-500 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                          Late
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Input
                        type="text"
                        placeholder="Add remarks..."
                        value={attendance[student._id]?.remarks || ''}
                        onChange={(e) => handleAttendanceChange(student._id, 'remarks', e.target.value)}
                        className="text-sm"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          {selectedClass ? 'No students found in this class' : 'Select a class to mark attendance'}
        </div>
      )}
    </div>
  );
};

export default TeacherAttendance;
