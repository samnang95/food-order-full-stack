const mongoose = require('mongoose');

const supportTicketSchema = new mongoose.Schema({
  ticketNumber: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
  },
  customerName: {
    type: String,
    default: 'BiteCraft Foodie',
  },
  customerPhone: {
    type: String,
    default: '',
  },
  customerEmail: {
    type: String,
    default: '',
  },
  orderId: {
    type: String,
    default: '',
    index: true,
  },
  orderNumber: {
    type: String,
    default: '',
  },
  category: {
    type: String,
    enum: [
      'Order Issue',
      'Payment & Refund',
      'Food Quality',
      'Delivery Experience',
      'Account & App',
      'General Inquiry',
    ],
    default: 'Order Issue',
  },
  issueType: {
    type: String,
    enum: [
      'Missing Item',
      'Damaged / Spilled Packaging',
      'Significantly Late',
      'Cold / Wrong Temperature',
      'Incorrect Item',
      'Payment Dispute',
      'Rider Behavior',
      'General Inquiry',
      'Other',
    ],
    default: 'Missing Item',
  },
  subject: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  requestedResolution: {
    type: String,
    enum: [
      'Instant Wallet Refund',
      'Redelivery',
      'Voucher & Loyalty Points',
      'Support Callback / Explanation',
      'Other',
    ],
    default: 'Instant Wallet Refund',
  },
  status: {
    type: String,
    enum: ['OPEN', 'IN_REVIEW', 'RESOLVED', 'CLOSED'],
    default: 'OPEN',
    index: true,
  },
  priority: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
    default: 'HIGH',
  },
  photos: [{
    type: String,
  }],
  resolutionNote: {
    type: String,
    default: '',
  },
  resolvedAt: {
    type: Date,
    default: null,
  },
}, { timestamps: true });

module.exports = mongoose.model('SupportTicket', supportTicketSchema);
