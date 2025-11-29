import { useState, useEffect } from 'react';
import { Users, BookOpen, Eye } from 'lucide-react';
import { classService } from '../../services/classService';
import { useNavigate } from 'react-router-dom';

const MyClasses = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await classService.getAll();
      setClasses(response.data || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">My Classes</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((cls) => (
          <div key={cls._id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <span className={`px-3 py-1 text-xs rounded-full ${
                  cls.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {cls.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <h3 className="text-xl font-semibold mb-2">{cls.name}</h3>
              <p className="text-gray-600 mb-4">Section: {cls.section} | Grade: {cls.grade}</p>

              <div className="flex items-center text-gray-600 mb-2">
                <Users className="w-4 h-4 mr-2" />
                <span className="text-sm">{cls.students?.length || 0} Students</span>
              </div>

              <div className="text-sm text-gray-600 mb-4">
                Room: {cls.room || 'Not assigned'}
              </div>

              <button
                onClick={() => navigate(`/teacher/classes/${cls._id}`)}
                className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {classes.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No classes assigned yet</p>
        </div>
      )}
    </div>
  );
};

export default MyClasses;
