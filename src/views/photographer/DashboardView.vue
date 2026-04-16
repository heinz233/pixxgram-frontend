<template>
  <div>
    <h2 class="text-h6 font-weight-bold mb-1">Dashboard</h2>
    <p class="text-medium-emphasis mb-6">Welcome back, {{ authStore.user?.name }}</p>

    <v-row v-if="loading">
      <v-col v-for="i in 4" :key="i" cols="6" md="3">
        <v-skeleton-loader type="card" rounded="xl" />
      </v-col>
    </v-row>

    <v-row v-else>
      <v-col v-for="stat in statCards" :key="stat.label" cols="6" md="3">
        <v-card rounded="xl" class="stat-card pa-5">
          <div class="d-flex align-center justify-space-between mb-3">
            <div class="stat-icon" :class="stat.colorClass">
              <v-icon size="20" :color="stat.iconColor">{{ stat.icon }}</v-icon>
            </div>
          </div>
          <div class="text-h5 font-weight-bold">{{ stat.value }}</div>
          <div class="text-caption text-medium-emphasis mt-1">{{ stat.label }}</div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Profile completion -->
    <v-card rounded="xl" class="pa-5 mt-4" v-if="stats">
      <div class="d-flex align-center justify-space-between mb-2">
        <span class="text-body-2 font-weight-semibold">Profile Completion</span>
        <span class="text-body-2 font-weight-bold text-secondary">{{ stats.profile_completion }}%</span>
      </div>
      <v-progress-linear
        :model-value="stats.profile_completion"
        color="secondary" rounded height="8"
        bg-color="rgba(0,0,0,0.06)"
      />
      <p class="text-caption text-medium-emphasis mt-2">
        Complete your profile to attract more clients.
      </p>
    </v-card>

    <!-- Quick links -->
    <v-row class="mt-4">
      <v-col cols="12" md="6">
        <v-card rounded="xl" class="pa-5">
          <h3 class="text-subtitle-2 font-weight-bold mb-4">Quick Actions</h3>
          <v-list density="compact" nav>
            <v-list-item
              v-for="action in quickActions"
              :key="action.label"
              :prepend-icon="action.icon"
              :title="action.label"
              :to="action.to"
              rounded="lg"
              active-color="primary"
            />
          </v-list>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card rounded="xl" class="pa-5" color="primary">
          <div class="d-flex align-center gap-3 mb-3">
            <v-icon color="secondary" size="28">mdi-crown</v-icon>
            <h3 class="text-subtitle-2 font-weight-bold text-white">Subscription</h3>
          </div>
          <p class="text-body-2 text-white opacity-80 mb-4">{{ subscriptionStatus }}</p>
          <v-btn color="secondary" size="small" :to="{ name: 'Subscription' }">
            {{ stats?.subscription_status === 'active' ? 'Manage' : 'Subscribe Now' }}
          </v-btn>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { photographersApi } from '@/api/photographers'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const loading   = ref(true)
const stats     = ref(null)

const statCards = computed(() => {
  if (!stats.value) return []
  return [
    { label: 'Average Rating', value: stats.value.average_rating?.toFixed(1) || '—', icon: 'mdi-star', iconColor: 'amber', colorClass: 'icon-amber' },
    { label: 'Total Ratings',  value: stats.value.total_ratings ?? 0,    icon: 'mdi-account-group', iconColor: 'blue', colorClass: 'icon-blue' },
    { label: 'Upcoming Bookings', value: stats.value.upcoming_bookings ?? 0, icon: 'mdi-calendar-check', iconColor: 'green', colorClass: 'icon-green' },
    { label: 'Portfolio Views', value: stats.value.total_portfolio_views ?? 0, icon: 'mdi-eye', iconColor: 'purple', colorClass: 'icon-purple' },
  ]
})

const subscriptionStatus = computed(() => {
  if (!stats.value) return ''
  if (stats.value.subscription_status === 'active') {
    const end = stats.value.subscription_end_date
    return `Active${end ? ' until ' + new Date(end).toLocaleDateString() : ''}`
  }
  return 'You need an active subscription to appear in search results.'
})

const quickActions = [
  { label: 'Edit Profile',    icon: 'mdi-account-edit-outline',  to: { name: 'PhotographerProfileEdit' } },
  { label: 'Upload Portfolio',icon: 'mdi-image-plus-outline',    to: { name: 'Portfolio' } },
  { label: 'View Bookings',   icon: 'mdi-calendar-check-outline',to: { name: 'PhotographerBookings' } },
]

onMounted(async () => {
  try {
    const { data } = await photographersApi.dashboard()
    stats.value = data
  } catch (_) {}
  finally { loading.value = false }
})
</script>

<style scoped>
.stat-card { border: 1px solid rgba(0,0,0,0.07) !important; }
.stat-icon { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
.icon-amber  { background: rgba(255,193,7,0.12); }
.icon-blue   { background: rgba(33,150,243,0.12); }
.icon-green  { background: rgba(76,175,80,0.12); }
.icon-purple { background: rgba(156,39,176,0.12); }
.gap-3 { gap: 12px; }
</style>
