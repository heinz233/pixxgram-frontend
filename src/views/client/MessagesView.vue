<template>
  <div class="messages-layout">
    <!-- Conversations list -->
    <div class="conversations-panel">
      <div class="panel-header">
        <h3 class="text-subtitle-1 font-weight-bold">Messages</h3>
      </div>
      <div v-if="loadingConvs" class="text-center pa-6">
        <v-progress-circular indeterminate size="24" color="primary" />
      </div>
      <div v-else-if="!conversations.length" class="text-center pa-8 text-medium-emphasis text-caption">
        No conversations yet.
      </div>
      <div
        v-for="conv in conversations"
        :key="conv.id"
        class="conv-item"
        :class="{ active: activeUserId === otherUser(conv).id }"
        @click="openConversation(otherUser(conv))"
      >
        <v-avatar size="40" color="primary" class="flex-shrink-0">
          <v-img v-if="otherUser(conv).user_image" :src="otherUser(conv).user_image" />
          <span v-else class="text-white text-caption font-weight-bold">
            {{ otherUser(conv).name?.charAt(0) }}
          </span>
        </v-avatar>
        <div class="conv-info">
          <p class="text-body-2 font-weight-semibold">{{ otherUser(conv).name }}</p>
          <p class="text-caption text-medium-emphasis text-truncate">{{ conv.message }}</p>
        </div>
        <v-badge v-if="!conv.is_read && conv.receiver_id === authStore.user?.id"
          color="accent" dot class="flex-shrink-0" />
      </div>
    </div>

    <!-- Chat window -->
    <div class="chat-panel">
      <div v-if="!activeUser" class="empty-chat">
        <v-icon size="56" color="medium-emphasis">mdi-message-text-outline</v-icon>
        <p class="mt-3 text-medium-emphasis">Select a conversation</p>
      </div>

      <template v-else>
        <!-- Chat header -->
        <div class="chat-header">
          <v-avatar size="36" color="primary" class="mr-3">
            <v-img v-if="activeUser.user_image" :src="activeUser.user_image" />
            <span v-else class="text-white text-caption font-weight-bold">{{ activeUser.name?.charAt(0) }}</span>
          </v-avatar>
          <span class="font-weight-semibold">{{ activeUser.name }}</span>
        </div>

        <!-- Messages -->
        <div ref="messagesContainer" class="messages-body">
          <div v-if="loadingMessages" class="text-center pa-6">
            <v-progress-circular indeterminate size="24" color="primary" />
          </div>
          <template v-else>
            <div
              v-for="msg in messages"
              :key="msg.id"
              class="message-bubble-wrap"
              :class="{ mine: msg.sender_id === authStore.user?.id }"
            >
              <div class="message-bubble">
                {{ msg.message }}
                <span class="message-time">{{ formatTime(msg.created_at) }}</span>
              </div>
            </div>
          </template>
        </div>

        <!-- Input -->
        <div class="chat-input">
          <v-text-field
            v-model="newMessage"
            placeholder="Type a message..."
            variant="outlined" rounded="lg" density="compact" hide-details
            @keyup.enter="sendMessage"
          >
            <template #append-inner>
              <v-btn icon size="small" color="primary" :loading="sending" @click="sendMessage">
                <v-icon size="18">mdi-send</v-icon>
              </v-btn>
            </template>
          </v-text-field>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted } from 'vue'
import { messagesApi } from '@/api/messages'
import { useAuthStore } from '@/stores/auth'

const authStore         = useAuthStore()
const conversations     = ref([])
const messages          = ref([])
const activeUser        = ref(null)
const activeUserId      = ref(null)
const newMessage        = ref('')
const loadingConvs      = ref(true)
const loadingMessages   = ref(false)
const sending           = ref(false)
const messagesContainer = ref(null)

function otherUser(conv) {
  return conv.sender_id === authStore.user?.id ? conv.receiver : conv.sender
}

async function openConversation(user) {
  activeUser.value   = user
  activeUserId.value = user.id
  loadingMessages.value = true
  try {
    const { data } = await messagesApi.conversation(user.id)
    messages.value = data
    await nextTick()
    scrollToBottom()
  } catch (_) {}
  finally { loadingMessages.value = false }
}

async function sendMessage() {
  if (!newMessage.value.trim() || !activeUser.value) return
  sending.value = true
  try {
    const { data } = await messagesApi.send({
      receiver_id: activeUser.value.id,
      message:     newMessage.value.trim(),
    })
    messages.value.push(data.data)
    newMessage.value = ''
    await nextTick()
    scrollToBottom()
  } catch (_) {}
  finally { sending.value = false }
}

function scrollToBottom() {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

function formatTime(d) {
  return new Date(d).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })
}

onMounted(async () => {
  try {
    const { data } = await messagesApi.conversations()
    conversations.value = data
  } catch (_) {}
  finally { loadingConvs.value = false }
})
</script>

<style scoped>
.messages-layout {
  display: flex;
  height: calc(100vh - 140px);
  border: 1px solid rgba(0,0,0,0.08);
  border-radius: 16px;
  overflow: hidden;
  background: rgb(var(--v-theme-surface));
}
.conversations-panel {
  width: 280px;
  flex-shrink: 0;
  border-right: 1px solid rgba(0,0,0,0.06);
  overflow-y: auto;
}
.panel-header {
  padding: 16px;
  border-bottom: 1px solid rgba(0,0,0,0.06);
  position: sticky; top: 0;
  background: rgb(var(--v-theme-surface));
}
.conv-item {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 16px;
  cursor: pointer; transition: background 0.15s;
}
.conv-item:hover { background: rgba(0,0,0,0.03); }
.conv-item.active { background: rgba(var(--v-theme-primary), 0.06); }
.conv-info { flex: 1; min-width: 0; }
.chat-panel { flex: 1; display: flex; flex-direction: column; min-width: 0; }
.empty-chat {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; justify-content: center; color: rgba(0,0,0,0.4);
}
.chat-header {
  display: flex; align-items: center;
  padding: 14px 20px;
  border-bottom: 1px solid rgba(0,0,0,0.06);
  flex-shrink: 0;
}
.messages-body { flex: 1; overflow-y: auto; padding: 16px 20px; display: flex; flex-direction: column; gap: 8px; }
.message-bubble-wrap { display: flex; }
.message-bubble-wrap.mine { justify-content: flex-end; }
.message-bubble {
  max-width: 70%;
  padding: 8px 14px;
  border-radius: 16px;
  font-size: 0.875rem;
  background: rgba(0,0,0,0.05);
  position: relative;
}
.message-bubble-wrap.mine .message-bubble {
  background: rgb(var(--v-theme-primary));
  color: white;
}
.message-time {
  display: block;
  font-size: 0.65rem;
  opacity: 0.6;
  margin-top: 2px;
  text-align: right;
}
.chat-input { padding: 12px 16px; border-top: 1px solid rgba(0,0,0,0.06); }
</style>
