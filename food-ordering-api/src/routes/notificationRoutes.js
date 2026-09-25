const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

// GET /notifications - Get system & promo notifications
router.get('/', notificationController.getNotifications);

// POST /notifications/send - Send/broadcast a push notification
router.post('/send', notificationController.sendNotification);

module.exports = router;
