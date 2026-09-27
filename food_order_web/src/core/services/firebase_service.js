import { initializeApp, getApps, getApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';
import { FirebaseConfig } from '../config/firebase_config';
import { ApiClient } from './api_client';
import { LocalDB, DBKeys } from '../db';

class FirebaseService {
  constructor() {
    this.app = null;
    this.messaging = null;
    this.isSupported = null;
    this.cachedToken = null;
    this._listeners = new Set();
  }

  /**
   * Initialize Firebase App & check Web Messaging support
   */
  async initialize() {
    if (this.app) return this.app;

    try {
      this.app = getApps().length === 0 ? initializeApp(FirebaseConfig) : getApp();
      const supported = await isSupported().catch(() => false);
      this.isSupported = supported && typeof window !== 'undefined' && 'Notification' in window;

      if (this.isSupported) {
        this.messaging = getMessaging(this.app);
        this._setupForegroundListener();
      } else {
        console.debug('ℹ️ [FirebaseService] FCM is not supported in this browser environment');
      }

      return this.app;
    } catch (err) {
      console.warn('⚠️ [FirebaseService] Initialization failed:', err.message);
      this.isSupported = false;
      return null;
    }
  }

  /**
   * Get current browser notification permission status
   */
  getPermissionStatus() {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'unsupported';
    }
    return Notification.permission; // 'granted' | 'denied' | 'default'
  }

  /**
   * Request browser notification permission and retrieve FCM device token
   */
  async requestPermissionAndGetToken() {
    await this.initialize();

    if (!this.isSupported || !this.messaging) {
      return { token: null, status: 'unsupported' };
    }

    try {
      // 1. Request permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.log(`ℹ️ [FirebaseService] Notification permission was ${permission}`);
        return { token: null, status: permission };
      }

      // 2. Register Service Worker for background message delivery
      let swRegistration = null;
      if ('serviceWorker' in navigator) {
        try {
          swRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
          await navigator.serviceWorker.ready;
        } catch (swErr) {
          console.warn('⚠️ [FirebaseService] ServiceWorker registration failed:', swErr.message);
        }
      }

      // 3. Retrieve FCM registration token
      const tokenOptions = {};
      if (swRegistration) {
        tokenOptions.serviceWorkerRegistration = swRegistration;
      }
      if (FirebaseConfig.vapidKey) {
        tokenOptions.vapidKey = FirebaseConfig.vapidKey;
      }

      const token = await getToken(this.messaging, tokenOptions);
      if (token) {
        this.cachedToken = token;
        LocalDB.setString(DBKeys.FCM_TOKEN, token);
        console.log('🔥 [FirebaseService] FCM Web Token registered:', token.slice(0, 20) + '...');
        // Sync token to backend
        await this.syncTokenWithBackend(token);
        return { token, status: 'granted' };
      }

      return { token: null, status: 'granted' };
    } catch (error) {
      console.error('❌ [FirebaseService] Error getting FCM token:', error);
      return { token: null, status: 'error', error: error.message };
    }
  }

  /**
   * Sync FCM token with backend API if user is logged in
   */
  async syncTokenWithBackend(tokenOverride = null) {
    const token = tokenOverride || this.cachedToken || LocalDB.getString(DBKeys.FCM_TOKEN);
    const authToken = ApiClient.getToken();

    if (!token || !authToken) {
      return false;
    }

    try {
      await ApiClient.post('/users/fcm-token', { fcmToken: token });
      console.log('☁️ [FirebaseService] FCM token synced with backend user profile');
      return true;
    } catch (err) {
      console.debug('⚠️ [FirebaseService] Failed to sync FCM token with backend:', err.message);
      return false;
    }
  }

  /**
   * Internal foreground message listener
   */
  _setupForegroundListener() {
    if (!this.messaging) return;

    onMessage(this.messaging, (payload) => {
      console.log('📩 [FirebaseService] Foreground FCM message received:', payload);
      this._listeners.forEach((listener) => {
        try {
          listener(payload);
        } catch (err) {
          console.error('Error in FCM message listener:', err);
        }
      });
    });
  }

  /**
   * Subscribe to incoming foreground push notifications
   */
  onForegroundMessage(callback) {
    this._listeners.add(callback);
    return () => {
      this._listeners.delete(callback);
    };
  }

  /**
   * Trigger a test notification via backend
   */
  async sendTestNotification() {
    const fcmToken = this.cachedToken || LocalDB.getString(DBKeys.FCM_TOKEN);
    return await ApiClient.post('/notifications/send', {
      title: '🔥 Firebase Push Alert: Order Hot & Ready!',
      body: 'Your artisan smash burger order is hot, packed, and assigned to delivery driver Sothea.',
      type: 'order',
      fcmToken,
    });
  }
}

export const firebaseService = new FirebaseService();
