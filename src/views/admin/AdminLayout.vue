<template>
  <v-layout>
    <NavBar />

    <!-- Admin Sidebar -->
    <v-navigation-drawer permanent width="260" color="surface" border="r">

      <!-- Admin identity card -->
      <div class="admin-identity pa-5">
        <div class="d-flex align-center gap-3">
          <v-avatar size="44" color="primary">
            <span class="text-white font-weight-bold">{{ adminInitials }}</span>
          </v-avatar>
          <div>
            <p class="text-body-2 font-weight-bold">{{ authStore.user?.name }}</p>
            <v-chip color="error" size="x-small" label class="mt-1">
              <v-icon start size="10">mdi-shield-account</v-icon>
              Administrator
            </v-chip>
          </div>
        </div>
      </div>

      <v-divider />

      <!-- Nav sections -->
      <div class="pa-3 pt-2">
        <p class="nav-section-label mt-3">Overview</p>
        <v-list density="compact" nav class="pa-0">
          <v-list-item
            v-for="item in overviewNav"
            :key="item.label"
            :to="item.to"
            :prepend-icon="item.icon"
            :title="item.label"
            rounded="lg"
            active-color="primary"
            class="mb-1"
          />
        </v-list>

        <p class="nav-section-label mt-4">Management</p>
        <v-list density="compact" nav class="pa-0">
          <v-list-item
            v-for="item in managementNav"
            :key="item.label"
            :to="item.to"
            :prepend-icon="item.icon"
            :title="item.label"
            rounded="lg"
            active-color="primary"
            class="mb-1"
          />
        </v-list>

        <p class="nav-section-label mt-4">Content</p>
        <v-list density="compact" nav class="pa-0">
          <v-list-item
            v-for="item in contentNav"
            :key="item.label"
            :to="item.to"
            :prepend-icon="item.icon"
            :title="item.label"
            rounded="lg"
            active-color="primary"
            class="mb-1"
          />
        </v-list>
      </div>

      <!-- Bottom: logout -->
      <template #append>
        <div class="pa-4">
          <v-btn
            block variant="tonal" color="error" rounded="lg" size="small"
            prepend-icon="mdi-logout"
            @click="handleLogout"
          >
            Sign Out
          </v-btn>
        </div>
      </template>
    </v-navigation-drawer>

    <!-- Main content -->
    <v-main style="background: rgb(var(--v-theme-background))">
      <v-container style="max-width:1200px" class="py-8">
        <router-view />
      </v-container>
    </v-main>
  </v-layout>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import NavBar from '@/components/shared/NavBar.vue'
import { useAuthStore } from '@/stores/auth'

const router    = useRouter()
const authStore = useAuthStore()

const adminInitials = computed(() => {
  const n = authStore.user?.name || ''
  return n.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
})

const overviewNav = [
  { label: 'Dashboard',    icon: 'mdi-view-dashboard-outline', to: { name: 'AdminDashboard' } },
  { label: 'Activity Feed',icon: 'mdi-pulse',                  to: { name: 'AdminActivity' } },
]
const managementNav = [
  { label: 'Photographers', icon: 'mdi-camera-account',              to: { name: 'AdminPhotographers' } },
  { label: 'All Users',     icon: 'mdi-account-group-outline',       to: { name: 'AdminUsers' } },
  { label: 'Ratings',       icon: 'mdi-star-outline',                to: { name: 'AdminRatings' } },
  { label: 'Reports',       icon: 'mdi-flag-outline',                to: { name: 'AdminReports' } },
  { label: 'Subscriptions', icon: 'mdi-crown-outline',               to: { name: 'AdminSubscriptions' } },
]
const contentNav = [
  { label: 'Categories', icon: 'mdi-tag-multiple-outline',        to: { name: 'AdminCategories' } },
  { label: 'Locations',  icon: 'mdi-map-marker-multiple-outline', to: { name: 'AdminLocations' } },
]

async function handleLogout() {
  await authStore.logout()
  router.push({ name: 'Login' })
}
</script>

<style scoped>
.admin-identity { background: rgba(var(--v-theme-primary), 0.04); }
.nav-section-label {
  font-size: 0.62rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: 1.2px;
  color: rgba(var(--v-theme-on-surface), 0.35);
  padding: 0 8px; margin-bottom: 6px;
}
.gap-3 { gap: 12px; }
</style>
