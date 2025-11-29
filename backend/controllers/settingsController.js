import UserSettings from '../models/UserSettings.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

// Get user settings
export const getSettings = async (req, res) => {
  try {
    let settings = await UserSettings.findOne({
      user: req.user._id,
      tenant: req.user.tenant
    });

    // Create default settings if not exists
    if (!settings) {
      settings = new UserSettings({
        user: req.user._id,
        tenant: req.user.tenant
      });
      await settings.save();
    }

    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ message: 'Error fetching settings' });
  }
};

// Update user settings
export const updateSettings = async (req, res) => {
  try {
    const { language, theme, notifications, privacy } = req.body;

    let settings = await UserSettings.findOne({
      user: req.user._id,
      tenant: req.user.tenant
    });

    if (!settings) {
      settings = new UserSettings({
        user: req.user._id,
        tenant: req.user.tenant
      });
    }

    if (language) settings.language = language;
    if (theme) settings.theme = theme;
    if (notifications) settings.notifications = { ...settings.notifications, ...notifications };
    if (privacy) settings.privacy = { ...settings.privacy, ...privacy };

    await settings.save();

    res.json({ message: 'Settings updated successfully', settings });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ message: 'Error updating settings' });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, address } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if email is already taken by another user
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email, tenant: req.user.tenant });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      user.email = email;
    }

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone) user.phone = phone;
    
    // Handle address object properly
    if (address) {
      if (!user.address) {
        user.address = {};
      }
      if (address.street !== undefined) user.address.street = address.street;
      if (address.city !== undefined) user.address.city = address.city;
      if (address.state !== undefined) user.address.state = address.state;
      if (address.country !== undefined) user.address.country = address.country;
      if (address.zipCode !== undefined) user.address.zipCode = address.zipCode;
    }

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ 
      message: 'Error updating profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Change password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Error changing password' });
  }
};
