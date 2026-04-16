<template>
  <div>
    <h2 class="text-h6 font-weight-bold mb-6">My Bookings</h2>

    <v-tabs v-model="tab" color="primary" class="mb-6">
      <v-tab value="all">All</v-tab>
      <v-tab value="pending">Pending</v-tab>
      <v-tab value="confirmed">Confirmed</v-tab>
      <v-tab value="completed">Completed</v-tab>
      <v-tab value="cancelled">Cancelled</v-tab>
    </v-tabs>

    <div v-if="loading" class="text-center py-10">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <div v-else-if="!filtered.length" class="text-center py-16">
      <v-icon size="64" color="medium-emphasis">mdi-calendar-blank-outline</v-icon>
      <p class="mt-4 text-medium-emphasis">No bookings found.</p>
      <v-btn color="primary" variant="tonal" class="mt-4" :to="{ name: 'Photographers' }">
        Find a Photographer
      </v-btn>
    </div>

    <v-row v-else>
      <v-col v-for="booking in filtered" :key="booking.id" cols="12" md="6">
        <v-card rounded="xl" class="booking-card pa-5">
          <div class="d-flex align-center justify-space-between mb-3">
            <div class="d-flex align-center gap-3">
              <v-avatar size="44" color="primary">
                <v-img v-if="booking.photographer?.user_image" :src="booking.photographer.user_image" />
                <span v-else class="text-white font-weight-bold text-body-2">
                  {{ booking.photographer?.name?.charAt(0) }}
                </span>
              </v-avatar>
              <div>
                <p class="text-body-2 font-weight-semibold">{{ booking.photographer?.name }}</p>
                <p class="text-caption text-medium-emphasis">{{ formatDate(booking.booking_date) }}</p>
              </div>
            </div>
            <v-chip :color="statusColor(booking.status)" size="small" label>
              {{ booking.status }}
            </v-chip>
          </div>
          <p v-if="booking.notes" class="text-caption text-medium-emphasis mb-3">{{ booking.notes }}</p>
          <div class="d-flex gap-2" v-if="booking.status === 'pending'">
            <v-btn variant="tonal" color="error" size="small" rounded="lg"
              :loading="cancelLoading === booking.id"
              @click="updateStatus(booking, 'cancelled')"
            >Cancel</v-btn>
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
const cancelLoading = ref(null)

const filtered = computed(() =>
  tab.value === 'all' ? bookings.value : bookings.value.filter(b => b.status === tab.value)
)

const statusColor = s => ({ pending:'warning', confirmed:'info', completed:'success', cancelled:'error' }[s] || 'default')

function formatDate(d) {
  return new Date(d).toLocaleString('en-KE', { dateStyle: 'medium', timeStyle: 'short' })
}

async function updateStatus(booking, status) {
  cancelLoading.value = booking.id
  try {
    await bookingsApi.updateStatus(booking.id, status)
    booking.status = status
    appStore.notify(`Booking ${status}`)
  } catch (e) {
    appStore.notify(e.response?.data?.message || 'Failed', 'error')
  } finally { cancelLoading.value = null }
}

onMounted(async () => {
  try {
    const { data } = await bookingsApi.list()
    bookings.value = data
  } catch (_) {}
  finally { loading.value = false }
})
</script>
<style scoped>
.booking-card { border: 1px solid rgba(0,0,0,0.07) !important; }
.gap-2 { gap: 8px; }
.gap-3 { gap: 12px; }
</style>
