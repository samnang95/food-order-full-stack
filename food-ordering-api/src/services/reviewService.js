const mongoose = require('mongoose');
const Review = require('../models/reviewModel');

class ReviewService {
  async createReview(data) {
    const reviewData = {
      foodName: data.foodName || 'Artisan Meal',
      orderNumber: data.orderNumber || '',
      customerName: data.customerName || 'BiteCraft Foodie',
      customerAvatar: data.customerAvatar || '',
      overallRating: Math.min(5, Math.max(1, Number(data.overallRating) || 5)),
      foodRating: Math.min(5, Math.max(1, Number(data.foodRating) || 5)),
      deliveryRating: Math.min(5, Math.max(1, Number(data.deliveryRating) || 5)),
      comment: (data.comment || '').trim(),
      tags: Array.isArray(data.tags) ? data.tags : [],
    };

    if (data.userId && mongoose.Types.ObjectId.isValid(data.userId)) {
      reviewData.userId = data.userId;
    }

    if (data.foodId && mongoose.Types.ObjectId.isValid(data.foodId)) {
      reviewData.foodId = data.foodId;
    }

    if (data.orderId && mongoose.Types.ObjectId.isValid(data.orderId)) {
      reviewData.orderId = data.orderId;
    }

    const review = new Review(reviewData);
    return await review.save();
  }

  async getReviews(filter = {}, limit = 50) {
    const query = {};

    if (filter.foodId) {
      if (mongoose.Types.ObjectId.isValid(filter.foodId)) {
        query.foodId = filter.foodId;
      }
    }

    if (filter.orderId) {
      if (mongoose.Types.ObjectId.isValid(filter.orderId)) {
        query.orderId = filter.orderId;
      }
    }

    if (filter.rating) {
      query.overallRating = Number(filter.rating);
    }

    return await Review.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit) || 50)
      .lean();
  }

  async getFoodReviews(foodId) {
    const query = {};
    if (mongoose.Types.ObjectId.isValid(foodId)) {
      query.foodId = foodId;
    }

    const reviews = await Review.find(query).sort({ createdAt: -1 }).lean();

    const count = reviews.length;
    const totalRating = reviews.reduce((sum, r) => sum + (r.overallRating || 5), 0);
    const averageRating = count > 0 ? Number((totalRating / count).toFixed(1)) : 5.0;

    const distribution = {
      5: reviews.filter((r) => r.overallRating === 5).length,
      4: reviews.filter((r) => r.overallRating === 4).length,
      3: reviews.filter((r) => r.overallRating === 3).length,
      2: reviews.filter((r) => r.overallRating === 2).length,
      1: reviews.filter((r) => r.overallRating === 1).length,
    };

    return {
      reviews,
      stats: {
        averageRating,
        totalReviews: count,
        distribution,
      },
    };
  }

  async getReviewByOrderId(orderId) {
    if (!orderId) return null;
    const query = mongoose.Types.ObjectId.isValid(orderId)
      ? { orderId }
      : { orderNumber: String(orderId).slice(-6).toUpperCase() };

    return await Review.findOne(query).lean();
  }
}

module.exports = new ReviewService();
