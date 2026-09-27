import { useReducer, useEffect, useCallback } from 'react';
import { createInitialNotificationsState } from './notifications_state';
import { NotificationsIntentType, NotificationsIntent } from './notifications_intent';
import { ApiClient, LocalDB, DBKeys, socketService, firebaseService } from '../../core';

/**
 * Pure Reducer: receives current notifications state and intent, returns new state
 */
export function notificationsReducer(state, action) {
  switch (action.type) {
    case NotificationsIntentType.RECEIVE_NOTIFICATION: {
      const incoming = action.payload;
      if (!incoming || !incoming.id) return state;

      const filtered = state.notifications.filter((n) => n.id !== incoming.id);
      const next = [incoming, ...filtered];
      LocalDB.setJSON(DBKeys.NOTIFICATIONS, next);

      return {
        ...state,
        notifications: next,
        unreadCount: next.filter((n) => !n.isRead).length,
        activeToast: incoming,
      };
    }

    case NotificationsIntentType.SET_NOTIFICATIONS: {
      const notifs = Array.isArray(action.payload) ? action.payload : [];
      LocalDB.setJSON(DBKeys.NOTIFICATIONS, notifs);

      return {
        ...state,
        notifications: notifs,
        unreadCount: notifs.filter((n) => !n.isRead).length,
      };
    }

    case NotificationsIntentType.MARK_AS_READ: {
      const id = action.payload;
      const updated = state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      );
      LocalDB.setJSON(DBKeys.NOTIFICATIONS, updated);

      return {
        ...state,
        notifications: updated,
        unreadCount: updated.filter((n) => !n.isRead).length,
      };
    }

    case NotificationsIntentType.MARK_ALL_AS_READ: {
      const updated = state.notifications.map((n) => ({ ...n, isRead: true }));
      LocalDB.setJSON(DBKeys.NOTIFICATIONS, updated);

      return {
        ...state,
        notifications: updated,
        unreadCount: 0,
      };
    }

    case NotificationsIntentType.DELETE_NOTIFICATION: {
      const id = action.payload;
      const updated = state.notifications.filter((n) => n.id !== id);
      LocalDB.setJSON(DBKeys.NOTIFICATIONS, updated);

      return {
        ...state,
        notifications: updated,
        unreadCount: updated.filter((n) => !n.isRead).length,
      };
    }

    case NotificationsIntentType.CLEAR_ALL: {
      LocalDB.setJSON(DBKeys.NOTIFICATIONS, []);

      return {
        ...state,
        notifications: [],
        unreadCount: 0,
      };
    }

    case NotificationsIntentType.TOGGLE_DROPDOWN:
      return {
        ...state,
        isDropdownOpen: !state.isDropdownOpen,
      };

    case NotificationsIntentType.SET_DROPDOWN:
      return {
        ...state,
        isDropdownOpen: Boolean(action.payload),
      };

    case NotificationsIntentType.SET_ACTIVE_TOAST:
      return {
        ...state,
        activeToast: action.payload,
      };

    case NotificationsIntentType.CLEAR_ACTIVE_TOAST:
      return {
        ...state,
        activeToast: null,
      };

    case NotificationsIntentType.SET_PUSH_PERMISSION:
      return {
        ...state,
        pushPermission: action.payload,
      };

    case NotificationsIntentType.SET_FCM_TOKEN: {
      const token = action.payload;
      if (token) {
        LocalDB.setString(DBKeys.FCM_TOKEN, token);
      } else {
        LocalDB.remove(DBKeys.FCM_TOKEN);
      }
      return {
        ...state,
        fcmToken: token,
      };
    }

    default:
      return state;
  }
}

/**
 * Custom Hook Store: Coordinates MVI flow and side-effects for Notifications
 */
export function useNotificationsStore() {
  const [state, dispatch] = useReducer(
    notificationsReducer,
    undefined,
    createInitialNotificationsState
  );

  const onIntent = useCallback((intent) => {
    dispatch(intent);
  }, []);

  // Cross-tab synchronization
  useEffect(() => {
    const unsub = LocalDB.addListener(DBKeys.NOTIFICATIONS, (newNotifs) => {
      if (Array.isArray(newNotifs)) {
        dispatch(NotificationsIntent.setNotifications(newNotifs));
      }
    });
    return () => unsub?.();
  }, []);

  // Fetch initial notifications from API
  useEffect(() => {
    let isMounted = true;
    ApiClient.get('/notifications')
      .then((res) => {
        if (!isMounted) return;
        const apiNotifs = res?.data;
        if (Array.isArray(apiNotifs) && apiNotifs.length > 0) {
          const current = state.notifications;
          const currentIds = new Set(current.map((n) => n.id));
          const freshNotifs = apiNotifs.filter((n) => !currentIds.has(n.id));

          if (freshNotifs.length > 0) {
            const combined = [...freshNotifs, ...current];
            dispatch(NotificationsIntent.setNotifications(combined));
          }
        }
      })
      .catch((err) => {
        console.debug('Failed to fetch remote notifications:', err.message);
      });

    return () => {
      isMounted = false;
    };
  }, [state.notifications]);

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

      dispatch(NotificationsIntent.receiveNotification(normalized));
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
      dispatch(NotificationsIntent.setPushPermission(firebaseService.getPermissionStatus()));
    });

    const unsubFCM = firebaseService.onForegroundMessage((payload) => {
      if (!payload) return;
      const normalized = {
        id: payload.messageId || `fcm_${Date.now()}`,
        title: payload.notification?.title || payload.data?.title || '🔔 BiteCraft Notification',
        body: payload.notification?.body || payload.data?.body || '',
        type: payload.data?.type || 'promo',
        orderId: payload.data?.orderId || null,
        promoCode: payload.data?.promoCode || null,
        timestamp: new Date().toISOString(),
        isRead: false,
      };

      dispatch(NotificationsIntent.receiveNotification(normalized));
    });

    return () => {
      isMounted = false;
      unsubFCM?.();
    };
  }, []);

  const requestPushPermission = useCallback(async () => {
    const token = await firebaseService.requestPermissionAndGetToken();
    const currentPermission = firebaseService.getPermissionStatus();
    dispatch(NotificationsIntent.setPushPermission(currentPermission));

    if (token) {
      dispatch(NotificationsIntent.setFcmToken(token));
      try {
        await ApiClient.post('/notifications/fcm-token', { token });
      } catch (err) {
        console.debug('Failed to sync FCM token to server:', err.message);
      }
      return { success: true, token };
    }
    return { success: false, permission: currentPermission };
  }, []);

  const dismissToast = useCallback(() => {
    dispatch(NotificationsIntent.clearActiveToast());
  }, []);

  return {
    state,
    onIntent,
    notifications: state.notifications,
    unreadCount: state.unreadCount,
    isDropdownOpen: state.isDropdownOpen,
    setIsDropdownOpen: (open) => dispatch(NotificationsIntent.setDropdown(open)),
    activeToast: state.activeToast,
    fcmToken: state.fcmToken,
    pushPermission: state.pushPermission,
    markAsRead: (id) => dispatch(NotificationsIntent.markAsRead(id)),
    markAllAsRead: () => dispatch(NotificationsIntent.markAllAsRead()),
    deleteNotification: (id) => dispatch(NotificationsIntent.deleteNotification(id)),
    clearAll: () => dispatch(NotificationsIntent.clearAll()),
    dismissToast,
    requestPushPermission,
  };
}
