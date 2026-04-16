<template>
  <div class="register-page">

    <!-- Step 1: Choose role -->
    <div v-if="step === 1" class="step-screen">
      <div class="text-center mb-10">
        <div class="brand-mark mx-auto mb-4">
          <v-icon size="36" color="secondary">mdi-camera-iris</v-icon>
        </div>
        <h1 class="brand-name">Join Pixxgram</h1>
        <p class="text-medium-emphasis mt-2 text-body-1">How would you like to use Pixxgram?</p>
      </div>

      <v-row justify="center" class="mx-0">
        <!-- Client card -->
        <v-col cols="12" sm="10" md="5" class="pa-3">
          <div class="role-card" :class="{ selected: selectedRole === 'client' }" @click="selectRole('client')">
            <div class="selected-check" v-if="selectedRole === 'client'">
              <v-icon color="white" size="16">mdi-check</v-icon>
            </div>
            <div class="role-card-icon client-icon mb-5">
              <v-icon size="40" color="primary">mdi-account-search</v-icon>
            </div>
            <h3 class="role-card-title">I need a Photographer</h3>
            <p class="role-card-desc">
              Find and book talented photographers across Kenya for any occasion.
            </p>
            <ul class="role-perks">
              <li><v-icon size="14" color="success" class="mr-2">mdi-check-circle</v-icon>Browse photographer profiles</li>
              <li><v-icon size="14" color="success" class="mr-2">mdi-check-circle</v-icon>Book sessions instantly</li>
              <li><v-icon size="14" color="success" class="mr-2">mdi-check-circle</v-icon>Pay with M-Pesa</li>
              <li><v-icon size="14" color="success" class="mr-2">mdi-check-circle</v-icon>Leave ratings & reviews</li>
            </ul>
            <v-chip color="primary" variant="tonal" size="small" class="mt-4">Free to join</v-chip>
          </div>
        </v-col>

        <!-- Photographer card -->
        <v-col cols="12" sm="10" md="5" class="pa-3">
          <div class="role-card photographer-variant" :class="{ selected: selectedRole === 'photographer' }" @click="selectRole('photographer')">
            <div class="selected-check secondary" v-if="selectedRole === 'photographer'">
              <v-icon color="white" size="16">mdi-check</v-icon>
            </div>
            <div class="role-card-icon photographer-icon mb-5">
              <v-icon size="40" color="secondary">mdi-camera</v-icon>
            </div>
            <h3 class="role-card-title">I am a Photographer</h3>
            <p class="role-card-desc">
              Showcase your portfolio, grow your client base, and get paid for your craft.
            </p>
            <ul class="role-perks">
              <li><v-icon size="14" color="success" class="mr-2">mdi-check-circle</v-icon>Upload your portfolio</li>
              <li><v-icon size="14" color="success" class="mr-2">mdi-check-circle</v-icon>Receive booking requests</li>
              <li><v-icon size="14" color="success" class="mr-2">mdi-check-circle</v-icon>Get paid via M-Pesa</li>
              <li><v-icon size="14" color="success" class="mr-2">mdi-check-circle</v-icon>Set your own rates</li>
            </ul>
            <v-chip color="secondary" variant="tonal" size="small" class="mt-4">Subscription from KSh 1,500/mo</v-chip>
          </div>
        </v-col>
      </v-row>

      <div class="text-center mt-8">
        <v-btn
          color="primary" size="x-large" rounded="xl"
          :disabled="!selectedRole"
          min-width="260"
          @click="step = 2"
        >
          Continue
          <v-icon end>mdi-arrow-right</v-icon>
        </v-btn>
        <p class="text-body-2 text-medium-emphasis mt-5">
          Already have an account?
          <router-link to="/login" class="text-primary font-weight-semibold">Sign in</router-link>
        </p>
      </div>
    </div>

    <!-- Step 2: Registration form -->
    <div v-if="step === 2" class="step-screen form-step">
      <v-container style="max-width:700px; padding:0">

        <div class="d-flex align-center mb-7">
          <v-btn icon variant="text" size="small" @click="step = 1" class="mr-3">
            <v-icon>mdi-arrow-left</v-icon>
          </v-btn>
          <div>
            <h2 class="text-h6 font-weight-bold">
              {{ selectedRole === 'photographer' ? 'Photographer' : 'Client' }} Registration
            </h2>
            <p class="text-caption text-medium-emphasis">Step 2 of 2 — fill in your details</p>
          </div>
          <v-spacer />
          <v-chip
            :color="selectedRole === 'photographer' ? 'secondary' : 'primary'"
            size="small" label
          >
            <v-icon start size="14">{{ selectedRole === 'photographer' ? 'mdi-camera' : 'mdi-account' }}</v-icon>
            {{ selectedRole === 'photographer' ? 'Photographer' : 'Client' }}
          </v-chip>
        </div>

        <v-card class="form-card pa-8">
          <v-form ref="formRef" @submit.prevent="handleRegister">

            <p class="section-label">Basic Information</p>
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field v-model="form.name" label="Full name"
                  prepend-inner-icon="mdi-account-outline" :rules="[rules.required]" />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="form.email" label="Email address" type="email"
                  prepend-inner-icon="mdi-email-outline" :rules="[rules.required, rules.email]" />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="form.password" label="Password"
                  :type="showPass ? 'text' : 'password'"
                  prepend-inner-icon="mdi-lock-outline"
                  :append-inner-icon="showPass ? 'mdi-eye-off' : 'mdi-eye'"
                  @click:append-inner="showPass = !showPass"
                  :rules="[rules.required, rules.minLen]" />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="form.phoneNumber" label="Phone number"
                  prepend-inner-icon="mdi-phone-outline" placeholder="07xxxxxxxx"
                  :rules="[rules.required]" />
              </v-col>
              <v-col cols="12" md="6">
                <v-select v-model="form.gender" label="Gender (optional)"
                  :items="['male','female','other']" prepend-inner-icon="mdi-gender-male-female" />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="form.dob" label="Date of birth (optional)"
                  type="date" prepend-inner-icon="mdi-calendar-outline" />
              </v-col>
            </v-row>

            <!-- Photographer-only section -->
            <template v-if="selectedRole === 'photographer'">
              <v-divider class="my-6" />
              <p class="section-label">Your Photography Details</p>
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field v-model="form.location" label="City / Location"
                    prepend-inner-icon="mdi-map-marker-outline" placeholder="e.g. Nairobi" />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field v-model="form.hourly_rate" label="Hourly rate (KSh)"
                    type="number" prepend-inner-icon="mdi-cash" placeholder="e.g. 2500" />
                </v-col>
                <v-col cols="12">
                  <v-textarea v-model="form.bio" label="Short bio"
                    rows="3" counter="300" maxlength="300"
                    placeholder="Describe your photography style and experience..."
                    prepend-inner-icon="mdi-text-box-outline" />
                </v-col>
              </v-row>
              <v-alert color="secondary" variant="tonal" rounded="xl"
                density="compact" class="mb-2" prepend-icon="mdi-information-outline">
                <span class="text-caption">
                  After account activation you'll need a subscription (from KSh 1,500/month)
                  to appear in search results and receive bookings.
                </span>
              </v-alert>
            </template>

            <v-alert v-if="authStore.error" type="error" variant="tonal"
              rounded="xl" class="my-4" density="compact">
              {{ authStore.error }}
            </v-alert>

            <v-btn type="submit" block size="large"
              :color="selectedRole === 'photographer' ? 'secondary' : 'primary'"
              :loading="authStore.loading" rounded="xl" class="mt-6">
              <v-icon start>mdi-account-plus</v-icon>
              Create {{ selectedRole === 'photographer' ? 'Photographer' : 'Client' }} Account
            </v-btn>

            <p class="text-center text-caption text-medium-emphasis mt-4">
              By signing up you agree to our
              <router-link to="/terms" class="text-primary">Terms</router-link> and
              <router-link to="/privacy" class="text-primary">Privacy Policy</router-link>
            </p>
          </v-form>
        </v-card>

        <p class="text-center text-body-2 mt-5">
          Already have an account?
          <router-link to="/login" class="text-primary font-weight-semibold">Sign in</router-link>
        </p>
      </v-container>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'

const router    = useRouter()
const authStore = useAuthStore()
const appStore  = useAppStore()
const formRef   = ref(null)
const showPass  = ref(false)
const step         = ref(1)
const selectedRole = ref('')

const form = ref({
  name: '', email: '', password: '',
  phoneNumber: '', gender: '', dob: '',
  role_id: 3,
  location: '', hourly_rate: '', bio: '',
})

function selectRole(role) {
  selectedRole.value = role
}

watch(selectedRole, (val) => {
  form.value.role_id = val === 'photographer' ? 2 : 3
})

const rules = {
  required: v => !!v || 'Required',
  email:    v => /.+@.+\..+/.test(v) || 'Invalid email',
  minLen:   v => (v && v.length >= 6) || 'Minimum 6 characters',
}

async function handleRegister() {
  const { valid } = await formRef.value.validate()
  if (!valid) return
  authStore.error = null
  try {
    const payload = {
      name:        form.value.name,
      email:       form.value.email,
      password:    form.value.password,
      phoneNumber: form.value.phoneNumber,
      role_id:     form.value.role_id,
    }
    if (form.value.gender)      payload.gender      = form.value.gender
    if (form.value.dob)         payload.dob         = form.value.dob
    if (form.value.location)    payload.gymLocation = form.value.location
    if (form.value.hourly_rate) payload.hourly_rate = form.value.hourly_rate
    if (form.value.bio)         payload.bio         = form.value.bio

    await authStore.register(payload)
    appStore.notify('Account created! Check your email to verify.', 'success')
    router.push({ name: 'VerifyEmail' })
  } catch (_) {}
}
</script>

<style scoped>
.register-page { min-height: 100vh; background: rgb(var(--v-theme-background)); }
.step-screen   { padding: 56px 20px 40px; max-width: 1000px; margin: 0 auto; }
.form-step     { max-width: 760px; }

.brand-mark {
  width: 72px; height: 72px;
  background: rgb(var(--v-theme-primary));
  border-radius: 22px;
  display: flex; align-items: center; justify-content: center;
}
.brand-name {
  font-size: 2.4rem; font-weight: 900;
  letter-spacing: -1.5px;
  color: rgb(var(--v-theme-primary));
}

/* Role selection cards */
.role-card {
  border: 2.5px solid rgba(0,0,0,0.09);
  border-radius: 24px;
  padding: 36px 30px;
  cursor: pointer;
  transition: all 0.22s ease;
  background: rgb(var(--v-theme-surface));
  position: relative;
  height: 100%;
  user-select: none;
}
.role-card:hover {
  border-color: rgb(var(--v-theme-primary));
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
  transform: translateY(-3px);
}
.role-card.selected {
  border-color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.03);
  box-shadow: 0 0 0 4px rgba(var(--v-theme-primary), 0.12);
  transform: translateY(-3px);
}
.photographer-variant:hover  { border-color: rgb(var(--v-theme-secondary)); }
.photographer-variant.selected {
  border-color: rgb(var(--v-theme-secondary));
  background: rgba(var(--v-theme-secondary), 0.03);
  box-shadow: 0 0 0 4px rgba(var(--v-theme-secondary), 0.12);
}

.selected-check {
  position: absolute; top: 16px; right: 16px;
  width: 26px; height: 26px;
  background: rgb(var(--v-theme-primary));
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
}
.selected-check.secondary { background: rgb(var(--v-theme-secondary)); }

.role-card-icon {
  width: 76px; height: 76px;
  border-radius: 20px;
  display: flex; align-items: center; justify-content: center;
}
.client-icon       { background: rgba(var(--v-theme-primary),   0.1); }
.photographer-icon { background: rgba(var(--v-theme-secondary), 0.1); }

.role-card-title {
  font-size: 1.25rem; font-weight: 800;
  letter-spacing: -0.3px; margin-bottom: 10px;
}
.role-card-desc {
  font-size: 0.875rem; line-height: 1.65;
  color: rgba(var(--v-theme-on-surface), 0.6);
  margin-bottom: 20px;
}
.role-perks {
  list-style: none; padding: 0;
  display: flex; flex-direction: column; gap: 10px;
}
.role-perks li {
  display: flex; align-items: center;
  font-size: 0.85rem;
  color: rgba(var(--v-theme-on-surface), 0.75);
}

/* Form */
.form-card { border: 1px solid rgba(0,0,0,0.08) !important; }
.section-label {
  font-size: 0.68rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: 1.2px;
  color: rgba(var(--v-theme-on-surface), 0.4);
  margin-bottom: 18px;
}
</style>
