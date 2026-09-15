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
      role: updatedUser.role
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
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Save new password
    await userRepository.updatePassword(id, hashedPassword);
    
    return true;
  }
};

module.exports = userService;
