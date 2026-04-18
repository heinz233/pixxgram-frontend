<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <h2 class="text-h6 font-weight-bold">Subscriptions</h2>
        <p class="text-medium-emphasis text-body-2 mt-1">All photographer subscriptions</p>
      </div>
      <v-chip color="primary" variant="tonal" size="small">
        {{ filtered.length }} records
      </v-chip>
    </div>

    <!-- Revenue cards -->
    <v-row class="mb-6">
      <v-col cols="12" md="4">
        <v-card rounded="xl" class="pa-5 revenue-card" color="primary">
          <p class="text-white text-caption text-uppercase font-weight-bold mb-2" style="opacity:.7">
            Total Revenue
          </p>
          <p class="text-white text-h5 font-weight-bold">
            KSh {{ totalRevenue.toLocaleString() }}
          </p>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card rounded="xl" class="pa-5 revenue-card" color="secondary">
          <p class="text-white text-caption text-uppercase font-weight-bold mb-2" style="opacity:.7">
            Active Subscriptions
          </p>
          <p class="text-white text-h5 font-weight-bold">
            {{ countByStatus('active') }}
          </p>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card rounded="xl" class="pa-5" style="border:1px solid rgba(0,0,0,0.07)">
          <p class="text-caption text-uppercase font-weight-bold mb-2 text-medium-emphasis">
            This Month
          </p>
          <p class="text-h5 font-weight-bold text-primary">
            KSh {{ monthRevenue.toLocaleString() }}
          </p>
        </v-card>
      </v-col>
    </v-row>

    <!-- Filters -->
    <v-card rounded="xl" class="pa-4 mb-5" style="border:1px solid rgba(0,0,0,0.07)">
      <v-row align="center">
        <v-col cols="12" md="5">
          <v-text-field v-model="search" placeholder="Search photographer..."
            prepend-inner-icon="mdi-magnify" density="compact" hide-details
            clearable variant="outlined" />
        </v-col>
        <v-col cols="6" md="3">
          <v-select v-model="statusFilter"
            :items="[
              { title: 'All Statuses', value: '' },
              { title: 'Active',       value: 'active' },
              { title: 'Pending',      value: 'pending' },
              { title: 'Cancelled',    value: 'cancelled' },
              { title: 'Expired',      value: 'expired' },
              { title: 'Failed',       value: 'failed' },
            ]"
            item-title="title" item-value="value"
            label="Status" density="compact" hide-details variant="outlined" />
        </v-col>
        <v-col cols="6" md="3">
          <v-select v-model="planFilter"
            :items="[
              { title: 'All Plans',  value: '' },
              { title: 'Monthly',   value: 'monthly' },
              { title: 'Quarterly', value: 'quarterly' },
              { title: 'Annual',    value: 'annual' },
            ]"
            item-title="title" item-value="value"
            label="Plan" density="compact" hide-details variant="outlined" />
        </v-col>
      </v-row>
    </v-card>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-12">
      <v-progress-circular indeterminate color="primary" size="44" />
      <p class="mt-4 text-medium-emphasis">Loading subscriptions...</p>
    </div>

    <!-- Error -->
    <v-alert v-else-if="loadError" type="error" variant="tonal" rounded="xl" class="mb-4">
      <p class="font-weight-bold mb-1">Could not load subscriptions</p>
      <p class="text-body-2 mb-3">{{ loadError }}</p>
      <v-btn size="small" color="error" variant="tonal" @click="loadSubs">Retry</v-btn>
    </v-alert>

    <!-- Empty -->
    <div v-else-if="!filtered.length" class="text-center py-16">
      <v-icon size="64" color="medium-emphasis">mdi-crown-off-outline</v-icon>
      <p class="mt-3 text-medium-emphasis">No subscriptions found.</p>
    </div>

    <!-- Table -->
    <v-card v-else rounded="xl" style="border:1px solid rgba(0,0,0,0.07)">
      <div v-for="sub in filtered" :key="sub.id"
        class="sub-row pa-4 d-flex align-center" style="gap:16px">
        <v-avatar size="40" color="secondary">
          <span class="text-white text-caption font-weight-bold">
            {{ sub.photographer?.name?.charAt(0) || '?' }}
          </span>
        </v-avatar>
        <div class="flex-grow-1 min-width-0">
          <p class="text-body-2 font-weight-semibold">
            {{ sub.photographer?.name || '—' }}
          </p>
          <p class="text-caption text-medium-emphasis">
            {{ sub.photographer?.email }}
          </p>
          <p class="text-caption text-medium-emphasis">
            {{ formatDate(sub.starts_at) }} → {{ sub.ends_at ? formatDate(sub.ends_at) : '—' }}
          </p>
        </div>
        <div class="text-center">
          <p class="text-body-2 font-weight-bold text-capitalize">{{ sub.plan }}</p>
          <p class="text-caption text-medium-emphasis">plan</p>
        </div>
        <div class="text-center">
          <p class="text-body-2 font-weight-bold">
            KSh {{ Number(sub.amount || 0).toLocaleString() }}
          </p>
          <p v-if="sub.mpesa_receipt" class="text-caption text-medium-emphasis">
            {{ sub.mpesa_receipt }}
          </p>
        </div>
        <v-chip :color="statusColor(sub.status)" size="small" label>
          {{ sub.status }}
        </v-chip>
      </div>
    </v-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { adminApi } from '@/api/admin'

const loading      = ref(true)
const loadError    = ref('')
const subs         = ref([])
const search       = ref('')
const statusFilter = ref('')
const planFilter   = ref('')

const countByStatus = s => subs.value.filter(sub => sub.status === s).length

const totalRevenue = computed(() =>
  subs.value.filter(s => s.status === 'active').reduce((a, s) => a + Number(s.amount || 0), 0)
)

const monthRevenue = computed(() => {
  const now = new Date()
  return subs.value
    .filter(s => {
      const d = new Date(s.created_at)
      return s.status === 'active' && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    })
    .reduce((a, s) => a + Number(s.amount || 0), 0)
})

const filtered = computed(() => {
  let list = subs.value
  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter(s =>
      s.photographer?.name?.toLowerCase().includes(q) ||
      s.photographer?.email?.toLowerCase().includes(q)
    )
  }
  if (statusFilter.value) list = list.filter(s => s.status === statusFilter.value)
  if (planFilter.value)   list = list.filter(s => s.plan   === planFilter.value)
  return list
})

const STATUS_COLORS = { active:'success', pending:'warning', cancelled:'error', expired:'default', failed:'error' }
const statusColor = s => STATUS_COLORS[s] || 'default'

function formatDate(d) {
  return d ? new Date(d).toLocaleDateString('en-KE', { dateStyle: 'medium' }) : '—'
}

async function loadSubs() {
  loading.value   = true
  loadError.value = ''
  try {
    const { data } = await adminApi.subscriptions()
    subs.value = data?.data || data || []
  } catch (e) {
    const s = e.response?.status
    if (s === 403) loadError.value = 'Access denied. Make sure you are logged in as an admin.'
    else if (!e.response) loadError.value = 'Cannot reach server. Is Laravel running?'
    else loadError.value = e.response?.data?.message || `Error ${s}`
  } finally { loading.value = false }
}

onMounted(loadSubs)
</script>

<style scoped>
.revenue-card { border: none !important; }
.sub-row { border-bottom: 1px solid rgba(0,0,0,0.05); }
.sub-row:last-child { border-bottom: none; }
.sub-row:hover { background: rgba(0,0,0,0.015); }
</style>
