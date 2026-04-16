import { reactive } from 'vue'

const snackbar = reactive({
  show: false,
  message: '',
  color: 'success',
})

export function useSnackbar() {
  function notify(message: string, color = 'success') {
    snackbar.message = message
    snackbar.color = color
    snackbar.show = true
  }

  function success(message: string) { notify(message, 'success') }
  function error(message: string)   { notify(message, 'error') }
  function info(message: string)    { notify(message, 'info') }
  function warning(message: string) { notify(message, 'warning') }

  return { snackbar, notify, success, error, info, warning }
}