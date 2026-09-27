/* eslint-disable no-undef */
/**
 * Firebase Cloud Messaging Service Worker for BiteCraft Web
 * Handles background push notifications when the tab/window is not active.
 */

// Import Firebase scripts (Compat version for Service Workers)
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// Initialize Firebase in Service Worker
firebase.initializeApp({
  apiKey: 'AIzaSyDJ-OpLa_dWaAY0fS6DZL_yT_o5TWyH0Ts',
  authDomain: 'food-order-42e98.firebaseapp.com',
  projectId: 'food-order-42e98',
  storageBucket: 'food-order-42e98.firebasestorage.app',
  messagingSenderId: '292432059407',
  appId: '1:292432059407:web:food_order_web',
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('🔥 [FCM SW] Received background push notification:', payload);

  const notificationTitle = payload.notification?.title || payload.data?.title || '🔔 BiteCraft Notification';
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body || 'You have an update on your food order.',
    icon: '/favicon.png',
    badge: '/favicon.png',
    tag: payload.data?.orderId || payload.data?.promoCode || 'bitecraft_alert',
    data: {
      orderId: payload.data?.orderId,
      promoCode: payload.data?.promoCode,
      url: payload.data?.orderId ? '/orders' : '/notifications',
    },
    vibrate: [200, 100, 200],
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click to navigate to the appropriate route
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/notifications';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Check if there is already a window/tab open with the target URL
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      // If no matching window is open, open a new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
