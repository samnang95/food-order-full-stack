const userService = require('../services/userService');

const getProfile = async (req, res) => {
  try {
    // req.user.id comes from the protect middleware
    const userProfile = await userService.getUserProfile(req.user.id);
    res.json(userProfile);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { username, email } = req.body;
    
    // Only pass fields that are present in the request
    const updateData = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'No valid fields provided for update' });
    }

    const updatedUser = await userService.updateUserProfile(req.user.id, updateData);
    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Old password and new password are required' });
    }
    
    await userService.changePassword(req.user.id, oldPassword, newPassword);
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword
};
