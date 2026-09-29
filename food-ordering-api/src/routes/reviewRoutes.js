const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

// Middleware to optionally attach authenticated user if token is provided
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return protect(req, res, next);
  }
  next();
};

// Get all reviews (supports query ?foodId=... &orderId=...)
router.get('/', reviewController.getReviews);

// Get reviews & stats for a specific food dish
router.get('/food/:foodId', reviewController.getFoodReviews);

// Get review for an order
router.get('/order/:orderId', reviewController.getReviewByOrderId);

// Submit a new dish or order review
router.post('/', optionalAuth, reviewController.createReview);

module.exports = router;
