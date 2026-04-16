<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <h2 class="text-h6 font-weight-bold">Activity Feed</h2>
        <p class="text-medium-emphasis mt-1">All platform events in real time</p>
      </div>
      <div class="d-flex gap-2">
        <v-btn
          variant="tonal" color="primary" size="small"
          prepend-icon="mdi-refresh"
          :loading="loading"
          @click="fetchAll"
        >
          Refresh
        </v-btn>
      </div>
    </div>

    <!-- Filter tabs -->
    <div class="d-flex gap-2 mb-6 flex-wrap">
      <v-btn
        v-for="f in filters"
        :key="f.value"
        :variant="activeFilter === f.value ? 'flat' : 'outlined'"
        :color="activeFilter === f.value ? 'primary' : 'default'"
        size="small" rounded="lg"
        @click="activeFilter = f.value"
      >
        <v-icon start size="14">{{ f.icon }}</v-icon>
        {{ f.label }}
        <v-chip v-if="counts[f.value]" size="x-small" :color="activeFilter === f.value ? 'white' : 'primary'"
          class="ml-2" style="height:16px">
          {{ counts[f.value] }}
        </v-chip>
      </v-btn>
    </div>

    <!-- Timeline -->
    <div v-if="loading" class="text-center py-12">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <div v-else-if="!filteredEvents.length" class="text-center py-16">
      <v-icon size="64" color="medium-emphasis">mdi-timeline-outline</v-icon>
      <p class="mt-3 text-medium-emphasis">No {{ activeFilter === 'all' ? '' : activeFilter }} activity yet.</p>
    </div>

    <div v-else class="timeline">
      <div
        v-for="(event, i) in filteredEvents"
        :key="i"
        class="timeline-item"
        :class="{ 'last': i === filteredEvents.length - 1 }"
      >
        <!-- Dot -->
        <div class="timeline-dot" :class="event.dotColor">
          <v-icon size="14" color="white">{{ event.icon }}</v-icon>
        </div>

        <!-- Content -->
        <v-card rounded="xl" class="timeline-card pa-4 ml-4 mb-3">
          <div class="d-flex align-start justify-space-between">
            <div class="d-flex align-start gap-3">
              <v-avatar size="32" :color="event.avatarColor" variant="tonal">
                <span class="text-caption font-weight-bold">{{ event.initial }}</span>
              </v-avatar>
              <div>
                <p class="text-body-2">
                  <strong>{{ event.actor }}</strong>
                  <span class="text-medium-emphasis"> {{ event.action }} </span>
                  <strong v-if="event.target">{{ event.target }}</strong>
                </p>
                <p v-if="event.detail" class="text-caption text-medium-emphasis mt-1">{{ event.detail }}</p>
              </div>
            </div>
            <div class="text-right flex-shrink-0 ml-3">
              <v-chip :color="event.chipColor" size="x-small" label>{{ event.type }}</v-chip>
              <p class="text-caption text-medium-emphasis mt-1">{{ event.time }}</p>
            </div>
          </div>
        </v-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/api/axios'

const loading     = ref(true)
const activeFilter= ref('all')
const rawEvents   = ref([])

const filters = [
  { label: 'All',           value: 'all',          icon: 'mdi-format-list-bulleted' },
  { label: 'Registrations', value: 'registration',  icon: 'mdi-account-plus-outline' },
  { label: 'Bookings',      value: 'booking',       icon: 'mdi-calendar-check-outline' },
  { label: 'Subscriptions', value: 'subscription',  icon: 'mdi-crown-outline' },
  { label: 'Reports',       value: 'report',        icon: 'mdi-flag-outline' },
  { label: 'Ratings',       value: 'rating',        icon: 'mdi-star-outline' },
]

function formatEvent(item) {
  const time = new Date(item.created_at).toLocaleString('en-KE', { dateStyle: 'short', timeStyle: 'short' })
  const base = { id: item.id, time, raw: item }

  if (item.type === 'registration' || item.event_type === 'registration') {
    return { ...base, type: 'registration', icon: 'mdi-account-plus', dotColor: 'dot-blue', avatarColor: 'blue',
      actor: item.name || item.user?.name, action: 'joined Pixxgram as a', target: item.role?.name || 'user',
      initial: (item.name || item.user?.name || '?').charAt(0), chipColor: 'blue' }
  }
  if (item.type === 'booking' || item.event_type === 'booking') {
    return { ...base, type: 'booking', icon: 'mdi-calendar-check', dotColor: 'dot-teal', avatarColor: 'teal',
      actor: item.client?.name || item.actor, action: 'booked', target: item.photographer?.name || item.target,
      detail: item.booking_date ? `Session on ${new Date(item.booking_date).toLocaleDateString()}` : null,
      initial: (item.client?.name || '?').charAt(0), chipColor: 'teal' }
  }
  if (item.type === 'subscription' || item.event_type === 'subscription') {
    return { ...base, type: 'subscription', icon: 'mdi-crown', dotColor: 'dot-amber', avatarColor: 'amber',
      actor: item.photographer?.name || item.actor, action: 'subscribed to the', target: item.plan + ' plan',
      detail: `KSh ${Number(item.amount || 0).toLocaleString()} via ${item.payment_method || 'M-Pesa'}`,
      initial: (item.photographer?.name || '?').charAt(0), chipColor: 'orange' }
  }
  if (item.type === 'report' || item.event_type === 'report') {
    return { ...base, type: 'report', icon: 'mdi-flag', dotColor: 'dot-red', avatarColor: 'red',
      actor: item.client?.name || item.actor, action: 'reported', target: item.photographer?.name,
      detail: item.reason,
      initial: (item.client?.name || '?').charAt(0), chipColor: 'error' }
  }
  if (item.type === 'rating' || item.event_type === 'rating') {
    return { ...base, type: 'rating', icon: 'mdi-star', dotColor: 'dot-amber', avatarColor: 'amber',
      actor: item.client?.name || item.actor, action: `gave ${item.stars} stars to`, target: item.photographer?.name,
      detail: item.comment,
      initial: (item.client?.name || '?').charAt(0), chipColor: 'amber' }
  }
  // fallback
  return { ...base, type: 'event', icon: 'mdi-circle', dotColor: 'dot-grey', avatarColor: 'grey',
    actor: item.actor || 'System', action: item.description || 'performed an action', target: null,
    initial: '?', chipColor: 'default' }
}

const events = computed(() => rawEvents.value.map(formatEvent))

const filteredEvents = computed(() =>
  activeFilter.value === 'all'
    ? events.value
    : events.value.filter(e => e.type === activeFilter.value)
)

const counts = computed(() => {
  const c = {}
  events.value.forEach(e => { c[e.type] = (c[e.type] || 0) + 1 })
  return c
})

async function fetchAll() {
  loading.value = true
  try {
    // Try to get a combined activity feed — if endpoint doesn't exist yet,
    // we'll combine bookings, subscriptions and reports manually
    const [bookRes, subRes, reportRes, ratingRes, userRes] = await Promise.allSettled([
      api.get('/admin/bookings'),
      api.get('/admin/subscriptions'),
      api.get('/admin/reports'),
      api.get('/admin/ratings'),
      api.get('/admin/users'),
    ])

    const combined = []

    if (bookRes.status === 'fulfilled') {
      const items = bookRes.value.data?.data || bookRes.value.data || []
      items.forEach(b => combined.push({ ...b, type: 'booking' }))
    }
    if (subRes.status === 'fulfilled') {
      const items = subRes.value.data?.data || subRes.value.data || []
      items.forEach(s => combined.push({ ...s, type: 'subscription' }))
    }
    if (reportRes.status === 'fulfilled') {
      const items = reportRes.value.data?.data || reportRes.value.data || []
      items.forEach(r => combined.push({ ...r, type: 'report' }))
    }
    if (ratingRes.status === 'fulfilled') {
      const items = ratingRes.value.data?.data || ratingRes.value.data || []
      items.forEach(r => combined.push({ ...r, type: 'rating' }))
    }
    if (userRes.status === 'fulfilled') {
      const items = userRes.value.data?.data || userRes.value.data || []
      items.forEach(u => combined.push({ ...u, type: 'registration' }))
    }

    // Sort by created_at desc
    combined.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    rawEvents.value = combined.slice(0, 100) // show latest 100
  } catch (_) {}
  finally { loading.value = false }
}

onMounted(fetchAll)
</script>

<style scoped>
.timeline { position: relative; padding-left: 24px; }
.timeline-item { position: relative; }
.timeline-item:not(.last)::before {
  content: '';
  position: absolute;
  left: 14px; top: 32px; bottom: 0;
  width: 2px;
  background: rgba(0,0,0,0.07);
}
.timeline-dot {
  position: absolute;
  left: 0; top: 12px;
  width: 28px; height: 28px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  z-index: 1;
}
.timeline-card { border: 1px solid rgba(0,0,0,0.07) !important; }

.dot-blue   { background: #1565C0; }
.dot-teal   { background: #00695C; }
.dot-amber  { background: #E65100; }
.dot-red    { background: #C62828; }
.dot-green  { background: #2E7D32; }
.dot-grey   { background: #616161; }

.gap-2 { gap: 8px; }
.gap-3 { gap: 12px; }
</style>
