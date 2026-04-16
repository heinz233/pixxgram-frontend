<template>
  <CrudPanel
    title="Categories"
    singular="Category"
    :headers="headers"
    :items="categories"
    :loading="loading"
    :empty-form="{ name: '', slug: '', description: '' }"
    @create="onCreate"
    @update="onUpdate"
    @delete="onDelete"
  >
    <template #fields="{ form }">
      <v-text-field
        v-model="form.name"
        label="Name"
        :rules="[v => !!v || 'Required']"
        class="mb-3"
      />
      <v-text-field
        v-model="form.slug"
        label="Slug (auto-generated if blank)"
        class="mb-3"
      />
      <v-textarea
        v-model="form.description"
        label="Description"
        rows="2"
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

const appStore   = useAppStore()
const loading    = ref(true)
const categories = ref([])

const headers = [
  { title: 'Name',        key: 'name' },
  { title: 'Slug',        key: 'slug' },
  { title: 'Description', key: 'description' },
  { title: 'Actions',     key: 'actions', sortable: false },
]

async function fetchCategories() {
  loading.value = true
  try {
    const { data } = await adminApi.categories()
    categories.value = data
  } catch (_) {}
  finally { loading.value = false }
}

async function onCreate(formData) {
  try {
    const { data } = await adminApi.createCategory(formData)
    categories.value.unshift(data)
    appStore.notify('Category created')
  } catch (e) { appStore.notify(e.response?.data?.message || 'Failed', 'error'); throw e }
}

async function onUpdate({ id, data: formData }) {
  try {
    const { data } = await adminApi.updateCategory(id, formData)
    const idx = categories.value.findIndex(c => c.id === id)
    if (idx !== -1) categories.value[idx] = data
    appStore.notify('Category updated')
  } catch (e) { appStore.notify(e.response?.data?.message || 'Failed', 'error'); throw e }
}

async function onDelete(id) {
  try {
    await adminApi.deleteCategory(id)
    categories.value = categories.value.filter(c => c.id !== id)
    appStore.notify('Category deleted')
  } catch (e) { appStore.notify(e.response?.data?.message || 'Failed', 'error') }
}

onMounted(fetchCategories)
</script>
