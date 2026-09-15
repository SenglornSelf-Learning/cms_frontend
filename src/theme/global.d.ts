export {}

interface ToastrApi {
  options: Record<string, unknown>
  success: (message: string, title?: string) => void
  error: (message: string, title?: string) => void
  warning: (message: string, title?: string) => void
  info: (message: string, title?: string) => void
}

declare global {
  interface Window {
    NProgress?: {
      configure: (options: { showSpinner?: boolean }) => void
      start: () => void
      done: () => void
    }
    toastr?: ToastrApi
  }
}
