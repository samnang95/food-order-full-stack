const mongoose = require('mongoose');

const userAddressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  customId: {
    type: String,
    index: true,
  },
  label: {
    type: String,
    enum: ['Home', 'Work', 'Partner', 'Gym', 'Other'],
    default: 'Home',
  },
  address: {
    type: String,
    required: true,
  },
  note: {
    type: String,
    default: '',
  },
  lat: {
    type: Number,
    default: 11.551,
  },
  lng: {
    type: Number,
    default: 104.925,
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

module.exports = mongoose.model('UserAddress', userAddressSchema);
