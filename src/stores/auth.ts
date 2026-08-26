import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { getUserService } from '@/services'
import {
  clearStoredCredentials,
  getStoredCredentials,
  setStoredCredentials,
} from '@/services/auth-credentials'
import type { UserFields } from '@/types/user'

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref<UserFields | null>(null)
  const isAuthenticated = computed(() => currentUser.value != null)

  function clearSession() {
    currentUser.value = null
    clearStoredCredentials()
  }

  async function login(username: string, password: string, remember: boolean): Promise<void> {
    setStoredCredentials({ username, password, remember })
    try {
      currentUser.value = await getUserService().getAccount({ skipAuthRedirect: true })
    } catch (error) {
      clearSession()
      throw error
    }
  }

  async function restoreSession(): Promise<boolean> {
    if (!getStoredCredentials()) {
      currentUser.value = null
      return false
    }
    try {
      currentUser.value = await getUserService().getAccount({ skipAuthRedirect: true })
      return true
    } catch {
      clearSession()
      return false
    }
  }

  function updateCredentials(username: string, password?: string) {
    const existing = getStoredCredentials()
    if (!existing) return
    setStoredCredentials({
      username,
      password: password ? password : existing.password,
      remember: existing.remember,
    })
  }

  function setCurrentUser(user: UserFields) {
    currentUser.value = user
  }

  async function logout() {
    clearSession()
    const { default: router } = await import('@/router')
    if (router.currentRoute.value.name !== 'login') {
      await router.push({ name: 'login' })
    }
  }

  return {
    currentUser,
    isAuthenticated,
    login,
    restoreSession,
    logout,
    clearSession,
    updateCredentials,
    setCurrentUser,
  }
})
