import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['info', 'success', 'warning', 'error', 'announcement'],
    default: 'info'
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  link: {
    type: String
  },
  read: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Index for faster queries
notificationSchema.index({ tenant: 1, recipient: 1, read: 1 });
notificationSchema.index({ createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
