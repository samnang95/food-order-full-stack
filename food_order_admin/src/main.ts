import { createApp } from 'vue';
import { createPinia } from 'pinia';
import router from './routes';
import './style.css';
import App from './App.vue';
import { useThemeStore } from './core/theme/theme_store';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

// Initialize Dark/Light/System theme & brand accent
useThemeStore().initTheme();

app.mount('#app');
