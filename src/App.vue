<template>
  <v-app>
    <router-view />

    <!-- Global snackbar notifications -->
    <v-snackbar
      v-model="appStore.snackbar.show"
      :color="appStore.snackbar.color"
      :timeout="3500"
      location="bottom right"
      rounded="lg"
    >
      {{ appStore.snackbar.message }}
      <template #actions>
        <v-btn variant="text" @click="appStore.snackbar.show = false">Close</v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>

<script setup>
import { onMounted } from 'vue'
import { useTheme } from 'vuetify'
import { useAppStore } from '@/stores/app'
import { useUnreadMessages } from '@/composables/useUnreadMessages'

const appStore = useAppStore()
const theme    = useTheme()

// Restore saved theme preference on app start
onMounted(() => {
  const saved = localStorage.getItem('pixxgram_theme')
  if (saved === 'pixxgramLight' || saved === 'pixxgramDark') {
    theme.global.name.value = saved
  }
})

useUnreadMessages()
</script>