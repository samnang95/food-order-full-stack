const reviewService = require('../services/reviewService');
const { getIO } = require('../socket/socketManager');

const createReview = async (req, res) => {
  try {
    const data = { ...req.body };

    // Attach authenticated user information if available
    if (req.user) {
      data.userId = req.user._id || req.user.id;
      data.customerName = req.user.username || data.customerName || 'BiteCraft Foodie';
      data.customerAvatar = req.user.profileImageUrl || data.customerAvatar || '';
    }

    const review = await reviewService.createReview(data);

    // Broadcast live socket event so other active clients see the review in real time
    try {
      const io = getIO();
      io.emit('review:created', {
        id: review._id,
        foodId: review.foodId,
        foodName: review.foodName,
        customerName: review.customerName,
        overallRating: review.overallRating,
        comment: review.comment,
        createdAt: review.createdAt,
      });
    } catch (socketErr) {
      console.warn('Socket broadcast skipped for review:', socketErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      review,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getReviews = async (req, res) => {
  try {
    const { foodId, orderId, rating, limit } = req.query;
    const reviews = await reviewService.getReviews({ foodId, orderId, rating, limit });

    res.json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getFoodReviews = async (req, res) => {
  try {
    const { foodId } = req.params;
    const result = await reviewService.getFoodReviews(foodId);

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getReviewByOrderId = async (req, res) => {
  try {
    const { orderId } = req.params;
    const review = await reviewService.getReviewByOrderId(orderId);

    res.json({
      success: true,
      review,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createReview,
  getReviews,
  getFoodReviews,
  getReviewByOrderId,
};
