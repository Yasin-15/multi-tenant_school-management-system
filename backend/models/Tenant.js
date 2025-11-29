import mongoose from 'mongoose';

const tenantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  subdomain: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  domain: {
    type: String,
    trim: true
  },
  logo: {
    type: String
  },
  contactEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  contactPhone: {
    type: String,
    trim: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  settings: {
    academicYearStart: {
      type: Date,
      default: () => new Date(new Date().getFullYear(), 8, 1) // September 1st
    },
    academicYearEnd: {
      type: Date,
      default: () => new Date(new Date().getFullYear() + 1, 5, 30) // June 30th
    },
    currency: {
      type: String,
      default: 'USD'
    },
    timezone: {
      type: String,
      default: 'UTC'
    },
    language: {
      type: String,
      default: 'en'
    },
    maxStudents: {
      type: Number,
      default: 1000
    },
    maxTeachers: {
      type: Number,
      default: 100
    }
  },
  subscription: {
    plan: {
      type: String,
      enum: ['trial', 'basic', 'premium', 'enterprise'],
      default: 'trial'
    },
    status: {
      type: String,
      enum: ['active', 'suspended', 'cancelled'],
      default: 'active'
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: {
      type: Date
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for faster queries
tenantSchema.index({ subdomain: 1 });
tenantSchema.index({ domain: 1 });

export default mongoose.model('Tenant', tenantSchema);
