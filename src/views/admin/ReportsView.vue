<template>
  <div>
    <h2 class="text-h6 font-weight-bold mb-6">Reports</h2>

    <v-tabs v-model="tab" color="primary" class="mb-6">
      <v-tab value="pending">Pending</v-tab>
      <v-tab value="resolved">Resolved</v-tab>
      <v-tab value="dismissed">Dismissed</v-tab>
    </v-tabs>

    <div v-if="loading" class="text-center py-10">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <div v-else-if="!filtered.length" class="text-center py-16">
      <v-icon size="64" color="medium-emphasis">mdi-flag-off-outline</v-icon>
      <p class="mt-4 text-medium-emphasis">No {{ tab }} reports.</p>
    </div>

    <v-row v-else>
      <v-col v-for="report in filtered" :key="report.id" cols="12" md="6">
        <v-card rounded="xl" class="report-card pa-5">
          <div class="d-flex align-start justify-space-between mb-3">
            <div>
              <v-chip :color="statusColor(report.status)" size="x-small" label class="mb-2">
                {{ report.status }}
              </v-chip>
              <p class="text-body-2 font-weight-semibold">{{ report.reason }}</p>
            </div>
            <span class="text-caption text-medium-emphasis">
              {{ new Date(report.created_at).toLocaleDateString() }}
            </span>
          </div>

          <div class="report-parties mb-3">
            <div class="party-row">
              <v-icon size="14" color="medium-emphasis">mdi-account-outline</v-icon>
              <span class="text-caption text-medium-emphasis">Client:</span>
              <span class="text-caption font-weight-medium">{{ report.client?.name }}</span>
            </div>
            <div class="party-row">
              <v-icon size="14" color="medium-emphasis">mdi-camera-outline</v-icon>
              <span class="text-caption text-medium-emphasis">Photographer:</span>
              <span class="text-caption font-weight-medium">{{ report.photographer?.name }}</span>
            </div>
          </div>

          <p v-if="report.description" class="text-caption text-medium-emphasis pa-3 rounded-lg mb-3"
             style="background:rgba(0,0,0,0.04)">
            {{ report.description }}
          </p>

          <div v-if="report.status === 'pending'" class="d-flex gap-2">
            <v-btn
              color="success" size="small" variant="tonal" rounded="lg"
              :loading="actionLoading === report.id + 'resolve'"
              @click="resolve(report)"
            >Resolve</v-btn>
            <v-btn
              color="error" size="small" variant="tonal" rounded="lg"
              :loading="actionLoading === report.id + 'dismiss'"
              @click="dismiss(report)"
            >Dismiss</v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { adminApi } from '@/api/admin'
import { useAppStore } from '@/stores/app'

const appStore     = useAppStore()
const loading      = ref(true)
const reports      = ref([])
const tab          = ref('pending')
const actionLoading = ref(null)

const filtered = computed(() =>
  reports.value.filter(r => r.status === tab.value)
)
const statusColor = s => ({ pending: 'warning', resolved: 'success', dismissed: 'default' }[s])

async function resolve(report) {
  actionLoading.value = report.id + 'resolve'
  try {
    await adminApi.resolveReport(report.id)
    report.status = 'resolved'
    appStore.notify('Report resolved')
  } catch (e) {
    appStore.notify(e.response?.data?.message || 'Failed', 'error')
  } finally { actionLoading.value = null }
}

async function dismiss(report) {
  actionLoading.value = report.id + 'dismiss'
  try {
    await adminApi.dismissReport(report.id)
    report.status = 'dismissed'
    appStore.notify('Report dismissed')
  } catch (e) {
    appStore.notify(e.response?.data?.message || 'Failed', 'error')
  } finally { actionLoading.value = null }
}

onMounted(async () => {
  try {
    const { data } = await adminApi.reports()
    reports.value = data.data || []
  } catch (_) {}
  finally { loading.value = false }
})
</script>

<style scoped>
.report-card { border: 1px solid rgba(0,0,0,0.07) !important; }
.report-parties { display: flex; flex-direction: column; gap: 4px; }
.party-row { display: flex; align-items: center; gap: 6px; }
.gap-2 { gap: 8px; }
</style>
