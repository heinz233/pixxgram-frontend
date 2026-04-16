import { onMounted, onUnmounted } from 'vue'
import { messagesApi } from '@/api/messages'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'

/**
 * Polls unread message count every 30 seconds while logged in.
 * Mount this once in App.vue or a persistent layout.
 */
export function useUnreadMessages() {
  const authStore = useAuthStore()
  const appStore  = useAppStore()
  let interval    = null

  async function fetchUnread() {
    if (!authStore.isLoggedIn) return
    try {
      const { data } = await messagesApi.unreadCount()
      appStore.setUnread(data.unread_count || 0)
    } catch (_) {}
  }

  onMounted(() => {
    fetchUnread()
    interval = setInterval(fetchUnread, 30_000)
  })

  onUnmounted(() => clearInterval(interval))

  return { fetchUnread }
}
