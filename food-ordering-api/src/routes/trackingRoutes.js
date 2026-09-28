const express = require('express');
const router = express.Router();
const trackingController = require('../controllers/trackingController');

// Get tracking session for an order (public/customer accessible)
router.get('/:orderId', trackingController.getTrackingSession);

// Update driver location (GPS tracking broadcast)
router.put('/:orderId/location', trackingController.updateDriverLocation);

// Update tracking status
router.put('/:orderId/status', trackingController.updateTrackingStatus);

module.exports = router;
