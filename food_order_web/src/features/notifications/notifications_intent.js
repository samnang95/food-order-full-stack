export const NotificationsIntentType = {
  RECEIVE_NOTIFICATION: 'NOTIFICATIONS/RECEIVE_NOTIFICATION',
  SET_NOTIFICATIONS: 'NOTIFICATIONS/SET_NOTIFICATIONS',

  MARK_AS_READ: 'NOTIFICATIONS/MARK_AS_READ',
  MARK_ALL_AS_READ: 'NOTIFICATIONS/MARK_ALL_AS_READ',
  DELETE_NOTIFICATION: 'NOTIFICATIONS/DELETE_NOTIFICATION',
  CLEAR_ALL: 'NOTIFICATIONS/CLEAR_ALL',

  TOGGLE_DROPDOWN: 'NOTIFICATIONS/TOGGLE_DROPDOWN',
  SET_DROPDOWN: 'NOTIFICATIONS/SET_DROPDOWN',

  SET_ACTIVE_TOAST: 'NOTIFICATIONS/SET_ACTIVE_TOAST',
  CLEAR_ACTIVE_TOAST: 'NOTIFICATIONS/CLEAR_ACTIVE_TOAST',

  SET_PUSH_PERMISSION: 'NOTIFICATIONS/SET_PUSH_PERMISSION',
  SET_FCM_TOKEN: 'NOTIFICATIONS/SET_FCM_TOKEN',
};

export const NotificationsIntent = {
  receiveNotification: (notif) => ({
    type: NotificationsIntentType.RECEIVE_NOTIFICATION,
    payload: notif,
  }),

  setNotifications: (notifs) => ({
    type: NotificationsIntentType.SET_NOTIFICATIONS,
    payload: notifs,
  }),

  markAsRead: (id) => ({
    type: NotificationsIntentType.MARK_AS_READ,
    payload: id,
  }),

  markAllAsRead: () => ({
    type: NotificationsIntentType.MARK_ALL_AS_READ,
  }),

  deleteNotification: (id) => ({
    type: NotificationsIntentType.DELETE_NOTIFICATION,
    payload: id,
  }),

  clearAll: () => ({
    type: NotificationsIntentType.CLEAR_ALL,
  }),

  toggleDropdown: () => ({
    type: NotificationsIntentType.TOGGLE_DROPDOWN,
  }),

  setDropdown: (isOpen) => ({
    type: NotificationsIntentType.SET_DROPDOWN,
    payload: isOpen,
  }),

  setActiveToast: (toast) => ({
    type: NotificationsIntentType.SET_ACTIVE_TOAST,
    payload: toast,
  }),

  clearActiveToast: () => ({
    type: NotificationsIntentType.CLEAR_ACTIVE_TOAST,
  }),

  setPushPermission: (permission) => ({
    type: NotificationsIntentType.SET_PUSH_PERMISSION,
    payload: permission,
  }),

  setFcmToken: (token) => ({
    type: NotificationsIntentType.SET_FCM_TOKEN,
    payload: token,
  }),
};
