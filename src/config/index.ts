/**
 * Central configuration (mirrors coreit.planfit `src/config`).
 * Set VITE_API_BASE to the Spring Boot origin (e.g. `http://localhost:8080`).
 */
export interface CmsRuntimeConfig {
  /** API origin prefix, e.g. `` (same origin) or `https://host:8080` */
  apiBaseUrl: string
  requestTimeoutMs: number
}

const DEFAULT_TIMEOUT_MS = 30_000

export function getCmsApiBaseUrl(): string {
  return import.meta.env.VITE_API_BASE ?? ''
}

export function getCmsRuntimeConfig(): CmsRuntimeConfig {
  return {
    apiBaseUrl: getCmsApiBaseUrl(),
    requestTimeoutMs: Number(import.meta.env.VITE_API_TIMEOUT) || DEFAULT_TIMEOUT_MS,
  }
}
