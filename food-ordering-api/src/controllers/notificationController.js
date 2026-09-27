const { getIO } = require('../socket/socketManager');
const firebaseService = require('../services/firebaseService');

const SYSTEM_NOTIFICATIONS = [
  {
    id: 'promo_welcome10',
    type: 'promo',
    title: '🎁 Welcome to BiteCraft!',
    body: 'Get 10% off your entire first order with promo code WELCOME10 at checkout.',
    promoCode: 'WELCOME10',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    isRead: false,
  },
  {
    id: 'promo_freeship',
    type: 'promo',
    title: '🚚 Free Delivery Special',
    body: 'Save $1.50 on delivery for orders over $8 with promo code FREESHIP.',
    promoCode: 'FREESHIP',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    isRead: false,
  },
  {
    id: 'promo_khnewyear',
    type: 'promo',
    title: '🎊 Khmer New Year Celebration!',
    body: 'Enjoy a massive 15% discount on all dishes with coupon code KHNEWYEAR.',
    promoCode: 'KHNEWYEAR',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    isRead: true,
  },
];

const notificationController = {
  getNotifications: (req, res) => {
    return res.status(200).json({
      status: 'success',
      data: SYSTEM_NOTIFICATIONS,
    });
  },

  sendNotification: async (req, res) => {
    const { title, body, type = 'system', orderId, promoCode, userId, fcmToken } = req.body;

    if (!title || !body) {
      return res.status(400).json({
        status: 'error',
        message: 'Title and body are required',
      });
    }

    const notification = {
      id: `notif_${Date.now()}`,
      title,
      body,
      type,
      orderId: orderId || null,
      promoCode: promoCode || null,
      timestamp: new Date().toISOString(),
      isRead: false,
    };

    try {
      const io = getIO();
      if (orderId) {
        io.to(`order_${orderId}`).emit('push_notification', notification);
      }
      io.emit('push_notification', notification);
      console.log(`🔔 [Notification] Broadcasted push notification: "${title}"`);
    } catch (err) {
      console.error('Failed to emit socket push notification:', err.message);
    }

    // Trigger Firebase Cloud Messaging
    try {
      if (userId) {
        await firebaseService.sendPushNotificationToUser(userId, {
          title,
          body,
          data: {
            orderId: orderId || '',
            promoCode: promoCode || '',
            type,
          },
        });
      } else if (fcmToken) {
        await firebaseService.sendPushNotification({
          token: fcmToken,
          title,
          body,
          data: {
            orderId: orderId || '',
            promoCode: promoCode || '',
            type,
          },
        });
      }
    } catch (fcmErr) {
      console.error('⚠️ [Notification] FCM delivery error:', fcmErr.message);
    }

    return res.status(201).json({
      status: 'success',
      message: 'Notification sent successfully',
      data: notification,
    });
  },
};

module.exports = notificationController;
