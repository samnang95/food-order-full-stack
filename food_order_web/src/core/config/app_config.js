export const AppConfig = {
  env: import.meta.env.VITE_APP_ENV || 'dev',
  appName: import.meta.env.VITE_APP_TITLE || 'BiteCraft Hub',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
  socketUrl: import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000',
  enableMock: import.meta.env.VITE_ENABLE_MOCK === 'true',
  googleClientId:
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
    '292432059407-su4bs36ab566qrakbfliurt01epc3pi5.apps.googleusercontent.com',

  get isDev() {
    return this.env === 'dev';
  },

  get isStaging() {
    return this.env === 'staging';
  },

  get isProd() {
    return this.env === 'prod';
  },
};

console.log(
  `🌍 [AppConfig] Running in [${AppConfig.env.toUpperCase()}] mode | API: ${AppConfig.apiBaseUrl}`
);
