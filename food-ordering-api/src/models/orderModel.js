const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  food: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Food',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true
  }
});

const locationSchema = new mongoose.Schema({
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  items: [orderItemSchema],
  totalAmount: {
    type: Number,
    required: true
  },
  deliveryAddress: {
    type: String,
    // Optional, can be empty if it's pickup or dine-in
  },
  deliveryLocation: {
    type: locationSchema,
    default: null,
  },
  restaurantLocation: {
    type: locationSchema,
    default: null,
  },
  driverLocation: {
    type: locationSchema,
    default: null,
  },
  status: {
    type: String,
    enum: ['pending', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'],
    default: 'pending',
    index: true
  },
  paymentMethod: {
    type: String,
    default: 'cash'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  voucherCode: {
    type: String,
    default: null,
  },
  discountAmount: {
    type: Number,
    default: 0,
  },
  deliverySchedule: {
    mode: { type: String, enum: ['asap', 'scheduled'], default: 'asap' },
    date: { type: String, default: null },
    timeSlot: { type: String, default: null },
    note: { type: String, default: '' },
  },
  deliveryNotes: {
    type: String,
    default: '',
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
