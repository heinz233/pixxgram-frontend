<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <h2 class="text-h6 font-weight-bold">All Users</h2>
        <p class="text-medium-emphasis mt-1">Manage every account on the platform</p>
      </div>
      <v-chip color="primary" variant="tonal" size="small">{{ filtered.length }} users</v-chip>
    </div>

    <!-- Filters -->
    <v-card rounded="xl" class="pa-4 mb-5 filter-card">
      <v-row align="center">
        <v-col cols="12" md="5">
          <v-text-field
            v-model="search"
            placeholder="Search name or email..."
            prepend-inner-icon="mdi-magnify"
            density="compact" hide-details clearable
          />
        </v-col>
        <v-col cols="6" md="3">
          <v-select
            v-model="roleFilter"
            :items="[{title:'All Roles',value:''},{title:'Admin',value:'admin'},{title:'Photographer',value:'photographer'},{title:'Client',value:'client'}]"
            item-title="title" item-value="value"
            label="Role" density="compact" hide-details
          />
        </v-col>
        <v-col cols="6" md="3">
          <v-select
            v-model="statusFilter"
            :items="[{title:'All Statuses',value:''},{title:'Active',value:'active'},{title:'Inactive',value:'inactive'},{title:'Suspended',value:'suspended'},{title:'Banned',value:'banned'}]"
            item-title="title" item-value="value"
            label="Status" density="compact" hide-details
          />
        </v-col>
      </v-row>
    </v-card>

    <!-- Table -->
    <v-card rounded="xl" class="users-table">
      <div v-if="loading" class="text-center py-12">
        <v-progress-circular indeterminate color="primary" />
      </div>

      <div v-else-if="!filtered.length" class="text-center py-16">
        <v-icon size="64" color="medium-emphasis">mdi-account-off-outline</v-icon>
        <p class="mt-3 text-medium-emphasis">No users match your filters.</p>
      </div>

      <template v-else>
        <!-- User rows -->
        <div
          v-for="user in filtered"
          :key="user.id"
          class="user-row pa-4 d-flex align-center gap-3"
        >
          <!-- Avatar -->
          <v-avatar size="44" :color="roleColor(user.role?.name)">
            <v-img v-if="user.user_image" :src="user.user_image" />
            <span v-else class="text-white font-weight-bold">{{ user.name?.charAt(0) }}</span>
          </v-avatar>

          <!-- Info -->
          <div class="flex-grow-1 min-width-0">
            <div class="d-flex align-center gap-2 flex-wrap">
              <p class="text-body-2 font-weight-semibold">{{ user.name }}</p>
              <v-chip :color="roleColor(user.role?.name)" size="x-small" label>
                {{ user.role?.name || '—' }}
              </v-chip>
              <v-chip :color="accountStatusColor(user)" size="x-small" label>
                {{ accountStatusLabel(user) }}
              </v-chip>
            </div>
            <p class="text-caption text-medium-emphasis mt-1">{{ user.email }}</p>
            <p class="text-caption text-medium-emphasis">
              <v-icon size="11" class="mr-1">mdi-phone</v-icon>{{ user.phoneNumber || '—' }}
              &nbsp;·&nbsp;
              <v-icon size="11" class="mr-1">mdi-calendar</v-icon>Joined {{ formatDate(user.created_at) }}
            </p>
          </div>

          <!-- Actions -->
          <div class="d-flex gap-2 flex-shrink-0">
            <!-- Activate / Deactivate -->
            <v-tooltip :text="user.is_active ? 'Deactivate account' : 'Activate account'" location="top">
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon size="small" variant="tonal"
                  :color="user.is_active ? 'success' : 'warning'"
                  :loading="actionLoading === user.id + 'toggle'"
                  @click="toggleActive(user)"
                >
                  <v-icon size="16">{{ user.is_active ? 'mdi-check-circle' : 'mdi-clock-outline' }}</v-icon>
                </v-btn>
              </template>
            </v-tooltip>

            <!-- Block / Unblock (Suspend) -->
            <v-tooltip :text="user.status === 'suspended' ? 'Unblock user' : 'Block / Suspend user'" location="top">
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon size="small" variant="tonal"
                  :color="user.status === 'suspended' ? 'orange' : 'error'"
                  :loading="actionLoading === user.id + 'block'"
                  @click="toggleBlock(user)"
                >
                  <v-icon size="16">{{ user.status === 'suspended' ? 'mdi-lock-open-outline' : 'mdi-block-helper' }}</v-icon>
                </v-btn>
              </template>
            </v-tooltip>

            <!-- Ban permanently -->
            <v-tooltip text="Permanently ban user" location="top">
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon size="small" variant="tonal" color="error"
                  :disabled="user.status === 'banned'"
                  :loading="actionLoading === user.id + 'ban'"
                  @click="banUser(user)"
                >
                  <v-icon size="16">mdi-gavel</v-icon>
                </v-btn>
              </template>
            </v-tooltip>
          </div>
        </div>
      </template>
    </v-card>

    <!-- Confirm Ban Dialog -->
    <v-dialog v-model="banDialog" max-width="420" rounded="xl">
      <v-card rounded="xl" class="pa-7 text-center">
        <v-icon size="52" color="error" class="mb-3">mdi-gavel</v-icon>
        <h3 class="text-subtitle-1 font-weight-bold mb-2">Permanently Ban User?</h3>
        <p class="text-body-2 text-medium-emphasis mb-2">
          You are about to permanently ban <strong>{{ banTarget?.name }}</strong>.
        </p>
        <p class="text-caption text-medium-emphasis mb-6">
          They will no longer be able to log in or use the platform.
        </p>
        <v-textarea v-model="banReason" label="Reason for ban" rows="2" placeholder="Explain why..." class="mb-4" />
        <div class="d-flex gap-3">
          <v-btn variant="text" @click="banDialog = false" class="flex-grow-1">Cancel</v-btn>
          <v-btn color="error" :loading="actionLoading === banTarget?.id + 'ban'" @click="confirmBan" class="flex-grow-1">
            Ban User
          </v-btn>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/api/axios'
import { adminApi } from '@/api/admin'
import { useAppStore } from '@/stores/app'

const appStore    = useAppStore()
const loading     = ref(true)
const users       = ref([])
const search      = ref('')
const roleFilter  = ref('')
const statusFilter= ref('')
const actionLoading = ref(null)
const banDialog   = ref(false)
const banTarget   = ref(null)
const banReason   = ref('')

const filtered = computed(() => {
  let list = users.value
  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter(u => u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q))
  }
  if (roleFilter.value)   list = list.filter(u => u.role?.name === roleFilter.value)
  if (statusFilter.value === 'active')    list = list.filter(u => u.is_active && u.status !== 'suspended' && u.status !== 'banned')
  if (statusFilter.value === 'inactive')  list = list.filter(u => !u.is_active)
  if (statusFilter.value === 'suspended') list = list.filter(u => u.status === 'suspended')
  if (statusFilter.value === 'banned')    list = list.filter(u => u.status === 'banned')
  return list
})

const roleColor   = r => ({ admin: 'error', photographer: 'secondary', client: 'primary' }[r] || 'default')
const formatDate  = d => d ? new Date(d).toLocaleDateString('en-KE', { dateStyle: 'medium' }) : '—'

function accountStatusLabel(user) {
  if (user.status === 'banned')    return 'Banned'
  if (user.status === 'suspended') return 'Suspended'
  if (!user.is_active)             return 'Inactive'
  return 'Active'
}
function accountStatusColor(user) {
  if (user.status === 'banned')    return 'error'
  if (user.status === 'suspended') return 'warning'
  if (!user.is_active)             return 'default'
  return 'success'
}

async function toggleActive(user) {
  actionLoading.value = user.id + 'toggle'
  try {
    await api.patch(`/admin/users/${user.id}/toggle-active`)
    user.is_active = !user.is_active
    if (user.is_active && user.status === 'suspended') user.status = 'active'
    appStore.notify(`Account ${user.is_active ? 'activated' : 'deactivated'}`)
  } catch (e) {
    appStore.notify(e.response?.data?.message || 'Action failed', 'error')
  } finally { actionLoading.value = null }
}

async function toggleBlock(user) {
  const isSuspended = user.status === 'suspended'
  actionLoading.value = user.id + 'block'
  try {
    const newStatus = isSuspended ? 'active' : 'suspended'
    await adminApi.updatePhotographerStatus(user.id, newStatus)
    user.status    = newStatus
    user.is_active = newStatus === 'active'
    appStore.notify(`User ${isSuspended ? 'unblocked' : 'blocked (suspended)'}`)
  } catch (e) {
    appStore.notify(e.response?.data?.message || 'Action failed', 'error')
  } finally { actionLoading.value = null }
}

function banUser(user) {
  banTarget.value = user
  banReason.value = ''
  banDialog.value = true
}

async function confirmBan() {
  actionLoading.value = banTarget.value.id + 'ban'
  try {
    await adminApi.updatePhotographerStatus(banTarget.value.id, 'banned')
    banTarget.value.status    = 'banned'
    banTarget.value.is_active = false
    appStore.notify(`${banTarget.value.name} has been permanently banned`, 'error')
    banDialog.value = false
  } catch (e) {
    appStore.notify(e.response?.data?.message || 'Ban failed', 'error')
  } finally { actionLoading.value = null }
}

onMounted(async () => {
  try {
    const { data } = await api.get('/admin/users')
    users.value = data.data || data
  } catch (_) {}
  finally { loading.value = false }
})
</script>

<style scoped>
.filter-card  { border: 1px solid rgba(0,0,0,0.07) !important; }
.users-table  { border: 1px solid rgba(0,0,0,0.07) !important; }
.user-row     { border-bottom: 1px solid rgba(0,0,0,0.05); }
.user-row:last-child { border-bottom: none; }
.user-row:hover { background: rgba(0,0,0,0.015); }
.gap-2 { gap: 8px; }
.gap-3 { gap: 12px; }
</style>
