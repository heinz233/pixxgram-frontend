<template>
  <div>
    <!-- Header -->
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <h2 class="text-h6 font-weight-bold">Categories</h2>
        <p class="text-medium-emphasis text-body-2 mt-1">
          Manage photography categories
        </p>
      </div>
      <v-btn color="primary" rounded="lg" prepend-icon="mdi-plus"
        @click="openCreate">
        Add Category
      </v-btn>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-12">
      <v-progress-circular indeterminate color="primary" size="44" />
      <p class="mt-4 text-medium-emphasis">Loading categories...</p>
    </div>

    <!-- Error -->
    <v-alert v-else-if="loadError" type="error" variant="tonal" rounded="xl" class="mb-4">
      <p class="font-weight-bold mb-1">Could not load categories</p>
      <p class="text-body-2 mb-3">{{ loadError }}</p>
      <v-btn size="small" color="error" variant="tonal" @click="fetchCategories">Retry</v-btn>
    </v-alert>

    <!-- Table card -->
    <v-card v-else rounded="xl" class="table-card">

      <!-- Table header -->
      <div class="table-header d-flex align-center px-5 py-3">
        <span class="text-caption font-weight-bold text-medium-emphasis" style="width:30%">NAME</span>
        <span class="text-caption font-weight-bold text-medium-emphasis" style="width:25%">SLUG</span>
        <span class="text-caption font-weight-bold text-medium-emphasis flex-grow-1">DESCRIPTION</span>
        <span class="text-caption font-weight-bold text-medium-emphasis" style="width:100px;text-align:right">ACTIONS</span>
      </div>

      <!-- Empty -->
      <div v-if="!categories.length" class="text-center py-12">
        <v-icon size="52" color="medium-emphasis">mdi-tag-off-outline</v-icon>
        <p class="mt-3 text-medium-emphasis">No categories yet.</p>
        <v-btn color="primary" variant="tonal" class="mt-3" rounded="lg" @click="openCreate">
          Add First Category
        </v-btn>
      </div>

      <!-- Rows -->
      <div v-else>
        <div
          v-for="cat in categories"
          :key="cat.id"
          class="table-row d-flex align-center px-5 py-4"
        >
          <div style="width:30%">
            <p class="text-body-2 font-weight-semibold">{{ cat.name }}</p>
          </div>
          <div style="width:25%">
            <v-chip size="x-small" variant="tonal" color="primary">{{ cat.slug }}</v-chip>
          </div>
          <div class="flex-grow-1 min-width-0 pr-4">
            <p class="text-body-2 text-medium-emphasis text-truncate">
              {{ cat.description || '—' }}
            </p>
          </div>
          <div class="d-flex" style="gap:6px;width:100px;justify-content:flex-end">
            <v-btn icon size="small" variant="text" color="primary" @click="openEdit(cat)">
              <v-icon size="16">mdi-pencil-outline</v-icon>
            </v-btn>
            <v-btn icon size="small" variant="text" color="error"
              :loading="deleteLoading === cat.id"
              @click="confirmDelete(cat)">
              <v-icon size="16">mdi-trash-can-outline</v-icon>
            </v-btn>
          </div>
        </div>
      </div>
    </v-card>

    <!-- Create / Edit Dialog -->
    <v-dialog v-model="dialog" max-width="440" persistent>
      <v-card rounded="xl" class="pa-6">
        <div class="d-flex align-center justify-space-between mb-5">
          <h3 class="text-subtitle-1 font-weight-bold">
            {{ editing ? 'Edit' : 'Add' }} Category
          </h3>
          <v-btn icon size="small" variant="text" @click="dialog = false" :disabled="saving">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>

        <v-form ref="formRef" @submit.prevent="save">
          <v-text-field
            v-model="form.name"
            label="Name"
            placeholder="e.g. Wedding Photography"
            prepend-inner-icon="mdi-tag-outline"
            :rules="[v => !!v || 'Name is required']"
            variant="outlined" rounded="lg" class="mb-3"
          />
          <v-text-field
            v-model="form.slug"
            label="Slug (auto-generated if blank)"
            placeholder="e.g. wedding-photography"
            prepend-inner-icon="mdi-link-variant"
            variant="outlined" rounded="lg" class="mb-3"
          />
          <v-textarea
            v-model="form.description"
            label="Description (optional)"
            rows="2"
            variant="outlined" rounded="lg" class="mb-4"
          />

          <v-alert v-if="formError" type="error" variant="tonal" rounded="xl" density="compact" class="mb-4">
            {{ formError }}
          </v-alert>

          <div class="d-flex" style="gap:12px">
            <v-btn variant="outlined" rounded="lg" class="flex-grow-1"
              :disabled="saving" @click="dialog = false">
              Cancel
            </v-btn>
            <v-btn type="submit" color="primary" rounded="lg" class="flex-grow-1" :loading="saving">
              {{ editing ? 'Update' : 'Create' }} Category
            </v-btn>
          </div>
        </v-form>
      </v-card>
    </v-dialog>

    <!-- Delete Confirm -->
    <v-dialog v-model="deleteDialog" max-width="380">
      <v-card rounded="xl" class="pa-7 text-center">
        <v-icon size="48" color="error" class="mb-3">mdi-trash-can-outline</v-icon>
        <h3 class="text-subtitle-1 font-weight-bold mb-2">Delete Category?</h3>
        <p class="text-body-2 text-medium-emphasis mb-6">
          "<strong>{{ deleteTarget?.name }}</strong>" will be permanently removed.
        </p>
        <div class="d-flex" style="gap:12px">
          <v-btn variant="text" @click="deleteDialog = false" class="flex-grow-1">Cancel</v-btn>
          <v-btn color="error" rounded="lg" class="flex-grow-1"
            :loading="deleteLoading === deleteTarget?.id"
            @click="doDelete">
            Delete
          </v-btn>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api/axios'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()

const loading      = ref(true)
const loadError    = ref('')
const categories   = ref([])
const dialog       = ref(false)
const deleteDialog = ref(false)
const formRef      = ref(null)
const saving       = ref(false)
const deleteLoading= ref(null)
const formError    = ref('')
const editing      = ref(null)
const deleteTarget = ref(null)

const form = ref({ name: '', slug: '', description: '' })

// ── load ───────────────────────────────────────────────────────────
async function fetchCategories() {
  loading.value   = true
  loadError.value = ''
  try {
    const { data } = await api.get('/admin/categories')
    categories.value = Array.isArray(data) ? data : (data?.data || [])
  } catch (e) {
    const s = e.response?.status
    if (s === 403)        loadError.value = 'Access denied. Make sure you are logged in as admin.'
    else if (!e.response) loadError.value = 'Cannot reach server. Is Laravel running?'
    else                  loadError.value = e.response?.data?.message || `Error ${s}`
  } finally { loading.value = false }
}

// ── form helpers ───────────────────────────────────────────────────
function openCreate() {
  editing.value   = null
  form.value      = { name: '', slug: '', description: '' }
  formError.value = ''
  dialog.value    = true
}

function openEdit(cat) {
  editing.value   = cat
  form.value      = { name: cat.name, slug: cat.slug || '', description: cat.description || '' }
  formError.value = ''
  dialog.value    = true
}

function confirmDelete(cat) {
  deleteTarget.value = cat
  deleteDialog.value = true
}

// ── save ───────────────────────────────────────────────────────────
async function save() {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  saving.value    = true
  formError.value = ''
  try {
    if (editing.value) {
      const { data } = await api.put(`/admin/categories/${editing.value.id}`, form.value)
      const idx = categories.value.findIndex(c => c.id === editing.value.id)
      if (idx !== -1) categories.value[idx] = data
      appStore.notify('Category updated')
    } else {
      const { data } = await api.post('/admin/categories', form.value)
      categories.value.unshift(data)
      appStore.notify('Category created')
    }
    dialog.value = false
  } catch (e) {
    const errs = e.response?.data?.errors || {}
    formError.value = Object.values(errs).flat()[0] ||
      e.response?.data?.message || 'Save failed. Please try again.'
  } finally { saving.value = false }
}

// ── delete ─────────────────────────────────────────────────────────
async function doDelete() {
  deleteLoading.value = deleteTarget.value.id
  try {
    await api.delete(`/admin/categories/${deleteTarget.value.id}`)
    categories.value = categories.value.filter(c => c.id !== deleteTarget.value.id)
    deleteDialog.value = false
    appStore.notify('Category deleted')
  } catch (e) {
    appStore.notify(e.response?.data?.message || 'Delete failed', 'error')
  } finally { deleteLoading.value = null }
}

onMounted(fetchCategories)
</script>

<style scoped>
.table-card { border: 1px solid rgba(0,0,0,0.07) !important; }
.table-header { border-bottom: 1px solid rgba(0,0,0,0.07); background: rgba(0,0,0,0.02); }
.table-row { border-bottom: 1px solid rgba(0,0,0,0.05); }
.table-row:last-child { border-bottom: none; }
.table-row:hover { background: rgba(0,0,0,0.015); }
</style>