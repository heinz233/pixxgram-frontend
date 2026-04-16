<template>
  <div>
    <!-- Header -->
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <h2 class="text-h6 font-weight-bold">My Bookings</h2>
        <p class="text-medium-emphasis text-body-2 mt-1">
          {{ bookings.length }} total booking{{ bookings.length !== 1 ? 's' : '' }}
        </p>
      </div>
      <v-btn
        variant="tonal" color="primary" size="small"
        prepend-icon="mdi-magnify"
        :to="{ name: 'Photographers' }"
      >
        Find Photographers
      </v-btn>
    </div>

    <!-- Tabs -->
    <v-tabs v-model="tab" color="primary" class="mb-6">
      <v-tab value="all">
        All
        <v-chip size="x-small" class="ml-2" color="primary" variant="tonal">
          {{ bookings.length }}
        </v-chip>
      </v-tab>
      <v-tab value="pending">
        Pending
        <v-chip v-if="countByStatus('pending')" size="x-small" class="ml-2" color="warning" variant="tonal">
          {{ countByStatus('pending') }}
        </v-chip>
      </v-tab>
      <v-tab value="confirmed">Confirmed</v-tab>
      <v-tab value="completed">Completed</v-tab>
      <v-tab value="cancelled">Cancelled</v-tab>
    </v-tabs>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-16">
      <v-progress-circular indeterminate color="primary" size="44" />
      <p class="mt-4 text-medium-emphasis">Loading your bookings...</p>
    </div>

    <!-- Error -->
    <v-alert
      v-else-if="loadError"
      type="error" variant="tonal" rounded="xl" class="mb-4"
    >
      <p class="font-weight-bold mb-1">Could not load bookings</p>
      <p class="text-body-2 mb-3">{{ loadError }}</p>
      <v-btn size="small" color="error" variant="tonal" @click="loadBookings">Retry</v-btn>
    </v-alert>

    <!-- Empty -->
    <div v-else-if="!filtered.length" class="text-center py-16">
      <div class="empty-icon mx-auto mb-4">
        <v-icon size="48" color="medium-emphasis">mdi-calendar-blank-outline</v-icon>
      </div>
      <h3 class="text-subtitle-1 font-weight-bold mb-2">
        {{ tab === 'all' ? 'No bookings yet' : `No ${tab} bookings` }}
      </h3>
      <p class="text-body-2 text-medium-emphasis mb-5" style="max-width:320px;margin:0 auto">
        {{ tab === 'all'
          ? 'Find a photographer and make your first booking.'
          : 'Try selecting a different status tab.' }}
      </p>
      <v-btn
        v-if="tab === 'all'"
        color="primary" rounded="lg"
        prepend-icon="mdi-magnify"
        :to="{ name: 'Photographers' }"
      >
        Browse Photographers
      </v-btn>
      <v-btn v-else variant="text" color="primary" @click="tab = 'all'">
        Show all bookings
      </v-btn>
    </div>

    <!-- Booking cards -->
    <v-row v-else>
      <v-col
        v-for="booking in filtered"
        :key="booking.id"
        cols="12" md="6"
      >
        <v-card rounded="xl" class="booking-card pa-5">

          <!-- Top row: avatar + name + status chip -->
          <div class="d-flex align-center justify-space-between mb-3">
            <div class="d-flex align-center gap-3">
              <v-avatar size="46" color="primary">
                <v-img
                  v-if="booking.photographer?.user_image"
                  :src="photoUrl(booking.photographer.user_image)"
                />
                <span v-else class="text-white font-weight-bold">
                  {{ booking.photographer?.name?.charAt(0) }}
                </span>
              </v-avatar>
              <div>
                <p class="text-body-2 font-weight-semibold">
                  {{ booking.photographer?.name || '—' }}
                </p>
                <p class="text-caption text-medium-emphasis">
                  <v-icon size="11" class="mr-1">mdi-calendar</v-icon>
                  {{ formatDate(booking.booking_date) }}
                </p>
              </div>
            </div>
            <v-chip
              :color="statusColor(booking.status)"
              size="small" label
            >
              {{ booking.status }}
            </v-chip>
          </div>

          <!-- Notes -->
          <div
            v-if="booking.notes"
            class="notes-box pa-3 rounded-xl mb-3"
          >
            <p class="text-caption text-medium-emphasis">
              <v-icon size="12" class="mr-1">mdi-note-text-outline</v-icon>
              {{ booking.notes }}
            </p>
          </div>

          <!-- Booking ID & created date -->
          <p class="text-caption text-medium-emphasis mb-3">
            Booking #{{ booking.id }} · Placed {{ timeAgo(booking.created_at) }}
          </p>

          <!-- Actions -->
          <div class="d-flex gap-2 flex-wrap">

            <!-- View photographer profile -->
            <v-btn
              variant="text" color="primary" size="small" rounded="lg"
              :to="{ name: 'PhotographerProfile', params: { id: booking.photographer_id } }"
            >
              <v-icon start size="14">mdi-account-outline</v-icon>
              View Profile
            </v-btn>

            <!-- Message photographer -->
            <v-btn
              variant="text" color="primary" size="small" rounded="lg"
              :to="{ name: 'ClientMessages' }"
            >
              <v-icon start size="14">mdi-message-outline</v-icon>
              Message
            </v-btn>

            <!-- Cancel (only pending) -->
            <v-btn
              v-if="booking.status === 'pending'"
              variant="tonal" color="error" size="small" rounded="lg"
              :loading="actionLoading === booking.id"
              @click="cancelBooking(booking)"
            >
              <v-icon start size="14">mdi-close-circle-outline</v-icon>
              Cancel
            </v-btn>

            <!-- Rate (only completed, not yet rated) -->
            <v-btn
              v-if="booking.status === 'completed'"
              variant="tonal" color="secondary" size="small" rounded="lg"
              @click="openRating(booking)"
            >
              <v-icon start size="14">mdi-star-outline</v-icon>
              Leave Review
            </v-btn>

          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Rating dialog -->
    <RatingDialog
      v-model="ratingDialog"
      :photographer-id="ratingPhotographerId"
      @rated="appStore.notify('Review submitted! Thank you.', 'success')"
    />

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { bookingsApi } from '@/api/bookings'
import { useAppStore } from '@/stores/app'
import RatingDialog from '@/components/client/RatingDialog.vue'

const appStore    = useAppStore()
const loading     = ref(true)
const loadError   = ref('')
const bookings    = ref([])
const tab         = ref('all')
const actionLoading     = ref(null)
const ratingDialog      = ref(false)
const ratingPhotographerId = ref(null)

// ── computed ───────────────────────────────────────────────────────
const filtered = computed(() => {
  if (tab.value === 'all') return bookings.value
  return bookings.value.filter(b => b.status === tab.value)
})

function countByStatus(s) {
  return bookings.value.filter(b => b.status === s).length
}

// ── helpers ────────────────────────────────────────────────────────
const BACKEND = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api')
  .replace(/\/api\/?$/, '')

function photoUrl(path) {
  if (!path) return ''
  if (path.startsWith('http')) return path
  return `${BACKEND}/storage/${path.replace(/^\//, '')}`
}

const STATUS_COLORS = {
  pending:   'warning',
  confirmed: 'info',
  completed: 'success',
  cancelled: 'error',
}
function statusColor(s) { return STATUS_COLORS[s] || 'default' }

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleString('en-KE', { dateStyle: 'medium', timeStyle: 'short' })
}

function timeAgo(d) {
  if (!d) return ''
  const diff = Date.now() - new Date(d).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60)   return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)    return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

// ── actions ────────────────────────────────────────────────────────
async function cancelBooking(booking) {
  if (!confirm(`Cancel your booking with ${booking.photographer?.name}?`)) return
  actionLoading.value = booking.id
  try {
    await bookingsApi.updateStatus(booking.id, 'cancelled')
    booking.status = 'cancelled'
    appStore.notify('Booking cancelled.')
  } catch (e) {
    appStore.notify(
      e.response?.data?.message || 'Could not cancel booking.',
      'error'
    )
  } finally {
    actionLoading.value = null
  }
}

function openRating(booking) {
  ratingPhotographerId.value = booking.photographer_id
  ratingDialog.value = true
}

// ── load ───────────────────────────────────────────────────────────
async function loadBookings() {
  loading.value  = true
  loadError.value = ''
  try {
    const { data } = await bookingsApi.list()

    // Backend returns a plain array — handle both array and paginated response
    if (Array.isArray(data)) {
      bookings.value = data
    } else if (data?.data && Array.isArray(data.data)) {
      bookings.value = data.data   // paginated
    } else if (data?.bookings && Array.isArray(data.bookings)) {
      bookings.value = data.bookings
    } else {
      bookings.value = []
      console.warn('Unexpected bookings response format:', data)
    }
  } catch (e) {
    const s = e.response?.status
    if (s === 401) loadError.value = 'Session expired. Please log in again.'
    else if (!e.response) loadError.value = 'Cannot reach server. Is Laravel running?'
    else loadError.value = e.response?.data?.message || `Failed to load bookings (${s})`
  } finally {
    loading.value = false
  }
}

onMounted(loadBookings)
</script>

<style scoped>
.booking-card { border: 1px solid rgba(0,0,0,0.07) !important; }
.notes-box    { background: rgba(0,0,0,0.03); }
.empty-icon {
  width: 88px; height: 88px;
  background: rgba(0,0,0,0.04);
  border-radius: 24px;
  display: flex; align-items: center; justify-content: center;
}
.gap-2 { gap: 8px; }
.gap-3 { gap: 12px; }
</style>