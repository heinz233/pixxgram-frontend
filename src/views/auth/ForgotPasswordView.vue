<template>
  <v-container fluid class="auth-bg fill-height">
    <v-row align="center" justify="center" class="fill-height">
      <v-col cols="12" sm="8" md="5" lg="4">

        <div class="text-center mb-8">
          <div class="brand-mark mx-auto mb-3">
            <v-icon size="36" color="secondary">mdi-lock-reset</v-icon>
          </div>
          <h1 class="brand-name">Reset Password</h1>
          <p class="text-medium-emphasis mt-1">We'll send you a reset link</p>
        </div>

        <v-card class="auth-card pa-8">
          <!-- Step 1: enter email -->
          <v-form v-if="!sent" ref="formRef" @submit.prevent="submit">
            <v-text-field
              v-model="email"
              label="Email address"
              type="email"
              prepend-inner-icon="mdi-email-outline"
              :rules="[v => !!v || 'Required', v => /.+@.+\..+/.test(v) || 'Invalid email']"
              class="mb-4"
            />

            <v-alert v-if="error" type="error" variant="tonal" rounded="lg" density="compact" class="mb-4">
              {{ error }}
            </v-alert>

            <v-btn type="submit" block size="large" color="primary" :loading="loading" class="mb-4">
              Send Reset Link
            </v-btn>
          </v-form>

          <!-- Step 2: confirmation -->
          <div v-else class="text-center">
            <v-icon size="56" color="success" class="mb-4">mdi-email-check-outline</v-icon>
            <h3 class="text-subtitle-1 font-weight-bold mb-2">Check your inbox</h3>
            <p class="text-body-2 text-medium-emphasis mb-6">
              We sent a password reset link to<br>
              <strong>{{ email }}</strong>
            </p>
            <v-btn variant="text" size="small" color="secondary" @click="sent = false; email = ''">
              Try a different email
            </v-btn>
          </div>

          <v-divider class="my-4" />
          <div class="text-center text-body-2">
            <router-link to="/login" class="text-secondary font-weight-semibold">
              <v-icon size="14" class="mr-1">mdi-arrow-left</v-icon>Back to Sign In
            </router-link>
          </div>
        </v-card>

      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import api from '@/api/axios'

const formRef = ref(null)
const email   = ref('')
const loading = ref(false)
const error   = ref('')
const sent    = ref(false)

async function submit() {
  const { valid } = await formRef.value.validate()
  if (!valid) return
  loading.value = true; error.value = ''
  try {
    await api.post('/forgot-password', { email: email.value })
    sent.value = true
  } catch (e) {
    error.value = e.response?.data?.message || 'Failed to send reset link. Please try again.'
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
