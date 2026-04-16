<template>
  <v-container fluid class="auth-bg fill-height">
    <v-row align="center" justify="center" class="fill-height">
      <v-col cols="12" sm="8" md="5" lg="4">

        <div class="text-center mb-8">
          <div class="brand-mark mx-auto mb-3">
            <v-icon size="36" color="secondary">mdi-lock-check-outline</v-icon>
          </div>
          <h1 class="brand-name">New Password</h1>
          <p class="text-medium-emphasis mt-1">Choose a strong password</p>
        </div>

        <v-card class="auth-card pa-8">
          <v-form v-if="!done" ref="formRef" @submit.prevent="submit">
            <v-text-field
              v-model="form.password"
              label="New password"
              :type="showPass ? 'text' : 'password'"
              prepend-inner-icon="mdi-lock-outline"
              :append-inner-icon="showPass ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="showPass = !showPass"
              :rules="[v => !!v || 'Required', v => v.length >= 6 || 'Minimum 6 characters']"
              class="mb-3"
            />
            <v-text-field
              v-model="form.password_confirmation"
              label="Confirm new password"
              :type="showPass ? 'text' : 'password'"
              prepend-inner-icon="mdi-lock-check-outline"
              :rules="[v => !!v || 'Required', v => v === form.password || 'Passwords do not match']"
              class="mb-4"
            />

            <!-- Password strength indicator -->
            <div class="mb-4">
              <div class="d-flex justify-space-between mb-1">
                <span class="text-caption text-medium-emphasis">Password strength</span>
                <span class="text-caption font-weight-semibold" :class="strengthColor">{{ strengthLabel }}</span>
              </div>
              <v-progress-linear :model-value="strengthScore * 25" :color="strengthColor" rounded height="4" />
            </div>

            <v-alert v-if="error" type="error" variant="tonal" rounded="lg" density="compact" class="mb-4">
              {{ error }}
            </v-alert>

            <v-btn type="submit" block size="large" color="primary" :loading="loading">
              Set New Password
            </v-btn>
          </v-form>

          <div v-else class="text-center">
            <v-icon size="56" color="success" class="mb-4">mdi-check-circle-outline</v-icon>
            <h3 class="text-subtitle-1 font-weight-bold mb-2">Password updated!</h3>
            <p class="text-body-2 text-medium-emphasis mb-6">You can now sign in with your new password.</p>
            <v-btn color="primary" block :to="{ name: 'Login' }">Go to Sign In</v-btn>
          </div>
        </v-card>

      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/api/axios'

const route   = useRoute()
const formRef = ref(null)
const showPass = ref(false)
const loading = ref(false)
const error   = ref('')
const done    = ref(false)
const form    = ref({ password: '', password_confirmation: '' })

const strengthScore = computed(() => {
  const p = form.value.password
  if (!p) return 0
  let s = 0
  if (p.length >= 6)  s++
  if (p.length >= 10) s++
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++
  if (/\d/.test(p) || /[^A-Za-z0-9]/.test(p)) s++
  return s
})

const strengthLabel = computed(() => ['', 'Weak', 'Fair', 'Good', 'Strong'][strengthScore.value] || '')
const strengthColor = computed(() => ['', 'error', 'warning', 'info', 'success'][strengthScore.value] || 'grey')

async function submit() {
  const { valid } = await formRef.value.validate()
  if (!valid) return
  loading.value = true; error.value = ''
  try {
    await api.post('/reset-password', {
      token:                 route.query.token,
      email:                 route.query.email,
      password:              form.value.password,
      password_confirmation: form.value.password_confirmation,
    })
    done.value = true
  } catch (e) {
    error.value = e.response?.data?.message || 'Reset failed. The link may have expired.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-bg { background: rgb(var(--v-theme-background)); min-height: 100vh; }
.brand-mark {
  width: 68px; height: 68px;
  background: rgb(var(--v-theme-primary));
  border-radius: 20px;
  display: flex; align-items: center; justify-content: center;
}
.brand-name { font-size: 1.8rem; font-weight: 800; letter-spacing: -0.5px; color: rgb(var(--v-theme-primary)); }
.auth-card { border: 1px solid rgba(0,0,0,0.08) !important; }
</style>
