<template>
  <v-dialog v-model="model" max-width="480" rounded="xl">
    <v-card rounded="xl" class="pa-6">
      <h3 class="text-subtitle-1 font-weight-bold mb-1">Book {{ photographer.name }}</h3>
      <p class="text-caption text-medium-emphasis mb-5">Select a date and add any notes</p>

      <v-form ref="formRef" @submit.prevent="submit">
        <v-text-field
          v-model="form.booking_date"
          label="Date & Time"
          type="datetime-local"
          prepend-inner-icon="mdi-calendar"
          :rules="[rules.required]"
          :min="minDate"
          class="mb-3"
        />
        <v-textarea
          v-model="form.notes"
          label="Notes (optional)"
          placeholder="Describe what you need..."
          rows="3"
          class="mb-4"
        />
        <v-alert v-if="error" type="error" variant="tonal" density="compact" rounded="lg" class="mb-4">
          {{ error }}
        </v-alert>
        <div class="d-flex gap-3">
          <v-btn variant="text" @click="model = false" class="flex-grow-1">Cancel</v-btn>
          <v-btn type="submit" color="primary" :loading="loading" class="flex-grow-1">Confirm Booking</v-btn>
        </div>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { bookingsApi } from '@/api/bookings'

const props = defineProps({
  modelValue:   { type: Boolean, default: false },
  photographer: { type: Object, required: true },
})
const emit = defineEmits(['update:modelValue', 'booked'])

const model   = computed({ get: () => props.modelValue, set: v => emit('update:modelValue', v) })
const formRef = ref(null)
const loading = ref(false)
const error   = ref('')
const form    = ref({ booking_date: '', notes: '' })

const minDate = new Date(Date.now() + 3600000).toISOString().slice(0, 16)
const rules   = { required: v => !!v || 'Required' }

async function submit() {
  const { valid } = await formRef.value.validate()
  if (!valid) return
  loading.value = true
  error.value   = ''
  try {
    await bookingsApi.create({
      photographer_id: props.photographer.id,
      booking_date:    form.value.booking_date,
      notes:           form.value.notes,
    })
    emit('booked')
    model.value = false
    form.value  = { booking_date: '', notes: '' }
  } catch (e) {
    error.value = e.response?.data?.message || 'Booking failed'
  } finally {
    loading.value = false
  }
}
</script>
<style scoped>
.gap-3 { gap: 12px; }
</style>
