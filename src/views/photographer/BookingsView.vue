<template>
  <div>
    <h2 class="text-h6 font-weight-bold mb-6">Booking Requests</h2>
    <v-tabs v-model="tab" color="primary" class="mb-6">
      <v-tab value="all">All</v-tab>
      <v-tab value="pending">Pending</v-tab>
      <v-tab value="confirmed">Confirmed</v-tab>
      <v-tab value="completed">Completed</v-tab>
    </v-tabs>

    <div v-if="loading" class="text-center py-10">
      <v-progress-circular indeterminate color="primary" />
    </div>
    <div v-else-if="!filtered.length" class="text-center py-16">
      <v-icon size="64" color="medium-emphasis">mdi-calendar-blank-outline</v-icon>
      <p class="mt-4 text-medium-emphasis">No bookings in this category.</p>
    </div>
    <v-row v-else>
      <v-col v-for="booking in filtered" :key="booking.id" cols="12" md="6">
        <v-card rounded="xl" class="booking-card pa-5">
          <div class="d-flex align-center gap-3 mb-3">
            <v-avatar size="44" color="primary">
              <v-img v-if="booking.client?.user_image" :src="booking.client.user_image" />
              <span v-else class="text-white font-weight-bold">{{ booking.client?.name?.charAt(0) }}</span>
            </v-avatar>
            <div>
              <p class="text-body-2 font-weight-semibold">{{ booking.client?.name }}</p>
              <p class="text-caption text-medium-emphasis">{{ formatDate(booking.booking_date) }}</p>
            </div>
            <v-spacer />
            <v-chip :color="statusColor(booking.status)" size="small" label>{{ booking.status }}</v-chip>
          </div>
          <p v-if="booking.notes" class="text-caption text-medium-emphasis mb-3 pa-3 rounded-lg" style="background:rgba(0,0,0,0.04)">
            {{ booking.notes }}
          </p>
          <div v-if="booking.status === 'pending'" class="d-flex gap-2">
            <v-btn color="success" size="small" rounded="lg" variant="tonal"
              :loading="actionLoading === booking.id + 'confirmed'"
              @click="updateStatus(booking, 'confirmed')"
            >Accept</v-btn>
            <v-btn color="error" size="small" rounded="lg" variant="tonal"
              :loading="actionLoading === booking.id + 'cancelled'"
              @click="updateStatus(booking, 'cancelled')"
            >Decline</v-btn>
          </div>
          <div v-if="booking.status === 'confirmed'" class="d-flex gap-2">
            <v-btn color="primary" size="small" rounded="lg" variant="tonal"
              :loading="actionLoading === booking.id + 'completed'"
              @click="updateStatus(booking, 'completed')"
            >Mark Complete</v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { bookingsApi } from '@/api/bookings'
import { useAppStore } from '@/stores/app'

const appStore    = useAppStore()
const loading     = ref(true)
const bookings    = ref([])
const tab         = ref('all')
const actionLoading = ref(null)

const filtered = computed(() =>
  tab.value === 'all' ? bookings.value : bookings.value.filter(b => b.status === tab.value)
)
const statusColor = s => ({ pending:'warning', confirmed:'info', completed:'success', cancelled:'error' }[s])
function formatDate(d) { return new Date(d).toLocaleString('en-KE', { dateStyle: 'medium', timeStyle: 'short' }) }

async function updateStatus(booking, status) {
  actionLoading.value = booking.id + status
  try {
    await bookingsApi.updateStatus(booking.id, status)
    booking.status = status
    appStore.notify(`Booking ${status}`)
  } catch (e) {
    appStore.notify(e.response?.data?.message || 'Failed', 'error')
  } finally { actionLoading.value = null }
}

onMounted(async () => {
  try { const { data } = await bookingsApi.list(); bookings.value = data }
  catch (_) {} finally { loading.value = false }
})
</script>
<style scoped>
.booking-card { border: 1px solid rgba(0,0,0,0.07) !important; }
.gap-2 { gap: 8px; }
.gap-3 { gap: 12px; }
</style>
