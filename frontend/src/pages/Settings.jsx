import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { User, Lock, Bell, Globe, Save, Building } from 'lucide-react';
import settingsService from '../services/settingsService';
import tenantService from '../services/tenantService';

const Settings = () => {
  const { t, i18n } = useTranslation();
  const user = useSelector((state) => state.auth.user);

  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Profile state
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: ''
  });

  // Password state
  const [password, setPassword] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Settings state
  const [settings, setSettings] = useState({
    language: 'en',
    theme: 'system',
    notifications: {
      email: {
        enabled: true,
        grades: true,
        attendance: true,
        fees: true,
        announcements: true
      },
      push: {
        enabled: true,
        grades: true,
        attendance: true,
        fees: true,
        announcements: true
      }
    }
  });

  const [schoolSettings, setSchoolSettings] = useState({
    name: '',
    subdomain: '',
    logo: '',
    language: 'en',
    theme: {
      primaryColor: '#3b82f6',
      secondaryColor: '#1e40af',
      accentColor: '#60a5fa'
    }
  });

  useEffect(() => {
    if (user) {
      setProfile({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || ''
      });
    }
    fetchSettings();
  }, [user]);

  useEffect(() => {
    if (activeTab === 'school' && user?.role === 'admin') {
      fetchSchoolSettings();
    }
  }, [activeTab, user]);

  const fetchSettings = async () => {
    try {
      const data = await settingsService.getSettings();
      setSettings({
        language: data.language || 'en',
        theme: data.theme || 'system',
        notifications: data.notifications || settings.notifications
      });
      i18n.changeLanguage(data.language || 'en');
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const fetchSchoolSettings = async () => {
    try {
      const tenantId = user.tenant?._id || user.tenant;
      const data = await tenantService.getTenant(tenantId);
      setSchoolSettings({
        name: data.name || '',
        subdomain: data.subdomain || '',
        logo: data.logo || '',
        language: data.settings?.language || 'en',
        theme: data.settings?.theme || {
          primaryColor: '#3b82f6',
          secondaryColor: '#1e40af',
          accentColor: '#60a5fa'
        }
      });
    } catch (error) {
      console.error('Error fetching school settings:', error);
      showMessage('error', 'Failed to load school settings');
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await settingsService.updateProfile(profile);
      showMessage('success', t('messages.updateSuccess'));
    } catch (error) {
      showMessage('error', error.response?.data?.message || t('messages.errorOccurred'));
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (password.newPassword !== password.confirmPassword) {
      showMessage('error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await settingsService.changePassword({
        currentPassword: password.currentPassword,
        newPassword: password.newPassword
      });
      showMessage('success', 'Password changed successfully');
      setPassword({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      showMessage('error', error.response?.data?.message || t('messages.errorOccurred'));
    } finally {
      setLoading(false);
    }
  };

  const handleSettingsUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await settingsService.updateSettings(settings);
      i18n.changeLanguage(settings.language);
      showMessage('success', t('messages.updateSuccess'));
    } catch (error) {
      showMessage('error', error.response?.data?.message || t('messages.errorOccurred'));
    } finally {
      setLoading(false);
    }
  };

  const handleSchoolUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const tenantId = user.tenant?._id || user.tenant;
      await tenantService.updateTenant(tenantId, {
        name: schoolSettings.name,
        subdomain: schoolSettings.subdomain,
        logo: schoolSettings.logo,
        settings: {
          language: schoolSettings.language,
          theme: schoolSettings.theme
        }
      });
      showMessage('success', 'School settings updated successfully');
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Failed to update school settings');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: t('settings.profile'), icon: User },
    { id: 'security', label: t('settings.security'), icon: Lock },
    { id: 'notifications', label: t('settings.notifications'), icon: Bell },
    { id: 'preferences', label: t('settings.preferences'), icon: Globe }
  ];

  if (user?.role === 'admin') {
    tabs.push({ id: 'school', label: 'School', icon: Building });
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{t('settings.title')}</h1>
      </div>

      {message.text && (
        <div className={`mb-4 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium text-sm ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileUpdate} className="space-y-4 max-w-2xl">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('settings.firstName')}
                  </label>
                  <input
                    type="text"
                    value={profile.firstName}
                    onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('settings.lastName')}
                  </label>
                  <input
                    type="text"
                    value={profile.lastName}
                    onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('common.email')}
                </label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('settings.phone')}
                </label>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('settings.address')}
                </label>
                <textarea
                  value={profile.address}
                  onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {t('settings.updateProfile')}
              </button>
            </form>
          )}

          {activeTab === 'security' && (
            <form onSubmit={handlePasswordChange} className="space-y-4 max-w-2xl">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('settings.currentPassword')}
                </label>
                <input
                  type="password"
                  value={password.currentPassword}
                  onChange={(e) => setPassword({ ...password, currentPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('settings.newPassword')}
                </label>
                <input
                  type="password"
                  value={password.newPassword}
                  onChange={(e) => setPassword({ ...password, newPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  minLength="6"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('settings.confirmPassword')}
                </label>
                <input
                  type="password"
                  value={password.confirmPassword}
                  onChange={(e) => setPassword({ ...password, confirmPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  minLength="6"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                <Lock className="w-4 h-4" />
                {t('settings.changePassword')}
              </button>
            </form>
          )}

          {activeTab === 'notifications' && (
            <form onSubmit={handleSettingsUpdate} className="space-y-6 max-w-2xl">
              <div>
                <h3 className="text-lg font-semibold mb-4">{t('settings.emailNotifications')}</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={settings.notifications.email.enabled}
                      onChange={(e) => setSettings({
                        ...settings,
                        notifications: {
                          ...settings.notifications,
                          email: { ...settings.notifications.email, enabled: e.target.checked }
                        }
                      })}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span>Enable email notifications</span>
                  </label>
                  <label className="flex items-center gap-3 ml-7">
                    <input
                      type="checkbox"
                      checked={settings.notifications.email.grades}
                      onChange={(e) => setSettings({
                        ...settings,
                        notifications: {
                          ...settings.notifications,
                          email: { ...settings.notifications.email, grades: e.target.checked }
                        }
                      })}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span>{t('nav.grades')}</span>
                  </label>
                  <label className="flex items-center gap-3 ml-7">
                    <input
                      type="checkbox"
                      checked={settings.notifications.email.attendance}
                      onChange={(e) => setSettings({
                        ...settings,
                        notifications: {
                          ...settings.notifications,
                          email: { ...settings.notifications.email, attendance: e.target.checked }
                        }
                      })}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span>{t('nav.attendance')}</span>
                  </label>
                  <label className="flex items-center gap-3 ml-7">
                    <input
                      type="checkbox"
                      checked={settings.notifications.email.fees}
                      onChange={(e) => setSettings({
                        ...settings,
                        notifications: {
                          ...settings.notifications,
                          email: { ...settings.notifications.email, fees: e.target.checked }
                        }
                      })}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span>{t('nav.fees')}</span>
                  </label>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {t('common.save')}
              </button>
            </form>
          )}

          {activeTab === 'preferences' && (
            <form onSubmit={handleSettingsUpdate} className="space-y-6 max-w-2xl">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('settings.language')}
                </label>
                <select
                  value={settings.language}
                  onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="en">English</option>
                  <option value="so">Somali (Soomaali)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('settings.theme')}
                </label>
                <select
                  value={settings.theme}
                  onChange={(e) => setSettings({ ...settings, theme: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="light">{t('settings.lightMode')}</option>
                  <option value="dark">{t('settings.darkMode')}</option>
                  <option value="system">{t('settings.systemDefault')}</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {t('common.save')}
              </button>
            </form>
          )}

          {activeTab === 'school' && (
            <form onSubmit={handleSchoolUpdate} className="space-y-6 max-w-2xl">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  School Name
                </label>
                <input
                  type="text"
                  value={schoolSettings.name}
                  onChange={(e) => setSchoolSettings({ ...schoolSettings, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subdomain
                </label>
                <div className="flex items-center">
                  <input
                    type="text"
                    value={schoolSettings.subdomain}
                    onChange={(e) => setSchoolSettings({ ...schoolSettings, subdomain: e.target.value })}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <span className="px-4 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg text-gray-500">
                    .school-system.com
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  School Logo
                </label>
                <div className="flex items-center gap-4">
                  {schoolSettings.logo && (
                    <img
                      src={schoolSettings.logo}
                      alt="School Logo"
                      className="h-16 w-16 object-contain border rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          if (file.size > 5 * 1024 * 1024) { // 5MB limit
                            showMessage('error', 'Image size should be less than 5MB');
                            return;
                          }
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setSchoolSettings({ ...schoolSettings, logo: reader.result });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100"
                    />
                    <p className="mt-1 text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Language
                </label>
                <select
                  value={schoolSettings.language}
                  onChange={(e) => setSchoolSettings({ ...schoolSettings, language: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="en">English</option>
                  <option value="so">Somali (Soomaali)</option>
                </select>
              </div>

              <div className="border-t pt-4 mt-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Color Theme</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Primary Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={schoolSettings.theme.primaryColor}
                        onChange={(e) => setSchoolSettings({
                          ...schoolSettings,
                          theme: { ...schoolSettings.theme, primaryColor: e.target.value }
                        })}
                        className="h-10 w-10 rounded border border-gray-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={schoolSettings.theme.primaryColor}
                        onChange={(e) => setSchoolSettings({
                          ...schoolSettings,
                          theme: { ...schoolSettings.theme, primaryColor: e.target.value }
                        })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Secondary Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={schoolSettings.theme.secondaryColor}
                        onChange={(e) => setSchoolSettings({
                          ...schoolSettings,
                          theme: { ...schoolSettings.theme, secondaryColor: e.target.value }
                        })}
                        className="h-10 w-10 rounded border border-gray-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={schoolSettings.theme.secondaryColor}
                        onChange={(e) => setSchoolSettings({
                          ...schoolSettings,
                          theme: { ...schoolSettings.theme, secondaryColor: e.target.value }
                        })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Accent Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={schoolSettings.theme.accentColor}
                        onChange={(e) => setSchoolSettings({
                          ...schoolSettings,
                          theme: { ...schoolSettings.theme, accentColor: e.target.value }
                        })}
                        className="h-10 w-10 rounded border border-gray-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={schoolSettings.theme.accentColor}
                        onChange={(e) => setSchoolSettings({
                          ...schoolSettings,
                          theme: { ...schoolSettings.theme, accentColor: e.target.value }
                        })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                Save School Settings
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
