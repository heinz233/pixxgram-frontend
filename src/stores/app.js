import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  const snackbar = ref({ show: false, message: '', color: 'success' })
  const unreadMessages = ref(0)

  function notify(message, color = 'success') {
    snackbar.value = { show: true, message, color }
  }

  function setUnread(count) {
    unreadMessages.value = count
  }

  return { snackbar, unreadMessages, notify, setUnread }
})
