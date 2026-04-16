<template>
  <CrudPanel
    title="Locations"
    singular="Location"
    :headers="headers"
    :items="locations"
    :loading="loading"
    :empty-form="{ name: '', region: '' }"
    @create="onCreate"
    @update="onUpdate"
    @delete="onDelete"
  >
    <template #fields="{ form }">
      <v-text-field
        v-model="form.name"
        label="Location name"
        :rules="[v => !!v || 'Required']"
        class="mb-3"
      />
      <v-text-field
        v-model="form.region"
        label="Region / County"
        class="mb-3"
      />
    </template>
  </CrudPanel>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import CrudPanel from '@/components/admin/CrudPanel.vue'
import { adminApi } from '@/api/admin'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()
const loading  = ref(true)
const locations = ref([])

const headers = [
  { title: 'Name',   key: 'name' },
  { title: 'Region', key: 'region' },
  { title: 'Active', key: 'is_active' },
  { title: 'Actions', key: 'actions', sortable: false },
]

async function fetchLocations() {
  loading.value = true
  try {
    const { data } = await adminApi.locations()
    locations.value = Array.isArray(data) ? data : data.data || []
  } catch (_) {}
  finally { loading.value = false }
}

async function onCreate(formData) {
  try {
    const { data } = await adminApi.createLocation(formData)
    locations.value.unshift(data.location || data)
    appStore.notify('Location created')
  } catch (e) { appStore.notify(e.response?.data?.message || 'Failed', 'error'); throw e }
}

async function onUpdate({ id, data: formData }) {
  try {
    const { data } = await adminApi.updateLocation(id, formData)
    const idx = locations.value.findIndex(l => l.id === id)
    if (idx !== -1) locations.value[idx] = data.location || data
    appStore.notify('Location updated')
  } catch (e) { appStore.notify(e.response?.data?.message || 'Failed', 'error'); throw e }
}

async function onDelete(id) {
  try {
    await adminApi.deleteLocation(id)
    locations.value = locations.value.filter(l => l.id !== id)
    appStore.notify('Location deleted')
  } catch (e) { appStore.notify(e.response?.data?.message || 'Failed', 'error') }
}

onMounted(fetchLocations)
</script>
