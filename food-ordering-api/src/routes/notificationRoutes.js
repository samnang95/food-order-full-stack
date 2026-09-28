const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// GET /notifications - Get system & promo notifications
router.get('/', notificationController.getNotifications);

// POST /notifications/send - Send/broadcast a push notification
router.post('/send', notificationController.sendNotification);

// POST /notifications/fcm-token - Register FCM push token for authenticated user
router.post('/fcm-token', protect, userController.updateFcmToken);

module.exports = router;
