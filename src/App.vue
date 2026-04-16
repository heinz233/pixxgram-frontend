<template>
  <v-app :theme="theme">
    <router-view v-slot="{ Component }">
      <transition name="page" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>

    <v-snackbar
      v-model="appStore.snackbar.show"
      :color="appStore.snackbar.color"
      :timeout="3500"
      location="bottom right"
      rounded="lg"
    >
      {{ appStore.snackbar.message }}
      <template #actions>
        <v-btn variant="text" @click="appStore.snackbar.show = false">Dismiss</v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>

<script setup>
import { ref } from 'vue'
import { useAppStore } from '@/stores/app'
import { useUnreadMessages } from '@/composables/useUnreadMessages'

const appStore = useAppStore()
const theme    = ref('pixxgramLight')

useUnreadMessages()
</script>

<style>
.page-enter-active, .page-leave-active { transition: opacity 0.15s ease; }
.page-enter-from, .page-leave-to { opacity: 0; }
</style>
