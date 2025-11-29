import { useState, useEffect } from 'react';
import { superAdminService } from '../../services/superAdminService';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

const TenantForm = ({ tenant, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    subdomain: '',
    domain: '',
    contactEmail: '',
    contactPhone: '',
    address: {
      street: '',
      city: '',
      state: '',
      country: '',
      zipCode: '',
    },
    settings: {
      currency: 'USD',
      timezone: 'UTC',
      language: 'en',
      maxStudents: 1000,
      maxTeachers: 100,
    },
    subscription: {
      plan: 'trial',
      status: 'active',
    },
    adminUser: {
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phone: '',
    },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (tenant) {
      setFormData({
        ...tenant,
        adminUser: {
          email: '',
          password: '',
          firstName: '',
          lastName: '',
          phone: '',
        },
      });
    }
  }, [tenant]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (tenant) {
        await superAdminService.updateTenant(tenant._id, formData);
      } else {
        await superAdminService.createTenant(formData);
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">School Name *</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <Label htmlFor="subdomain">Subdomain *</Label>
          <Input
            id="subdomain"
            name="subdomain"
            value={formData.subdomain}
            onChange={handleChange}
            required
            disabled={!!tenant}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="contactEmail">Contact Email *</Label>
          <Input
            id="contactEmail"
            name="contactEmail"
            type="email"
            value={formData.contactEmail}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <Label htmlFor="contactPhone">Contact Phone</Label>
          <Input
            id="contactPhone"
            name="contactPhone"
            value={formData.contactPhone}
            onChange={handleChange}
          />
        </div>
      </div>

      {!tenant && (
        <>
          <h3 className="text-lg font-semibold border-t pt-4">Admin User</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="adminUser.firstName">First Name *</Label>
              <Input
                id="adminUser.firstName"
                name="adminUser.firstName"
                value={formData.adminUser.firstName}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="adminUser.lastName">Last Name *</Label>
              <Input
                id="adminUser.lastName"
                name="adminUser.lastName"
                value={formData.adminUser.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="adminUser.email">Admin Email *</Label>
              <Input
                id="adminUser.email"
                name="adminUser.email"
                type="email"
                value={formData.adminUser.email}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="adminUser.password">Password *</Label>
              <Input
                id="adminUser.password"
                name="adminUser.password"
                type="password"
                value={formData.adminUser.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </>
      )}

      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : tenant ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
};

export default TenantForm;
