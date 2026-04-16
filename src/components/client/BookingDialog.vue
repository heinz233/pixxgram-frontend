<template>
  <v-dialog v-model="model" max-width="500" persistent>
    <v-card rounded="xl" class="pa-6">

      <!-- Header -->
      <div class="d-flex align-center justify-space-between mb-1">
        <h3 class="text-subtitle-1 font-weight-bold">
          Book {{ photographer?.name }}
        </h3>
        <v-btn icon size="small" variant="text" @click="close">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>
      <p class="text-caption text-medium-emphasis mb-5">
        Choose a date and describe what you need
      </p>

      <v-form ref="formRef" @submit.prevent="submit">

        <!-- Date & Time -->
        <v-text-field
          v-model="form.booking_date"
          label="Date & Time"
          type="datetime-local"
          prepend-inner-icon="mdi-calendar-clock"
          :rules="[rules.required, rules.futureDate]"
          :min="minDate"
          class="mb-3"
        />

        <!-- Notes -->
        <v-textarea
          v-model="form.notes"
          label="Notes (optional)"
          placeholder="Describe what you need — event type, location, number of hours, special requirements..."
          rows="3"
          counter="1000"
          maxlength="1000"
          class="mb-4"
        />

        <!-- Photographer rate hint -->
        <v-alert
          v-if="photographer?.photographer_profile?.hourly_rate"
          color="info" variant="tonal" density="compact" rounded="xl" class="mb-4"
          prepend-icon="mdi-cash"
        >
          <span class="text-body-2">
            Hourly rate:
            <strong>KSh {{ Number(photographer.photographer_profile.hourly_rate).toLocaleString() }}/hr</strong>
            — Agree on total cost directly with the photographer.
          </span>
        </v-alert>

        <!-- Error -->
        <v-alert
          v-if="bookingError"
          type="error" variant="tonal" density="compact" rounded="xl" class="mb-4"
        >
          {{ bookingError }}
        </v-alert>

        <!-- Actions -->
        <div class="d-flex gap-3">
          <v-btn
            variant="outlined" color="primary" rounded="lg"
            class="flex-grow-1"
            :disabled="loading"
            @click="close"
          >
            Cancel
          </v-btn>
          <v-btn
            type="submit" color="primary" rounded="lg"
            class="flex-grow-1"
            :loading="loading"
          >
            <v-icon start>mdi-calendar-check</v-icon>
            Confirm Booking
          </v-btn>
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

const model = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const formRef     = ref(null)
const loading     = ref(false)
const bookingError= ref('')
const form        = ref({ booking_date: '', notes: '' })

// Minimum date: 2 hours from now (gives buffer for timezone differences)
const minDate = computed(() => {
  const d = new Date(Date.now() + 2 * 60 * 60 * 1000)
  // Format as "YYYY-MM-DDThh:mm" for datetime-local input
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
})

const rules = {
  required:   v => !!v || 'Please select a date and time',
  futureDate: v => {
    if (!v) return true
    const selected = new Date(v)
    const minTime  = new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now
    return selected > minTime || 'Booking must be at least 1 hour from now'
  },
}

function close() {
  if (loading.value) return
  model.value    = false
  bookingError.value = ''
  form.value     = { booking_date: '', notes: '' }
  formRef.value?.resetValidation()
}

async function submit() {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  loading.value      = true
  bookingError.value = ''

  try {
    const { data } = await bookingsApi.create({
      photographer_id: props.photographer.id,
      booking_date:    form.value.booking_date,
      notes:           form.value.notes || null,
    })

    emit('booked', data.booking)
    close()

  } catch (err) {
    const status = err.response?.status
    const msg    = err.response?.data?.message || err.response?.data?.error || ''

    if (status === 422) {
      // Show validation errors clearly
      const errors = err.response?.data?.errors || {}
      const first  = Object.values(errors).flat()[0]
      bookingError.value = first || msg || 'Please check the booking details.'
    } else if (status === 409) {
      bookingError.value = msg || 'You already have a pending booking with this photographer on that day.'
    } else if (status === 401) {
      bookingError.value = 'Your session has expired. Please log in again.'
    } else if (status === 403) {
      bookingError.value = 'Only clients can make bookings.'
    } else if (!err.response) {
      bookingError.value = 'Cannot reach server. Please check your connection.'
    } else {
      bookingError.value = msg || 'Booking failed. Please try again.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.gap-3 { gap: 12px; }
</style>