<template>
  <div>
    <h2 class="text-h6 font-weight-bold mb-5">Messages</h2>

    <div class="messages-layout">

      <!-- ── LEFT: Conversations panel ──────────────────────────── -->
      <div class="conversations-panel">

        <div class="panel-header">
          <span class="text-subtitle-2 font-weight-bold">Conversations</span>
          <v-btn icon size="x-small" variant="tonal" color="primary"
            title="Start a new conversation" @click="newMsgDialog = true">
            <v-icon size="16">mdi-pencil-plus-outline</v-icon>
          </v-btn>
        </div>

        <!-- Search conversations -->
        <div class="px-3 pt-2 pb-1">
          <v-text-field
            v-model="convSearch"
            placeholder="Search..." density="compact"
            prepend-inner-icon="mdi-magnify"
            variant="outlined" rounded="lg"
            hide-details clearable
          />
        </div>

        <!-- Loading conversations -->
        <div v-if="loadingConvs" class="text-center pa-8">
          <v-progress-circular indeterminate size="28" color="primary" />
          <p class="mt-2 text-caption text-medium-emphasis">Loading...</p>
        </div>

        <!-- Error loading conversations -->
        <div v-else-if="convsError" class="pa-4 text-center">
          <v-icon color="error" size="32">mdi-alert-circle-outline</v-icon>
          <p class="text-caption text-medium-emphasis mt-2">{{ convsError }}</p>
          <v-btn size="x-small" variant="tonal" color="primary" class="mt-2" @click="loadConversations">
            Retry
          </v-btn>
        </div>

        <!-- Empty conversations -->
        <div v-else-if="!filteredConvs.length" class="text-center pa-8">
          <v-icon size="40" color="medium-emphasis">mdi-message-off-outline</v-icon>
          <p class="text-caption text-medium-emphasis mt-2">
            {{ convSearch ? 'No matching conversations.' : 'No conversations yet.' }}
          </p>
          <v-btn v-if="!convSearch" size="small" color="primary" variant="tonal"
            class="mt-3" rounded="lg" @click="newMsgDialog = true">
            <v-icon start size="14">mdi-pencil-plus-outline</v-icon>
            Start a conversation
          </v-btn>
        </div>

        <!-- Conversation list -->
        <div v-else>
          <div
            v-for="conv in filteredConvs"
            :key="conv.id"
            class="conv-item"
            :class="{ active: activeUserId === getOtherUser(conv)?.id }"
            @click="openConversation(getOtherUser(conv))"
          >
            <v-avatar size="42" color="primary" class="flex-shrink-0">
              <v-img v-if="getOtherUser(conv)?.user_image"
                :src="buildUrl(getOtherUser(conv).user_image)" />
              <span v-else class="text-white text-caption font-weight-bold">
                {{ getOtherUser(conv)?.name?.charAt(0)?.toUpperCase() }}
              </span>
            </v-avatar>
            <div class="conv-info min-width-0">
              <div class="d-flex align-center justify-space-between">
                <p class="text-body-2 font-weight-semibold text-truncate">
                  {{ getOtherUser(conv)?.name }}
                </p>
                <p class="text-caption text-medium-emphasis flex-shrink-0 ml-1">
                  {{ formatTime(conv.created_at) }}
                </p>
              </div>
              <p class="text-caption text-medium-emphasis text-truncate">
                {{ conv.message || '…' }}
              </p>
            </div>
            <v-badge
              v-if="!conv.is_read && conv.receiver_id === authStore.user?.id"
              color="primary" dot class="flex-shrink-0 ml-1"
            />
          </div>
        </div>
      </div>

      <!-- ── RIGHT: Chat panel ───────────────────────────────────── -->
      <div class="chat-panel">

        <!-- No conversation selected -->
        <div v-if="!activeUser" class="empty-chat">
          <v-icon size="56" color="medium-emphasis">mdi-message-text-outline</v-icon>
          <p class="mt-3 text-medium-emphasis">Select a conversation</p>
          <v-btn color="primary" variant="tonal" rounded="lg" class="mt-4"
            @click="newMsgDialog = true">
            <v-icon start>mdi-pencil-plus-outline</v-icon>
            New Message
          </v-btn>
        </div>

        <template v-else>
          <!-- Chat header -->
          <div class="chat-header">
            <v-avatar size="36" color="primary" class="mr-3 flex-shrink-0">
              <v-img v-if="activeUser.user_image" :src="buildUrl(activeUser.user_image)" />
              <span v-else class="text-white text-caption font-weight-bold">
                {{ activeUser.name?.charAt(0)?.toUpperCase() }}
              </span>
            </v-avatar>
            <div>
              <p class="font-weight-semibold text-body-2">{{ activeUser.name }}</p>
              <p class="text-caption text-medium-emphasis">{{ activeUser.email }}</p>
            </div>
          </div>

          <!-- Messages area -->
          <div ref="messagesContainer" class="messages-body">
            <div v-if="loadingMessages" class="text-center pa-6">
              <v-progress-circular indeterminate size="24" color="primary" />
            </div>

            <div v-else-if="!messages.length" class="text-center pa-8">
              <v-icon size="40" color="medium-emphasis">mdi-chat-outline</v-icon>
              <p class="text-caption text-medium-emphasis mt-2">
                No messages yet. Say hello!
              </p>
            </div>

            <template v-else>
              <div
                v-for="msg in messages"
                :key="msg.id"
                class="message-bubble-wrap"
                :class="{ mine: msg.sender_id === authStore.user?.id }"
              >
                <div class="message-bubble">
                  <p>{{ msg.message }}</p>
                  <span class="message-time">{{ formatTime(msg.created_at) }}</span>
                </div>
              </div>
            </template>
          </div>

          <!-- Send error -->
          <div v-if="sendError" class="send-error">
            <v-icon size="14" class="mr-1">mdi-alert-circle-outline</v-icon>
            {{ sendError }}
          </div>

          <!-- Input -->
          <div class="chat-input">
            <v-text-field
              v-model="newMessage"
              placeholder="Type a message..."
              variant="outlined" rounded="lg" density="compact"
              hide-details
              :disabled="sending"
              @keyup.enter="sendMessage"
            >
              <template #append-inner>
                <v-btn icon size="small" color="primary"
                  :loading="sending"
                  :disabled="!newMessage.trim()"
                  @click="sendMessage">
                  <v-icon size="18">mdi-send</v-icon>
                </v-btn>
              </template>
            </v-text-field>
          </div>
        </template>
      </div>
    </div>

    <!-- ── NEW MESSAGE DIALOG ──────────────────────────────────── -->
    <v-dialog v-model="newMsgDialog" max-width="480">
      <v-card rounded="xl" class="pa-6">
        <div class="d-flex align-center justify-space-between mb-4">
          <h3 class="text-subtitle-1 font-weight-bold">New Message</h3>
          <v-btn icon size="small" variant="text" @click="newMsgDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>

        <!-- Search for user -->
        <v-text-field
          v-model="userSearch"
          label="Search for a photographer or client..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined" rounded="lg" density="compact"
          class="mb-3"
          @input="searchUsers"
          :loading="searchingUsers"
        />

        <!-- Search results -->
        <div v-if="searchResults.length" class="search-results">
          <div
            v-for="user in searchResults"
            :key="user.id"
            class="search-result-item d-flex align-center pa-3"
            :style="{ cursor: 'pointer' }"
            @click="startConversationWith(user)"
          >
            <v-avatar size="38" color="primary" class="mr-3">
              <v-img v-if="user.user_image" :src="buildUrl(user.user_image)" />
              <span v-else class="text-white text-caption font-weight-bold">
                {{ user.name?.charAt(0) }}
              </span>
            </v-avatar>
            <div>
              <p class="text-body-2 font-weight-semibold">{{ user.name }}</p>
              <p class="text-caption text-medium-emphasis">
                {{ user.role?.name || user.email }}
              </p>
            </div>
            <v-spacer />
            <v-icon size="18" color="primary">mdi-message-arrow-right-outline</v-icon>
          </div>
        </div>

        <div v-else-if="userSearch.length >= 2 && !searchingUsers"
          class="text-center pa-4 text-medium-emphasis">
          <v-icon size="32">mdi-account-search-outline</v-icon>
          <p class="text-caption mt-2">No users found for "{{ userSearch }}"</p>
        </div>

        <div v-else-if="!userSearch" class="text-center pa-4 text-medium-emphasis">
          <p class="text-caption">Type at least 2 characters to search</p>
        </div>

        <!-- OR: type message directly if you know the user -->
        <v-divider class="my-4" />
        <p class="text-caption text-medium-emphasis mb-3">
          Or message someone directly by entering their user ID:
        </p>
        <div class="d-flex" style="gap:8px">
          <v-text-field
            v-model="directUserId"
            label="User ID"
            type="number" density="compact"
            variant="outlined" rounded="lg"
            hide-details
          />
          <v-btn color="primary" rounded="lg" :disabled="!directUserId"
            @click="openById">
            Open
          </v-btn>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import { messagesApi } from '@/api/messages'
import api from '@/api/axios'
import { useAuthStore } from '@/stores/auth'
import { useAppStore  } from '@/stores/app'

const authStore = useAuthStore()
const appStore  = useAppStore()

// ── state ──────────────────────────────────────────────────────────
const conversations     = ref([])
const messages          = ref([])
const activeUser        = ref(null)
const activeUserId      = ref(null)
const newMessage        = ref('')
const convSearch        = ref('')
const loadingConvs      = ref(true)
const loadingMessages   = ref(false)
const sending           = ref(false)
const convsError        = ref('')
const sendError         = ref('')
const messagesContainer = ref(null)

// New message dialog
const newMsgDialog    = ref(false)
const userSearch      = ref('')
const directUserId    = ref('')
const searchResults   = ref([])
const searchingUsers  = ref(false)
let   searchTimeout   = null

// Polling
let pollInterval = null

// ── backend URL ────────────────────────────────────────────────────
const BACKEND = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api')
  .replace(/\/api\/?$/, '').replace(/\/$/, '')

function buildUrl(path) {
  if (!path) return ''
  if (path.startsWith('http')) return path
  return `${BACKEND}/storage/${path.replace(/^\/+/, '')}`
}

// ── computed ───────────────────────────────────────────────────────
const filteredConvs = computed(() => {
  if (!convSearch.value) return conversations.value
  const q = convSearch.value.toLowerCase()
  return conversations.value.filter(c => {
    const other = getOtherUser(c)
    return other?.name?.toLowerCase().includes(q)
  })
})

// ── helpers ────────────────────────────────────────────────────────
function getOtherUser(conv) {
  if (!conv) return null
  const myId = authStore.user?.id
  return conv.sender_id === myId ? conv.receiver : conv.sender
}

function formatTime(d) {
  if (!d) return ''
  const date = new Date(d)
  const now  = new Date()
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })
  }
  return date.toLocaleDateString('en-KE', { dateStyle: 'short' })
}

function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

// ── load conversations ─────────────────────────────────────────────
async function loadConversations() {
  loadingConvs.value = true
  convsError.value   = ''
  try {
    const { data } = await messagesApi.conversations()
    // Handle both array and wrapped responses
    conversations.value = Array.isArray(data) ? data : (data?.data || data?.conversations || [])
  } catch (e) {
    const s = e.response?.status
    if (s === 401) convsError.value = 'Session expired. Please log in again.'
    else if (!e.response) convsError.value = 'Cannot reach server. Is Laravel running?'
    else convsError.value = e.response?.data?.message || `Error ${s}`
  } finally {
    loadingConvs.value = false
  }
}

// ── open conversation ──────────────────────────────────────────────
async function openConversation(user) {
  if (!user) return
  activeUser.value      = user
  activeUserId.value    = user.id
  loadingMessages.value = true
  messages.value        = []

  try {
    const { data } = await messagesApi.conversation(user.id)
    messages.value = Array.isArray(data) ? data : (data?.messages || data?.data || [])
    scrollToBottom()
  } catch (e) {
    appStore.notify(
      e.response?.data?.message || 'Could not load messages.',
      'error'
    )
  } finally {
    loadingMessages.value = false
  }

  // Start polling for new messages every 5 seconds
  stopPolling()
  pollInterval = setInterval(pollMessages, 5000)
}

async function pollMessages() {
  if (!activeUserId.value) return
  try {
    const { data } = await messagesApi.conversation(activeUserId.value)
    const newMsgs  = Array.isArray(data) ? data : (data?.messages || data?.data || [])
    if (newMsgs.length !== messages.value.length) {
      messages.value = newMsgs
      scrollToBottom()
    }
  } catch (_) {}
}

function stopPolling() {
  if (pollInterval) {
    clearInterval(pollInterval)
    pollInterval = null
  }
}

// ── send message ───────────────────────────────────────────────────
async function sendMessage() {
  const text = newMessage.value.trim()
  if (!text || !activeUser.value) return

  sending.value  = true
  sendError.value = ''

  // Optimistic update — show message immediately
  const optimistic = {
    id:          Date.now(),
    sender_id:   authStore.user?.id,
    receiver_id: activeUser.value.id,
    message:     text,
    created_at:  new Date().toISOString(),
    is_read:     false,
  }
  messages.value.push(optimistic)
  newMessage.value = ''
  scrollToBottom()

  try {
    const { data } = await messagesApi.send({
      receiver_id: activeUser.value.id,
      message:     text,
    })

    // Replace optimistic message with real one
    const real = data.data || data
    const idx  = messages.value.findIndex(m => m.id === optimistic.id)
    if (idx !== -1) messages.value[idx] = real

    // Refresh conversations sidebar
    loadConversations()

  } catch (e) {
    // Remove optimistic message on failure
    messages.value = messages.value.filter(m => m.id !== optimistic.id)
    newMessage.value = text

    const s = e.response?.status
    if (s === 422) sendError.value = e.response?.data?.message || 'Invalid message.'
    else if (!e.response) sendError.value = 'Cannot reach server.'
    else sendError.value = e.response?.data?.message || 'Failed to send message.'
  } finally {
    sending.value = false
  }
}

// ── search users for new conversation ─────────────────────────────
async function searchUsers() {
  if (userSearch.value.length < 2) {
    searchResults.value = []
    return
  }
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(async () => {
    searchingUsers.value = true
    try {
      // Search photographers by name
      const { data } = await api.get('/photographers', {
        params: { name: userSearch.value, per_page: 8 },
      })
      searchResults.value = data?.data || data || []
    } catch (_) {
      searchResults.value = []
    } finally {
      searchingUsers.value = false
    }
  }, 400)
}

function startConversationWith(user) {
  newMsgDialog.value  = false
  userSearch.value    = ''
  searchResults.value = []
  openConversation(user)
}

async function openById() {
  const id = parseInt(directUserId.value)
  if (!id) return
  newMsgDialog.value = false
  directUserId.value = ''

  try {
    // Fetch the user by ID (could be photographer or client)
    const { data } = await api.get(`/photographers/${id}`)
    openConversation(data)
  } catch (_) {
    // If not a photographer, try getting user info from existing conversations
    appStore.notify(`Could not find user with ID ${id}`, 'error')
  }
}

onMounted(loadConversations)
onUnmounted(stopPolling)
</script>

<style scoped>
.messages-layout {
  display: flex;
  height: calc(100vh - 180px);
  min-height: 500px;
  border: 1px solid rgba(0,0,0,0.08);
  border-radius: 16px;
  overflow: hidden;
  background: rgb(var(--v-theme-surface));
}

/* Left panel */
.conversations-panel {
  width: 300px; flex-shrink: 0;
  border-right: 1px solid rgba(0,0,0,0.06);
  overflow-y: auto;
  display: flex; flex-direction: column;
}
.panel-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid rgba(0,0,0,0.06);
  position: sticky; top: 0;
  background: rgb(var(--v-theme-surface));
  z-index: 1;
}
.conv-item {
  display: flex; align-items: center;
  gap: 12px; padding: 12px 16px;
  cursor: pointer; transition: background 0.15s;
  border-bottom: 1px solid rgba(0,0,0,0.04);
}
.conv-item:hover  { background: rgba(0,0,0,0.03); }
.conv-item.active { background: rgba(var(--v-theme-primary), 0.07); }
.conv-info { flex: 1; min-width: 0; }

/* Right panel */
.chat-panel { flex: 1; display: flex; flex-direction: column; min-width: 0; }
.empty-chat {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  color: rgba(0,0,0,0.4); padding: 32px;
}
.chat-header {
  display: flex; align-items: center;
  padding: 12px 20px;
  border-bottom: 1px solid rgba(0,0,0,0.06);
  flex-shrink: 0;
  background: rgb(var(--v-theme-surface));
}
.messages-body {
  flex: 1; overflow-y: auto;
  padding: 16px 20px;
  display: flex; flex-direction: column; gap: 8px;
}

/* Message bubbles */
.message-bubble-wrap { display: flex; }
.message-bubble-wrap.mine { justify-content: flex-end; }
.message-bubble {
  max-width: 72%;
  padding: 10px 14px;
  border-radius: 18px 18px 18px 4px;
  font-size: 0.875rem;
  background: rgba(0,0,0,0.06);
  word-break: break-word;
}
.message-bubble-wrap.mine .message-bubble {
  background: rgb(var(--v-theme-primary));
  color: white;
  border-radius: 18px 18px 4px 18px;
}
.message-time {
  display: block; font-size: 0.62rem;
  opacity: 0.55; margin-top: 3px; text-align: right;
}

/* Input area */
.send-error {
  padding: 4px 16px;
  font-size: 0.75rem;
  color: rgb(var(--v-theme-error));
  display: flex; align-items: center;
}
.chat-input {
  padding: 10px 16px;
  border-top: 1px solid rgba(0,0,0,0.06);
  flex-shrink: 0;
}

/* New message search */
.search-results {
  border: 1px solid rgba(0,0,0,0.08);
  border-radius: 12px;
  overflow: hidden;
  max-height: 260px;
  overflow-y: auto;
}
.search-result-item {
  border-bottom: 1px solid rgba(0,0,0,0.05);
  transition: background 0.15s;
}
.search-result-item:last-child { border-bottom: none; }
.search-result-item:hover { background: rgba(var(--v-theme-primary), 0.05); }
</style>