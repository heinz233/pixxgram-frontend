<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <h2 class="text-h6 font-weight-bold">My Bookings</h2>
        <p class="text-medium-emphasis text-body-2 mt-1">
          {{ bookings.length }} booking{{ bookings.length !== 1 ? 's' : '' }}
        </p>
      </div>
      <v-btn variant="tonal" color="primary" size="small" rounded="lg"
        :to="{ name: 'Photographers' }" prepend-icon="mdi-magnify">
        Find Photographers
      </v-btn>
    </div>

    <!-- Tabs -->
    <v-tabs v-model="tab" color="primary" class="mb-6">
      <v-tab value="all">
        All
        <v-chip size="x-small" class="ml-2" color="primary" variant="tonal">{{ bookings.length }}</v-chip>
      </v-tab>
      <v-tab value="pending">Pending</v-tab>
      <v-tab value="confirmed">
        Confirmed
        <v-chip v-if="unpaidConfirmed" size="x-small" class="ml-2" color="warning" variant="flat">
          Pay now
        </v-chip>
      </v-tab>
      <v-tab value="completed">Completed</v-tab>
      <v-tab value="cancelled">Cancelled</v-tab>
    </v-tabs>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-16">
      <v-progress-circular indeterminate color="primary" size="44" />
      <p class="mt-4 text-medium-emphasis">Loading bookings...</p>
    </div>

    <!-- Error -->
    <v-alert v-else-if="loadError" type="error" variant="tonal" rounded="xl" class="mb-4">
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
        {{ tab === 'all' ? 'Browse photographers and make your first booking.' : '' }}
      </p>
      <v-btn v-if="tab === 'all'" color="primary" rounded="lg"
        :to="{ name: 'Photographers' }" prepend-icon="mdi-camera">
        Browse Photographers
      </v-btn>
      <v-btn v-else variant="text" color="primary" @click="tab = 'all'">Show all</v-btn>
    </div>

    <!-- Booking cards -->
    <v-row v-else>
      <v-col v-for="booking in filtered" :key="booking.id" cols="12" md="6">
        <v-card rounded="xl" class="booking-card pa-5"
          :class="{ 'payment-due': needsPayment(booking) }">

          <!-- Payment required banner -->
          <v-alert v-if="needsPayment(booking)"
            color="warning" variant="tonal" rounded="lg"
            density="compact" class="mb-4"
            prepend-icon="mdi-credit-card-clock-outline">
            <p class="text-body-2 font-weight-bold">Payment required</p>
            <p class="text-caption">
              Your booking is confirmed! Pay to secure your session with
              {{ booking.photographer?.name }}.
            </p>
          </v-alert>

          <!-- Top row -->
          <div class="d-flex align-center justify-space-between mb-3">
            <div class="d-flex align-center" style="gap:12px">
              <v-avatar size="46" color="primary">
                <v-img v-if="booking.photographer?.user_image"
                  :src="buildUrl(booking.photographer.user_image)" />
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
            <div class="text-right">
              <v-chip :color="statusColor(booking.status)" size="small" label class="mb-1">
                {{ booking.status }}
              </v-chip>
              <br>
              <v-chip v-if="booking.payment_status"
                :color="paymentColor(booking.payment_status)" size="x-small" label>
                <v-icon start size="10">{{ paymentIcon(booking.payment_status) }}</v-icon>
                {{ paymentLabel(booking.payment_status) }}
              </v-chip>
            </div>
          </div>

          <!-- Rate -->
          <div v-if="booking.photographer?.photographer_profile?.hourly_rate" class="mb-2">
            <v-icon size="14" color="success" class="mr-1">mdi-cash</v-icon>
            <span class="text-caption">
              KSh {{ Number(booking.photographer.photographer_profile.hourly_rate).toLocaleString() }}/hr
            </span>
          </div>

          <!-- Notes -->
          <div v-if="booking.notes" class="notes-box pa-3 rounded-xl mb-3">
            <p class="text-caption text-medium-emphasis">
              <v-icon size="12" class="mr-1">mdi-note-text-outline</v-icon>
              {{ booking.notes }}
            </p>
          </div>

          <!-- Receipt -->
          <div v-if="booking.payment_status === 'paid'" class="receipt-box pa-3 rounded-xl mb-3">
            <p class="text-caption text-success font-weight-bold">
              <v-icon size="13" class="mr-1">mdi-check-circle</v-icon>
              Payment confirmed
              <span v-if="booking.mpesa_receipt"> · {{ booking.mpesa_receipt }}</span>
            </p>
            <p v-if="booking.amount" class="text-caption text-medium-emphasis">
              KSh {{ Number(booking.amount).toLocaleString() }} paid via M-Pesa
            </p>
          </div>

          <!-- Booking ID -->
          <p class="text-caption text-medium-emphasis mb-3">
            Booking #{{ booking.id }} · {{ timeAgo(booking.created_at) }}
          </p>

          <!-- Actions -->
          <div class="d-flex flex-wrap" style="gap:8px">

            <!-- PAY NOW -->
            <v-btn v-if="needsPayment(booking)"
              color="success" rounded="lg" size="small"
              prepend-icon="mdi-cellphone-check"
              @click="openPayment(booking)">
              Pay Now via M-Pesa
            </v-btn>

            <!-- Cancel — pending only -->
            <v-btn v-if="booking.status === 'pending'"
              variant="tonal" color="error" size="small" rounded="lg"
              :loading="actionLoading === booking.id"
              @click="cancelBooking(booking)">
              <v-icon start size="14">mdi-close-circle-outline</v-icon>
              Cancel
            </v-btn>

            <!-- Review — completed only -->
            <v-btn v-if="booking.status === 'completed'"
              variant="tonal" color="secondary" size="small" rounded="lg"
              @click="openRating(booking)">
              <v-icon start size="14">mdi-star-outline</v-icon>
              Leave Review
            </v-btn>

            <!-- View profile -->
            <v-btn variant="text" color="primary" size="small"
              :to="{ name: 'PhotographerProfile', params: { id: booking.photographer_id } }">
              View Profile
            </v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- ── PAYMENT DIALOG ─────────────────────────────────────── -->
    <v-dialog v-model="paymentDialog" max-width="460" persistent>
      <v-card rounded="xl" class="pa-6">
        <div class="d-flex align-center justify-space-between mb-4">
          <h3 class="text-subtitle-1 font-weight-bold">Pay for Booking</h3>
          <v-btn icon size="small" variant="text" @click="closePayment" :disabled="paying">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>

        <!-- Summary -->
        <v-card color="primary" variant="tonal" rounded="xl" class="pa-4 mb-5">
          <div class="d-flex align-center" style="gap:12px">
            <v-avatar size="42" color="primary">
              <span class="text-white font-weight-bold">
                {{ paymentBooking?.photographer?.name?.charAt(0) }}
              </span>
            </v-avatar>
            <div>
              <p class="text-body-2 font-weight-bold">{{ paymentBooking?.photographer?.name }}</p>
              <p class="text-caption text-medium-emphasis">
                {{ paymentBooking ? formatDate(paymentBooking.booking_date) : '' }}
              </p>
              <p class="text-caption text-medium-emphasis">Booking #{{ paymentBooking?.id }}</p>
            </div>
          </div>
        </v-card>

        <!-- Amount -->
        <v-text-field
          v-model.number="payAmount"
          label="Amount to pay (KSh)"
          type="number" min="1"
          prepend-inner-icon="mdi-cash"
          :hint="paymentBooking?.photographer?.photographer_profile?.hourly_rate
            ? `Photographer rate: KSh ${Number(paymentBooking.photographer.photographer_profile.hourly_rate).toLocaleString()}/hr`
            : 'Agree on the total amount with the photographer'"
          persistent-hint
          :rules="[v => !!v && v > 0 || 'Enter a valid amount']"
          class="mb-4" variant="outlined" rounded="lg"
        />

        <!-- Phone -->
        <v-text-field
          v-model="payPhone"
          label="M-Pesa phone number"
          placeholder="07xxxxxxxx"
          prepend-inner-icon="mdi-cellphone"
          :rules="[v => !!v || 'Phone number required']"
          :error-messages="payError"
          class="mb-2" variant="outlined" rounded="lg"
        />
        <p class="text-caption text-medium-emphasis mb-5">
          <v-icon size="12" class="mr-1">mdi-information-outline</v-icon>
          You will receive an M-Pesa STK push. Enter your PIN to confirm.
        </p>

        <v-btn block color="success" size="large" rounded="xl"
          :loading="paying" @click="submitPayment">
          <v-icon start>mdi-cellphone-check</v-icon>
          Pay KSh {{ payAmount ? Number(payAmount).toLocaleString() : '0' }} via M-Pesa
        </v-btn>
      </v-card>
    </v-dialog>

    <!-- ── POLLING DIALOG ─────────────────────────────────────── -->
    <v-dialog v-model="pollingDialog" max-width="380" persistent>
      <v-card rounded="xl" class="pa-8 text-center">

        <div v-if="pollStatus !== 'failed'">
          <v-progress-circular indeterminate color="success" size="64" width="5" class="mb-5" />
          <h3 class="text-subtitle-1 font-weight-bold mb-2">Waiting for payment</h3>
          <p class="text-body-2 text-medium-emphasis mb-4">
            Check <strong>{{ payPhone }}</strong> for the M-Pesa prompt.<br>
            Enter your PIN to complete payment.
          </p>
          <v-chip color="info" size="small">
            <v-icon start size="14">mdi-timer-outline</v-icon>
            {{ pollMessage }}
          </v-chip>
        </div>

        <div v-else>
          <v-icon size="64" color="error" class="mb-4">mdi-close-circle-outline</v-icon>
          <h3 class="text-subtitle-1 font-weight-bold mb-2">Payment Failed</h3>
          <p class="text-body-2 text-medium-emphasis mb-4">
            The payment was cancelled or failed. Please try again.
          </p>
        </div>

        <v-btn variant="outlined" color="error" rounded="xl" @click="cancelPolling">
          Cancel
        </v-btn>
      </v-card>
    </v-dialog>

    <!-- Rating dialog -->
    <RatingDialog
      v-model="ratingDialog"
      :photographer-id="ratingPhotographerId"
      @rated="appStore.notify('Review submitted! Thank you.', 'success')"
    />

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { bookingsApi } from '@/api/bookings'
import { useAuthStore } from '@/stores/auth'
import { useAppStore  } from '@/stores/app'
import RatingDialog from '@/components/client/RatingDialog.vue'

const authStore = useAuthStore()
const appStore  = useAppStore()

const loading     = ref(true)
const loadError   = ref('')
const bookings    = ref([])
const tab         = ref('all')
const actionLoading = ref(null)

const ratingDialog         = ref(false)
const ratingPhotographerId = ref(null)

const paymentDialog  = ref(false)
const paymentBooking = ref(null)
const payAmount      = ref('')
const payPhone       = ref('')
const payError       = ref('')
const paying         = ref(false)

const pollingDialog    = ref(false)
const pollStatus       = ref('pending')
const pollMessage      = ref('Waiting...')
const pollingBookingId = ref(null)
let   pollInterval     = null

// ── computed ───────────────────────────────────────────────────────
const filtered = computed(() => {
  if (tab.value === 'all') return bookings.value
  return bookings.value.filter(b => b.status === tab.value)
})

const unpaidConfirmed = computed(() =>
  bookings.value.filter(b => needsPayment(b)).length
)

// ── helpers ────────────────────────────────────────────────────────
const BACKEND = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api')
  .replace(/\/api\/?$/, '').replace(/\/$/, '')

function buildUrl(path) {
  if (!path) return ''
  if (path.startsWith('http')) return path
  if (path.startsWith('/storage/')) return `${BACKEND}${path}`
  if (path.startsWith('storage/'))  return `${BACKEND}/${path}`
  return `${BACKEND}/storage/${path.replace(/^\/+/, '')}`
}

function needsPayment(b) {
  return b.status === 'confirmed' && b.payment_status !== 'paid'
}

const statusColor  = s => ({ pending:'warning', confirmed:'info', completed:'success', cancelled:'error' }[s] || 'default')
const paymentColor = s => ({ paid:'success', pending_payment:'warning', unpaid:'grey' }[s] || 'default')
const paymentLabel = s => ({ paid:'Paid ✓', pending_payment:'Paying...', unpaid:'Unpaid' }[s] || s)
const paymentIcon  = s => ({ paid:'mdi-check-circle', pending_payment:'mdi-clock-outline', unpaid:'mdi-cash-remove' }[s] || 'mdi-cash')

function formatDate(d) {
  return d ? new Date(d).toLocaleString('en-KE', { dateStyle: 'medium', timeStyle: 'short' }) : '—'
}

function timeAgo(d) {
  if (!d) return ''
  const mins = Math.floor((Date.now() - new Date(d)) / 60000)
  if (mins < 60)   return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)    return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

// ── load ───────────────────────────────────────────────────────────
async function loadBookings() {
  loading.value   = true
  loadError.value = ''
  try {
    const { data } = await bookingsApi.list()
    bookings.value = Array.isArray(data) ? data : (data?.data || data?.bookings || [])
    const unpaid = bookings.value.find(needsPayment)
    if (unpaid) tab.value = 'confirmed'
  } catch (e) {
    const s = e.response?.status
    if (s === 401)        loadError.value = 'Session expired. Please log in again.'
    else if (!e.response) loadError.value = 'Cannot reach server. Is Laravel running?'
    else                  loadError.value = e.response?.data?.message || `Error ${s}`
  } finally { loading.value = false }
}

// ── cancel ─────────────────────────────────────────────────────────
async function cancelBooking(booking) {
  if (!confirm(`Cancel your booking with ${booking.photographer?.name}?`)) return
  actionLoading.value = booking.id
  try {
    await bookingsApi.updateStatus(booking.id, 'cancelled')
    booking.status = 'cancelled'
    appStore.notify('Booking cancelled.')
  } catch (e) {
    appStore.notify(e.response?.data?.message || 'Could not cancel.', 'error')
  } finally { actionLoading.value = null }
}

function openRating(booking) {
  ratingPhotographerId.value = booking.photographer_id
  ratingDialog.value = true
}

// ── payment ────────────────────────────────────────────────────────
function openPayment(booking) {
  paymentBooking.value = booking
  payAmount.value = booking.amount ||
    booking.photographer?.photographer_profile?.hourly_rate || ''
  payPhone.value  = authStore.user?.phoneNumber || ''
  payError.value  = ''
  paymentDialog.value = true
}

function closePayment() {
  if (paying.value) return
  paymentDialog.value = false
  paymentBooking.value = null
  payError.value = ''
}

async function submitPayment() {
  payError.value = ''
  if (!payAmount.value || payAmount.value <= 0) {
    payError.value = 'Enter a valid amount.'
    return
  }
  if (!payPhone.value) {
    payError.value = 'Phone number required.'
    return
  }

  paying.value = true
  try {
    await bookingsApi.pay(paymentBooking.value.id, payPhone.value, payAmount.value)

    paymentDialog.value    = false
    pollingDialog.value    = true
    pollStatus.value       = 'pending'
    pollMessage.value      = 'Waiting for your M-Pesa PIN...'
    pollingBookingId.value = paymentBooking.value.id

    startPolling(paymentBooking.value.id)
  } catch (e) {
    payError.value = e.response?.data?.message || 'Payment failed to initiate. Try again.'
  } finally { paying.value = false }
}

function startPolling(bookingId) {
  let attempts = 0
  pollInterval = setInterval(async () => {
    attempts++
    try {
      const { data } = await bookingsApi.paymentStatus(bookingId)

      if (data.payment_status === 'paid') {
        stopPolling()
        pollingDialog.value = false
        const b = bookings.value.find(x => x.id === bookingId)
        if (b) {
          b.payment_status = 'paid'
          b.mpesa_receipt  = data.mpesa_receipt
          b.amount         = data.amount
        }
        appStore.notify('🎉 Payment confirmed! Your booking is secured.', 'success')
        return
      }

      pollMessage.value = `Checking... (${attempts * 5}s elapsed)`

    } catch (_) {}

    if (attempts >= 24) {
      stopPolling()
      pollingDialog.value = false
      pollStatus.value = 'failed'
      appStore.notify('Payment timed out. If you paid, contact support.', 'warning')
    }
  }, 5000)
}

function stopPolling() {
  if (pollInterval) { clearInterval(pollInterval); pollInterval = null }
}

function cancelPolling() {
  stopPolling()
  pollingDialog.value = false
  pollStatus.value    = 'pending'
}

onMounted(loadBookings)
onUnmounted(stopPolling)
</script>

<style scoped>
.booking-card { border: 1px solid rgba(0,0,0,0.07) !important; transition: border-color 0.2s; }
.booking-card.payment-due { border-color: rgb(var(--v-theme-warning)) !important; }
.notes-box   { background: rgba(0,0,0,0.03); }
.receipt-box { background: rgba(var(--v-theme-success), 0.06); }
.empty-icon  { width:88px; height:88px; background:rgba(0,0,0,0.04); border-radius:24px; display:flex; align-items:center; justify-content:center; }
</style>
