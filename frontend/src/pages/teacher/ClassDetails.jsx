import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, ArrowLeft, Calendar, MapPin } from 'lucide-react';
import { classService } from '../../services/classService';

const ClassDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [classData, setClassData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchClassDetails();
    }, [id]);

    const fetchClassDetails = async () => {
        try {
            setLoading(true);
            const response = await classService.getById(id);
            setClassData(response.data || response);
        } catch (err) {
            console.error('Error fetching class details:', err);
            setError('Failed to load class details');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-full">Loading...</div>;
    }

    if (error) {
        return (
            <div className="p-8 text-center">
                <p className="text-red-500 mb-4">{error}</p>
                <button
                    onClick={() => navigate('/teacher/classes')}
                    className="text-blue-600 hover:underline"
                >
                    Back to Classes
                </button>
            </div>
        );
    }

    if (!classData) return null;

    return (
        <div className="p-8">
            <button
                onClick={() => navigate('/teacher/classes')}
                className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Classes
            </button>

            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">{classData.name}</h1>
                            <div className="flex items-center gap-4 text-gray-600">
                                <span className="flex items-center">
                                    <span className="font-semibold mr-1">Grade:</span> {classData.grade}
                                </span>
                                <span className="flex items-center">
                                    <span className="font-semibold mr-1">Section:</span> {classData.section}
                                </span>
                            </div>
                        </div>
                        <span className={`px-3 py-1 text-sm rounded-full ${classData.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                            {classData.isActive ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                </div>

                <div className="p-6 bg-gray-50 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex items-center p-4 bg-white rounded-lg shadow-sm">
                        <div className="p-3 bg-blue-100 rounded-full mr-4">
                            <Users className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Total Students</p>
                            <p className="text-xl font-bold">{classData.students?.length || 0}</p>
                        </div>
                    </div>

                    <div className="flex items-center p-4 bg-white rounded-lg shadow-sm">
                        <div className="p-3 bg-purple-100 rounded-full mr-4">
                            <MapPin className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Room</p>
                            <p className="text-xl font-bold">{classData.room || 'Not assigned'}</p>
                        </div>
                    </div>

                    <div className="flex items-center p-4 bg-white rounded-lg shadow-sm">
                        <div className="p-3 bg-orange-100 rounded-full mr-4">
                            <Calendar className="w-6 h-6 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Academic Year</p>
                            <p className="text-xl font-bold">{classData.academicYear}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">Students</h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Roll No</th>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Parent Contact</th>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {classData.students && classData.students.length > 0 ? (
                                classData.students.map((student) => (
                                    <tr key={student._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {student.rollNumber || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 mr-3">
                                                    {student.user?.firstName?.[0] || 'S'}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {student.user?.firstName} {student.user?.lastName}
                                                    </div>
                                                    <div className="text-sm text-gray-500">{student.admissionNumber}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {student.user?.gender || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {student.guardianPhone || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${student.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                {student.status || 'Active'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                        No students found in this class
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ClassDetails;
