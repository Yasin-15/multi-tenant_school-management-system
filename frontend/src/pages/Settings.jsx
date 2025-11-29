import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { User, Lock, Bell, Globe, Save } from 'lucide-react';
import settingsService from '../services/settingsService';

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

  const tabs = [
    { id: 'profile', label: t('settings.profile'), icon: User },
    { id: 'security', label: t('settings.security'), icon: Lock },
    { id: 'notifications', label: t('settings.notifications'), icon: Bell },
    { id: 'preferences', label: t('settings.preferences'), icon: Globe }
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{t('settings.title')}</h1>
      </div>

      {message.text && (
        <div className={`mb-4 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
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
                  className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
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
        </div>
      </div>
    </div>
  );
};

export default Settings;
