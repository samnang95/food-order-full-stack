export const AppRoutes = Object.freeze({
  ROOT: '/',
  ORDERS: '/orders',
  ORDER_DETAIL: '/orders/:id',
  MENU: '/menu',
  CATEGORIES: '/categories',
  CATEGORY_DETAIL: '/category/:id',
  SEARCH: '/search',
  VOUCHERS: '/vouchers',
  FAVORITES: '/favorites',
  CHECKOUT: '/checkout',
  PROFILE: '/profile',
  NOTIFICATIONS: '/notifications',
  SETTINGS: '/settings',
  NOT_FOUND: '*',
});

export const getOrderDetailRoute = (id) => `/orders/${id}`;
export const getCategoryDetailRoute = (id) => `/category/${encodeURIComponent(id)}`;
export const getSearchRoute = (q) => `/search${q ? `?q=${encodeURIComponent(q)}` : ''}`;



