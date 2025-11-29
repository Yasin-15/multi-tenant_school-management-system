import { useState, useEffect } from 'react';
import { Save, Database, Mail, Shield, Bell } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';

const Settings = () => {
  const [settings, setSettings] = useState({
    system: {
      siteName: 'School Management System',
      supportEmail: 'support@schoolms.com',
      maxTenantsPerPlan: {
        trial: 1,
        basic: 10,
        premium: 50,
        enterprise: 999,
      },
    },
    email: {
      smtpHost: '',
      smtpPort: 587,
      smtpUser: '',
      smtpPassword: '',
      fromEmail: '',
      fromName: 'School MS',
    },
    security: {
      jwtExpiry: '7d',
      passwordMinLength: 6,
      maxLoginAttempts: 5,
      sessionTimeout: 3600,
    },
    notifications: {
      enableEmail: true,
      enableSMS: false,
      enablePush: false,
    },
  });

  const [activeTab, setActiveTab] = useState('system');
  const [saving, setSaving] = useState(false);

  const handleChange = (section, field, value) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // TODO: Implement API call to save settings
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'system', label: 'System', icon: Database },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">System Settings</h1>
        <p className="text-gray-600">Configure system-wide settings</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="border-b">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'system' && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="siteName">Site Name</Label>
                <Input
                  id="siteName"
                  value={settings.system.siteName}
                  onChange={(e) => handleChange('system', 'siteName', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="supportEmail">Support Email</Label>
                <Input
                  id="supportEmail"
                  type="email"
                  value={settings.system.supportEmail}
                  onChange={(e) => handleChange('system', 'supportEmail', e.target.value)}
                />
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Max Tenants Per Plan</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="trialMax">Trial</Label>
                    <Input
                      id="trialMax"
                      type="number"
                      value={settings.system.maxTenantsPerPlan.trial}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          system: {
                            ...prev.system,
                            maxTenantsPerPlan: {
                              ...prev.system.maxTenantsPerPlan,
                              trial: parseInt(e.target.value),
                            },
                          },
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="basicMax">Basic</Label>
                    <Input
                      id="basicMax"
                      type="number"
                      value={settings.system.maxTenantsPerPlan.basic}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          system: {
                            ...prev.system,
                            maxTenantsPerPlan: {
                              ...prev.system.maxTenantsPerPlan,
                              basic: parseInt(e.target.value),
                            },
                          },
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="premiumMax">Premium</Label>
                    <Input
                      id="premiumMax"
                      type="number"
                      value={settings.system.maxTenantsPerPlan.premium}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          system: {
                            ...prev.system,
                            maxTenantsPerPlan: {
                              ...prev.system.maxTenantsPerPlan,
                              premium: parseInt(e.target.value),
                            },
                          },
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="enterpriseMax">Enterprise</Label>
                    <Input
                      id="enterpriseMax"
                      type="number"
                      value={settings.system.maxTenantsPerPlan.enterprise}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          system: {
                            ...prev.system,
                            maxTenantsPerPlan: {
                              ...prev.system.maxTenantsPerPlan,
                              enterprise: parseInt(e.target.value),
                            },
                          },
                        }))
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'email' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="smtpHost">SMTP Host</Label>
                  <Input
                    id="smtpHost"
                    value={settings.email.smtpHost}
                    onChange={(e) => handleChange('email', 'smtpHost', e.target.value)}
                    placeholder="smtp.gmail.com"
                  />
                </div>
                <div>
                  <Label htmlFor="smtpPort">SMTP Port</Label>
                  <Input
                    id="smtpPort"
                    type="number"
                    value={settings.email.smtpPort}
                    onChange={(e) => handleChange('email', 'smtpPort', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="smtpUser">SMTP Username</Label>
                <Input
                  id="smtpUser"
                  value={settings.email.smtpUser}
                  onChange={(e) => handleChange('email', 'smtpUser', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="smtpPassword">SMTP Password</Label>
                <Input
                  id="smtpPassword"
                  type="password"
                  value={settings.email.smtpPassword}
                  onChange={(e) => handleChange('email', 'smtpPassword', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fromEmail">From Email</Label>
                  <Input
                    id="fromEmail"
                    type="email"
                    value={settings.email.fromEmail}
                    onChange={(e) => handleChange('email', 'fromEmail', e.target.value)}
                    placeholder="noreply@schoolms.com"
                  />
                </div>
                <div>
                  <Label htmlFor="fromName">From Name</Label>
                  <Input
                    id="fromName"
                    value={settings.email.fromName}
                    onChange={(e) => handleChange('email', 'fromName', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="jwtExpiry">JWT Token Expiry</Label>
                  <Input
                    id="jwtExpiry"
                    value={settings.security.jwtExpiry}
                    onChange={(e) => handleChange('security', 'jwtExpiry', e.target.value)}
                    placeholder="7d"
                  />
                  <p className="text-sm text-gray-500 mt-1">Format: 7d, 24h, 60m</p>
                </div>
                <div>
                  <Label htmlFor="passwordMinLength">Min Password Length</Label>
                  <Input
                    id="passwordMinLength"
                    type="number"
                    value={settings.security.passwordMinLength}
                    onChange={(e) => handleChange('security', 'passwordMinLength', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                  <Input
                    id="maxLoginAttempts"
                    type="number"
                    value={settings.security.maxLoginAttempts}
                    onChange={(e) => handleChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="sessionTimeout">Session Timeout (seconds)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={settings.security.sessionTimeout}
                    onChange={(e) => handleChange('security', 'sessionTimeout', parseInt(e.target.value))}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Email Notifications</h4>
                    <p className="text-sm text-gray-500">Send notifications via email</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifications.enableEmail}
                      onChange={(e) => handleChange('notifications', 'enableEmail', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">SMS Notifications</h4>
                    <p className="text-sm text-gray-500">Send notifications via SMS</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifications.enableSMS}
                      onChange={(e) => handleChange('notifications', 'enableSMS', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Push Notifications</h4>
                    <p className="text-sm text-gray-500">Send push notifications to mobile apps</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifications.enablePush}
                      onChange={(e) => handleChange('notifications', 'enablePush', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-6 border-t mt-6">
            <Button onClick={handleSave} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
