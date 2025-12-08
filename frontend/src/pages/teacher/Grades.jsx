import { useState, useEffect } from 'react';
import { Save, BookOpen, Search, ArrowUpDown } from 'lucide-react';
import { classService } from '../../services/classService';
import { studentService } from '../../services/studentService';
import { subjectService } from '../../services/subjectService';
import { gradeService } from '../../services/gradeService';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/select';

const TeacherGrades = () => {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [examType, setExamType] = useState('');
  const [examName, setExamName] = useState('');
  const [examDate, setExamDate] = useState(new Date().toISOString().split('T')[0]);
  const [month, setMonth] = useState('');
  const [chapterName, setChapterName] = useState('');
  const [chapterNumber, setChapterNumber] = useState('');
  const [totalMarks, setTotalMarks] = useState('100');
  const [grades, setGrades] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

  useEffect(() => {
    fetchClasses();
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchStudents();
    }
  }, [selectedClass]);

  const fetchClasses = async () => {
    try {
      const response = await classService.getAll();
      setClasses(response.data || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await subjectService.getAll();
      setSubjects(response.data || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await studentService.getAll({ class: selectedClass, limit: 1000 });
      setStudents(response.data || []);

      const initialGrades = {};
      response.data.forEach(student => {
        initialGrades[student._id] = {
          marksObtained: '',
          remarks: ''
        };
      });
      setGrades(initialGrades);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGradeChange = (studentId, field, value) => {
    setGrades(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value
      }
    }));
  };

  const calculateGrade = (marks, total) => {
    const percentage = (marks / total) * 100;
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 50) return 'D';
    return 'F';
  };

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const filteredAndSortedStudents = students
    .filter((student) => {
      const fullName = `${student.user?.firstName} ${student.user?.lastName}`.toLowerCase();
      const rollNo = student.rollNumber?.toLowerCase() || '';
      const search = searchTerm.toLowerCase();
      return fullName.includes(search) || rollNo.includes(search);
    })
    .sort((a, b) => {
      if (!sortConfig.key) return 0;

      let aValue, bValue;
      if (sortConfig.key === 'name') {
        aValue = `${a.user?.firstName} ${a.user?.lastName}`.toLowerCase();
        bValue = `${b.user?.firstName} ${b.user?.lastName}`.toLowerCase();
      } else if (sortConfig.key === 'rollNumber') {
        aValue = a.rollNumber || '';
        bValue = b.rollNumber || '';
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });

  const handleSaveGrades = async () => {
    if (!selectedClass || !selectedSubject || !examType || !examName) {
      alert('Please fill in all required fields');
      return;
    }

    if (examType === 'monthly' && !month) {
      alert('Please select a month for monthly exam');
      return;
    }

    if ((examType === 'chapter' || examType === 'Chapter Exam') && !chapterName) {
      alert('Please enter chapter name for chapter exam');
      return;
    }

    setSaving(true);
    try {
      const currentYear = new Date().getFullYear();
      const studentsWithGrades = Object.entries(grades)
        .filter(([_, data]) => data.marksObtained !== '');

      if (studentsWithGrades.length === 0) {
        alert('Please enter marks for at least one student');
        setSaving(false);
        return;
      }

      // Create grades one by one
      for (const [studentId, data] of studentsWithGrades) {
        const gradeData = {
          student: studentId,
          class: selectedClass,
          subject: selectedSubject,
          examType,
          examName,
          examDate,
          totalMarks: parseInt(totalMarks),
          obtainedMarks: parseInt(data.marksObtained),
          remarks: data.remarks,
          academicYear: `${currentYear}-${currentYear + 1}`
        };

        if (examType === 'monthly') {
          gradeData.month = month;
        }

        if (examType === 'chapter' || examType === 'Chapter Exam') {
          gradeData.chapterName = chapterName;
          if (chapterNumber) {
            gradeData.chapterNumber = parseInt(chapterNumber);
          }
        }

        await gradeService.create(gradeData);
      }

      alert(`Grades saved successfully for ${studentsWithGrades.length} students!`);

      // Reset form
      setGrades({});
      setExamName('');
      setMonth('');
      setChapterName('');
      setChapterNumber('');
      fetchStudents();
    } catch (error) {
      console.error('Error saving grades:', error);
      alert(error.response?.data?.message || 'Error saving grades');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Enter Grades</h1>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">Class *</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="">Select Class</option>
              {classes.map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.name} - {cls.section}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Subject *</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="">Select Subject</option>
              {subjects.map((subject) => (
                <option key={subject._id} value={subject._id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Exam Type *</label>
            <select
              value={examType}
              onChange={(e) => {
                setExamType(e.target.value);
                setMonth('');
                setChapterName('');
                setChapterNumber('');
              }}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="">Select Type</option>
              <option value="Midterm">Midterm</option>
              <option value="Final">Final</option>
              <option value="Chapter Exam">Chapter Exam</option>
              <option value="Quiz">Quiz</option>
              <option value="monthly">Monthly Exam</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">Exam Name *</label>
            <Input
              type="text"
              placeholder="e.g., Monthly Test - January"
              value={examName}
              onChange={(e) => setExamName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Exam Date *</label>
            <Input
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Total Marks *</label>
            <Input
              type="number"
              min="1"
              value={totalMarks}
              onChange={(e) => setTotalMarks(e.target.value)}
            />
          </div>
        </div>

        {examType === 'monthly' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Month *</label>
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Select Month</option>
                <option value="January">January</option>
                <option value="February">February</option>
                <option value="March">March</option>
                <option value="April">April</option>
                <option value="May">May</option>
                <option value="June">June</option>
                <option value="July">July</option>
                <option value="August">August</option>
                <option value="September">September</option>
                <option value="October">October</option>
                <option value="November">November</option>
                <option value="December">December</option>
              </select>
            </div>
          </div>
        )}

        {(examType === 'chapter' || examType === 'Chapter Exam') && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Chapter Name *</label>
              <Input
                type="text"
                placeholder="e.g., Photosynthesis"
                value={chapterName}
                onChange={(e) => setChapterName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Chapter Number</label>
              <Input
                type="number"
                min="1"
                placeholder="e.g., 1"
                value={chapterNumber}
                onChange={(e) => setChapterNumber(e.target.value)}
              />
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <Button
            onClick={handleSaveGrades}
            disabled={!selectedClass || !selectedSubject || !examType || saving}
            className="px-6"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Grades'}
          </Button>
        </div>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            type="text"
            placeholder="Search by student name or roll number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading students...</div>
      ) : students.length > 0 ? (
        <div className="bg-white rounded-lg shadow">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('rollNumber')}
                  >
                    <div className="flex items-center">
                      Roll No
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center">
                      Student Name
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Marks Obtained</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAndSortedStudents.map((student) => {
                  const marks = grades[student._id]?.marksObtained;
                  const grade = marks ? calculateGrade(parseInt(marks), parseInt(totalMarks)) : '-';

                  return (
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
                      <td className="px-6 py-4">
                        <Input
                          type="number"
                          placeholder="0"
                          min="0"
                          max={totalMarks}
                          value={grades[student._id]?.marksObtained || ''}
                          onChange={(e) => handleGradeChange(student._id, 'marksObtained', e.target.value)}
                          className="w-24"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 text-xs rounded-full font-semibold ${grade === 'A+' || grade === 'A' ? 'bg-green-100 text-green-800' :
                          grade === 'B' || grade === 'C' ? 'bg-blue-100 text-blue-800' :
                            grade === 'D' ? 'bg-yellow-100 text-yellow-800' :
                              grade === 'F' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                          }`}>
                          {grade}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Input
                          type="text"
                          placeholder="Add remarks..."
                          value={grades[student._id]?.remarks || ''}
                          onChange={(e) => handleGradeChange(student._id, 'remarks', e.target.value)}
                          className="text-sm"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          {selectedClass ? 'No students found in this class' : 'Select a class to enter grades'}
        </div>
      )}
    </div>
  );
};

export default TeacherGrades;
