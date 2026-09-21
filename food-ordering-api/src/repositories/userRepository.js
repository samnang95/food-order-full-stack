const User = require('../models/userModel');

const userRepository = {
  findByUsername: async (username) => {
    return await User.findOne({ username });
  },

  findByEmail: async (email) => {
    return await User.findOne({ email });
  },

  findByGoogleId: async (googleId) => {
    return await User.findOne({ googleId });
  },

  findByAppleId: async (appleId) => {
    return await User.findOne({ appleId });
  },
  
  findById: async (id) => {
    return await User.findById(id);
  },
  
  create: async (username, hashedPassword, email) => {
    const newUser = new User({
      username,
      password: hashedPassword,
      email: email || undefined,
      role: 'user'
    });
    await newUser.save();
    return newUser;
  },

  createGoogleUser: async (username, email, googleId) => {
    const newUser = new User({
      username,
      email,
      googleId,
      role: 'user'
    });
    await newUser.save();
    return newUser;
  },

  createAppleUser: async (username, email, appleId) => {
    const newUser = new User({
      username,
      email,
      appleId,
      role: 'user'
    });
    await newUser.save();
    return newUser;
  },

  update: async (id, updateData) => {
    return await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );
  },

  updatePassword: async (id, newPassword) => {
    return await User.findByIdAndUpdate(
      id,
      { $set: { password: newPassword } },
      { new: true, runValidators: true }
    );
  },

  findAll: async () => {
    // Return all users, excluding passwords
    return await User.find().select('-password').sort({ createdAt: -1 });
  },

  updateRole: async (id, role) => {
    return await User.findByIdAndUpdate(
      id,
      { $set: { role: role } },
      { new: true, runValidators: true }
    ).select('-password');
  }
};

module.exports = userRepository;
