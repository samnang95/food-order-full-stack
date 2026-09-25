const bcrypt = require('bcryptjs');
const userRepository = require('../repositories/userRepository');

const userService = {
  getUserProfile: async (id) => {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }
    // Return safe user object
    return {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      avatar: user.avatar || '',
      createdAt: user.createdAt
    };
  },

  updateUserProfile: async (id, updateData) => {
    // Validate uniqueness if username or email is being updated
    if (updateData.username) {
      const existingUser = await userRepository.findByUsername(updateData.username);
      if (existingUser && existingUser._id.toString() !== id.toString()) {
        throw new Error('Username already exists');
      }
    }
    
    if (updateData.email) {
      const existingEmail = await userRepository.findByEmail(updateData.email);
      if (existingEmail && existingEmail._id.toString() !== id.toString()) {
        throw new Error('Email already in use');
      }
    }

    const updatedUser = await userRepository.update(id, updateData);
    
    return {
      id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      role: updatedUser.role,
      avatar: updatedUser.avatar || ''
    };
  },

  changePassword: async (id, oldPassword, newPassword) => {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }
    
    // Check if user has a password (they might have registered with Google only)
    if (!user.password) {
      throw new Error('Account does not have a password set. Please use Google Login.');
    }

    // Verify old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      throw new Error('Incorrect old password');
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const newHashedPassword = await bcrypt.hash(newPassword, salt);
    await userRepository.updatePassword(userId, newHashedPassword);
  },

  getAllUsers: async () => {
    return await userRepository.findAll();
  },

  updateUserRole: async (userIdToUpdate, newRole) => {
    const validRoles = ['user'];
    
    if (!validRoles.includes(newRole)) {
      throw new Error('Invalid role specified. Role must be user.');
    }

    const user = await userRepository.findById(userIdToUpdate);
    if (!user) {
      throw new Error('User not found');
    }

    return await userRepository.updateRole(userIdToUpdate, newRole);
  },

  updateFcmToken: async (userId, fcmToken) => {
    return await userRepository.update(userId, { fcmToken });
  }
};

module.exports = userService;
