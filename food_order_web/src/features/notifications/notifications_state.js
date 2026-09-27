import { LocalDB, DBKeys, firebaseService } from '../../core';

export function createInitialNotificationsState() {
  const notifications = LocalDB.getJSON(DBKeys.NOTIFICATIONS, []);
  const safeNotifs = Array.isArray(notifications) ? notifications : [];

  return {
    notifications: safeNotifs,
    unreadCount: safeNotifs.filter((n) => !n.isRead).length,
    isDropdownOpen: false,
    activeToast: null,
    fcmToken: LocalDB.getString(DBKeys.FCM_TOKEN, null),
    pushPermission: firebaseService.getPermissionStatus(),
  };
}
