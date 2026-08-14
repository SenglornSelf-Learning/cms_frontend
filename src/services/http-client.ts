import axios, { type AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'
import { getCmsRuntimeConfig } from '@/config'

let httpClientInstance: AxiosInstance | null = null

function toHttpError(error: unknown): Error {
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
  return new Error(msg)
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

  client.interceptors.request.use((config) => stripJsonContentType(config))

  client.interceptors.response.use(
    (res) => res,
    (error) => Promise.reject(toHttpError(error)),
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
