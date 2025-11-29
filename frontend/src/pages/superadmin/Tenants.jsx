import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Eye, Power } from 'lucide-react';
import { superAdminService } from '../../services/superAdminService';
import Modal from '../../components/ui/modal';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import TenantForm from '../../components/superadmin/TenantForm';

const Tenants = () => {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      const response = await superAdminService.getAllTenants({ search: searchTerm });
      setTenants(response.data || []);
    } catch (error) {
      console.error('Error fetching tenants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure? This will delete all tenant data permanently!')) {
      try {
        await superAdminService.deleteTenant(id);
        fetchTenants();
      } catch (error) {
        console.error('Error deleting tenant:', error);
        alert('Error deleting tenant');
      }
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await superAdminService.toggleTenantStatus(id);
      fetchTenants();
    } catch (error) {
      console.error('Error toggling tenant status:', error);
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

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedTenant(null);
    fetchTenants();
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Tenants</h1>
        <Button onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Add Tenant
        </Button>
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
              {tenants.map((tenant) => (
                <tr key={tenant._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{tenant.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{tenant.subdomain}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div>{tenant.contactEmail}</div>
                    <div className="text-gray-500">{tenant.contactPhone}</div>
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
                      <button className="text-blue-600 hover:text-blue-800">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(tenant)}
                        className="text-green-600 hover:text-green-800"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(tenant._id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
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
