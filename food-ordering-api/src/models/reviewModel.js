const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    foodId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Food',
      required: false,
      index: true,
    },
    foodName: {
      type: String,
      trim: true,
      default: 'Artisan Meal',
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: false,
      index: true,
    },
    orderNumber: {
      type: String,
      trim: true,
      default: '',
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    customerName: {
      type: String,
      required: true,
      trim: true,
      default: 'BiteCraft Foodie',
    },
    customerAvatar: {
      type: String,
      default: '',
    },
    overallRating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      default: 5,
    },
    foodRating: {
      type: Number,
      min: 1,
      max: 5,
      default: 5,
    },
    deliveryRating: {
      type: Number,
      min: 1,
      max: 5,
      default: 5,
    },
    comment: {
      type: String,
      trim: true,
      default: '',
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Review', reviewSchema);
