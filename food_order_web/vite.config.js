import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import process from 'node:process';
import { copyFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

// Vite plugin to generate 404.html from index.html for SPA static hosting (Render, GitHub Pages, etc.)
function spaFallbackPlugin() {
  return {
    name: 'spa-fallback-plugin',
    closeBundle() {
      const distDir = resolve(process.cwd(), 'dist');
      const indexFile = resolve(distDir, 'index.html');
      const fallbackFile = resolve(distDir, '404.html');
      if (existsSync(indexFile)) {
        copyFileSync(indexFile, fallbackFile);
      }
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiTarget =
    env.VITE_API_TARGET ||
    (mode === 'prod'
      ? 'https://food-ordering-api-iu90.onrender.com'
      : mode === 'staging'
        ? 'http://localhost:3001'
        : 'http://localhost:3000');

  return {
    plugins: [react(), tailwindcss(), spaFallbackPlugin()],
    server: {
      port: 5173,
      open: false,
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
    build: {
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/leaflet')) {
              return 'vendor-leaflet';
            }
            if (
              id.includes('node_modules/react/') ||
              id.includes('node_modules/react-dom/') ||
              id.includes('node_modules/react-router')
            ) {
              return 'vendor-react';
            }
            if (id.includes('node_modules/socket.io-client')) {
              return 'vendor-socket';
            }
          },
        },
      },
    },
  };
});

