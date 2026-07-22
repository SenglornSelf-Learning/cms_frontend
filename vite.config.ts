import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

const srcDir = fileURLToPath(new URL('./src', import.meta.url))
const themeDir = fileURLToPath(new URL('./public/theme', import.meta.url))

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiTarget = env.VITE_API_PROXY_TARGET || 'http://localhost:8080'

  return {
    plugins: [vue(), vueDevTools()],
    resolve: {
      alias: {
        '@': srcDir,
        '@sleek-theme': themeDir,
      },
    },
    server: {
      host: true,
      port: 5173,
      strictPort: true,
      proxy: {
        // Browser: /api/categories/list  ->  Spring Boot: http://localhost:8080/api/categories/list
        '/api': {
          target: apiTarget,
          changeOrigin: true,
        },
      },
    },
    preview: {
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
        },
      },
    },
  }
})
