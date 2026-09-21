const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    unique: true,
    sparse: true
  },
  password: {
    type: String
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  appleId: {
    type: String,
    unique: true,
    sparse: true
  },
  role: {
    type: String,
    enum: ['user'],
    default: 'user'
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
