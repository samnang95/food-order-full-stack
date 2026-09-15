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
  
  findById: async (id) => {
    return await User.findById(id);
  },
  
  create: async (username, hashedPassword, email) => {
    const newUser = new User({
      username,
      password: hashedPassword,
      email: email || undefined,
      role: 'customer'
    });
    await newUser.save();
    return newUser;
  },

  createGoogleUser: async (username, email, googleId) => {
    const newUser = new User({
      username,
      email,
      googleId,
      role: 'customer'
    });
    await newUser.save();
    return newUser;
  }
};

module.exports = userRepository;
