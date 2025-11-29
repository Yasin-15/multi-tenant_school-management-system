import Notification from '../models/Notification.js';

// Get io instance
const getIO = (req) => {
  return req.app.get('io');
};

// Get all notifications for current user
export const getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;

    const query = {
      tenant: req.user.tenant,
      recipient: req.user._id
    };

    if (unreadOnly === 'true') {
      query.read = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({
      tenant: req.user.tenant,
      recipient: req.user._id,
      read: false
    });

    res.json({
      notifications,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
      unreadCount
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Error fetching notifications' });
  }
};

// Get unread count
export const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      tenant: req.user.tenant,
      recipient: req.user._id,
      read: false
    });

    res.json({ count });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ message: 'Error fetching unread count' });
  }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findOneAndUpdate(
      {
        _id: id,
        tenant: req.user.tenant,
        recipient: req.user._id
      },
      {
        read: true,
        readAt: new Date()
      },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json(notification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Error marking notification as read' });
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      {
        tenant: req.user.tenant,
        recipient: req.user._id,
        read: false
      },
      {
        read: true,
        readAt: new Date()
      }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Error marking all notifications as read' });
  }
};

// Delete notification
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findOneAndDelete({
      _id: id,
      tenant: req.user.tenant,
      recipient: req.user._id
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: 'Error deleting notification' });
  }
};

// Delete all read notifications
export const deleteAllRead = async (req, res) => {
  try {
    await Notification.deleteMany({
      tenant: req.user.tenant,
      recipient: req.user._id,
      read: true
    });

    res.json({ message: 'All read notifications deleted successfully' });
  } catch (error) {
    console.error('Error deleting notifications:', error);
    res.status(500).json({ message: 'Error deleting notifications' });
  }
};

// Create notification (admin and super admin)
export const createNotification = async (req, res) => {
  try {
    console.log('[Create Notification] Request by user:', req.user?.email, 'Role:', req.user?.role);
    console.log('[Create Notification] Request body:', JSON.stringify(req.body, null, 2));

    const { recipients, type, title, message, link, tenantId } = req.body;

    // Validate required fields
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({
        message: 'Recipients array is required and cannot be empty'
      });
    }

    if (!title || !message) {
      return res.status(400).json({
        message: 'Title and message are required'
      });
    }

    // Determine which tenant to use
    // Super admins can specify tenantId to send notifications to any tenant
    // Regular admins use their own tenant
    let targetTenant = req.user.tenant;

    if (req.user.role === 'super_admin' || req.user.role === 'superadmin') {
      if (tenantId) {
        targetTenant = tenantId;
        console.log('[Create Notification] Super admin sending to tenant:', tenantId);
      } else {
        console.log('[Create Notification] Super admin using own tenant');
      }
    }

    // Create notifications for multiple recipients
    const notifications = recipients.map(recipientId => ({
      tenant: targetTenant,
      recipient: recipientId,
      type: type || 'info',
      title,
      message,
      link
    }));

    const created = await Notification.insertMany(notifications);
    console.log('[Create Notification] Successfully created', created.length, 'notifications');

    // Emit real-time notification to each recipient
    const io = getIO(req);
    if (io) {
      created.forEach(notification => {
        io.to(`user-${notification.recipient}`).emit('new-notification', notification);
      });
    }

    res.status(201).json({
      message: 'Notifications created successfully',
      count: created.length
    });
  } catch (error) {
    console.error('[Create Notification] Error:', error);
    console.error('[Create Notification] Stack:', error.stack);
    res.status(500).json({
      message: 'Error creating notification',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Helper function to create notification (can be used by other controllers)
export const createNotificationHelper = async (tenantId, recipientId, data, io = null) => {
  try {
    const notification = new Notification({
      tenant: tenantId,
      recipient: recipientId,
      ...data
    });
    await notification.save();

    // Emit real-time notification if io is provided
    if (io) {
      io.to(`user-${recipientId}`).emit('new-notification', notification);
    }

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};
