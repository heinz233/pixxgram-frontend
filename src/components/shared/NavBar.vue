<template>
  <v-app-bar flat border="b" color="surface" height="64">
    <v-container class="d-flex align-center pa-0" style="max-width:1280px">

      <!-- Logo -->
      <router-link to="/" class="brand d-flex align-center text-decoration-none mr-8">
        <div class="brand-icon mr-2">
          <v-icon size="20" color="white">mdi-camera-iris</v-icon>
        </div>
        <span class="brand-text">Pixxgram</span>
      </router-link>

      <!-- Desktop nav links -->
      <nav class="d-none d-md-flex align-center gap-2">
        <v-btn variant="text" size="small" :to="{ name: 'Photographers' }">Browse</v-btn>
        <v-btn variant="text" size="small" :to="{ name: 'HowItWorks' }">How it Works</v-btn>
        <v-btn variant="text" size="small" :to="{ name: 'About' }">About</v-btn>
      </nav>

      <v-spacer />

      <!-- Unread badge -->
      <v-btn
        v-if="authStore.isLoggedIn"
        :to="messageRoute"
        icon variant="text"
        class="mr-1"
      >
        <v-badge :content="appStore.unreadMessages || ''" :model-value="appStore.unreadMessages > 0" color="accent">
          <v-icon>mdi-message-outline</v-icon>
        </v-badge>
      </v-btn>

      <!-- Theme toggle -->
      <v-btn icon variant="text" class="mr-1" @click="toggleTheme">
        <v-icon>{{ isDark ? 'mdi-weather-sunny' : 'mdi-weather-night' }}</v-icon>
      </v-btn>

      <!-- Not logged in -->
      <template v-if="!authStore.isLoggedIn">
        <v-btn variant="text" size="small" :to="{ name: 'Login' }" class="mr-1">Sign in</v-btn>
        <v-btn color="primary" size="small" :to="{ name: 'Register' }">Get started</v-btn>
      </template>

      <!-- Logged in — avatar menu -->
      <template v-else>
        <v-menu offset-y rounded="xl">
          <template #activator="{ props }">
            <v-btn v-bind="props" icon variant="text">
              <v-avatar size="36" color="primary">
                <v-img v-if="authStore.user?.user_image" :src="authStore.user.user_image" />
                <span v-else class="text-white font-weight-bold text-body-2">
                  {{ initials }}
                </span>
              </v-avatar>
            </v-btn>
          </template>
          <v-list rounded="xl" density="compact" min-width="200">
            <v-list-item :subtitle="authStore.user?.email" class="py-3">
              <template #title>
                <span class="font-weight-semibold">{{ authStore.user?.name }}</span>
              </template>
            </v-list-item>
            <v-divider />
            <v-list-item
              v-for="item in menuItems"
              :key="item.label"
              :prepend-icon="item.icon"
              :to="item.to"
              :title="item.label"
              rounded="lg"
            />
            <v-divider />
            <v-list-item
              prepend-icon="mdi-logout"
              title="Sign out"
              rounded="lg"
              @click="handleLogout"
            />
          </v-list>
        </v-menu>
      </template>

    </v-container>
  </v-app-bar>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTheme } from 'vuetify'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'

const router    = useRouter()
const authStore = useAuthStore()
const appStore  = useAppStore()
const theme     = useTheme()

// ── Theme toggle with localStorage persistence ─────────────────────
const THEME_KEY = 'pixxgram_theme'

const isDark = computed(() => theme.global.current.value.dark)

function toggleTheme() {
  const newTheme = isDark.value ? 'pixxgramLight' : 'pixxgramDark'
  theme.global.name.value = newTheme
  // Save preference so it survives page refresh
  localStorage.setItem(THEME_KEY, newTheme)
}

// Restore saved theme on every page load
onMounted(() => {
  const saved = localStorage.getItem(THEME_KEY)
  if (saved && (saved === 'pixxgramLight' || saved === 'pixxgramDark')) {
    theme.global.name.value = saved
  }
})

const initials = computed(() => {
  const name = authStore.user?.name || ''
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
})

const messageRoute = computed(() => {
  if (authStore.isPhotographer) return { name: 'PhotographerMessages' }
  return { name: 'ClientMessages' }
})

const menuItems = computed(() => {
  if (authStore.isAdmin) {
    return [{ label: 'Dashboard', icon: 'mdi-view-dashboard-outline', to: { name: 'AdminDashboard' } }]
  }
  if (authStore.isPhotographer) {
    return [
      { label: 'Dashboard',    icon: 'mdi-view-dashboard-outline', to: { name: 'PhotographerDashboard' } },
      { label: 'My Profile',   icon: 'mdi-account-edit-outline',   to: { name: 'PhotographerProfileEdit' } },
      { label: 'Portfolio',    icon: 'mdi-image-multiple-outline',  to: { name: 'Portfolio' } },
      { label: 'Subscription', icon: 'mdi-crown-outline',           to: { name: 'Subscription' } },
    ]
  }
  return [
    { label: 'My Bookings', icon: 'mdi-calendar-check-outline', to: { name: 'ClientBookings' } },
    { label: 'Messages',    icon: 'mdi-message-outline',         to: { name: 'ClientMessages' } },
  ]
})

async function handleLogout() {
  await authStore.logout()
  router.push({ name: 'Home' })
}
</script>

<style scoped>
.brand-icon {
  width: 32px; height: 32px;
  background: rgb(var(--v-theme-primary));
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
}
.brand-text {
  font-weight: 800;
  font-size: 1.2rem;
  letter-spacing: -0.5px;
  color: rgb(var(--v-theme-primary));
}
.gap-2 { gap: 8px; }
</style>