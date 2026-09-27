import { useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { NotificationsContext } from './notifications_context';
import { ApiClient, LocalDB, DBKeys, socketService, firebaseService } from '../../core';

export function NotificationsProvider({ children }) {
  const [notifications, setNotifications] = useState(() => {
    return LocalDB.getJSON(DBKeys.NOTIFICATIONS, []);
  });

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeToast, setActiveToast] = useState(null);
  const [fcmToken, setFcmToken] = useState(() => LocalDB.getString(DBKeys.FCM_TOKEN, null));
  const [pushPermission, setPushPermission] = useState(() => firebaseService.getPermissionStatus());

  // Cross-tab synchronization
  useEffect(() => {
    const unsub = LocalDB.addListener(DBKeys.NOTIFICATIONS, (newNotifs) => {
      if (Array.isArray(newNotifs)) {
        setNotifications(newNotifs);
      }
    });
    return () => unsub?.();
  }, []);

  const save = useCallback((updated) => {
    setNotifications(updated);
    LocalDB.setJSON(DBKeys.NOTIFICATIONS, updated);
  }, []);

  // Fetch initial notifications from API
  useEffect(() => {
    let isMounted = true;
    ApiClient.get('/notifications')
      .then((res) => {
        if (!isMounted) return;
        const apiNotifs = res?.data;
        if (Array.isArray(apiNotifs) && apiNotifs.length > 0) {
          setNotifications((current) => {
            const currentIds = new Set(current.map((n) => n.id));
            const freshNotifs = apiNotifs.filter((n) => !currentIds.has(n.id));

            if (freshNotifs.length > 0) {
              const combined = [...freshNotifs, ...current];
              LocalDB.setJSON(DBKeys.NOTIFICATIONS, combined);
              return combined;
            }
            return current;
          });
        }
      })
      .catch((err) => {
        console.debug('Failed to fetch remote notifications:', err.message);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Subscribe to real-time Socket.IO push notifications
  useEffect(() => {
    const unsubSocket = socketService.onPushNotification((incomingNotif) => {
      if (!incomingNotif || !incomingNotif.id) return;

      const normalized = {
        id: incomingNotif.id,
        title: incomingNotif.title || '🔔 Notification',
        body: incomingNotif.body || '',
        type: incomingNotif.type || 'order',
        orderId: incomingNotif.orderId || null,
        promoCode: incomingNotif.promoCode || null,
        timestamp: incomingNotif.timestamp || new Date().toISOString(),
        isRead: false,
      };

      setNotifications((prev) => {
        const filtered = prev.filter((n) => n.id !== normalized.id);
        const next = [normalized, ...filtered];
        LocalDB.setJSON(DBKeys.NOTIFICATIONS, next);
        return next;
      });

      // Display live floating toast for 6 seconds
      setActiveToast(normalized);
    });

    return () => {
      unsubSocket?.();
    };
  }, []);

  // Subscribe to Firebase Cloud Messaging (Foreground Push)
  useEffect(() => {
    let isMounted = true;

    firebaseService.initialize().then(() => {
      if (!isMounted) return;
      setPushPermission(firebaseService.getPermissionStatus());
    });

    const unsubFCM = firebaseService.onForegroundMessage((payload) => {
      if (!payload) return;
      const notification = payload.notification || {};
      const data = payload.data || {};

      const normalized = {
        id: payload.messageId || `fcm_${Date.now()}`,
        title: notification.title || data.title || '🔥 Firebase Push',
        body: notification.body || data.body || '',
        type: data.type || 'order',
        orderId: data.orderId || null,
        promoCode: data.promoCode || null,
        timestamp: new Date().toISOString(),
        isRead: false,
      };

      setNotifications((prev) => {
        const filtered = prev.filter((n) => n.id !== normalized.id);
        const next = [normalized, ...filtered];
        LocalDB.setJSON(DBKeys.NOTIFICATIONS, next);
        return next;
      });

      setActiveToast(normalized);
    });

    return () => {
      isMounted = false;
      unsubFCM?.();
    };
  }, []);

  // Auto-dismiss active toast after 6 seconds
  useEffect(() => {
    if (!activeToast) return;
    const timer = setTimeout(() => {
      setActiveToast(null);
    }, 6000);
    return () => clearTimeout(timer);
  }, [activeToast]);

  const markAsRead = useCallback(
    (id) => {
      const updated = notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n));
      save(updated);
    },
    [notifications, save]
  );

  const markAllAsRead = useCallback(() => {
    const updated = notifications.map((n) => ({ ...n, isRead: true }));
    save(updated);
  }, [notifications, save]);

  const removeNotification = useCallback(
    (id) => {
      const updated = notifications.filter((n) => n.id !== id);
      save(updated);
    },
    [notifications, save]
  );

  const clearAll = useCallback(() => {
    save([]);
  }, [save]);

  const dismissToast = useCallback(() => {
    setActiveToast(null);
  }, []);

  const toggleDropdown = useCallback(() => {
    setIsDropdownOpen((prev) => !prev);
  }, []);

  /**
   * Request native browser push notification permission and get FCM token
   */
  const requestPushPermission = useCallback(async () => {
    const result = await firebaseService.requestPermissionAndGetToken();
    setPushPermission(result.status);
    if (result.token) {
      setFcmToken(result.token);
    }
    return result;
  }, []);

  /**
   * Send test push notification
   */
  const sendTestPush = useCallback(async () => {
    return await firebaseService.sendTestNotification();
  }, []);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      activeToast,
      isDropdownOpen,
      setIsDropdownOpen,
      toggleDropdown,
      markAsRead,
      markAllAsRead,
      removeNotification,
      clearAll,
      dismissToast,
      fcmToken,
      pushPermission,
      requestPushPermission,
      sendTestPush,
    }),
    [
      notifications,
      unreadCount,
      activeToast,
      isDropdownOpen,
      toggleDropdown,
      markAsRead,
      markAllAsRead,
      removeNotification,
      clearAll,
      dismissToast,
      fcmToken,
      pushPermission,
      requestPushPermission,
      sendTestPush,
    ]
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

NotificationsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
