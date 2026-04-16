<template>
  <div>
    <NavBar />
    <v-container style="max-width:1100px" class="py-8">
      <!-- Sub-nav tabs for client -->
      <div class="client-tabs mb-6">
        <v-btn
          v-for="tab in tabs"
          :key="tab.name"
          variant="text"
          size="small"
          :to="tab.to"
          :active="$route.name === tab.name"
          active-color="primary"
          class="mr-1"
        >
          <v-icon start size="16">{{ tab.icon }}</v-icon>
          {{ tab.label }}
        </v-btn>
      </div>
      <router-view />
    </v-container>
  </div>
</template>

<script setup>
import NavBar from '@/components/shared/NavBar.vue'

const tabs = [
  { name: 'ClientBookings', label: 'My Bookings', icon: 'mdi-calendar-check-outline', to: { name: 'ClientBookings' } },
  { name: 'ClientMessages', label: 'Messages',    icon: 'mdi-message-outline',         to: { name: 'ClientMessages' } },
  { name: 'ClientProfile',  label: 'My Profile',  icon: 'mdi-account-outline',         to: { name: 'ClientProfile' } },
]
</script>

<style scoped>
.client-tabs {
  border-bottom: 1px solid rgba(0,0,0,0.08);
  padding-bottom: 8px;
}
</style>
