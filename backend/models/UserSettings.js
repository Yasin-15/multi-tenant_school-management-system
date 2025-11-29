import mongoose from 'mongoose';

const userSettingsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true
  },
  language: {
    type: String,
    enum: ['en', 'so'],
    default: 'en'
  },
  theme: {
    type: String,
    enum: ['light', 'dark', 'system'],
    default: 'system'
  },
  notifications: {
    email: {
      enabled: { type: Boolean, default: true },
      grades: { type: Boolean, default: true },
      attendance: { type: Boolean, default: true },
      fees: { type: Boolean, default: true },
      announcements: { type: Boolean, default: true }
    },
    push: {
      enabled: { type: Boolean, default: true },
      grades: { type: Boolean, default: true },
      attendance: { type: Boolean, default: true },
      fees: { type: Boolean, default: true },
      announcements: { type: Boolean, default: true }
    }
  },
  privacy: {
    showEmail: { type: Boolean, default: false },
    showPhone: { type: Boolean, default: false }
  }
}, {
  timestamps: true
});

const UserSettings = mongoose.model('UserSettings', userSettingsSchema);

export default UserSettings;
