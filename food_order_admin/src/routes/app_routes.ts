export const AppRoutes = Object.freeze({
  ROOT: '/',
  ORDERS: '/orders',
  KDS: '/kds',
  MENU: '/menu',
  CATEGORIES: '/categories',
  CUSTOMERS: '/customers',
  VOUCHERS: '/vouchers',
  REVIEWS: '/reviews',
  SETTINGS: '/settings',
  LOGIN: '/login',
  NOT_FOUND: '/:pathMatch(.*)*',
} as const);

export type AppRouteKey = keyof typeof AppRoutes;
