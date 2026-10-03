const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// Public endpoints for generating & verifying dynamic KHQR
router.post('/khqr/generate', paymentController.generateKhqr);
router.post('/khqr/verify', paymentController.verifyPayment);

module.exports = router;
