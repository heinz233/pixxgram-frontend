<template>
  <v-container fluid class="auth-bg fill-height">
    <v-row align="center" justify="center" class="fill-height">
      <v-col cols="12" sm="8" md="5" lg="4" class="text-center">

        <div class="brand-mark mx-auto mb-6">
          <v-icon size="48" color="secondary">mdi-email-check-outline</v-icon>
        </div>

        <h2 class="text-h5 font-weight-bold mb-3">Check your inbox</h2>
        <p class="text-medium-emphasis mb-2">
          We sent a verification link to your email address.
        </p>
        <p class="text-body-2 text-medium-emphasis mb-6">
          Click the link in the email to activate your account, then come back here to sign in.
        </p>

        <v-card class="pa-6 mb-4">
          <p class="text-body-2 font-weight-semibold mb-4">Didn't receive the email?</p>
          <v-text-field
            v-model="email"
            label="Your email address"
            type="email"
            density="compact"
            prepend-inner-icon="mdi-email-outline"
            class="mb-3"
          />
          <v-btn
            block color="primary" variant="tonal" rounded="lg"
            :loading="loading"
            @click="resend"
          >
            <v-icon start>mdi-email-fast-outline</v-icon>
            Resend verification email
          </v-btn>
          <v-alert v-if="message" :type="msgType" class="mt-4" density="compact" variant="tonal" rounded="lg">
            {{ message }}
          </v-alert>
        </v-card>

        <v-card class="pa-6" color="primary" variant="tonal">
          <p class="text-body-2 mb-3">Already verified your email?</p>
          <v-btn color="primary" block rounded="lg" :to="{ name: 'Login' }">
            <v-icon start>mdi-login</v-icon>
            Go to Sign In
          </v-btn>
        </v-card>

        <div class="mt-5 text-body-2">
          <router-link to="/login" class="text-secondary">
            <v-icon size="14" class="mr-1">mdi-arrow-left</v-icon>
            Back to login
          </router-link>
        </div>

      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { authApi } from '@/api/auth'

const email   = ref('')
const loading = ref(false)
const message = ref('')
const msgType = ref('success')

async function resend() {
  if (!email.value) {
    message.value = 'Please enter your email address.'
    msgType.value = 'warning'
    return
  }
  loading.value = true
  message.value = ''
  try {
    await authApi.resendEmail(email.value)
    message.value = 'Verification email sent! Check your inbox.'
    msgType.value = 'success'
  } catch (e) {
    message.value = e.response?.data?.message || 'Failed to resend. Please try again.'
    msgType.value = 'error'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-bg { background: rgb(var(--v-theme-background)); min-height: 100vh; }
.brand-mark {
  width: 88px; height: 88px;
  background: rgb(var(--v-theme-primary));
  border-radius: 24px;
  display: flex; align-items: center; justify-content: center;
}
</style>
