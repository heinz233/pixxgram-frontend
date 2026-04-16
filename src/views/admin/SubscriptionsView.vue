<template>
  <div>
    <h2 class="text-h6 font-weight-bold mb-6">Subscriptions</h2>

    <!-- Summary cards -->
    <v-row class="mb-6" v-if="!loading">
      <v-col v-for="s in summary" :key="s.label" cols="6" md="3">
        <v-card rounded="xl" class="pa-5 summary-card">
          <div class="summary-icon mb-3" :class="s.bg">
            <v-icon :color="s.color" size="20">{{ s.icon }}</v-icon>
          </div>
          <div class="text-h5 font-weight-bold">{{ s.value }}</div>
          <div class="text-caption text-medium-emphasis mt-1">{{ s.label }}</div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Filters -->
    <div class="d-flex gap-3 mb-5 flex-wrap">
      <v-select
        v-model="statusFilter"
        :items="[{title:'All',value:''},{title:'Active',value:'active'},{title:'Pending',value:'pending'},{title:'Cancelled',value:'cancelled'},{title:'Failed',value:'failed'}]"
        item-title="title" item-value="value"
        label="Status" density="compact" hide-details style="max-width:160px"
      />
      <v-select
        v-model="planFilter"
        :items="[{title:'All Plans',value:''},{title:'Monthly',value:'monthly'},{title:'Quarterly',value:'quarterly'},{title:'Annual',value:'annual'}]"
        item-title="title" item-value="value"
        label="Plan" density="compact" hide-details style="max-width:160px"
      />
    </div>

    <v-data-table
      :headers="headers"
      :items="filtered"
      :loading="loading"
      rounded="xl"
      class="admin-table"
    >
      <template #item.photographer="{ item }">
        <div class="d-flex align-center gap-2 py-1">
          <v-avatar size="30" color="primary">
            <span class="text-white text-caption font-weight-bold">{{ item.photographer?.name?.charAt(0) }}</span>
          </v-avatar>
          <span class="text-body-2">{{ item.photographer?.name }}</span>
        </div>
      </template>

      <template #item.plan="{ item }">
        <v-chip :color="planColor(item.plan)" size="x-small" label class="text-capitalize">
          {{ item.plan }}
        </v-chip>
      </template>

      <template #item.amount="{ item }">
        <span class="font-weight-semibold">KSh {{ Number(item.amount).toLocaleString() }}</span>
      </template>

      <template #item.status="{ item }">
        <v-chip :color="statusColor(item.status)" size="x-small" label>{{ item.status }}</v-chip>
      </template>

      <template #item.ends_at="{ item }">
        <span class="text-caption">{{ item.ends_at ? new Date(item.ends_at).toLocaleDateString() : '—' }}</span>
      </template>
    </v-data-table>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/api/axios'

const loading      = ref(true)
const subs         = ref([])
const statusFilter = ref('')
const planFilter   = ref('')

const headers = [
  { title: 'Photographer', key: 'photographer', sortable: false },
  { title: 'Plan',         key: 'plan',         sortable: true  },
  { title: 'Amount',       key: 'amount',       sortable: true  },
  { title: 'Status',       key: 'status',       sortable: true  },
  { title: 'Expires',      key: 'ends_at',      sortable: true  },
  { title: 'Created',      key: 'created_at',   sortable: true  },
]

const filtered = computed(() => {
  let list = subs.value
  if (statusFilter.value) list = list.filter(s => s.status === statusFilter.value)
  if (planFilter.value)   list = list.filter(s => s.plan   === planFilter.value)
  return list
})

const summary = computed(() => [
  { label: 'Active',   value: subs.value.filter(s=>s.status==='active').length,    icon:'mdi-check-circle',   color:'success', bg:'icon-green'  },
  { label: 'Revenue',  value: 'KSh '+subs.value.filter(s=>s.status==='active').reduce((a,s)=>a+Number(s.amount),0).toLocaleString(), icon:'mdi-cash-multiple', color:'secondary', bg:'icon-amber' },
  { label: 'Pending',  value: subs.value.filter(s=>s.status==='pending').length,   icon:'mdi-clock-outline',  color:'warning', bg:'icon-orange' },
  { label: 'Cancelled',value: subs.value.filter(s=>s.status==='cancelled').length, icon:'mdi-cancel',         color:'error',   bg:'icon-red'    },
])

const planColor   = p => ({ monthly:'primary', quarterly:'secondary', annual:'success' }[p] || 'default')
const statusColor = s => ({ active:'success', pending:'warning', cancelled:'error', failed:'error' }[s] || 'default')

onMounted(async () => {
  try {
    const { data } = await api.get('/admin/subscriptions')
    subs.value = data.data || data
  } catch (_) {}
  finally { loading.value = false }
})
</script>

<style scoped>
.admin-table { border: 1px solid rgba(0,0,0,0.07) !important; }
.summary-card { border: 1px solid rgba(0,0,0,0.07) !important; }
.summary-icon { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
.icon-green  { background: rgba(76,175,80,0.1); }
.icon-amber  { background: rgba(255,193,7,0.1); }
.icon-orange { background: rgba(255,152,0,0.1); }
.icon-red    { background: rgba(244,67,54,0.1); }
.gap-2 { gap: 8px; }
.gap-3 { gap: 12px; }
</style>
