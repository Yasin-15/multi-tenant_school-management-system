import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, CheckCheck, Trash2, X, Settings } from 'lucide-react';
import notificationService from '../services/notificationService';

const Notifications = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const params = filter === 'unread' ? { unreadOnly: true } : {};
      const data = await notificationService.getNotifications(params);
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      fetchNotifications();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      fetchNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationService.deleteNotification(id);
      fetchNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleDeleteAllRead = async () => {
    if (window.confirm(t('messages.confirmDelete'))) {
      try {
        await notificationService.deleteAllRead();
        fetchNotifications();
      } catch (error) {
        console.error('Error deleting notifications:', error);
      }
    }
  };

  const getNotificationIcon = (type) => {
    const iconClass = 'w-5 h-5';
    switch (type) {
      case 'success':
        return <Check className={`${iconClass} text-green-500`} />;
      case 'warning':
        return <Bell className={`${iconClass} text-yellow-500`} />;
      case 'error':
        return <X className={`${iconClass} text-red-500`} />;
      default:
        return <Bell className={`${iconClass} text-blue-500`} />;
    }
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return t('common.justNow') || 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('notifications.title')}</h1>
          <p className="text-gray-600 mt-2">
            {unreadCount > 0 ? `${unreadCount} ${t('notifications.unread')}` : t('notifications.noNotifications')}
          </p>
        </div>
        {user?.role === 'admin' && (
          <button
            onClick={() => navigate('/admin/notifications/manage')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Settings className="w-5 h-5" />
            Manage Notifications
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg ${
                filter === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t('common.all')}
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-lg ${
                filter === 'unread'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t('notifications.unread')}
            </button>
          </div>

          <div className="flex gap-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg"
              >
                <CheckCheck className="w-4 h-4" />
                {t('notifications.markAllAsRead')}
              </button>
            )}
            <button
              onClick={handleDeleteAllRead}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
            >
              <Trash2 className="w-4 h-4" />
              {t('notifications.deleteAll')}
            </button>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {loading ? (
            <div className="p-8 text-center text-gray-500">{t('common.loading')}</div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">{t('notifications.noNotifications')}</div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification._id}
                className={`p-4 hover:bg-gray-50 transition-colors ${
                  !notification.read ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-gray-900">
                          {notification.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          {formatDate(notification.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        {!notification.read && (
                          <button
                            onClick={() => handleMarkAsRead(notification._id)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                            title={t('notifications.markAsRead')}
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(notification._id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                          title={t('common.delete')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
