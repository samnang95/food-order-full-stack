export const DBKeys = Object.freeze({
  AUTH_TOKEN: 'foodhub_admin_token',
  USER_PROFILE: 'foodhub_admin_profile',
  THEME_MODE: 'foodhub_theme_mode',
  RESTAURANT_STATUS: 'foodhub_restaurant_status',
  SOUND_ENABLED: 'foodhub_sound_enabled',
  STORE_PROFILE: 'foodhub_store_profile',
  CACHED_ORDERS: 'foodhub_cached_orders',
  CACHED_FOODS: 'foodhub_cached_foods',
  CACHED_CATEGORIES: 'foodhub_cached_categories',
  CACHED_CUSTOMERS: 'foodhub_cached_customers',
  CACHED_VOUCHERS: 'foodhub_cached_vouchers',
  CACHED_REVIEWS: 'foodhub_cached_reviews',
  NOTIFICATIONS: 'foodhub_notifications',
} as const);

export type DBKey = typeof DBKeys[keyof typeof DBKeys];
