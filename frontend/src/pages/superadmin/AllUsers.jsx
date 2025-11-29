import { useState, useEffect } from 'react';
import { Search, Filter, Eye, Ban, CheckCircle, Trash2 } from 'lucide-react';
import { superAdminService } from '../../services/superAdminService';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/select';
import Modal from '../../components/ui/modal';

const AllUsers = () => {
  const [users, setUsers] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTenant, setSelectedTenant] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  useEffect(() => {
    fetchTenants();
    fetchUsers();
  }, [pagination.page, selectedTenant, selectedRole, searchTerm]);

  const fetchTenants = async () => {
    try {
      const response = await superAdminService.getAllTenants();
      setTenants(response.data || []);
    } catch (error) {
      console.error('Error fetching tenants:', error);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm,
        tenant: selectedTenant,
        role: selectedRole,
      };
      const response = await superAdminService.getAllUsers(params);
      setUsers(response.data || []);
      setPagination({
        ...pagination,
        total: response.total || 0,
        pages: response.pages || 0,
      });
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    if (window.confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this user?`)) {
      try {
        await superAdminService.toggleUserStatus(userId);
        fetchUsers();
      } catch (error) {
        console.error('Error toggling user status:', error);
        alert('Error updating user status');
      }
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone!')) {
      try {
        await superAdminService.deleteUser(userId);
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Error deleting user');
      }
    }
  };

  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      super_admin: 'bg-purple-100 text-purple-800',
      admin: 'bg-blue-100 text-blue-800',
      teacher: 'bg-green-100 text-green-800',
      student: 'bg-yellow-100 text-yellow-800',
      parent: 'bg-pink-100 text-pink-800',
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  if (loading && users.length === 0) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">All Users</h1>
        <p className="text-gray-600">Manage users across all tenants</p>
      </div>

      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4 border-b">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Select
                value={selectedTenant}
                onChange={(e) => setSelectedTenant(e.target.value)}
              >
                <option value="">All Tenants</option>
                {tenants.map((tenant) => (
                  <option key={tenant._id} value={tenant._id}>
                    {tenant.name}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="teacher">Teacher</option>
                <option value="student">Student</option>
                <option value="parent">Parent</option>
              </Select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tenant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Login</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold">
                        {user.firstName?.[0]}{user.lastName?.[0]}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full capitalize ${getRoleBadgeColor(user.role)}`}>
                      {user.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.tenant?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewDetails(user)}
                        className="text-blue-600 hover:text-blue-800"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(user._id, user.isActive)}
                        className={`${user.isActive ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'}`}
                        title={user.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {user.isActive ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                      </button>
                      {user.role !== 'super_admin' && (
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-500">
            No users found
          </div>
        )}

        {pagination.pages > 1 && (
          <div className="px-6 py-4 border-t flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} users
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                disabled={pagination.page === 1}
                className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                disabled={pagination.page === pagination.pages}
                className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="User Details"
      >
        {selectedUser && (
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold text-xl">
                {selectedUser.firstName?.[0]}{selectedUser.lastName?.[0]}
              </div>
              <div>
                <h3 className="text-xl font-semibold">{selectedUser.firstName} {selectedUser.lastName}</h3>
                <p className="text-gray-600">{selectedUser.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <label className="text-sm font-medium text-gray-500">Role</label>
                <p className="mt-1 capitalize">{selectedUser.role.replace('_', ' ')}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <p className="mt-1">{selectedUser.isActive ? 'Active' : 'Inactive'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Tenant</label>
                <p className="mt-1">{selectedUser.tenant?.name || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Phone</label>
                <p className="mt-1">{selectedUser.phone || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                <p className="mt-1">
                  {selectedUser.dateOfBirth ? new Date(selectedUser.dateOfBirth).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Gender</label>
                <p className="mt-1 capitalize">{selectedUser.gender || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Last Login</label>
                <p className="mt-1">
                  {selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleString() : 'Never'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Created At</label>
                <p className="mt-1">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            {selectedUser.address && (
              <div className="pt-4 border-t">
                <label className="text-sm font-medium text-gray-500">Address</label>
                <p className="mt-1">
                  {selectedUser.address.street && `${selectedUser.address.street}, `}
                  {selectedUser.address.city && `${selectedUser.address.city}, `}
                  {selectedUser.address.state && `${selectedUser.address.state} `}
                  {selectedUser.address.zipCode}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AllUsers;
