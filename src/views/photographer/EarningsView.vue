<template>
  <div>
    <h2 class="text-h6 font-weight-bold mb-1">Earnings & Stats</h2>
    <p class="text-medium-emphasis mb-6">Track your performance on Pixxgram</p>

    <v-row v-if="loading">
      <v-col v-for="i in 4" :key="i" cols="6" md="3">
        <v-skeleton-loader type="card" rounded="xl" />
      </v-col>
    </v-row>

    <v-row v-else>
      <v-col v-for="card in statCards" :key="card.label" cols="6" md="3">
        <v-card rounded="xl" class="stat-card pa-5">
          <div class="stat-icon mb-3" :class="card.bg">
            <v-icon :color="card.color" size="20">{{ card.icon }}</v-icon>
          </div>
          <div class="text-h5 font-weight-bold">{{ card.value }}</div>
          <div class="text-caption text-medium-emphasis mt-1">{{ card.label }}</div>
          <div v-if="card.sub" class="text-caption mt-1" :class="card.subColor">{{ card.sub }}</div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Subscription status banner -->
    <v-card
      v-if="stats && stats.subscription_status !== 'active'"
      rounded="xl" color="warning" variant="tonal" class="pa-5 mt-4 d-flex align-center gap-3"
    >
      <v-icon color="warning" size="24">mdi-alert-circle-outline</v-icon>
      <div>
        <p class="text-body-2 font-weight-bold">Your subscription is not active</p>
        <p class="text-caption">Subscribe to appear in search results and receive bookings.</p>
      </div>
      <v-spacer />
      <v-btn color="secondary" size="small" :to="{ name: 'Subscription' }">Subscribe Now</v-btn>
    </v-card>

    <v-row class="mt-4">
      <!-- Booking history -->
      <v-col cols="12" md="7">
        <v-card rounded="xl" class="pa-6 stat-card">
          <h3 class="text-subtitle-2 font-weight-bold mb-4">Recent Bookings</h3>
          <div v-if="loadingBookings" class="text-center py-6">
            <v-progress-circular indeterminate size="24" color="primary" />
          </div>
          <div v-else-if="!recentBookings.length" class="text-center py-6 text-medium-emphasis">
            <v-icon size="40">mdi-calendar-blank-outline</v-icon>
            <p class="text-caption mt-2">No bookings yet.</p>
          </div>
          <div v-else>
            <div
              v-for="b in recentBookings"
              :key="b.id"
              class="booking-row d-flex align-center justify-space-between py-3"
            >
              <div class="d-flex align-center gap-3">
                <v-avatar size="32" color="primary">
                  <span class="text-white text-caption font-weight-bold">{{ b.client?.name?.charAt(0) }}</span>
                </v-avatar>
                <div>
                  <p class="text-body-2 font-weight-semibold">{{ b.client?.name }}</p>
                  <p class="text-caption text-medium-emphasis">{{ fmtDate(b.booking_date) }}</p>
                </div>
              </div>
              <v-chip :color="statusColor(b.status)" size="x-small" label>{{ b.status }}</v-chip>
            </div>
          </div>
          <v-btn variant="text" size="small" color="primary" class="mt-2" :to="{ name: 'PhotographerBookings' }">
            View all bookings <v-icon end size="14">mdi-arrow-right</v-icon>
          </v-btn>
        </v-card>
      </v-col>

      <!-- Portfolio performance -->
      <v-col cols="12" md="5">
        <v-card rounded="xl" class="pa-6 stat-card">
          <h3 class="text-subtitle-2 font-weight-bold mb-4">Portfolio Performance</h3>
          <div v-if="!portfolioStats.length" class="text-center py-6 text-medium-emphasis">
            <v-icon size="40">mdi-image-off-outline</v-icon>
            <p class="text-caption mt-2">Upload photos to see stats.</p>
          </div>
          <div v-else>
            <div v-for="item in portfolioStats.slice(0, 5)" :key="item.id" class="portfolio-stat-row py-2">
              <div class="d-flex justify-space-between mb-1">
                <span class="text-caption font-weight-semibold text-truncate" style="max-width:150px">{{ item.title }}</span>
                <span class="text-caption text-medium-emphasis">{{ item.views }} views</span>
              </div>
              <v-progress-linear
                :model-value="maxViews > 0 ? (item.views / maxViews) * 100 : 0"
                color="secondary" rounded height="4" bg-color="rgba(0,0,0,0.06)"
              />
            </div>
          </div>
          <v-btn variant="text" size="small" color="primary" class="mt-2" :to="{ name: 'Portfolio' }">
            Manage portfolio <v-icon end size="14">mdi-arrow-right</v-icon>
          </v-btn>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { photographersApi } from '@/api/photographers'
import { bookingsApi } from '@/api/bookings'

const loading = ref(true), loadingBookings = ref(true)
const stats = ref(null), recentBookings = ref([])

const statCards = computed(() => {
  if (!stats.value) return []
  return [
    { label: 'Profile Completion', value: stats.value.profile_completion + '%', icon: 'mdi-account-check-outline', color: 'blue',    bg: 'icon-blue',   sub: stats.value.profile_completion < 100 ? 'Complete your profile' : 'Fully complete!', subColor: stats.value.profile_completion < 100 ? 'text-warning' : 'text-success' },
    { label: 'Average Rating',     value: stats.value.average_rating?.toFixed(1) || '—', icon: 'mdi-star',         color: 'amber',   bg: 'icon-amber',  sub: `${stats.value.total_ratings} reviews` },
    { label: 'Upcoming Bookings',  value: stats.value.upcoming_bookings ?? 0,  icon: 'mdi-calendar-check',         color: 'green',   bg: 'icon-green'  },
    { label: 'Portfolio Views',    value: stats.value.total_portfolio_views ?? 0, icon: 'mdi-eye-outline',          color: 'purple',  bg: 'icon-purple' },
  ]
})

const portfolioStats = computed(() => stats.value?.portfolio_analysis || [])
const maxViews = computed(() => Math.max(...portfolioStats.value.map(p => p.views || 0), 1))

const statusColor = s => ({ pending:'warning', confirmed:'info', completed:'success', cancelled:'error' }[s])
function fmtDate(d) { return new Date(d).toLocaleDateString('en-KE', { dateStyle: 'medium' }) }

onMounted(async () => {
  try {
    const [dashRes, bookRes] = await Promise.allSettled([
      photographersApi.dashboard(),
      bookingsApi.list(),
    ])
    if (dashRes.status === 'fulfilled')  stats.value = dashRes.value.data
    if (bookRes.status === 'fulfilled')  recentBookings.value = (bookRes.value.data || []).slice(0, 5)
  } catch (_) {}
  finally { loading.value = false; loadingBookings.value = false }
})
</script>

<style scoped>
.stat-card { border: 1px solid rgba(0,0,0,0.07) !important; }
.stat-icon { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
.icon-blue   { background: rgba(33,150,243,0.1); }
.icon-amber  { background: rgba(255,193,7,0.1); }
.icon-green  { background: rgba(76,175,80,0.1); }
.icon-purple { background: rgba(156,39,176,0.1); }
.booking-row { border-bottom: 1px solid rgba(0,0,0,0.05); }
.booking-row:last-child { border-bottom: none; }
.portfolio-stat-row { border-bottom: 1px solid rgba(0,0,0,0.04); }
.gap-3 { gap: 12px; }
</style>
