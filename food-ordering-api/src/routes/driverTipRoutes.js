const express = require('express');
const router = express.Router();
const driverTipController = require('../controllers/driverTipController');

// Submit tip
router.post('/', driverTipController.submitTip);

// Submit feedback & compliments
router.post('/feedback', driverTipController.submitFeedback);

// Get order tip status
router.get('/:orderId', driverTipController.getOrderTipStatus);

// Get driver profile & stats
router.get('/driver/:driverId', driverTipController.getDriverProfile);

module.exports = router;
