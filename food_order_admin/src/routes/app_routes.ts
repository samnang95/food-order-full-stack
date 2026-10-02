export const AppRoutes = Object.freeze({
  ROOT: '/',
  ORDERS: '/orders',
  MENU: '/menu',
  CATEGORIES: '/categories',
  CUSTOMERS: '/customers',
  VOUCHERS: '/vouchers',
  SETTINGS: '/settings',
  LOGIN: '/login',
  NOT_FOUND: '/:pathMatch(.*)*',
} as const);

export type AppRouteKey = keyof typeof AppRoutes;
