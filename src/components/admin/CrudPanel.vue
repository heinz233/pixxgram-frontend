<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-6">
      <h2 class="text-h6 font-weight-bold">{{ title }}</h2>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreate">Add {{ singular }}</v-btn>
    </div>

    <v-card rounded="xl" class="admin-table">
      <v-data-table
        :headers="headers"
        :items="items"
        :loading="loading"
        rounded="xl"
      >
        <template #item.actions="{ item }">
          <div class="d-flex gap-2">
            <v-btn icon size="x-small" variant="text" color="primary" @click="openEdit(item)">
              <v-icon size="16">mdi-pencil-outline</v-icon>
            </v-btn>
            <v-btn icon size="x-small" variant="text" color="error"
              :loading="deleteLoading === item.id"
              @click="confirmDelete(item)"
            >
              <v-icon size="16">mdi-trash-can-outline</v-icon>
            </v-btn>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Create / Edit Dialog -->
    <v-dialog v-model="dialog" max-width="420" rounded="xl">
      <v-card rounded="xl" class="pa-6">
        <h3 class="text-subtitle-1 font-weight-bold mb-5">
          {{ editing ? 'Edit' : 'Add' }} {{ singular }}
        </h3>
        <v-form ref="formRef" @submit.prevent="save">
          <slot name="fields" :form="form" />
          <v-alert v-if="formError" type="error" variant="tonal" density="compact" rounded="lg" class="mb-4">
            {{ formError }}
          </v-alert>
          <div class="d-flex gap-3 mt-2">
            <v-btn variant="text" @click="dialog = false" class="flex-grow-1">Cancel</v-btn>
            <v-btn type="submit" color="primary" :loading="saving" class="flex-grow-1">Save</v-btn>
          </div>
        </v-form>
      </v-card>
    </v-dialog>

    <!-- Delete Confirm Dialog -->
    <v-dialog v-model="deleteDialog" max-width="360" rounded="xl">
      <v-card rounded="xl" class="pa-6 text-center">
        <v-icon size="48" color="error" class="mb-3">mdi-trash-can-outline</v-icon>
        <h3 class="text-subtitle-1 font-weight-bold mb-2">Delete {{ singular }}?</h3>
        <p class="text-body-2 text-medium-emphasis mb-6">This action cannot be undone.</p>
        <div class="d-flex gap-3">
          <v-btn variant="text" @click="deleteDialog = false" class="flex-grow-1">Cancel</v-btn>
          <v-btn color="error" :loading="deleteLoading === deletingItem?.id" @click="doDelete" class="flex-grow-1">Delete</v-btn>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAppStore } from '@/stores/app'

const props = defineProps({
  title:    { type: String, required: true },
  singular: { type: String, required: true },
  headers:  { type: Array,  required: true },
  items:    { type: Array,  default: () => [] },
  loading:  { type: Boolean, default: false },
  emptyForm:{ type: Object, default: () => ({}) },
})

const emit = defineEmits(['create', 'update', 'delete'])

const appStore    = useAppStore()
const dialog      = ref(false)
const deleteDialog= ref(false)
const formRef     = ref(null)
const saving      = ref(false)
const deleteLoading = ref(null)
const formError   = ref('')
const editing     = ref(null)
const deletingItem= ref(null)
const form        = ref({ ...props.emptyForm })

function openCreate() {
  editing.value = null
  form.value    = { ...props.emptyForm }
  formError.value = ''
  dialog.value  = true
}

function openEdit(item) {
  editing.value = item
  form.value    = { ...item }
  formError.value = ''
  dialog.value  = true
}

function confirmDelete(item) {
  deletingItem.value = item
  deleteDialog.value = true
}

async function save() {
  const { valid } = await formRef.value.validate()
  if (!valid) return
  saving.value = true; formError.value = ''
  try {
    if (editing.value) {
      emit('update', { id: editing.value.id, data: form.value })
    } else {
      emit('create', form.value)
    }
    dialog.value = false
  } catch (e) {
    formError.value = e.response?.data?.message || 'Save failed'
  } finally {
    saving.value = false
  }
}

async function doDelete() {
  deleteLoading.value = deletingItem.value.id
  try {
    emit('delete', deletingItem.value.id)
    deleteDialog.value = false
  } catch (e) {
    appStore.notify(e.response?.data?.message || 'Delete failed', 'error')
  } finally {
    deleteLoading.value = null
  }
}
</script>
<style scoped>
.admin-table { border: 1px solid rgba(0,0,0,0.07) !important; }
.gap-2 { gap: 8px; }
.gap-3 { gap: 12px; }
</style>
