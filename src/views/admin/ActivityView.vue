<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <h2 class="text-h6 font-weight-bold">Activity Feed</h2>
        <p class="text-medium-emphasis text-body-2 mt-1">All platform events</p>
      </div>
      <v-btn variant="tonal" color="primary" size="small"
        prepend-icon="mdi-refresh" :loading="loading" @click="loadAll">
        Refresh
      </v-btn>
    </div>

    <!-- Filter tabs -->
    <div class="d-flex flex-wrap mb-6" style="gap:8px">
      <v-btn v-for="f in filters" :key="f.value"
        :variant="activeFilter === f.value ? 'flat' : 'outlined'"
        :color="activeFilter === f.value ? 'primary' : 'default'"
        size="small" rounded="lg"
        @click="activeFilter = f.value">
        <v-icon start size="14">{{ f.icon }}</v-icon>
        {{ f.label }}
        <v-chip v-if="eventCounts[f.value]" size="x-small"
          :color="activeFilter === f.value ? 'white' : 'primary'" class="ml-2">
          {{ eventCounts[f.value] }}
        </v-chip>
      </v-btn>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-12">
      <v-progress-circular indeterminate color="primary" size="44" />
      <p class="mt-4 text-medium-emphasis">Loading activity...</p>
    </div>

    <!-- Error -->
    <v-alert v-else-if="loadError" type="error" variant="tonal" rounded="xl" class="mb-4">
      <p class="font-weight-bold mb-1">Could not load activity</p>
      <p class="text-body-2 mb-3">{{ loadError }}</p>
      <v-btn size="small" color="error" variant="tonal" @click="loadAll">Retry</v-btn>
    </v-alert>

    <!-- Empty -->
    <div v-else-if="!visibleEvents.length" class="text-center py-16">
      <v-icon size="64" color="medium-emphasis">mdi-timeline-outline</v-icon>
      <p class="mt-3 text-medium-emphasis">No activity yet.</p>
    </div>

    <!-- Timeline -->
    <div v-else class="timeline">
      <div v-for="(event, i) in visibleEvents" :key="i"
        class="timeline-item" :class="{ last: i === visibleEvents.length - 1 }">

        <div class="timeline-dot" :class="event.dotClass">
          <v-icon size="13" color="white">{{ event.icon }}</v-icon>
        </div>

        <v-card rounded="xl" class="timeline-card pa-4 ml-4 mb-3">
          <div class="d-flex align-start justify-space-between">
            <div class="d-flex align-start" style="gap:12px">
              <v-avatar size="32" :color="event.avatarColor" variant="tonal">
                <span class="text-caption font-weight-bold">{{ event.initial }}</span>
              </v-avatar>
              <div>
                <p class="text-body-2">
                  <strong>{{ event.actor }}</strong>
                  <span class="text-medium-emphasis"> {{ event.action }} </span>
                  <strong v-if="event.target">{{ event.target }}</strong>
                </p>
                <p v-if="event.detail" class="text-caption text-medium-emphasis mt-1">
                  {{ event.detail }}
                </p>
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
import { adminApi } from '@/api/admin'

const loading      = ref(true)
const loadError    = ref('')
const activeFilter = ref('all')
const rawEvents    = ref([])

const filters = [
  { label: 'All',           value: 'all',         icon: 'mdi-format-list-bulleted' },
  { label: 'Registrations', value: 'registration', icon: 'mdi-account-plus-outline' },
  { label: 'Bookings',      value: 'booking',      icon: 'mdi-calendar-check-outline' },
  { label: 'Subscriptions', value: 'subscription', icon: 'mdi-crown-outline' },
  { label: 'Reports',       value: 'report',       icon: 'mdi-flag-outline' },
  { label: 'Ratings',       value: 'rating',       icon: 'mdi-star-outline' },
]

function formatEvent(item) {
  const time = item.created_at
    ? new Date(item.created_at).toLocaleString('en-KE', { dateStyle: 'short', timeStyle: 'short' })
    : ''
  const t = item._type

  if (t === 'registration') return {
    type: 'Registration', icon: 'mdi-account-plus', dotClass: 'dot-blue', avatarColor: 'blue', chipColor: 'blue',
    actor: item.name, action: 'joined as a', target: item.role?.name || 'user',
    initial: (item.name || '?').charAt(0), detail: item.email, time,
  }
  if (t === 'booking') return {
    type: 'Booking', icon: 'mdi-calendar-check', dotClass: 'dot-teal', avatarColor: 'teal', chipColor: 'teal',
    actor: item.client?.name || 'Client', action: 'booked', target: item.photographer?.name,
    initial: (item.client?.name || '?').charAt(0),
    detail: item.booking_date ? `Session on ${new Date(item.booking_date).toLocaleDateString()}` : null, time,
  }
  if (t === 'subscription') return {
    type: 'Subscription', icon: 'mdi-crown', dotClass: 'dot-amber', avatarColor: 'orange', chipColor: 'orange',
    actor: item.photographer?.name || 'Photographer', action: 'subscribed to', target: (item.plan || '') + ' plan',
    initial: (item.photographer?.name || '?').charAt(0),
    detail: `KSh ${Number(item.amount || 0).toLocaleString()}`, time,
  }
  if (t === 'report') return {
    type: 'Report', icon: 'mdi-flag', dotClass: 'dot-red', avatarColor: 'red', chipColor: 'error',
    actor: item.client?.name || 'Client', action: 'reported', target: item.photographer?.name,
    initial: (item.client?.name || '?').charAt(0), detail: item.reason, time,
  }
  if (t === 'rating') return {
    type: 'Rating', icon: 'mdi-star', dotClass: 'dot-amber', avatarColor: 'amber', chipColor: 'amber',
    actor: item.client?.name || 'Client', action: `gave ${item.stars}★ to`, target: item.photographer?.name,
    initial: (item.client?.name || '?').charAt(0), detail: item.comment, time,
  }
  return { type: 'event', icon: 'mdi-circle', dotClass: 'dot-grey', avatarColor: 'grey', chipColor: 'default',
    actor: 'System', action: 'event', target: null, initial: '?', detail: null, time }
}

const events = computed(() => rawEvents.value.map(formatEvent))

const visibleEvents = computed(() =>
  activeFilter.value === 'all'
    ? events.value
    : events.value.filter(e => e.type.toLowerCase() === activeFilter.value)
)

const eventCounts = computed(() => {
  const c = {}
  events.value.forEach(e => {
    const key = e.type.toLowerCase()
    c[key] = (c[key] || 0) + 1
  })
  return c
})

async function loadAll() {
  loading.value   = true
  loadError.value = ''
  try {
    const [bookRes, subRes, reportRes, ratingRes, userRes] = await Promise.allSettled([
      adminApi.bookings(),
      adminApi.subscriptions(),
      adminApi.reports(),
      adminApi.ratings(),
      adminApi.users(),
    ])

    const combined = []
    if (bookRes.status   === 'fulfilled') (bookRes.value.data?.data   || bookRes.value.data   || []).forEach(i => combined.push({ ...i, _type: 'booking' }))
    if (subRes.status    === 'fulfilled') (subRes.value.data?.data    || subRes.value.data    || []).forEach(i => combined.push({ ...i, _type: 'subscription' }))
    if (reportRes.status === 'fulfilled') (reportRes.value.data?.data || reportRes.value.data || []).forEach(i => combined.push({ ...i, _type: 'report' }))
    if (ratingRes.status === 'fulfilled') (ratingRes.value.data?.data || ratingRes.value.data || []).forEach(i => combined.push({ ...i, _type: 'rating' }))
    if (userRes.status   === 'fulfilled') (userRes.value.data?.data   || userRes.value.data   || []).forEach(i => combined.push({ ...i, _type: 'registration' }))

    combined.sort((a,b) => new Date(b.created_at) - new Date(a.created_at))
    rawEvents.value = combined.slice(0, 150)
  } catch (e) {
    loadError.value = e.response?.data?.message || 'Failed to load activity feed'
  } finally { loading.value = false }
}

onMounted(loadAll)
</script>

<style scoped>
.timeline { position: relative; padding-left: 24px; }
.timeline-item { position: relative; }
.timeline-item:not(.last)::before {
  content: ''; position: absolute;
  left: 14px; top: 32px; bottom: 0;
  width: 2px; background: rgba(0,0,0,0.07);
}
.timeline-dot {
  position: absolute; left: 0; top: 12px;
  width: 28px; height: 28px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center; z-index: 1;
}
.timeline-card { border: 1px solid rgba(0,0,0,0.07) !important; }
.dot-blue  { background: #1565C0; }
.dot-teal  { background: #00695C; }
.dot-amber { background: #E65100; }
.dot-red   { background: #C62828; }
.dot-grey  { background: #616161; }
</style>
