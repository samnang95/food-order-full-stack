const mongoose = require('mongoose');

const driverTipSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    index: true,
  },
  driverId: {
    type: String,
    default: 'driver_001',
    index: true,
  },
  driverName: {
    type: String,
    default: 'Sok Dara',
  },
  amountUsd: {
    type: Number,
    required: true,
    min: 0,
  },
  amountKhr: {
    type: Number,
    required: true,
    min: 0,
  },
  paymentMethod: {
    type: String,
    enum: ['checkout_add_on', 'bakong_khqr', 'cash'],
    default: 'checkout_add_on',
  },
  compliments: [{
    type: String,
  }],
  note: {
    type: String,
    default: '',
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 5,
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'refunded'],
    default: 'completed',
  },
  bakongRef: {
    type: String,
    default: null,
  },
}, { timestamps: true });

module.exports = mongoose.model('DriverTip', driverTipSchema);
