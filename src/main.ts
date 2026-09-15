import { createApp } from 'vue'
import { createPinia } from 'pinia'

import '@sleek-theme/assets/plugins/simplebar/simplebar.css'
import '@sleek-theme/assets/plugins/nprogress/nprogress.css'
import '@sleek-theme/assets/plugins/toastr/toastr.min.css'
import '@sleek-theme/assets/css/sleek.css'

import App from './App.vue'
import router from './router'
import { initializeServices } from '@/services'
import { loadThemeScripts } from '@/theme/load-theme-scripts'

async function bootstrap() {
  await loadThemeScripts()

  const app = createApp(App)
  const pinia = createPinia()

  app.use(pinia)

  initializeServices()

  const { useAuthStore } = await import('@/stores/auth')
  await useAuthStore().restoreSession()

  app.use(router)

  app.mount('#app')
}

bootstrap().catch((err) => {
  console.error('Failed to start CMS frontend:', err)
})
