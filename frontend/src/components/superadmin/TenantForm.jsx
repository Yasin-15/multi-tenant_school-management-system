import { useState, useEffect } from 'react';
import { superAdminService } from '../../services/superAdminService';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { toast } from 'react-hot-toast';

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
  const [validationErrors, setValidationErrors] = useState({});

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

    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

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
      setFormData((prev) => {
        const newData = { ...prev, [name]: value };

        // Auto-generate subdomain from school name (only for new tenants)
        if (name === 'name' && !tenant && !prev.subdomain) {
          const subdomain = value
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .substring(0, 30);
          newData.subdomain = subdomain;
        }

        return newData;
      });
    }
  };

  const validateForm = () => {
    const errors = {};

    // Required fields validation
    if (!formData.name.trim()) {
      errors.name = 'School name is required';
    }

    if (!formData.subdomain.trim()) {
      errors.subdomain = 'Subdomain is required';
    } else if (!/^[a-z0-9-]+$/.test(formData.subdomain)) {
      errors.subdomain = 'Subdomain can only contain lowercase letters, numbers, and hyphens';
    }

    if (!formData.contactEmail.trim()) {
      errors.contactEmail = 'Contact email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      errors.contactEmail = 'Invalid email format';
    }

    // Admin user validation (only for new tenants)
    if (!tenant) {
      if (!formData.adminUser.firstName.trim()) {
        errors['adminUser.firstName'] = 'First name is required';
      }

      if (!formData.adminUser.lastName.trim()) {
        errors['adminUser.lastName'] = 'Last name is required';
      }

      if (!formData.adminUser.email.trim()) {
        errors['adminUser.email'] = 'Admin email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.adminUser.email)) {
        errors['adminUser.email'] = 'Invalid email format';
      }

      if (!formData.adminUser.password) {
        errors['adminUser.password'] = 'Password is required';
      } else if (formData.adminUser.password.length < 6) {
        errors['adminUser.password'] = 'Password must be at least 6 characters';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      toast.error('Please fix the validation errors');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (tenant) {
        await superAdminService.updateTenant(tenant._id, formData);
        toast.success('Tenant updated successfully');
      } else {
        await superAdminService.createTenant(formData);
        toast.success('Tenant created successfully');
      }
      onClose();
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'An error occurred';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getFieldError = (fieldName) => {
    return validationErrors[fieldName];
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
            className={getFieldError('name') ? 'border-red-500' : ''}
          />
          {getFieldError('name') && (
            <p className="text-red-500 text-xs mt-1">{getFieldError('name')}</p>
          )}
        </div>

        <div>
          <Label htmlFor="subdomain">Subdomain *</Label>
          <Input
            id="subdomain"
            name="subdomain"
            value={formData.subdomain}
            onChange={handleChange}
            disabled={!!tenant}
            placeholder="e.g., myschool"
            className={getFieldError('subdomain') ? 'border-red-500' : ''}
          />
          {getFieldError('subdomain') && (
            <p className="text-red-500 text-xs mt-1">{getFieldError('subdomain')}</p>
          )}
          {!tenant && formData.subdomain && !getFieldError('subdomain') && (
            <p className="text-blue-600 text-xs mt-1">
              URL: {formData.subdomain}.yourschool.com
            </p>
          )}
          {!tenant && !formData.subdomain && (
            <p className="text-gray-500 text-xs mt-1">
              Only lowercase letters, numbers, and hyphens allowed
            </p>
          )}
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
            placeholder="contact@school.com"
            className={getFieldError('contactEmail') ? 'border-red-500' : ''}
          />
          {getFieldError('contactEmail') && (
            <p className="text-red-500 text-xs mt-1">{getFieldError('contactEmail')}</p>
          )}
        </div>

        <div>
          <Label htmlFor="contactPhone">Contact Phone</Label>
          <Input
            id="contactPhone"
            name="contactPhone"
            value={formData.contactPhone}
            onChange={handleChange}
            placeholder="+1234567890"
          />
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="text-lg font-semibold mb-4">Address</h3>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <Label htmlFor="address.street">Street Address</Label>
            <Input
              id="address.street"
              name="address.street"
              value={formData.address.street}
              onChange={handleChange}
              placeholder="123 School St"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <Label htmlFor="address.city">City</Label>
            <Input
              id="address.city"
              name="address.city"
              value={formData.address.city}
              onChange={handleChange}
              placeholder="New York"
            />
          </div>
          <div>
            <Label htmlFor="address.state">State/Province</Label>
            <Input
              id="address.state"
              name="address.state"
              value={formData.address.state}
              onChange={handleChange}
              placeholder="NY"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <Label htmlFor="address.country">Country</Label>
            <Input
              id="address.country"
              name="address.country"
              value={formData.address.country}
              onChange={handleChange}
              placeholder="USA"
            />
          </div>
          <div>
            <Label htmlFor="address.zipCode">Zip/Postal Code</Label>
            <Input
              id="address.zipCode"
              name="address.zipCode"
              value={formData.address.zipCode}
              onChange={handleChange}
              placeholder="10001"
            />
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="text-lg font-semibold mb-4">Settings</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="settings.currency">Currency</Label>
            <Input
              id="settings.currency"
              name="settings.currency"
              value={formData.settings.currency}
              onChange={handleChange}
              placeholder="USD"
            />
          </div>
          <div>
            <Label htmlFor="settings.timezone">Timezone</Label>
            <Input
              id="settings.timezone"
              name="settings.timezone"
              value={formData.settings.timezone}
              onChange={handleChange}
              placeholder="UTC"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <Label htmlFor="settings.language">Language</Label>
            <Input
              id="settings.language"
              name="settings.language"
              value={formData.settings.language}
              onChange={handleChange}
              placeholder="en"
            />
          </div>
          <div>
            <Label htmlFor="subscription.plan">Plan</Label>
            <select
              id="subscription.plan"
              name="subscription.plan"
              value={formData.subscription.plan}
              onChange={handleChange}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="trial">Trial</option>
              <option value="basic">Basic</option>
              <option value="premium">Premium</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>
        </div>
      </div>

      {
        !tenant && (
          <>
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-4">Admin User</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="adminUser.firstName">First Name *</Label>
                  <Input
                    id="adminUser.firstName"
                    name="adminUser.firstName"
                    value={formData.adminUser.firstName}
                    onChange={handleChange}
                    placeholder="John"
                    className={getFieldError('adminUser.firstName') ? 'border-red-500' : ''}
                  />
                  {getFieldError('adminUser.firstName') && (
                    <p className="text-red-500 text-xs mt-1">{getFieldError('adminUser.firstName')}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="adminUser.lastName">Last Name *</Label>
                  <Input
                    id="adminUser.lastName"
                    name="adminUser.lastName"
                    value={formData.adminUser.lastName}
                    onChange={handleChange}
                    placeholder="Doe"
                    className={getFieldError('adminUser.lastName') ? 'border-red-500' : ''}
                  />
                  {getFieldError('adminUser.lastName') && (
                    <p className="text-red-500 text-xs mt-1">{getFieldError('adminUser.lastName')}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <Label htmlFor="adminUser.email">Admin Email *</Label>
                  <Input
                    id="adminUser.email"
                    name="adminUser.email"
                    type="email"
                    value={formData.adminUser.email}
                    onChange={handleChange}
                    placeholder="admin@school.com"
                    className={getFieldError('adminUser.email') ? 'border-red-500' : ''}
                  />
                  {getFieldError('adminUser.email') && (
                    <p className="text-red-500 text-xs mt-1">{getFieldError('adminUser.email')}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="adminUser.password">Password *</Label>
                  <Input
                    id="adminUser.password"
                    name="adminUser.password"
                    type="password"
                    value={formData.adminUser.password}
                    onChange={handleChange}
                    placeholder="Min. 6 characters"
                    className={getFieldError('adminUser.password') ? 'border-red-500' : ''}
                  />
                  {getFieldError('adminUser.password') && (
                    <p className="text-red-500 text-xs mt-1">{getFieldError('adminUser.password')}</p>
                  )}
                </div>
              </div>
            </div>
          </>
        )
      }

      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : tenant ? 'Update' : 'Create'}
        </Button>
      </div>
    </form >
  );
};

export default TenantForm;
