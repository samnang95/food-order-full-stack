export const AppConstants = Object.freeze({
  STORAGE_KEYS: {
    AUTH_TOKEN: 'foodhub_admin_token',
    RESTAURANT_STATUS: 'foodhub_restaurant_status',
    SOUND_ENABLED: 'foodhub_sound_enabled',
    THEME_MODE: 'foodhub_theme_mode',
  },
  ORDER_STATUSES: {
    PENDING: 'pending',
    PREPARING: 'preparing',
    ON_THE_WAY: 'on_delivery',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled',
  } as const,
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 50,
  },
});
