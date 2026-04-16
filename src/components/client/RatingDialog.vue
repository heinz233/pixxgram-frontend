<template>
  <v-dialog v-model="model" max-width="420" rounded="xl">
    <v-card rounded="xl" class="pa-6">
      <h3 class="text-subtitle-1 font-weight-bold mb-1">Leave a Review</h3>
      <p class="text-caption text-medium-emphasis mb-5">Share your experience</p>
      <v-form ref="formRef" @submit.prevent="submit">
        <div class="text-center mb-4">
          <v-rating v-model="form.stars" color="secondary" size="36" hover />
          <p class="text-caption text-medium-emphasis mt-1">{{ ratingLabel }}</p>
        </div>
        <v-textarea v-model="form.comment" label="Comment (optional)" rows="3" class="mb-4" />
        <v-alert v-if="error" type="error" variant="tonal" density="compact" rounded="lg" class="mb-4">{{ error }}</v-alert>
        <div class="d-flex gap-3">
          <v-btn variant="text" @click="model = false" class="flex-grow-1">Cancel</v-btn>
          <v-btn type="submit" color="secondary" :loading="loading" class="flex-grow-1">Submit</v-btn>
        </div>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { photographersApi } from '@/api/photographers'

const props = defineProps({
  modelValue:     { type: Boolean, default: false },
  photographerId: { type: [Number, String], required: true },
})
const emit = defineEmits(['update:modelValue', 'rated'])
const model   = computed({ get: () => props.modelValue, set: v => emit('update:modelValue', v) })
const formRef = ref(null)
const loading = ref(false)
const error   = ref('')
const form    = ref({ stars: 0, comment: '' })

const labels  = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent']
const ratingLabel = computed(() => labels[form.value.stars] || 'Tap to rate')

async function submit() {
  if (!form.value.stars) { error.value = 'Please select a rating'; return }
  loading.value = true; error.value = ''
  try {
    await photographersApi.rate(props.photographerId, form.value)
    emit('rated'); model.value = false
    form.value = { stars: 0, comment: '' }
  } catch (e) {
    error.value = e.response?.data?.message || 'Failed to submit rating'
  } finally { loading.value = false }
}
</script>
<style scoped>.gap-3{gap:12px}</style>
