/**
 * Application Constants
 */

export const OrderStatusLabels = Object.freeze({
  ALL: 'All Orders',
  PENDING: 'Pending',
  PREPARING: 'Cooking',
  ON_THE_WAY: 'Delivering',
  DELIVERED: 'Completed',
  CANCELLED: 'Cancelled',
});

export const Currency = Object.freeze({
  USD_SYMBOL: '$',
  KHR_SYMBOL: '៛',
  EXCHANGE_RATE_KHR: 4100,
});

export const SocketEvents = Object.freeze({
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  ORDER_STATUS_CHANGED: 'order_status_changed',
  PUSH_NOTIFICATION: 'push_notification',
  JOIN_ORDER: 'join_order',
  LEAVE_ORDER: 'leave_order',
});

export const AppRoutes = Object.freeze({
  ORDERS: 'orders',
  MENU: 'menu',
  SETTINGS: 'settings',
});
