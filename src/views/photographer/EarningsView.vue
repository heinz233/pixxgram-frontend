<template>
  <div>

    <!-- Header -->
    <div class="d-flex align-center justify-space-between mb-7">
      <div>
        <h2 class="text-h6 font-weight-bold">Earnings & Stats</h2>
        <p class="text-medium-emphasis text-body-2 mt-1">
          Track your performance on Pixxgram
        </p>
      </div>
      <v-btn variant="text" size="small" color="primary"
        prepend-icon="mdi-refresh" :loading="loading" @click="loadData">
        Refresh
      </v-btn>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-16">
      <v-progress-circular indeterminate color="primary" size="48" />
      <p class="mt-4 text-medium-emphasis">Loading your earnings...</p>
    </div>

    <template v-else>

      <!-- ── EARNINGS SUMMARY CARDS ─────────────────────────────── -->
      <v-row class="mb-4">

        <!-- Total Earned -->
        <v-col cols="12" md="4">
          <v-card rounded="xl" class="pa-6 earnings-hero" color="primary">
            <p class="text-white text-caption text-uppercase font-weight-bold mb-2" style="opacity:.7">
              Total Earned
            </p>
            <p class="text-white text-h4 font-weight-bold">
              KSh {{ totalEarned.toLocaleString() }}
            </p>
            <p class="text-caption mt-2" style="color:rgba(255,255,255,0.55)">
              From {{ paidBookings.length }} paid booking{{ paidBookings.length !== 1 ? 's' : '' }}
            </p>
          </v-card>
        </v-col>

        <!-- This Month -->
        <v-col cols="12" md="4">
          <v-card rounded="xl" class="pa-6 earnings-hero" color="secondary">
            <p class="text-white text-caption text-uppercase font-weight-bold mb-2" style="opacity:.7">
              This Month
            </p>
            <p class="text-white text-h4 font-weight-bold">
              KSh {{ thisMonthEarned.toLocaleString() }}
            </p>
            <p class="text-caption mt-2" style="color:rgba(255,255,255,0.55)">
              {{ currentMonthName }}
            </p>
          </v-card>
        </v-col>

        <!-- Pending Payment -->
        <v-col cols="12" md="4">
          <v-card rounded="xl" class="pa-6 stat-card">
            <div class="d-flex align-center justify-space-between mb-3">
              <div class="stat-icon bg-amber">
                <v-icon size="18" color="orange">mdi-clock-outline</v-icon>
              </div>
            </div>
            <p class="text-h5 font-weight-bold">
              KSh {{ pendingAmount.toLocaleString() }}
            </p>
            <p class="text-caption text-medium-emphasis mt-1">
              Awaiting payment ({{ confirmedUnpaid.length }} booking{{ confirmedUnpaid.length !== 1 ? 's' : '' }})
            </p>
          </v-card>
        </v-col>
      </v-row>

      <!-- ── BOOKING STATS ROW ───────────────────────────────────── -->
      <v-row class="mb-6">
        <v-col cols="6" md="3">
          <v-card rounded="xl" class="pa-5 stat-card text-center">
            <div class="stat-icon bg-blue mx-auto mb-2">
              <v-icon size="18" color="blue">mdi-calendar-check-outline</v-icon>
            </div>
            <p class="text-h5 font-weight-bold">{{ totalBookings }}</p>
            <p class="text-caption text-medium-emphasis">Total Bookings</p>
          </v-card>
        </v-col>
        <v-col cols="6" md="3">
          <v-card rounded="xl" class="pa-5 stat-card text-center">
            <div class="stat-icon bg-green mx-auto mb-2">
              <v-icon size="18" color="success">mdi-check-circle-outline</v-icon>
            </div>
            <p class="text-h5 font-weight-bold">{{ completedBookings }}</p>
            <p class="text-caption text-medium-emphasis">Completed</p>
          </v-card>
        </v-col>
        <v-col cols="6" md="3">
          <v-card rounded="xl" class="pa-5 stat-card text-center">
            <div class="stat-icon bg-purple mx-auto mb-2">
              <v-icon size="18" color="purple">mdi-star-outline</v-icon>
            </div>
            <p class="text-h5 font-weight-bold">{{ avgRating }}</p>
            <p class="text-caption text-medium-emphasis">Avg Rating</p>
          </v-card>
        </v-col>
        <v-col cols="6" md="3">
          <v-card rounded="xl" class="pa-5 stat-card text-center">
            <div class="stat-icon bg-teal mx-auto mb-2">
              <v-icon size="18" color="teal">mdi-image-multiple-outline</v-icon>
            </div>
            <p class="text-h5 font-weight-bold">{{ portfolioCount }}</p>
            <p class="text-caption text-medium-emphasis">Portfolio Photos</p>
          </v-card>
        </v-col>
      </v-row>

      <!-- ── MAIN CONTENT: Transactions + Recent Bookings ──────── -->
      <v-row>

        <!-- Recent paid transactions -->
        <v-col cols="12" md="7">
          <v-card rounded="xl" class="pa-6 content-card">
            <div class="d-flex align-center justify-space-between mb-5">
              <h3 class="text-subtitle-2 font-weight-bold">Payment History</h3>
              <v-chip color="success" variant="tonal" size="small">
                {{ paidBookings.length }} payments
              </v-chip>
            </div>

            <!-- Empty -->
            <div v-if="!paidBookings.length" class="text-center py-10">
              <v-icon size="52" color="medium-emphasis">mdi-cash-remove</v-icon>
              <p class="mt-3 text-body-2 font-weight-semibold">No payments yet</p>
              <p class="text-caption text-medium-emphasis mt-1">
                Payments will appear here once clients pay for confirmed bookings.
              </p>
            </div>

            <!-- Transaction list -->
            <div v-else>
              <div
                v-for="booking in paidBookings.slice(0, 8)"
                :key="booking.id"
                class="transaction-row d-flex align-center py-3"
                style="gap:14px"
              >
                <!-- Client avatar -->
                <v-avatar size="38" color="primary">
                  <v-img v-if="booking.client?.user_image"
                    :src="buildUrl(booking.client.user_image)" />
                  <span v-else class="text-white text-caption font-weight-bold">
                    {{ booking.client?.name?.charAt(0)?.toUpperCase() }}
                  </span>
                </v-avatar>

                <div class="flex-grow-1 min-width-0">
                  <p class="text-body-2 font-weight-semibold">
                    {{ booking.client?.name || 'Client' }}
                  </p>
                  <p class="text-caption text-medium-emphasis">
                    {{ formatDate(booking.booking_date) }}
                    <span v-if="booking.mpesa_receipt">
                      · {{ booking.mpesa_receipt }}
                    </span>
                  </p>
                </div>

                <div class="text-right flex-shrink-0">
                  <p class="text-body-2 font-weight-bold text-success">
                    + KSh {{ Number(booking.amount || 0).toLocaleString() }}
                  </p>
                  <p class="text-caption text-medium-emphasis">
                    {{ timeAgo(booking.paid_at || booking.updated_at) }}
                  </p>
                </div>
              </div>

              <!-- View all -->
              <v-btn
                v-if="paidBookings.length > 8"
                variant="text" color="primary" block class="mt-3"
                :to="{ name: 'PhotographerBookings' }"
              >
                View all {{ paidBookings.length }} payments
                <v-icon end size="14">mdi-arrow-right</v-icon>
              </v-btn>
            </div>
          </v-card>
        </v-col>

        <!-- Right column -->
        <v-col cols="12" md="5">

          <!-- Pending payments (confirmed but not paid) -->
          <v-card rounded="xl" class="pa-6 content-card mb-4">
            <div class="d-flex align-center justify-space-between mb-4">
              <h3 class="text-subtitle-2 font-weight-bold">Awaiting Payment</h3>
              <v-chip v-if="confirmedUnpaid.length"
                color="warning" variant="tonal" size="small">
                {{ confirmedUnpaid.length }}
              </v-chip>
            </div>

            <div v-if="!confirmedUnpaid.length" class="text-center py-6">
              <v-icon size="40" color="success">mdi-check-circle-outline</v-icon>
              <p class="text-caption text-medium-emphasis mt-2">
                No pending payments
              </p>
            </div>

            <div v-else>
              <div
                v-for="booking in confirmedUnpaid"
                :key="booking.id"
                class="pending-row d-flex align-center py-3"
                style="gap:12px"
              >
                <v-avatar size="34" color="warning" variant="tonal">
                  <span class="text-warning text-caption font-weight-bold">
                    {{ booking.client?.name?.charAt(0) }}
                  </span>
                </v-avatar>
                <div class="flex-grow-1 min-width-0">
                  <p class="text-body-2 font-weight-semibold text-truncate">
                    {{ booking.client?.name }}
                  </p>
                  <p class="text-caption text-medium-emphasis">
                    {{ formatDate(booking.booking_date) }}
                  </p>
                </div>
                <v-chip color="warning" size="x-small" label>unpaid</v-chip>
              </div>
            </div>
          </v-card>

          <!-- Portfolio performance -->
          <v-card rounded="xl" class="pa-6 content-card">
            <div class="d-flex align-center justify-space-between mb-4">
              <h3 class="text-subtitle-2 font-weight-bold">Portfolio Performance</h3>
              <v-btn variant="text" size="x-small" color="primary"
                :to="{ name: 'Portfolio' }">
                Manage <v-icon end size="12">mdi-arrow-right</v-icon>
              </v-btn>
            </div>

            <div v-if="!dashStats?.portfolio_analysis?.length" class="text-center py-6">
              <v-icon size="40" color="medium-emphasis">mdi-image-off-outline</v-icon>
              <p class="text-caption text-medium-emphasis mt-2">
                Upload photos to see stats.
              </p>
              <v-btn size="small" color="primary" variant="tonal" class="mt-3" rounded="lg"
                :to="{ name: 'Portfolio' }">
                Upload Photos
              </v-btn>
            </div>

            <div v-else>
              <div
                v-for="item in dashStats.portfolio_analysis.slice(0, 5)"
                :key="item.id"
                class="portfolio-stat-row d-flex align-center py-2"
                style="gap:10px"
              >
                <v-img
                  :src="item.thumbnail_url || item.image_url"
                  width="40" height="40" cover rounded="lg"
                  class="flex-shrink-0"
                />
                <div class="flex-grow-1 min-width-0">
                  <p class="text-caption font-weight-semibold text-truncate">
                    {{ item.title }}
                  </p>
                  <p class="text-caption text-medium-emphasis">
                    {{ item.category }}
                  </p>
                </div>
                <div class="text-right flex-shrink-0">
                  <p class="text-caption font-weight-bold">
                    <v-icon size="11" color="medium-emphasis">mdi-eye</v-icon>
                    {{ item.views || 0 }}
                  </p>
                </div>
              </div>
            </div>
          </v-card>

        </v-col>
      </v-row>

    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { bookingsApi } from '@/api/bookings'
import { photographersApi } from '@/api/photographers'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

// ── state ──────────────────────────────────────────────────────────
const loading    = ref(true)
const bookings   = ref([])
const dashStats  = ref(null)

// ── computed ───────────────────────────────────────────────────────
const paidBookings = computed(() =>
  bookings.value.filter(b => b.payment_status === 'paid')
)

const confirmedUnpaid = computed(() =>
  bookings.value.filter(b =>
    b.status === 'confirmed' && b.payment_status !== 'paid'
  )
)

const totalBookings    = computed(() => bookings.value.length)
const completedBookings= computed(() => bookings.value.filter(b => b.status === 'completed').length)

const totalEarned = computed(() =>
  paidBookings.value.reduce((sum, b) => sum + Number(b.amount || 0), 0)
)

const pendingAmount = computed(() =>
  confirmedUnpaid.value.reduce((sum, b) =>
    sum + Number(b.photographer?.photographerProfile?.hourly_rate || 0), 0
  )
)

const thisMonthEarned = computed(() => {
  const now = new Date()
  return paidBookings.value
    .filter(b => {
      const d = new Date(b.paid_at || b.updated_at)
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    })
    .reduce((sum, b) => sum + Number(b.amount || 0), 0)
})

const currentMonthName = computed(() =>
  new Date().toLocaleDateString('en-KE', { month: 'long', year: 'numeric' })
)

const avgRating = computed(() => {
  const r = dashStats.value?.average_rating
  return r ? Number(r).toFixed(1) : '—'
})

const portfolioCount = computed(() =>
  dashStats.value?.portfolio_analysis?.length || 0
)

// ── helpers ────────────────────────────────────────────────────────
const BACKEND = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api')
  .replace(/\/api\/?$/, '').replace(/\/$/, '')

function buildUrl(path) {
  if (!path) return ''
  if (path.startsWith('http')) return path
  return `${BACKEND}/storage/${path.replace(/^\/+/, '')}`
}

function formatDate(d) {
  return d ? new Date(d).toLocaleDateString('en-KE', { dateStyle: 'medium' }) : '—'
}

function timeAgo(d) {
  if (!d) return ''
  const diff = Date.now() - new Date(d).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 30)  return `${days}d ago`
  return new Date(d).toLocaleDateString('en-KE', { dateStyle: 'short' })
}

// ── load ───────────────────────────────────────────────────────────
async function loadData() {
  loading.value = true
  try {
    const [bookingsRes, dashRes] = await Promise.allSettled([
      bookingsApi.list(),
      photographersApi.dashboard(),
    ])

    if (bookingsRes.status === 'fulfilled') {
      const data = bookingsRes.value.data
      bookings.value = Array.isArray(data) ? data : (data?.data || [])
    }

    if (dashRes.status === 'fulfilled') {
      dashStats.value = dashRes.value.data
    }

  } catch (_) {}
  finally { loading.value = false }
}

onMounted(loadData)
</script>

<style scoped>
/* Earnings hero cards */
.earnings-hero { border: none !important; }

/* Stat cards */
.stat-card  { border: 1px solid rgba(0,0,0,0.07) !important; }
.content-card { border: 1px solid rgba(0,0,0,0.07) !important; }

.stat-icon {
  width: 36px; height: 36px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
}
.bg-blue   { background: rgba(33,150,243,0.1); }
.bg-green  { background: rgba(76,175,80,0.1); }
.bg-purple { background: rgba(156,39,176,0.1); }
.bg-teal   { background: rgba(0,150,136,0.1); }
.bg-amber  { background: rgba(255,152,0,0.1); }

/* Transaction list */
.transaction-row {
  border-bottom: 1px solid rgba(0,0,0,0.05);
}
.transaction-row:last-child { border-bottom: none; }

/* Pending rows */
.pending-row {
  border-bottom: 1px solid rgba(0,0,0,0.05);
}
.pending-row:last-child { border-bottom: none; }

/* Portfolio stats */
.portfolio-stat-row {
  border-bottom: 1px solid rgba(0,0,0,0.05);
}
.portfolio-stat-row:last-child { border-bottom: none; }
</style>