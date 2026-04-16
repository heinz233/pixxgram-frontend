<template>
  <v-dialog v-model="model" max-width="480" rounded="xl">
    <v-card rounded="xl" class="pa-6">
      <div class="d-flex align-center gap-2 mb-5">
        <v-icon color="error">mdi-flag-outline</v-icon>
        <h3 class="text-subtitle-1 font-weight-bold">Report Photographer</h3>
      </div>
      <v-form ref="formRef" @submit.prevent="submit">
        <v-select
          v-model="form.reason"
          label="Reason for report"
          :items="reasons"
          :rules="[v => !!v || 'Please select a reason']"
          class="mb-3"
        />
        <v-textarea
          v-model="form.description"
          label="Additional details"
          placeholder="Describe the issue..."
          rows="4"
          :rules="[v => !!v || 'Please provide details', v => v.length >= 20 || 'At least 20 characters']"
          class="mb-4"
        />
        <v-alert v-if="error" type="error" variant="tonal" density="compact" rounded="lg" class="mb-4">{{ error }}</v-alert>
        <v-alert v-if="success" type="success" variant="tonal" density="compact" rounded="lg" class="mb-4">
          Report submitted. Our team will review it shortly.
        </v-alert>
        <div class="d-flex gap-3">
          <v-btn variant="text" @click="model = false" class="flex-grow-1">Cancel</v-btn>
          <v-btn type="submit" color="error" :loading="loading" class="flex-grow-1" :disabled="success">Submit Report</v-btn>
        </div>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import api from '@/api/axios'

const props = defineProps({
  modelValue:     { type: Boolean, default: false },
  photographerId: { type: [Number, String], required: true },
})
const emit = defineEmits(['update:modelValue'])
const model   = computed({ get: () => props.modelValue, set: v => emit('update:modelValue', v) })
const formRef = ref(null)
const loading = ref(false), error = ref(''), success = ref(false)
const form = ref({ reason: '', description: '' })

const reasons = [
  'Inappropriate behaviour', 'Fake profile / photos',
  'No-show / didn\'t deliver', 'Harassment',
  'Scam / fraud', 'Other',
]

async function submit() {
  const { valid } = await formRef.value.validate()
  if (!valid) return
  loading.value = true; error.value = ''
  try {
    await api.post('/reports', { photographer_id: props.photographerId, ...form.value })
    success.value = true
    setTimeout(() => { model.value = false; success.value = false; form.value = { reason: '', description: '' } }, 2000)
  } catch (e) { error.value = e.response?.data?.message || 'Failed to submit report' }
  finally { loading.value = false }
}
</script>
<style scoped>.gap-2{gap:8px}.gap-3{gap:12px}</style>
