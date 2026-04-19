<template>
  <div class="profile-page">

    <!-- LOADING -->
    <div v-if="pageState === 'loading'" class="state-screen">
      <v-progress-circular indeterminate color="primary" size="52" />
      <p class="mt-5 text-medium-emphasis">Loading your profile...</p>
    </div>

    <!-- ERROR -->
    <div v-else-if="pageState === 'error'" class="state-screen">
      <v-icon size="64" color="error">mdi-alert-circle-outline</v-icon>
      <p class="mt-4 text-subtitle-1 font-weight-bold">Could not load profile</p>
      <p class="mt-1 text-medium-emphasis text-body-2 text-center" style="max-width:360px">
        {{ errorMessage }}
      </p>
      <div class="d-flex mt-5" style="gap:12px">
        <v-btn color="primary" rounded="lg" @click="loadProfile">
          <v-icon start>mdi-refresh</v-icon> Retry
        </v-btn>
        <v-btn variant="outlined" rounded="lg" :to="{ name: 'Login' }">Re-login</v-btn>
      </div>
    </div>

    <!-- FORM -->
    <div v-else-if="pageState === 'ready'">

      <!-- Header -->
      <div class="d-flex align-center justify-space-between mb-7">
        <div>
          <h2 class="text-h6 font-weight-bold">My Profile</h2>
          <p class="text-medium-emphasis text-body-2 mt-1">
            Manage how clients see you on Pixxgram
          </p>
        </div>
        <div class="text-center">
          <v-progress-circular
            :model-value="completionPct"
            :color="completionPct === 100 ? 'success' : 'secondary'"
            size="54" width="5"
          >
            <span class="text-caption font-weight-bold">{{ completionPct }}%</span>
          </v-progress-circular>
          <p class="text-caption text-medium-emphasis mt-1">Complete</p>
        </div>
      </div>

      <!-- Missing fields tip -->
      <v-alert
        v-if="missingFields.length"
        variant="tonal" color="info" rounded="xl"
        density="compact" class="mb-6"
        prepend-icon="mdi-lightbulb-outline"
      >
        <span class="text-body-2">
          Still missing: <strong>{{ missingFields.join(' · ') }}</strong>
        </span>
      </v-alert>

      <v-form ref="formRef" @submit.prevent="save">

        <!-- PHOTO -->
        <v-card rounded="xl" class="section-card pa-6 mb-4">
          <p class="section-heading">Profile Photo</p>
          <div class="d-flex align-center" style="gap:24px">
            <div class="avatar-wrap" @click="fileInput?.click()">
              <v-avatar size="100" color="primary">
                <v-img v-if="photoPreview" :src="photoPreview" cover />
                <v-img v-else-if="form.profile_photo" :src="buildUrl(form.profile_photo)" cover @error="imgErr = true" />
                <span v-else class="text-white text-h4 font-weight-bold">{{ initials }}</span>
              </v-avatar>
              <div class="avatar-cam">
                <v-icon size="22" color="white">mdi-camera</v-icon>
              </div>
            </div>
            <div>
              <p class="text-subtitle-2 font-weight-bold">{{ userName }}</p>
              <p class="text-caption text-medium-emphasis mb-2">{{ userEmail }}</p>
              <v-btn variant="tonal" color="secondary" size="small" rounded="lg"
                prepend-icon="mdi-camera-outline" @click="fileInput?.click()">
                Upload Photo
              </v-btn>
              <p v-if="photoFile" class="text-caption text-success mt-1">
                <v-icon size="12">mdi-check</v-icon>
                {{ photoFile.name }} selected
              </p>
              <p class="text-caption text-medium-emphasis mt-1">JPG, PNG, WEBP · max 4MB</p>
            </div>
            <input ref="fileInput" type="file" accept="image/jpeg,image/png,image/webp"
              hidden @change="onPhoto" />
          </div>

          <!-- Storage link warning -->
          <v-alert v-if="imgErr" type="warning" variant="tonal" rounded="xl"
            density="compact" class="mt-4" prepend-icon="mdi-alert-outline">
            <p class="font-weight-bold text-body-2 mb-1">Photo saved but not displaying</p>
            <p class="text-body-2">Run this command in your Laravel folder:</p>
            <code class="font-weight-bold">php artisan storage:link</code>
          </v-alert>
        </v-card>

        <!-- BIO -->
        <v-card rounded="xl" class="section-card pa-6 mb-4">
          <p class="section-heading">About You</p>
          <v-textarea v-model="form.bio" label="Bio"
            placeholder="Tell clients about your photography style and experience..."
            rows="4" counter="500" maxlength="500"
            prepend-inner-icon="mdi-text-box-outline" class="mb-4" />
          <v-row>
            <v-col cols="12" sm="6">
              <v-select v-model="form.gender" label="Gender"
                :items="[{title:'Male',value:'male'},{title:'Female',value:'female'},{title:'Other',value:'other'}]"
                item-title="title" item-value="value"
                prepend-inner-icon="mdi-gender-male-female" />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field v-model.number="form.age" label="Age"
                type="number" min="18" max="100"
                prepend-inner-icon="mdi-cake-variant-outline"
                :rules="[v => !v || (v >= 18 && v <= 100) || 'Must be 18–100']" />
            </v-col>
          </v-row>
        </v-card>

        <!-- LOCATION & RATES -->
        <v-card rounded="xl" class="section-card pa-6 mb-6">
          <p class="section-heading">Location & Rates</p>
          <v-row>
            <v-col cols="12" sm="6">
              <v-text-field v-model="form.location" label="City / Location"
                placeholder="e.g. Nairobi" prepend-inner-icon="mdi-map-marker-outline" />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field v-model.number="form.hourly_rate" label="Hourly Rate (KSh)"
                type="number" min="0" placeholder="e.g. 2500"
                prepend-inner-icon="mdi-cash"
                :hint="form.hourly_rate ? `KSh ${Number(form.hourly_rate).toLocaleString()} / hr` : ''"
                persistent-hint />
            </v-col>
          </v-row>
        </v-card>

        <!-- FEEDBACK -->
        <v-alert v-if="saveError" type="error" variant="tonal" rounded="xl" density="compact" class="mb-4">
          {{ saveError }}
        </v-alert>
        <v-alert v-if="saveSuccess" type="success" variant="tonal" rounded="xl" density="compact" class="mb-4"
          prepend-icon="mdi-check-circle-outline">
          Profile saved successfully!
        </v-alert>

        <!-- SAVE BUTTON -->
        <v-btn type="submit" color="primary" size="large" rounded="xl"
          :loading="saving" min-width="180">
          <v-icon start>mdi-content-save-outline</v-icon>
          Save Profile
        </v-btn>

      </v-form>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/api/axios'
import { useAuthStore } from '@/stores/auth'
import { useAppStore  } from '@/stores/app'

const authStore = useAuthStore()
const appStore  = useAppStore()

const pageState    = ref('loading')
const errorMessage = ref('')
const formRef      = ref(null)
const fileInput    = ref(null)
const saving       = ref(false)
const saveError    = ref('')
const saveSuccess  = ref(false)
const photoPreview = ref(null)
const photoFile    = ref(null)
const imgErr       = ref(false)

const form = ref({
  bio: '', location: '', hourly_rate: '',
  gender: '', age: '', profile_photo: '',
})

// ── computed ───────────────────────────────────────────────────────
const userName  = computed(() => authStore.user?.name  || '')
const userEmail = computed(() => authStore.user?.email || '')
const initials  = computed(() =>
  userName.value.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase() || '?'
)

const BACKEND = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api')
  .replace(/\/api\/?$/, '').replace(/\/$/, '')

function buildUrl(path) {
  if (!path) return ''
  if (path.startsWith('http')) return path
  return `${BACKEND}/storage/${path.replace(/^\/+/, '')}`
}

const FIELDS = ['bio', 'location', 'hourly_rate', 'gender', 'age', 'profile_photo']
const LABELS = {
  bio: 'Bio', location: 'Location', hourly_rate: 'Hourly Rate',
  gender: 'Gender', age: 'Age', profile_photo: 'Profile Photo',
}

const completionPct = computed(() => {
  const filled = FIELDS.filter(f => {
    const v = f === 'profile_photo'
      ? (photoPreview.value || form.value.profile_photo)
      : form.value[f]
    return !!v || v === 0
  }).length
  return Math.round((filled / FIELDS.length) * 100)
})

const missingFields = computed(() =>
  FIELDS.filter(f => {
    const v = f === 'profile_photo'
      ? (photoPreview.value || form.value.profile_photo)
      : form.value[f]
    return !v && v !== 0
  }).map(f => LABELS[f])
)

// ── helpers ────────────────────────────────────────────────────────
function fillForm(p) {
  if (!p) return
  form.value = {
    bio:           p.bio           ?? '',
    location:      p.location      ?? '',
    hourly_rate:   p.hourly_rate   ?? '',
    gender:        p.gender        ?? '',
    age:           p.age           ?? '',
    profile_photo: p.profile_photo ?? '',
  }
}

// ── load ───────────────────────────────────────────────────────────
async function loadProfile() {
  pageState.value    = 'loading'
  errorMessage.value = ''
  imgErr.value       = false

  try {
    const { data } = await api.get('/user')
    const user = data?.user ?? data

    if (!user?.id) {
      errorMessage.value = 'Server returned unexpected data.'
      pageState.value    = 'error'
      return
    }

    authStore.user = user
    localStorage.setItem('user', JSON.stringify(user))
    fillForm(user.photographer_profile ?? user.photographerProfile)
    pageState.value = 'ready'

  } catch (e) {
    const s = e.response?.status
    if (!e.response)   errorMessage.value = `Cannot reach server at ${BACKEND}. Is Laravel running?`
    else if (s === 401) errorMessage.value = 'Session expired. Please log in again.'
    else if (s === 403) errorMessage.value = 'Access denied.'
    else if (s === 404) errorMessage.value = 'Endpoint not found. Check routes/api.php.'
    else                errorMessage.value = e.response?.data?.message || `Error ${s}`
    pageState.value = 'error'
  }
}

// ── photo ──────────────────────────────────────────────────────────
function onPhoto(e) {
  const f = e.target.files?.[0]
  if (!f) return
  if (f.size > 4 * 1024 * 1024) {
    appStore.notify('Image must be under 4MB', 'warning')
    return
  }
  photoFile.value    = f
  photoPreview.value = URL.createObjectURL(f)
  imgErr.value       = false
}

// ── save ───────────────────────────────────────────────────────────
async function save() {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  saving.value      = true
  saveError.value   = ''
  saveSuccess.value = false

  try {
    const fd = new FormData()

    // IMPORTANT: Use POST + _method=PUT (Laravel method spoofing).
    // PHP on XAMPP does NOT populate $_FILES or $_POST for PUT requests —
    // only POST works reliably with multipart/form-data.
    fd.append('_method', 'PUT')

    fd.append('bio',      form.value.bio      || '')
    fd.append('location', form.value.location || '')
    fd.append('gender',   form.value.gender   || '')

    if (form.value.hourly_rate !== '' && form.value.hourly_rate !== null) {
      fd.append('hourly_rate', String(form.value.hourly_rate))
    }
    if (form.value.age !== '' && form.value.age !== null) {
      fd.append('age', String(form.value.age))
    }
    if (photoFile.value) {
      fd.append('profile_photo', photoFile.value)
    }

    // POST to the profile endpoint — Laravel sees _method=PUT and routes it correctly
    const { data } = await api.post('/photographer/profile', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    // Update form and store from response
    const freshProfile = data?.user?.photographer_profile ?? data?.profile ?? null
    if (freshProfile) {
      fillForm(freshProfile)
    }
    if (data?.user) {
      authStore.user = data.user
      localStorage.setItem('user', JSON.stringify(data.user))
    }

    photoFile.value    = null
    photoPreview.value = null
    saveSuccess.value  = true
    appStore.notify('Profile saved! ✓', 'success')
    setTimeout(() => { saveSuccess.value = false }, 4000)

  } catch (e) {
    const s = e.response?.status
    if (s === 422) {
      const errs  = e.response?.data?.errors || {}
      const first = Object.values(errs).flat()[0]
      saveError.value = first || e.response?.data?.message || 'Validation failed.'
    } else if (s === 405) {
      saveError.value = 'Method not allowed. Make sure POST /api/photographer/profile exists in routes/api.php.'
    } else if (s === 403) {
      saveError.value = 'Permission denied. Only photographers can update this profile.'
    } else if (s === 404) {
      saveError.value = 'Route POST /api/photographer/profile not found. Check routes/api.php.'
    } else if (!e.response) {
      saveError.value = 'Cannot reach server. Is Laravel running?'
    } else {
      saveError.value = e.response?.data?.message || `Save failed (${s})`
    }
  } finally {
    saving.value = false
  }
}

onMounted(loadProfile)
</script>

<style scoped>
.state-screen {
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  min-height: 420px; text-align: center; padding: 32px 16px;
}
.section-card { border: 1px solid rgba(0,0,0,0.07) !important; }
.section-heading {
  font-size: 0.68rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: 1.2px;
  color: rgba(var(--v-theme-on-surface), 0.4);
  margin-bottom: 18px;
}
.avatar-wrap {
  position: relative; cursor: pointer;
  border-radius: 50%; flex-shrink: 0;
}
.avatar-cam {
  position: absolute; inset: 0; background: rgba(0,0,0,0.45);
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
  opacity: 0; transition: opacity 0.2s;
}
.avatar-wrap:hover .avatar-cam { opacity: 1; }
</style>