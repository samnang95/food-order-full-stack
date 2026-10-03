import { createApp } from 'vue';
import { createPinia } from 'pinia';
import router from './routes';
import './style.css';
import App from './App.vue';
import { useThemeStore } from './core/theme/theme_store';
import i18n from './core/i18n';
import { useI18nStore } from './core/i18n/i18n_store';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(i18n);
app.use(router);

// Initialize Dark/Light/System theme & brand accent
useThemeStore().initTheme();

// Initialize Locale (Khmer / English)
useI18nStore().initLocale();

app.mount('#app');

