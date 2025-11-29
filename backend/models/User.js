import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    tenant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tenant',
        required: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        select: false
    },
    role: {
        type: String,
        enum: ['super_admin', 'admin', 'teacher', 'student', 'parent'],
        required: true
    },
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    avatar: {
        type: String
    },
    phone: {
        type: String,
        trim: true
    },
    dateOfBirth: {
        type: Date
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other']
    },
    address: {
        street: String,
        city: String,
        state: String,
        country: String,
        zipCode: String
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date
    },
    emailVerified: {
        type: Boolean,
        default: false
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date
}, {
    timestamps: true
});

// Compound index for tenant + email uniqueness
userSchema.index({ tenant: 1, email: 1 }, { unique: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Virtual for full name
userSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`;
});

// Ensure virtuals are included in JSON
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

export default mongoose.model('User', userSchema);
