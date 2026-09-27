/**
 * Application Route Paths
 */
export const AppRoutes = Object.freeze({
  ROOT: '/',
  ORDERS: '/orders',
  ORDER_DETAIL: '/orders/:id',
  MENU: '/menu',
  FAVORITES: '/favorites',
  CHECKOUT: '/checkout',
  PROFILE: '/profile',
  NOTIFICATIONS: '/notifications',
  SETTINGS: '/settings',
  NOT_FOUND: '*',
});

export const getOrderDetailRoute = (id) => `/orders/${id}`;

