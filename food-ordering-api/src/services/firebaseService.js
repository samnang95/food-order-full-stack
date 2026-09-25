const { initializeApp, cert } = require('firebase-admin/app');
const { getMessaging } = require('firebase-admin/messaging');
const path = require('path');
const fs = require('fs');
const userRepository = require('../repositories/userRepository');

let app = null;
let messaging = null;

// Attempt to initialize Firebase Admin SDK
try {
  let credential = null;

  // 1. Check for service account JSON file in config folder
  const configPath = path.join(__dirname, '../config/firebase-service-account.json');
  if (fs.existsSync(configPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    credential = cert(serviceAccount);
    console.log('🔥 [Firebase Admin] Initialized from config/firebase-service-account.json');
  } 
  // 2. Check for environment variable with JSON string or file path
  else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      const parsed = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      credential = cert(parsed);
      console.log('🔥 [Firebase Admin] Initialized from FIREBASE_SERVICE_ACCOUNT environment variable');
    } catch (_) {
      if (fs.existsSync(process.env.FIREBASE_SERVICE_ACCOUNT)) {
        credential = cert(process.env.FIREBASE_SERVICE_ACCOUNT);
        console.log(`🔥 [Firebase Admin] Initialized from file at ${process.env.FIREBASE_SERVICE_ACCOUNT}`);
      }
    }
  }

  if (credential) {
    app = initializeApp({ credential });
    messaging = getMessaging(app);
  } else {
    console.warn('⚠️ [Firebase Admin] No service account key found. Place firebase-service-account.json in src/config/ to enable automated FCM push notifications.');
  }
} catch (err) {
  console.error('⚠️ [Firebase Admin] Initialization failed:', err.message);
}

const firebaseService = {
  isReady: () => messaging !== null,

  /**
   * Send FCM push notification to a specific device token
   */
  sendPushNotification: async ({ token, title, body, data = {} }) => {
    if (!messaging) {
      console.log(`ℹ️ [FCM Simulated] Would send to token (${token?.slice(0, 15)}...): "${title}" - "${body}"`);
      return false;
    }

    if (!token) return false;

    // FCM data payload requires all string values
    const stringData = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== null && value !== undefined) {
        stringData[key] = String(value);
      }
    }

    try {
      const message = {
        token,
        notification: {
          title,
          body,
        },
        data: stringData,
        android: {
          priority: 'high',
          notification: {
            channelId: data.type === 'order' || data.type === 'delivery' ? 'bitecraft_orders' : 'bitecraft_promos',
            sound: 'default',
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
            },
          },
        },
      };

      const response = await messaging.send(message);
      console.log(`🚀 [FCM] Push notification delivered: ${response} ("${title}")`);
      return true;
    } catch (error) {
      console.error(`❌ [FCM] Failed to send push notification:`, error.message);
      return false;
    }
  },

  /**
   * Send push notification directly to a user by their User ID
   */
  sendPushNotificationToUser: async (userId, { title, body, data = {} }) => {
    try {
      const user = await userRepository.findById(userId);
      if (!user || !user.fcmToken) {
        return false;
      }

      return await firebaseService.sendPushNotification({
        token: user.fcmToken,
        title,
        body,
        data,
      });
    } catch (err) {
      console.error('❌ [FCM] Error sending push notification to user:', err.message);
      return false;
    }
  },
};

module.exports = firebaseService;
