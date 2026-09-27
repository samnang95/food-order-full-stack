const mongoose = require('mongoose');

const groupMemberSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  avatar: { type: String, default: '' },
  isHost: { type: Boolean, default: false },
  joinedAt: { type: Date, default: Date.now },
}, { _id: false });

const groupItemSchema = new mongoose.Schema({
  itemId: { type: String, required: true },
  foodId: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, default: 1, min: 1 },
  image: { type: String, default: '' },
  addedBy: {
    id: { type: String, required: true },
    name: { type: String, required: true },
    avatar: { type: String, default: '' },
  },
  notes: { type: String, default: '' },
}, { _id: false });

const groupOrderSchema = new mongoose.Schema({
  groupId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  title: {
    type: String,
    default: 'Team Lunch',
  },
  host: {
    userId: { type: String, required: true },
    name: { type: String, required: true },
    avatar: { type: String, default: '' },
  },
  members: [groupMemberSchema],
  items: [groupItemSchema],
  status: {
    type: String,
    enum: ['active', 'locked', 'ordered', 'cancelled'],
    default: 'active',
    index: true,
  },
  spendingLimitPerPerson: {
    type: Number,
    default: null,
  },
  deliveryAddress: {
    type: String,
    default: '',
  },
}, { timestamps: true });

module.exports = mongoose.model('GroupOrder', groupOrderSchema);
