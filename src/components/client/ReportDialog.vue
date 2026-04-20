<template>
  <v-dialog v-model="model" max-width="500" persistent>
    <v-card rounded="xl" class="pa-6">

      <!-- Header -->
      <div class="d-flex align-center justify-space-between mb-4">
        <div>
          <h3 class="text-subtitle-1 font-weight-bold">Report Photographer</h3>
          <p class="text-caption text-medium-emphasis mt-1">
            Report <strong>{{ photographerName }}</strong> to our team
          </p>
        </div>
        <v-btn icon size="small" variant="text" @click="close" :disabled="submitting">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>

      <!-- Info banner -->
      <v-alert color="info" variant="tonal" rounded="xl" density="compact" class="mb-5"
        prepend-icon="mdi-information-outline">
        <span class="text-body-2">
          Reports are reviewed by our admin team within 24–48 hours.
          False reports may result in account suspension.
        </span>
      </v-alert>

      <v-form ref="formRef" @submit.prevent="submit">

        <!-- Reason -->
        <v-select
          v-model="form.reason"
          label="Reason for report"
          :items="reasons"
          item-title="label"
          item-value="value"
          prepend-inner-icon="mdi-flag-outline"
          :rules="[v => !!v || 'Please select a reason']"
          variant="outlined" rounded="lg"
          class="mb-4"
        />

        <!-- Description -->
        <v-textarea
          v-model="form.description"
          label="Additional details (optional)"
          placeholder="Describe what happened in detail. The more information you provide, the faster we can review your report."
          rows="4"
          counter="1000"
          maxlength="1000"
          variant="outlined" rounded="lg"
          class="mb-4"
        />

        <!-- Error -->
        <v-alert v-if="submitError" type="error" variant="tonal"
          rounded="xl" density="compact" class="mb-4">
          {{ submitError }}
        </v-alert>

        <!-- Actions -->
        <div class="d-flex" style="gap:12px">
          <v-btn variant="outlined" rounded="lg" class="flex-grow-1"
            :disabled="submitting" @click="close">
            Cancel
          </v-btn>
          <v-btn type="submit" color="error" rounded="lg" class="flex-grow-1"
            :loading="submitting">
            <v-icon start>mdi-flag</v-icon>
            Submit Report
          </v-btn>
        </div>

      </v-form>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import api from '@/api/axios'
import { useAppStore } from '@/stores/app'

const props = defineProps({
  modelValue:     { type: Boolean, default: false },
  photographerId: { type: [Number, String], required: true },
  photographerName: { type: String, default: 'this photographer' },
})
const emit = defineEmits(['update:modelValue', 'reported'])

const appStore = useAppStore()

const model = computed({
  get: () => props.modelValue,
  set: v  => emit('update:modelValue', v),
})

const formRef    = ref(null)
const submitting = ref(false)
const submitError= ref('')

const form = ref({ reason: '', description: '' })

const reasons = [
  { label: '🚫 Inappropriate behavior',   value: 'inappropriate_behavior' },
  { label: '💸 Scam or fraud',             value: 'scam_or_fraud' },
  { label: '🚶 No-show / didn\'t arrive', value: 'no_show' },
  { label: '📷 Poor quality work',         value: 'poor_quality' },
  { label: '😡 Harassment',               value: 'harassment' },
  { label: '🎭 Fake profile',              value: 'fake_profile' },
  { label: '❓ Other',                     value: 'other' },
]

function close() {
  if (submitting.value) return
  model.value = false
  form.value  = { reason: '', description: '' }
  submitError.value = ''
  formRef.value?.resetValidation()
}

async function submit() {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  submitting.value  = true
  submitError.value = ''

  try {
    await api.post(`/photographers/${props.photographerId}/report`, {
      reason:      form.value.reason,
      description: form.value.description || null,
    })

    emit('reported')
    close()
    appStore.notify(
      'Report submitted. Our team will review it within 24–48 hours.',
      'success'
    )
  } catch (e) {
    const s   = e.response?.status
    const msg = e.response?.data?.message || ''

    if (s === 409) {
      submitError.value = msg || 'You already have a pending report against this photographer.'
    } else if (s === 403) {
      submitError.value = 'Only clients can submit reports.'
    } else if (s === 422) {
      const errs = e.response?.data?.errors || {}
      submitError.value = Object.values(errs).flat()[0] || msg || 'Validation failed.'
    } else if (!e.response) {
      submitError.value = 'Cannot reach server. Is Laravel running?'
    } else {
      submitError.value = msg || 'Failed to submit report. Please try again.'
    }
  } finally {
    submitting.value = false
  }
}
</script>
