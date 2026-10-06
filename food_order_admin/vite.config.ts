import { defineConfig, loadEnv, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'
import { copyFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

// Vite plugin to generate 404.html from index.html for SPA static hosting (Render, GitHub Pages, etc.)
function spaFallbackPlugin(): Plugin {
  return {
    name: 'spa-fallback-plugin',
    closeBundle() {
      const distDir = resolve(process.cwd(), 'dist')
      const indexFile = resolve(distDir, 'index.html')
      const fallbackFile = resolve(distDir, '404.html')
      if (existsSync(indexFile)) {
        copyFileSync(indexFile, fallbackFile)
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const port = Number(env.VITE_PORT) || 5174
  const apiTarget = env.VITE_API_TARGET || 'http://localhost:3000'

  return {
    plugins: [
      vue(),
      tailwindcss(),
      spaFallbackPlugin(),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      port,
      open: false,
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
  }
})
