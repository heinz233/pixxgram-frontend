<template>
  <div>
    <!-- Page header -->
    <div class="d-flex align-center justify-space-between mb-8">
      <div>
        <h1 class="text-h5 font-weight-bold">Dashboard</h1>
        <p class="text-medium-emphasis mt-1">
          {{ greeting }}, {{ firstName }}. Here's what's happening on Pixxgram.
        </p>
      </div>
      <div class="text-right">
        <p class="text-caption text-medium-emphasis">{{ currentDate }}</p>
        <v-chip color="success" size="x-small" class="mt-1">
          <v-icon start size="10">mdi-circle</v-icon> System Online
        </v-chip>
      </div>
    </div>

    <!-- Stat cards -->
    <v-row v-if="loading">
      <v-col v-for="i in 6" :key="i" cols="6" md="4" lg="2">
        <v-skeleton-loader type="card" rounded="xl" />
      </v-col>
    </v-row>

    <v-row v-else class="mb-2">
      <v-col v-for="card in statCards" :key="card.label" cols="6" md="4" lg="2">
        <v-card rounded="xl" class="stat-card pa-4">
          <div class="d-flex align-center justify-space-between mb-3">
            <div class="stat-icon" :class="card.bg">
              <v-icon :color="card.color" size="18">{{ card.icon }}</v-icon>
            </div>
            <v-icon size="14" :color="card.trend === 'up' ? 'success' : 'medium-emphasis'">
              {{ card.trend === 'up' ? 'mdi-trending-up' : 'mdi-minus' }}
            </v-icon>
          </div>
          <div class="text-h6 font-weight-bold">{{ card.value }}</div>
          <div class="text-caption text-medium-emphasis mt-1">{{ card.label }}</div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Revenue cards -->
    <v-row class="mb-4" v-if="stats">
      <v-col cols="12" md="6">
        <v-card rounded="xl" class="revenue-card pa-6" color="primary">
          <div class="d-flex align-center justify-space-between mb-2">
            <p class="text-white text-caption text-uppercase font-weight-bold" style="opacity:.7">Total Platform Revenue</p>
            <v-icon color="secondary" size="20">mdi-cash-multiple</v-icon>
          </div>
          <p class="text-white text-h4 font-weight-bold">
            KSh {{ Number(stats.total_revenue || 0).toLocaleString() }}
          </p>
          <p class="mt-2 text-caption" style="color:rgba(255,255,255,0.6)">All time from subscriptions</p>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card rounded="xl" class="revenue-card pa-6" color="secondary">
          <div class="d-flex align-center justify-space-between mb-2">
            <p class="text-white text-caption text-uppercase font-weight-bold" style="opacity:.7">This Month's Revenue</p>
            <v-icon color="white" size="20">mdi-calendar-today</v-icon>
          </div>
          <p class="text-white text-h4 font-weight-bold">
            KSh {{ Number(stats.monthly_revenue || 0).toLocaleString() }}
          </p>
          <p class="mt-2 text-caption" style="color:rgba(255,255,255,0.6)">{{ new Date().toLocaleString('default', { month: 'long', year: 'numeric' }) }}</p>
        </v-card>
      </v-col>
    </v-row>

    <!-- Bottom two panels -->
    <v-row>
      <!-- Recent reports -->
      <v-col cols="12" md="6">
        <v-card rounded="xl" class="panel-card pa-6">
          <div class="d-flex align-center justify-space-between mb-5">
            <h3 class="text-subtitle-2 font-weight-bold">Pending Reports</h3>
            <v-btn variant="text" size="x-small" color="primary" :to="{ name: 'AdminReports' }">
              View all <v-icon end size="12">mdi-arrow-right</v-icon>
            </v-btn>
          </div>
          <div v-if="loadingReports" class="text-center py-6">
            <v-progress-circular indeterminate size="24" color="primary" />
          </div>
          <div v-else-if="!recentReports.length" class="text-center py-8">
            <v-icon size="40" color="success">mdi-check-circle-outline</v-icon>
            <p class="text-caption text-medium-emphasis mt-2">No pending reports</p>
          </div>
          <div v-else>
            <div v-for="r in recentReports.slice(0,4)" :key="r.id" class="report-row d-flex align-center gap-3 py-3">
              <v-avatar size="34" color="error" variant="tonal">
                <v-icon size="16" color="error">mdi-flag</v-icon>
              </v-avatar>
              <div class="flex-grow-1 min-width-0">
                <p class="text-body-2 font-weight-semibold text-truncate">{{ r.reason }}</p>
                <p class="text-caption text-medium-emphasis">
                  {{ r.client?.name }} → {{ r.photographer?.name }}
                </p>
              </div>
              <v-chip color="warning" size="x-small" label>pending</v-chip>
            </div>
          </div>
        </v-card>
      </v-col>

      <!-- Recent ratings -->
      <v-col cols="12" md="6">
        <v-card rounded="xl" class="panel-card pa-6">
          <div class="d-flex align-center justify-space-between mb-5">
            <h3 class="text-subtitle-2 font-weight-bold">Latest Reviews</h3>
            <v-btn variant="text" size="x-small" color="primary" :to="{ name: 'AdminRatings' }">
              View all <v-icon end size="12">mdi-arrow-right</v-icon>
            </v-btn>
          </div>
          <div v-if="loadingRatings" class="text-center py-6">
            <v-progress-circular indeterminate size="24" color="primary" />
          </div>
          <div v-else-if="!recentRatings.length" class="text-center py-8">
            <v-icon size="40" color="medium-emphasis">mdi-star-off-outline</v-icon>
            <p class="text-caption text-medium-emphasis mt-2">No ratings yet</p>
          </div>
          <div v-else>
            <div v-for="r in recentRatings.slice(0,4)" :key="r.id" class="rating-row d-flex align-center gap-3 py-3">
              <v-avatar size="34" color="secondary" variant="tonal">
                <span class="text-caption font-weight-bold" style="color: rgb(var(--v-theme-secondary))">
                  {{ r.client?.name?.charAt(0) }}
                </span>
              </v-avatar>
              <div class="flex-grow-1 min-width-0">
                <p class="text-body-2 font-weight-semibold text-truncate">{{ r.photographer?.name }}</p>
                <p class="text-caption text-medium-emphasis text-truncate">{{ r.comment || 'No comment' }}</p>
              </div>
              <div class="d-flex align-center gap-1">
                <v-icon size="14" color="amber">mdi-star</v-icon>
                <span class="text-caption font-weight-bold">{{ r.stars }}</span>
              </div>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Quick action links -->
    <v-row class="mt-2">
      <v-col v-for="link in quickLinks" :key="link.label" cols="12" sm="6" md="3">
        <v-card rounded="xl" class="quick-link pa-5" :to="link.to" hover>
          <div class="quick-link-icon mb-3" :class="link.bg">
            <v-icon :color="link.color" size="22">{{ link.icon }}</v-icon>
          </div>
          <p class="text-body-2 font-weight-bold mb-1">{{ link.label }}</p>
          <p class="text-caption text-medium-emphasis">{{ link.desc }}</p>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { adminApi } from '@/api/admin'
import { useAuthStore } from '@/stores/auth'
import api from '@/api/axios'

const authStore     = useAuthStore()
const loading       = ref(true)
const loadingReports= ref(true)
const loadingRatings= ref(true)
const stats         = ref(null)
const recentReports = ref([])
const recentRatings = ref([])

const firstName = computed(() => authStore.user?.name?.split(' ')[0] || 'Admin')
const greeting  = computed(() => {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
})
const currentDate = computed(() =>
  new Date().toLocaleDateString('en-KE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
)

const statCards = computed(() => {
  if (!stats.value) return []
  return [
    { label: 'Photographers',  value: stats.value.total_photographers,  icon: 'mdi-camera-account',         color: 'blue',   bg: 'bg-blue',   trend: 'up' },
    { label: 'Active',         value: stats.value.active_photographers, icon: 'mdi-check-circle-outline',   color: 'green',  bg: 'bg-green',  trend: 'up' },
    { label: 'Clients',        value: stats.value.total_clients,        icon: 'mdi-account-group-outline',  color: 'purple', bg: 'bg-purple', trend: 'up' },
    { label: 'Reports',        value: stats.value.pending_reports,      icon: 'mdi-flag-outline',           color: 'red',    bg: 'bg-red',    trend: stats.value.pending_reports > 0 ? 'up' : 'flat' },
    { label: 'Bookings',       value: stats.value.total_bookings,       icon: 'mdi-calendar-check-outline', color: 'teal',   bg: 'bg-teal',   trend: 'up' },
    { label: 'Completed',      value: stats.value.completed_bookings,   icon: 'mdi-calendar-check',         color: 'green',  bg: 'bg-green',  trend: 'up' },
  ]
})

const quickLinks = [
  { label: 'Manage Photographers', desc: 'View, suspend or ban accounts', icon: 'mdi-camera-account',         color: 'primary',   bg: 'bg-blue',   to: { name: 'AdminPhotographers' } },
  { label: 'Review Reports',       desc: 'Handle flagged content',         icon: 'mdi-flag-outline',           color: 'error',     bg: 'bg-red',    to: { name: 'AdminReports' } },
  { label: 'Activity Feed',        desc: 'See all platform events',        icon: 'mdi-pulse',                  color: 'secondary', bg: 'bg-amber',  to: { name: 'AdminActivity' } },
  { label: 'Ratings Overview',     desc: 'View all photographer ratings',  icon: 'mdi-star-outline',           color: 'amber',     bg: 'bg-amber',  to: { name: 'AdminRatings' } },
]

onMounted(async () => {
  const [dashRes, reportsRes, ratingsRes] = await Promise.allSettled([
    adminApi.dashboard(),
    adminApi.reports({ status: 'pending' }),
    api.get('/admin/ratings'),
  ])
  if (dashRes.status   === 'fulfilled') stats.value         = dashRes.value.data
  if (reportsRes.status === 'fulfilled') recentReports.value = reportsRes.value.data?.data || []
  if (ratingsRes.status === 'fulfilled') recentRatings.value = ratingsRes.value.data?.data || ratingsRes.value.data || []
  loading.value = false
  loadingReports.value = false
  loadingRatings.value = false
})
</script>

<style scoped>
.stat-card   { border: 1px solid rgba(0,0,0,0.07) !important; }
.panel-card  { border: 1px solid rgba(0,0,0,0.07) !important; }
.quick-link  { border: 1px solid rgba(0,0,0,0.07) !important; transition: transform 0.18s; }
.quick-link:hover { transform: translateY(-2px); }
.revenue-card { border: none !important; }

.stat-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
.quick-link-icon { width: 44px; height: 44px; border-radius: 13px; display: flex; align-items: center; justify-content: center; }

.bg-blue   { background: rgba(33,150,243,0.1); }
.bg-green  { background: rgba(76,175,80,0.1); }
.bg-purple { background: rgba(156,39,176,0.1); }
.bg-red    { background: rgba(244,67,54,0.1); }
.bg-teal   { background: rgba(0,150,136,0.1); }
.bg-amber  { background: rgba(255,193,7,0.1); }

.report-row, .rating-row { border-bottom: 1px solid rgba(0,0,0,0.05); }
.report-row:last-child, .rating-row:last-child { border-bottom: none; }
.gap-1 { gap: 4px; }
.gap-3 { gap: 12px; }
</style>
