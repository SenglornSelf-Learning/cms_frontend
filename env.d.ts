/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_PROXY_TARGET?: string
  readonly VITE_API_TIMEOUT?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface NProgressLite {
  configure: (opts: { showSpinner?: boolean }) => void
  start: () => void
  done: () => void
}

declare global {
  interface Window {
    NProgress?: NProgressLite
  }
}

export {}
