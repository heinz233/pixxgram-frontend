<template>
  <v-container fluid class="auth-bg fill-height">
    <v-row align="center" justify="center" class="fill-height">
      <v-col cols="12" sm="8" md="5" lg="4">

        <!-- Logo -->
        <div class="text-center mb-8">
          <div class="brand-mark mx-auto mb-3">
            <v-icon size="36" color="secondary">mdi-camera-iris</v-icon>
          </div>
          <h1 class="brand-name">Pixxgram</h1>
          <p class="text-medium-emphasis mt-1">Welcome back</p>
        </div>

        <v-card class="auth-card pa-8">
          <v-form ref="formRef" @submit.prevent="handleLogin">
            <v-text-field
              v-model="form.email"
              label="Email address"
              type="email"
              prepend-inner-icon="mdi-email-outline"
              :rules="[rules.required, rules.email]"
              class="mb-3"
              autocomplete="email"
            />
            <v-text-field
              v-model="form.password"
              label="Password"
              :type="showPassword ? 'text' : 'password'"
              prepend-inner-icon="mdi-lock-outline"
              :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="showPassword = !showPassword"
              :rules="[rules.required]"
              class="mb-2"
              autocomplete="current-password"
            />

            <div class="text-right mb-5">
              <router-link to="/forgot-password" class="text-caption text-secondary font-weight-medium">
                Forgot password?
              </router-link>
            </div>

            <v-alert
              v-if="authStore.error"
              type="error" variant="tonal" rounded="lg" class="mb-4" density="compact"
            >
              {{ authStore.error }}
            </v-alert>

            <v-btn
              type="submit"
              block size="large"
              color="primary"
              :loading="authStore.loading"
              class="mb-4"
            >
              Sign In
            </v-btn>

            <div class="text-center text-body-2">
              Don't have an account?
              <router-link to="/register" class="text-secondary font-weight-semibold ml-1">Sign up</router-link>
            </div>
          </v-form>
        </v-card>

      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router    = useRouter()
const route     = useRoute()
const authStore = useAuthStore()
const formRef   = ref(null)
const showPassword = ref(false)

const form = ref({ email: '', password: '' })

const rules = {
  required: v => !!v || 'This field is required',
  email:    v => /.+@.+\..+/.test(v) || 'Enter a valid email',
}

async function handleLogin() {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  // Clear any previous error
  authStore.error = null

  try {
    const data = await authStore.login(form.value)

    // Check if there's a redirect query param first
    const redirect = route.query.redirect
    if (redirect) {
      return router.push(redirect)
    }

    // Otherwise route by role
    const role = data?.user?.role?.name || authStore.roleName

    if (role === 'admin')        return router.push({ name: 'AdminDashboard' })
    if (role === 'photographer') return router.push({ name: 'PhotographerDashboard' })
    if (role === 'client')       return router.push({ name: 'ClientBookings' })

    // Fallback if role is somehow missing
    router.push({ name: 'Home' })

  } catch (_) {
    // error already set in store
  }
}
</script>

<style scoped>
.auth-bg {
  background: rgb(var(--v-theme-background));
  min-height: 100vh;
}
.brand-mark {
  width: 64px; height: 64px;
  background: rgb(var(--v-theme-primary));
  border-radius: 20px;
  display: flex; align-items: center; justify-content: center;
}
.brand-name {
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: -0.5px;
  color: rgb(var(--v-theme-primary));
}
.auth-card {
  border: 1px solid rgba(0,0,0,0.08) !important;
}
</style>
