<template>
  <div>
    <h2 class="text-h6 font-weight-bold mb-6">Manage Photographers</h2>

    <!-- Filters -->
    <div class="d-flex gap-3 mb-5 flex-wrap">
      <v-text-field
        v-model="search"
        placeholder="Search by name..."
        prepend-inner-icon="mdi-magnify"
        density="compact" hide-details clearable
        style="max-width:280px"
      />
      <v-select
        v-model="statusFilter"
        :items="['all','active','suspended','banned']"
        label="Status"
        density="compact" hide-details clearable
        style="max-width:180px"
      />
    </div>

    <v-data-table
      :headers="headers"
      :items="filtered"
      :loading="loading"
      rounded="xl"
      class="admin-table"
    >
      <template #item.name="{ item }">
        <div class="d-flex align-center gap-3 py-2">
          <v-avatar size="36" color="primary">
            <v-img v-if="item.user_image" :src="item.user_image" />
            <span v-else class="text-white text-caption font-weight-bold">{{ item.name?.charAt(0) }}</span>
          </v-avatar>
          <div>
            <p class="text-body-2 font-weight-semibold">{{ item.name }}</p>
            <p class="text-caption text-medium-emphasis">{{ item.email }}</p>
          </div>
        </div>
      </template>

      <template #item.subscription="{ item }">
        <v-chip
          :color="item.photographer_profile?.subscription_status === 'active' ? 'success' : 'default'"
          size="x-small" label
        >
          {{ item.photographer_profile?.subscription_status || 'none' }}
        </v-chip>
      </template>

      <template #item.status="{ item }">
        <v-chip :color="statusColor(item.status)" size="x-small" label>{{ item.status }}</v-chip>
      </template>

      <template #item.actions="{ item }">
        <div class="d-flex gap-2">
          <v-menu rounded="xl">
            <template #activator="{ props }">
              <v-btn v-bind="props" size="x-small" variant="tonal" color="primary">
                Status <v-icon end size="14">mdi-chevron-down</v-icon>
              </v-btn>
            </template>
            <v-list density="compact" rounded="xl" min-width="160">
              <v-list-item
                v-for="s in ['active','suspended','banned']"
                :key="s"
                :title="s"
                :disabled="item.status === s"
                @click="updateStatus(item, s)"
              />
            </v-list>
          </v-menu>

          <v-menu rounded="xl">
            <template #activator="{ props }">
              <v-btn v-bind="props" size="x-small" variant="tonal" color="secondary">
                Sub <v-icon end size="14">mdi-chevron-down</v-icon>
              </v-btn>
            </template>
            <v-list density="compact" rounded="xl" min-width="160">
              <v-list-item title="Reactivate" @click="manageSubscription(item, 'reactivate')" />
              <v-list-item title="Force Delete" @click="manageSubscription(item, 'force_delete')" />
            </v-list>
          </v-menu>
        </div>
      </template>
    </v-data-table>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { adminApi } from '@/api/admin'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()
const loading  = ref(true)
const photographers = ref([])
const search   = ref('')
const statusFilter = ref(null)

const headers = [
  { title: 'Photographer', key: 'name', sortable: true },
  { title: 'Subscription', key: 'subscription', sortable: false },
  { title: 'Status',       key: 'status', sortable: true },
  { title: 'Joined',       key: 'created_at', sortable: true },
  { title: 'Actions',      key: 'actions', sortable: false },
]

const filtered = computed(() => {
  let list = photographers.value
  if (search.value)
    list = list.filter(p => p.name?.toLowerCase().includes(search.value.toLowerCase()) || p.email?.toLowerCase().includes(search.value.toLowerCase()))
  if (statusFilter.value && statusFilter.value !== 'all')
    list = list.filter(p => p.status === statusFilter.value)
  return list
})

const statusColor = s => ({ active: 'success', suspended: 'warning', banned: 'error', pending: 'info' }[s] || 'default')

async function updateStatus(item, status) {
  try {
    await adminApi.updatePhotographerStatus(item.id, status)
    item.status = status
    appStore.notify(`Status updated to ${status}`)
  } catch (e) {
    appStore.notify(e.response?.data?.error || 'Failed', 'error')
  }
}

async function manageSubscription(item, action) {
  try {
    await adminApi.manageSubscription(item.id, action)
    appStore.notify(`Subscription ${action === 'reactivate' ? 'reactivated' : 'deleted'}`)
    await fetchPhotographers()
  } catch (e) {
    appStore.notify(e.response?.data?.error || 'Failed', 'error')
  }
}

async function fetchPhotographers() {
  loading.value = true
  try {
    const { data } = await adminApi.photographers()
    photographers.value = data.data || []
  } catch (_) {}
  finally { loading.value = false }
}

onMounted(fetchPhotographers)
</script>

<style scoped>
.admin-table { border: 1px solid rgba(0,0,0,0.07) !important; }
.gap-2 { gap: 8px; }
.gap-3 { gap: 12px; }
</style>
