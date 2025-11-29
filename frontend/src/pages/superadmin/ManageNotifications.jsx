import { useState, useEffect } from 'react';
import { Bell, Plus, Send, Users, X, Building2 } from 'lucide-react';
import notificationService from '../../services/notificationService';
import api from '../../services/api';

const SuperAdminManageNotifications = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tenants, setTenants] = useState([]);
  const [selectedTenant, setSelectedTenant] = useState('');
  const [users, setUsers] = useState([]);

  const [formData, setFormData] = useState({
    recipientType: 'all',
    recipients: [],
    type: 'info',
    title: '',
    message: '',
    link: ''
  });

  useEffect(() => {
    fetchTenants();
  }, []);

  useEffect(() => {
    if (selectedTenant) {
      fetchTenantUsers();
    }
  }, [selectedTenant]);

  const fetchTenants = async () => {
    try {
      const response = await api.get('/tenants');
      const tenantData = response.data.data || response.data;
      setTenants(Array.isArray(tenantData) ? tenantData : []);
    } catch (error) {
      console.error('Error fetching tenants:', error);
    }
  };

  const fetchTenantUsers = async () => {
    try {
      // Fetch users for the selected tenant
      const response = await api.get(`/super-admin/tenants/${selectedTenant}/users`);
      const userData = response.data.data || response.data;
      setUsers(Array.isArray(userData) ? userData : []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRecipientTypeChange = (type) => {
    setFormData(prev => ({
      ...prev,
      recipientType: type,
      recipients: []
    }));
  };

  const handleRecipientToggle = (userId) => {
    setFormData(prev => ({
      ...prev,
      recipients: prev.recipients.includes(userId)
        ? prev.recipients.filter(id => id !== userId)
        : [...prev.recipients, userId]
    }));
  };

  const handleSelectAll = () => {
    const allUserIds = users.map(u => u._id).filter(Boolean);
    setFormData(prev => ({
      ...prev,
      recipients: allUserIds
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedTenant) {
      alert('Please select a tenant');
      return;
    }

    if (!formData.title || !formData.message) {
      alert('Please fill in all required fields');
      return;
    }

    let recipients = [];

    if (formData.recipientType === 'all') {
      recipients = users.map(u => u._id).filter(Boolean);
    } else {
      recipients = formData.recipients;
    }

    if (recipients.length === 0) {
      alert('Please select at least one recipient');
      return;
    }

    try {
      setLoading(true);
      
      // Super admin needs to send notification through tenant context
      await api.post('/notifications', {
        recipients,
        type: formData.type,
        title: formData.title,
        message: formData.message,
        link: formData.link || undefined,
        tenantId: selectedTenant
      });

      alert(`Notification sent to ${recipients.length} recipient(s)`);
      setShowCreateModal(false);
      setFormData({
        recipientType: 'all',
        recipients: [],
        type: 'info',
        title: '',
        message: '',
        link: ''
      });
    } catch (error) {
      console.error('Error creating notification:', error);
      alert('Failed to send notification');
    } finally {
      setLoading(false);
    }
  };

  const studentCount = users.filter(u => u.role === 'student').length;
  const teacherCount = users.filter(u => u.role === 'teacher').length;
  const adminCount = users.filter(u => u.role === 'admin').length;

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Notifications</h1>
          <p className="text-gray-600 mt-2">Send notifications to users across tenants</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          disabled={!selectedTenant}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-5 h-5" />
          Create Notification
        </button>
      </div>

      {/* Tenant Selection */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Tenant
        </label>
        <select
          value={selectedTenant}
          onChange={(e) => setSelectedTenant(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Choose a tenant...</option>
          {tenants.map(tenant => (
            <option key={tenant._id} value={tenant._id}>
              {tenant.name} - {tenant.subdomain}
            </option>
          ))}
        </select>
      </div>

      {selectedTenant && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Users</p>
                <p className="text-3xl font-bold mt-2">{users.length}</p>
              </div>
              <Users className="w-12 h-12 text-purple-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Students</p>
                <p className="text-3xl font-bold mt-2">{studentCount}</p>
              </div>
              <Users className="w-12 h-12 text-blue-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Teachers</p>
                <p className="text-3xl font-bold mt-2">{teacherCount}</p>
              </div>
              <Users className="w-12 h-12 text-green-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Admins</p>
                <p className="text-3xl font-bold mt-2">{adminCount}</p>
              </div>
              <Building2 className="w-12 h-12 text-orange-500 opacity-20" />
            </div>
          </div>
        </div>
      )}

      {/* Create Notification Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-2xl font-bold">Create Notification</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Recipient Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Send To
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleRecipientTypeChange('all')}
                    className={`px-4 py-2 rounded-lg border ${
                      formData.recipientType === 'all'
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    All Users
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRecipientTypeChange('custom')}
                    className={`px-4 py-2 rounded-lg border ${
                      formData.recipientType === 'custom'
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Select Users
                  </button>
                </div>
              </div>

              {/* Individual Selection */}
              {formData.recipientType === 'custom' && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Select Recipients ({formData.recipients.length} selected)
                    </label>
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      Select All
                    </button>
                  </div>
                  <div className="border border-gray-300 rounded-lg max-h-48 overflow-y-auto p-2">
                    {users.map(user => (
                      <label
                        key={user._id}
                        className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={formData.recipients.includes(user._id)}
                          onChange={() => handleRecipientToggle(user._id)}
                          className="rounded"
                        />
                        <span className="text-sm">
                          {user.firstName} {user.lastName} - {user.email}
                          <span className="ml-2 text-xs text-gray-500">({user.role})</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Notification Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="info">Info</option>
                  <option value="success">Success</option>
                  <option value="warning">Warning</option>
                  <option value="error">Error</option>
                  <option value="announcement">Announcement</option>
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter notification title"
                  required
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter notification message"
                  required
                />
              </div>

              {/* Link (Optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Link (Optional)
                </label>
                <input
                  type="text"
                  name="link"
                  value={formData.link}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="/path/to/page"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  <Send className="w-5 h-5" />
                  {loading ? 'Sending...' : 'Send Notification'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminManageNotifications;
