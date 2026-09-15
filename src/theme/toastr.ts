/** Sleek dashboard toaster options from theme/js/sleek.js `callToaster`. */
const SLEEK_TOASTR_OPTIONS = {
  closeButton: true,
  debug: false,
  newestOnTop: false,
  progressBar: true,
  preventDuplicates: false,
  onclick: null,
  showDuration: '300',
  hideDuration: '1000',
  timeOut: '5000',
  extendedTimeOut: '1000',
  showEasing: 'swing',
  hideEasing: 'linear',
  showMethod: 'fadeIn',
  hideMethod: 'fadeOut',
} as const

function applySleekToastrOptions() {
  const toastr = window.toastr
  if (!toastr) return null

  toastr.options = {
    ...SLEEK_TOASTR_OPTIONS,
    positionClass: document.dir === 'rtl' ? 'toast-top-left' : 'toast-top-right',
  }
  return toastr
}

export function showSuccessToast(message: string, title = 'Success!') {
  applySleekToastrOptions()?.success(message, title)
}

export function showErrorToast(message: string, title = 'Error!') {
  applySleekToastrOptions()?.error(message, title)
}