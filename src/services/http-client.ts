import axios, { type AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'
import { getCmsRuntimeConfig } from '@/config'
import { clearStoredCredentials, getStoredCredentials, toBasicAuthHeader } from './auth-credentials'

let httpClientInstance: AxiosInstance | null = null
let handlingUnauthorized = false

export class HttpError extends Error {
  readonly status?: number

  constructor(message: string, status?: number) {
    super(message)
    this.name = 'HttpError'
    this.status = status
  }
}

function toHttpError(error: unknown): HttpError {
  const err = error as AxiosError<{ message?: string; error?: string }>
  const data = err.response?.data
  const fromBody =
    data && typeof data === 'object'
      ? data.message ?? data.error
      : undefined
  const msg =
    (typeof fromBody === 'string' && fromBody) ||
    err.response?.statusText ||
    err.message ||
    'Request failed'
  return new HttpError(msg, err.response?.status)
}

function stripJsonContentType(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
  if (typeof FormData === 'undefined' || !(config.data instanceof FormData) || !config.headers) {
    return config
  }
  const headers = config.headers
  if (typeof headers.setContentType === 'function') {
    headers.setContentType(false)
  }
  if (typeof headers.delete === 'function') {
    headers.delete('Content-Type')
    headers.delete('content-type')
  }
  delete (headers as Record<string, unknown>)['Content-Type']
  delete (headers as Record<string, unknown>)['content-type']
  return config
}

// attach basic auth to the request if the credentials are stored
function attachBasicAuth(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
  const creds = getStoredCredentials()
  if (creds && config.headers && !config.headers.Authorization) {
    config.headers.Authorization = toBasicAuthHeader(creds.username, creds.password)
  }
  return stripJsonContentType(config)
}

// redirect to login if the request is unauthorized
async function redirectToLoginOnUnauthorized(error: AxiosError): Promise<void> {
  if (error.config?.skipAuthRedirect) return
  if (error.response?.status !== 401) return
  if (handlingUnauthorized) return

  handlingUnauthorized = true
  clearStoredCredentials()
  try {
    const { default: router } = await import('@/router')
    const { useAuthStore } = await import('@/stores/auth')
    useAuthStore().clearSession()
    if (router.currentRoute.value.name !== 'login') {
      const redirect = router.currentRoute.value.fullPath
      await router.push({ name: 'login', query: redirect !== '/' ? { redirect } : undefined })
    }
  } finally {
    handlingUnauthorized = false
  }
}

/**
 * Axios client for Spring Boot REST API (`/api/**`).
 * Pattern aligned with coreit.planfit `services/http-client.ts`.
 */
export function createHttpClient(): AxiosInstance {
  if (httpClientInstance) {
    return httpClientInstance
  }

  const { apiBaseUrl, requestTimeoutMs } = getCmsRuntimeConfig()

  const client = axios.create({
    baseURL: apiBaseUrl,
    timeout: requestTimeoutMs,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  })

  client.interceptors.request.use((config) => attachBasicAuth(config))

  client.interceptors.response.use(
    (res) => res,
    async (error) => {
      if (axios.isAxiosError(error)) {
        await redirectToLoginOnUnauthorized(error)
      }
      return Promise.reject(toHttpError(error))
    },
  )

  httpClientInstance = client
  return client
}

export function getHttpClient(): AxiosInstance {
  if (!httpClientInstance) {
    throw new Error('HTTP client not initialized. Call initializeServices() from main.ts first.')
  }
  return httpClientInstance
}
