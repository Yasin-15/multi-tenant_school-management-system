import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import notificationService from '../services/notificationService';
import { useSocket } from '../contexts/SocketContext';

const NotificationBell = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const { socket, connected } = useSocket();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
    }
  }, [user]);

  // Listen for real-time notifications
  useEffect(() => {
    if (socket && connected) {
      socket.on('new-notification', (notification) => {
        console.log('New notification received:', notification);
        setUnreadCount(prev => prev + 1);
        setShowAnimation(true);
        setTimeout(() => setShowAnimation(false), 1000);
        
        // Show browser notification if permitted
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(notification.title, {
            body: notification.message,
            icon: '/logo.png'
          });
        }
      });

      return () => {
        socket.off('new-notification');
      };
    }
  }, [socket, connected]);

  const fetchUnreadCount = async () => {
    try {
      const data = await notificationService.getUnreadCount();
      setUnreadCount(data.count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const handleClick = () => {
    const role = user?.role || 'student';
    navigate(`/${role}/notifications`);
  };

  return (
    <button
      onClick={handleClick}
      className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      title="Notifications"
    >
      <Bell className={`w-6 h-6 ${showAnimation ? 'animate-bounce text-blue-600' : ''}`} />
      {unreadCount > 0 && (
        <span className={`absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full ${showAnimation ? 'animate-pulse' : ''}`}>
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
      {!connected && (
        <span className="absolute bottom-0 right-0 w-2 h-2 bg-gray-400 rounded-full" title="Connecting..." />
      )}
    </button>
  );
};

export default NotificationBell;
