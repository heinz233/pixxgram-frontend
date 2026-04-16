<template>
  <v-layout>
    <NavBar />

    <v-navigation-drawer permanent width="240" color="surface" border="r">
      <div class="pa-5 pb-2">
        <p class="text-overline text-medium-emphasis" style="font-size:0.65rem;letter-spacing:1.5px">Photographer</p>
      </div>
      <v-list density="compact" nav class="px-3">
        <v-list-item
          v-for="item in navItems"
          :key="item.label"
          :to="item.to"
          :prepend-icon="item.icon"
          :title="item.label"
          rounded="lg"
          active-color="primary"
          class="mb-1"
        />
      </v-list>

      <template #append>
        <div class="pa-4">
          <v-card rounded="xl" class="pa-4 sub-banner"
            :color="isActive ? 'success' : 'warning'" variant="tonal">
            <div class="d-flex align-center gap-2 mb-1">
              <v-icon size="16" :color="isActive ? 'success' : 'warning'">mdi-crown</v-icon>
              <span class="text-caption font-weight-bold">Subscription</span>
            </div>
            <p class="text-caption text-medium-emphasis">{{ subscriptionLabel }}</p>
            <v-btn size="x-small" :color="isActive ? 'success' : 'warning'" variant="flat" class="mt-2"
              :to="{ name: 'Subscription' }">
              {{ isActive ? 'Manage' : 'Subscribe' }}
            </v-btn>
          </v-card>
        </div>
      </template>
    </v-navigation-drawer>

    <v-main>
      <v-container style="max-width:960px" class="py-8">
        <router-view />
      </v-container>
    </v-main>
  </v-layout>
</template>

<script setup>
import { computed } from 'vue'
import NavBar from '@/components/shared/NavBar.vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const navItems = [
  { label: 'Dashboard',    icon: 'mdi-view-dashboard-outline', to: { name: 'PhotographerDashboard' } },
  { label: 'My Profile',   icon: 'mdi-account-edit-outline',   to: { name: 'PhotographerProfileEdit' } },
  { label: 'Portfolio',    icon: 'mdi-image-multiple-outline',  to: { name: 'Portfolio' } },
  { label: 'Bookings',     icon: 'mdi-calendar-check-outline',  to: { name: 'PhotographerBookings' } },
  { label: 'Messages',     icon: 'mdi-message-outline',         to: { name: 'PhotographerMessages' } },
  { label: 'Earnings',     icon: 'mdi-chart-line',              to: { name: 'Earnings' } },
  { label: 'Subscription', icon: 'mdi-crown-outline',           to: { name: 'Subscription' } },
]

const profile = computed(() => authStore.user?.photographer_profile)
const isActive = computed(() => profile.value?.subscription_status === 'active')
const subscriptionLabel = computed(() => {
  if (!profile.value) return 'Not subscribed'
  if (isActive.value) {
    const end = profile.value.subscription_end_date
    return end ? `Expires ${new Date(end).toLocaleDateString()}` : 'Active'
  }
  return 'Subscribe to get bookings'
})
</script>

<style scoped>
.sub-banner { border: none !important; }
.gap-2 { gap: 8px; }
</style>
