const env = import.meta.env;

export const AppConfig = Object.freeze({
  appName: env.VITE_APP_TITLE || 'BiteCraft Admin',
  appVersion: '1.0.0',
  flavor: (env.VITE_APP_ENV || 'dev') as 'dev' | 'staging' | 'prod',
  apiBaseUrl: env.VITE_API_BASE_URL || '/api',
  apiTarget: env.VITE_API_TARGET || 'http://localhost:3000',
  socketUrl: env.VITE_SOCKET_URL || 'http://localhost:3000',
  port: Number(env.VITE_PORT) || 5174,
  timeoutMs: 10000,
  defaultCurrency: 'USD',
  currencySymbol: '$',
  restaurantName: 'BiteCraft Express Kitchen #1',
  restaurantAddress: '450 Foodie Boulevard, Phnom Penh',
  restaurantPhone: '+855 23 888 999',
});
