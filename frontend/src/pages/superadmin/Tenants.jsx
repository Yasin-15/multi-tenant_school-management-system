import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Eye, Power, RefreshCw } from 'lucide-react';
import { superAdminService } from '../../services/superAdminService';
import Modal from '../../components/ui/modal';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import TenantForm from '../../components/superadmin/TenantForm';
import { toast } from 'react-hot-toast';

const Tenants = () => {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) {
        setRefreshing(true);
      }
      const response = await superAdminService.getAllTenants({ search: searchTerm });
      setTenants(response.data || []);
    } catch (error) {
      console.error('Error fetching tenants:', error);
      toast.error('Failed to fetch tenants');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchTenants(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure? This will delete all tenant data permanently!')) {
      try {
        await superAdminService.deleteTenant(id);
        toast.success('Tenant deleted successfully');
        fetchTenants();
      } catch (error) {
        console.error('Error deleting tenant:', error);
        toast.error(error.response?.data?.message || 'Error deleting tenant');
      }
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const response = await superAdminService.toggleTenantStatus(id);
      toast.success(response.message || 'Tenant status updated');
      fetchTenants();
    } catch (error) {
      console.error('Error toggling tenant status:', error);
      toast.error(error.response?.data?.message || 'Error updating tenant status');
    }
  };

  const handleEdit = (tenant) => {
    setSelectedTenant(tenant);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedTenant(null);
    setIsModalOpen(true);
  };

  const handleModalClose = (shouldRefresh = true) => {
    setIsModalOpen(false);
    setSelectedTenant(null);
    if (shouldRefresh) {
      fetchTenants();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tenants...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Manage Tenants</h1>
          <p className="text-gray-600 mt-1">Create and manage school tenants</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={handleAdd}>
            <Plus className="w-4 h-4 mr-2" />
            Add Tenant
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search tenants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyUp={(e) => e.key === 'Enter' && fetchTenants()}
              className="pl-10"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subdomain</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {tenants.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <p className="text-lg font-medium mb-2">No tenants found</p>
                      <p className="text-sm mb-4">
                        {searchTerm ? 'Try adjusting your search' : 'Get started by creating your first tenant'}
                      </p>
                      {!searchTerm && (
                        <Button onClick={handleAdd}>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Tenant
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                tenants.map((tenant) => (
                  <tr key={tenant._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{tenant.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{tenant.subdomain}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div>{tenant.contactEmail}</div>
                      <div className="text-gray-500">{tenant.contactPhone || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm capitalize">
                      {tenant.subscription?.plan || 'trial'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        tenant.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {tenant.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {new Date(tenant.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleToggleStatus(tenant._id)}
                          className={`${tenant.isActive ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'}`}
                          title={tenant.isActive ? 'Deactivate' : 'Activate'}
                        >
                          <Power className="w-4 h-4" />
                        </button>
                        <button 
                          className="text-blue-600 hover:text-blue-800"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(tenant)}
                          className="text-green-600 hover:text-green-800"
                          title="Edit Tenant"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(tenant._id)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete Tenant"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title={selectedTenant ? 'Edit Tenant' : 'Add Tenant'}
        size="lg"
      >
        <TenantForm tenant={selectedTenant} onClose={handleModalClose} />
      </Modal>
    </div>
  );
};

export default Tenants;
