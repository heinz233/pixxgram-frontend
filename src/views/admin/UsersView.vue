<template>
  <div>
    <!-- Header -->
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <h2 class="text-h6 font-weight-bold">All Users</h2>
        <p class="text-medium-emphasis text-body-2 mt-1">
          Manage every account on the platform
        </p>
      </div>
      <v-chip color="primary" variant="tonal" size="small">
        {{ filtered.length }} users
      </v-chip>
    </div>

    <!-- Filters -->
    <v-card rounded="xl" class="pa-4 mb-5 filter-card">
      <v-row align="center">
        <v-col cols="12" md="5">
          <v-text-field
            v-model="search"
            placeholder="Search name or email..."
            prepend-inner-icon="mdi-magnify"
            density="compact" hide-details clearable variant="outlined"
          />
        </v-col>
        <v-col cols="6" md="3">
          <v-select
            v-model="roleFilter"
            :items="[
              { title: 'All Roles',      value: '' },
              { title: 'Admin',          value: 'admin' },
              { title: 'Photographer',   value: 'photographer' },
              { title: 'Client',         value: 'client' },
            ]"
            item-title="title" item-value="value"
            label="Role" density="compact" hide-details variant="outlined"
          />
        </v-col>
        <v-col cols="6" md="3">
          <v-select
            v-model="statusFilter"
            :items="[
              { title: 'All Statuses', value: '' },
              { title: 'Active',       value: 'active' },
              { title: 'Inactive',     value: 'inactive' },
              { title: 'Suspended',    value: 'suspended' },
              { title: 'Banned',       value: 'banned' },
            ]"
            item-title="title" item-value="value"
            label="Status" density="compact" hide-details variant="outlined"
          />
        </v-col>
        <v-col cols="12" md="1">
          <v-btn variant="text" color="primary" @click="clearFilters" size="small" block>
            Clear
          </v-btn>
        </v-col>
      </v-row>
    </v-card>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-16">
      <v-progress-circular indeterminate color="primary" size="44" />
      <p class="mt-4 text-medium-emphasis">Loading users...</p>
    </div>

    <!-- Error -->
    <v-alert v-else-if="loadError" type="error" variant="tonal" rounded="xl" class="mb-4">
      <p class="font-weight-bold mb-1">Could not load users</p>
      <p class="text-body-2 mb-3">{{ loadError }}</p>
      <v-btn size="small" color="error" variant="tonal" @click="loadUsers">Retry</v-btn>
    </v-alert>

    <!-- Empty -->
    <div v-else-if="!filtered.length" class="text-center py-16">
      <v-icon size="64" color="medium-emphasis">mdi-account-off-outline</v-icon>
      <p class="mt-3 text-medium-emphasis">
        {{ users.length === 0 ? 'No users found.' : 'No users match your filters.' }}
      </p>
      <v-btn v-if="users.length > 0" variant="text" color="primary" @click="clearFilters">
        Clear filters
      </v-btn>
    </div>

    <!-- Users list -->
    <v-card v-else rounded="xl" class="users-card">
      <div
        v-for="user in filtered"
        :key="user.id"
        class="user-row pa-4 d-flex align-center"
        style="gap:16px"
      >
        <!-- Avatar -->
        <v-avatar size="46" :color="roleColor(user.role?.name)">
          <v-img v-if="user.user_image" :src="user.user_image" />
          <span v-else class="text-white font-weight-bold">
            {{ user.name?.charAt(0)?.toUpperCase() }}
          </span>
        </v-avatar>

        <!-- Info -->
        <div class="flex-grow-1 min-width-0">
          <div class="d-flex align-center flex-wrap" style="gap:8px">
            <p class="text-body-2 font-weight-semibold">{{ user.name }}</p>
            <v-chip :color="roleColor(user.role?.name)" size="x-small" label>
              {{ user.role?.name || '—' }}
            </v-chip>
            <v-chip :color="statusColor(user)" size="x-small" label>
              {{ statusLabel(user) }}
            </v-chip>
          </div>
          <p class="text-caption text-medium-emphasis mt-1">{{ user.email }}</p>
          <p class="text-caption text-medium-emphasis">
            <v-icon size="11" class="mr-1">mdi-phone</v-icon>
            {{ user.phoneNumber || '—' }}
            &nbsp;·&nbsp;
            <v-icon size="11" class="mr-1">mdi-calendar-outline</v-icon>
            Joined {{ formatDate(user.created_at) }}
          </p>
        </div>

        <!-- Action buttons -->
        <div class="d-flex flex-shrink-0" style="gap:6px">
          <!-- Activate / Deactivate -->
          <v-tooltip :text="user.is_active ? 'Deactivate account' : 'Activate account'" location="top">
            <template #activator="{ props }">
              <v-btn v-bind="props" icon size="small" variant="tonal"
                :color="user.is_active ? 'success' : 'warning'"
                :loading="actionLoading === user.id + '_toggle'"
                @click="toggleActive(user)">
                <v-icon size="16">
                  {{ user.is_active ? 'mdi-check-circle-outline' : 'mdi-clock-outline' }}
                </v-icon>
              </v-btn>
            </template>
          </v-tooltip>

          <!-- Block / Unblock -->
          <v-tooltip
            :text="user.status === 'suspended' ? 'Unblock user' : 'Block / Suspend user'"
            location="top"
          >
            <template #activator="{ props }">
              <v-btn v-bind="props" icon size="small" variant="tonal"
                :color="user.status === 'suspended' ? 'warning' : 'error'"
                :loading="actionLoading === user.id + '_block'"
                @click="toggleBlock(user)">
                <v-icon size="16">
                  {{ user.status === 'suspended' ? 'mdi-lock-open-outline' : 'mdi-block-helper' }}
                </v-icon>
              </v-btn>
            </template>
          </v-tooltip>

          <!-- Ban permanently -->
          <v-tooltip text="Permanently ban user" location="top">
            <template #activator="{ props }">
              <v-btn v-bind="props" icon size="small" variant="tonal" color="error"
                :disabled="user.status === 'banned' || user.role?.name === 'admin'"
                :loading="actionLoading === user.id + '_ban'"
                @click="openBanDialog(user)">
                <v-icon size="16">mdi-gavel</v-icon>
              </v-btn>
            </template>
          </v-tooltip>
        </div>
      </div>
    </v-card>

    <!-- Ban confirm dialog -->
    <v-dialog v-model="banDialog" max-width="420">
      <v-card rounded="xl" class="pa-7 text-center">
        <v-icon size="52" color="error" class="mb-3">mdi-gavel</v-icon>
        <h3 class="text-subtitle-1 font-weight-bold mb-2">Permanently Ban User?</h3>
        <p class="text-body-2 text-medium-emphasis mb-5">
          <strong>{{ banTarget?.name }}</strong> will be permanently banned and
          will no longer be able to log in or use the platform.
        </p>
        <v-textarea v-model="banReason" label="Reason for ban"
          rows="2" placeholder="Why is this user being banned?" class="mb-4" variant="outlined" />
        <div class="d-flex" style="gap:12px">
          <v-btn variant="text" @click="banDialog = false" class="flex-grow-1">Cancel</v-btn>
          <v-btn color="error" rounded="lg"
            :loading="actionLoading === banTarget?.id + '_ban'"
            @click="confirmBan" class="flex-grow-1">
            Ban User
          </v-btn>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { adminApi } from '@/api/admin'
import { useAppStore } from '@/stores/app'

const appStore     = useAppStore()
const loading      = ref(true)
const loadError    = ref('')
const users        = ref([])
const search       = ref('')
const roleFilter   = ref('')
const statusFilter = ref('')
const actionLoading= ref(null)
const banDialog    = ref(false)
const banTarget    = ref(null)
const banReason    = ref('')

// ── computed ───────────────────────────────────────────────────────
const filtered = computed(() => {
  let list = users.value
  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter(u =>
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q)
    )
  }
  if (roleFilter.value) {
    list = list.filter(u => u.role?.name === roleFilter.value)
  }
  if (statusFilter.value === 'active')    list = list.filter(u => u.is_active && u.status !== 'suspended' && u.status !== 'banned')
  if (statusFilter.value === 'inactive')  list = list.filter(u => !u.is_active)
  if (statusFilter.value === 'suspended') list = list.filter(u => u.status === 'suspended')
  if (statusFilter.value === 'banned')    list = list.filter(u => u.status === 'banned')
  return list
})

// ── helpers ────────────────────────────────────────────────────────
const roleColor = r => ({ admin: 'error', photographer: 'secondary', client: 'primary' }[r] || 'default')

function statusLabel(user) {
  if (user.status === 'banned')    return 'Banned'
  if (user.status === 'suspended') return 'Suspended'
  return user.is_active ? 'Active' : 'Inactive'
}

function statusColor(user) {
  if (user.status === 'banned')    return 'error'
  if (user.status === 'suspended') return 'warning'
  return user.is_active ? 'success' : 'default'
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-KE', { dateStyle: 'medium' })
}

function clearFilters() {
  search.value = ''
  roleFilter.value = ''
  statusFilter.value = ''
}

// ── load ───────────────────────────────────────────────────────────
async function loadUsers() {
  loading.value  = true
  loadError.value = ''
  try {
    const { data } = await adminApi.users()
    users.value = data?.data || data || []
  } catch (e) {
    const s = e.response?.status
    if (s === 403) loadError.value = 'Access denied. Make sure you are logged in as an admin.'
    else if (!e.response) loadError.value = 'Cannot reach server. Is Laravel running?'
    else loadError.value = e.response?.data?.message || `Failed to load users (${s})`
  } finally {
    loading.value = false
  }
}

// ── actions ────────────────────────────────────────────────────────
async function toggleActive(user) {
  actionLoading.value = user.id + '_toggle'
  try {
    await adminApi.toggleUserActive(user.id)
    user.is_active = !user.is_active
    if (user.is_active && user.status === 'suspended') user.status = 'active'
    appStore.notify(`Account ${user.is_active ? 'activated' : 'deactivated'}`)
  } catch (e) {
    appStore.notify(e.response?.data?.message || 'Action failed', 'error')
  } finally { actionLoading.value = null }
}

async function toggleBlock(user) {
  actionLoading.value = user.id + '_block'
  const suspend = user.status !== 'suspended'
  try {
    await adminApi.updatePhotographerStatus(user.id, suspend ? 'suspended' : 'active')
    user.status    = suspend ? 'suspended' : 'active'
    user.is_active = !suspend
    appStore.notify(suspend ? 'User blocked / suspended' : 'User unblocked')
  } catch (e) {
    appStore.notify(e.response?.data?.message || 'Action failed', 'error')
  } finally { actionLoading.value = null }
}

function openBanDialog(user) {
  banTarget.value = user
  banReason.value = ''
  banDialog.value = true
}

async function confirmBan() {
  if (!banTarget.value) return
  actionLoading.value = banTarget.value.id + '_ban'
  try {
    await adminApi.updatePhotographerStatus(banTarget.value.id, 'banned')
    banTarget.value.status    = 'banned'
    banTarget.value.is_active = false
    banDialog.value = false
    appStore.notify(`${banTarget.value.name} has been permanently banned`, 'error')
  } catch (e) {
    appStore.notify(e.response?.data?.message || 'Ban failed', 'error')
  } finally { actionLoading.value = null }
}

onMounted(loadUsers)
</script>

<style scoped>
.filter-card { border: 1px solid rgba(0,0,0,0.07) !important; }
.users-card  { border: 1px solid rgba(0,0,0,0.07) !important; }
.user-row    { border-bottom: 1px solid rgba(0,0,0,0.05); }
.user-row:last-child { border-bottom: none; }
.user-row:hover { background: rgba(0,0,0,0.015); }
</style>
