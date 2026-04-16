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
      <v-card v-if="debugInfo" class="mt-4 pa-3 text-left" rounded="lg" max-width="480">
        <p class="text-caption font-weight-bold text-medium-emphasis mb-1">Debug info:</p>
        <pre class="text-caption" style="white-space:pre-wrap;word-break:break-all;font-size:0.7rem">{{ debugInfo }}</pre>
      </v-card>
      <div class="d-flex gap-3 mt-5 flex-wrap justify-center">
        <v-btn color="primary" rounded="lg" @click="loadProfile">
          <v-icon start>mdi-refresh</v-icon> Retry
        </v-btn>
        <v-btn variant="outlined" color="primary" rounded="lg" :to="{ name: 'Login' }">
          Re-login
        </v-btn>
      </div>
    </div>

    <!-- READY -->
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

        <!-- PHOTO SECTION -->
        <v-card rounded="xl" class="section-card pa-6 mb-4">
          <p class="section-heading">Profile Photo</p>
          <div class="d-flex align-center" style="gap:24px">
            <div class="avatar-wrap" @click="fileInput?.click()">
              <v-avatar size="100" color="primary">
                <!-- New photo selected (not yet saved) -->
                <v-img v-if="photoPreview" :src="photoPreview" cover />
                <!-- Saved photo from DB -->
                <v-img
                  v-else-if="form.profile_photo"
                  :src="photoUrl"
                  cover
                  @error="onImgError"
                />
                <!-- Fallback initials -->
                <span v-else class="text-white text-h4 font-weight-bold">
                  {{ initials }}
                </span>
              </v-avatar>
              <div class="avatar-cam">
                <v-icon size="22" color="white">mdi-camera</v-icon>
              </div>
            </div>

            <div>
              <p class="text-subtitle-2 font-weight-bold">{{ userName }}</p>
              <p class="text-caption text-medium-emphasis mb-2">{{ userEmail }}</p>

              <!-- Show current photo path for debugging -->
              <p v-if="form.profile_photo && !photoPreview"
                class="text-caption text-medium-emphasis mb-2"
                style="max-width:260px;word-break:break-all">
                <v-icon size="11" class="mr-1">mdi-image</v-icon>
                {{ form.profile_photo }}
              </p>

              <v-btn
                variant="tonal" color="secondary" size="small" rounded="lg"
                prepend-icon="mdi-camera-outline"
                @click="fileInput?.click()"
              >
                {{ form.profile_photo ? 'Change Photo' : 'Upload Photo' }}
              </v-btn>
              <p class="text-caption text-medium-emphasis mt-2">JPG, PNG, WEBP · max 4MB</p>
            </div>
            <input
              ref="fileInput" type="file"
              accept="image/jpeg,image/png,image/webp"
              hidden @change="onPhoto"
            />
          </div>

          <!-- Storage link warning -->
          <v-alert
            v-if="imgLoadError"
            type="warning" variant="tonal" rounded="xl"
            density="compact" class="mt-4"
            prepend-icon="mdi-alert-outline"
          >
            <p class="font-weight-bold mb-1">Photo saved but not displaying</p>
            <p class="text-body-2 mb-2">
              You need to run the storage symlink command in your Laravel project:
            </p>
            <code class="text-body-2 font-weight-bold">php artisan storage:link</code>
            <p class="text-caption mt-2 text-medium-emphasis">
              After running this, refresh the page and your photo will appear.
            </p>
          </v-alert>
        </v-card>

        <!-- BIO SECTION -->
        <v-card rounded="xl" class="section-card pa-6 mb-4">
          <p class="section-heading">About You</p>
          <v-textarea
            v-model="form.bio"
            label="Bio"
            placeholder="Tell clients about your photography style and experience..."
            rows="4" counter="500" maxlength="500"
            prepend-inner-icon="mdi-text-box-outline"
            class="mb-4"
          />
          <v-row>
            <v-col cols="12" sm="6">
              <v-select
                v-model="form.gender"
                label="Gender"
                :items="[
                  { title: 'Male',   value: 'male'   },
                  { title: 'Female', value: 'female' },
                  { title: 'Other',  value: 'other'  },
                ]"
                item-title="title"
                item-value="value"
                prepend-inner-icon="mdi-gender-male-female"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model.number="form.age"
                label="Age"
                type="number" min="18" max="100"
                prepend-inner-icon="mdi-cake-variant-outline"
                :rules="[v => !v || (v >= 18 && v <= 100) || 'Must be 18–100']"
              />
            </v-col>
          </v-row>
        </v-card>

        <!-- LOCATION & RATES -->
        <v-card rounded="xl" class="section-card pa-6 mb-6">
          <p class="section-heading">Location & Rates</p>
          <v-row>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.location"
                label="City / Location"
                placeholder="e.g. Nairobi"
                prepend-inner-icon="mdi-map-marker-outline"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model.number="form.hourly_rate"
                label="Hourly Rate (KSh)"
                type="number" min="0"
                placeholder="e.g. 2500"
                prepend-inner-icon="mdi-cash"
                :hint="form.hourly_rate ? `KSh ${Number(form.hourly_rate).toLocaleString()} / hr` : ''"
                persistent-hint
              />
            </v-col>
          </v-row>
        </v-card>

        <!-- ALERTS -->
        <v-alert v-if="saveError" type="error" variant="tonal" rounded="xl" density="compact" class="mb-4">
          {{ saveError }}
        </v-alert>
        <v-alert
          v-if="saveSuccess"
          type="success" variant="tonal" rounded="xl" density="compact" class="mb-4"
          prepend-icon="mdi-check-circle-outline"
        >
          Profile saved successfully!
        </v-alert>

        <!-- SAVE -->
        <v-btn
          type="submit" color="primary" size="large" rounded="xl"
          :loading="saving" min-width="180"
        >
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

// ── state ──────────────────────────────────────────────────────────
const pageState    = ref('loading')   // 'loading' | 'error' | 'ready'
const errorMessage = ref('')
const debugInfo    = ref('')

const formRef      = ref(null)
const fileInput    = ref(null)
const saving       = ref(false)
const saveError    = ref('')
const saveSuccess  = ref(false)
const photoPreview = ref(null)   // blob URL of newly selected file
const photoFile    = ref(null)   // File object
const imgLoadError = ref(false)  // true when saved photo can't load (storage:link missing)

const form = ref({
  bio:          '',
  location:     '',
  hourly_rate:  '',
  gender:       '',
  age:          '',
  profile_photo: '',  // relative path stored in DB e.g. "profiles/xxx.jpg"
})

// ── computed ───────────────────────────────────────────────────────
const userName  = computed(() => authStore.user?.name  || '')
const userEmail = computed(() => authStore.user?.email || '')
const initials  = computed(() =>
  userName.value.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase() || '?'
)

// Build the full public URL for a stored photo path
const BACKEND = computed(() =>
  (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api')
    .replace(/\/api\/?$/, '')
    .replace(/\/$/, '')
)

const photoUrl = computed(() => {
  const path = form.value.profile_photo
  if (!path) return ''
  // Already a full URL — return as-is
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  // Relative path → prepend backend storage URL
  // e.g. "profiles/abc.jpg" → "http://127.0.0.1:8000/storage/profiles/abc.jpg"
  const clean = path.replace(/^\/+/, '')
  return `${BACKEND.value}/storage/${clean}`
})

const FIELDS = ['bio', 'location', 'hourly_rate', 'gender', 'age', 'profile_photo']
const LABELS = {
  bio: 'Bio', location: 'Location',
  hourly_rate: 'Hourly Rate', gender: 'Gender',
  age: 'Age', profile_photo: 'Profile Photo',
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
  FIELDS
    .filter(f => {
      const v = f === 'profile_photo'
        ? (photoPreview.value || form.value.profile_photo)
        : form.value[f]
      return !v && v !== 0
    })
    .map(f => LABELS[f])
)

// ── helpers ────────────────────────────────────────────────────────
function fillForm(profile) {
  if (!profile) return
  form.value = {
    bio:           profile.bio           ?? '',
    location:      profile.location      ?? '',
    hourly_rate:   profile.hourly_rate   ?? '',
    gender:        profile.gender        ?? '',
    age:           profile.age           ?? '',
    profile_photo: profile.profile_photo ?? '',
  }
}

function onImgError() {
  // The photo path is saved but the URL doesn't resolve
  // — almost always means storage:link hasn't been run
  imgLoadError.value = true
}

// ── load profile ───────────────────────────────────────────────────
async function loadProfile() {
  pageState.value    = 'loading'
  errorMessage.value = ''
  debugInfo.value    = ''
  imgLoadError.value = false

  try {
    const { data } = await api.get('/user')
    const user = (data?.user && typeof data.user === 'object') ? data.user : data

    if (!user?.id) {
      errorMessage.value = 'Server returned unexpected data. Check GET /api/user.'
      debugInfo.value    = JSON.stringify(data, null, 2).slice(0, 600)
      pageState.value    = 'error'
      return
    }

    // Persist to store
    authStore.user = user
    localStorage.setItem('user', JSON.stringify(user))

    // Laravel serialises relationship as "photographer_profile" (snake_case)
    const profile = user.photographer_profile ?? user.photographerProfile ?? null
    fillForm(profile)

    pageState.value = 'ready'

  } catch (e) {
    const s = e.response?.status
    if (!e.response)   errorMessage.value = `Cannot reach server at ${BACKEND.value}. Is Laravel running?`
    else if (s === 401) errorMessage.value = 'Session expired. Please log in again.'
    else if (s === 403) errorMessage.value = 'Access denied. Make sure you are logged in.'
    else if (s === 404) errorMessage.value = 'Endpoint GET /api/user not found. Check routes/api.php.'
    else                errorMessage.value = e.response?.data?.message || `Error ${s}`
    debugInfo.value = e.response
      ? JSON.stringify({ status: s, body: e.response.data }, null, 2).slice(0, 500)
      : e.message
    pageState.value = 'error'
  }
}

// ── photo picker ───────────────────────────────────────────────────
function onPhoto(e) {
  const f = e.target.files?.[0]
  if (!f) return
  if (f.size > 4 * 1024 * 1024) {
    appStore.notify('Image must be under 4MB', 'warning')
    return
  }
  photoFile.value    = f
  photoPreview.value = URL.createObjectURL(f)
  imgLoadError.value = false
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

    // Always send all fields so empty values can clear old data
    fd.append('bio',         form.value.bio         || '')
    fd.append('location',    form.value.location    || '')
    fd.append('gender',      form.value.gender      || '')

    if (form.value.hourly_rate !== '' && form.value.hourly_rate !== null) {
      fd.append('hourly_rate', String(form.value.hourly_rate))
    }
    if (form.value.age !== '' && form.value.age !== null) {
      fd.append('age', String(form.value.age))
    }
    if (photoFile.value) {
      fd.append('profile_photo', photoFile.value)
    }

    // Use PUT directly — works with XAMPP + Laravel
    const saveResponse = await api.put('/photographer/profile', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    // The backend now returns the fresh profile in the response
    // Use it directly instead of making a second API call
    const freshProfile =
      saveResponse.data?.user?.photographer_profile ??
      saveResponse.data?.profile ??
      null

    if (freshProfile) {
      fillForm(freshProfile)
      // Update store with fresh data
      if (saveResponse.data?.user) {
        authStore.user = saveResponse.data.user
        localStorage.setItem('user', JSON.stringify(saveResponse.data.user))
      }
    } else {
      // Fallback: fetch fresh user from API
      try {
        const { data: userData } = await api.get('/user')
        const user = userData?.user ?? userData
        if (user?.id) {
          authStore.user = user
          localStorage.setItem('user', JSON.stringify(user))
          const p = user.photographer_profile ?? user.photographerProfile
          if (p) fillForm(p)
        }
      } catch (_) {}
    }

    // Clear the selected file — photo is now saved
    photoFile.value    = null
    photoPreview.value = null
    imgLoadError.value = false

    saveSuccess.value = true
    appStore.notify('Profile saved! ✓', 'success')
    setTimeout(() => { saveSuccess.value = false }, 4000)

  } catch (e) {
    const s = e.response?.status
    if (s === 422) {
      const errs = e.response?.data?.errors || {}
      saveError.value = Object.values(errs).flat()[0] || 'Validation failed.'
    } else if (s === 405) {
      // PUT not allowed — try POST instead
      saveError.value = 'PUT method not allowed. Make sure Route::put(\'/photographer/profile\', ...) exists in routes/api.php.'
    } else if (s === 403) {
      saveError.value = 'Permission denied. Only photographers can update this profile.'
    } else if (s === 404) {
      saveError.value = 'Route PUT /api/photographer/profile not found. Check routes/api.php.'
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
.section-card    { border: 1px solid rgba(0,0,0,0.07) !important; }
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
  position: absolute; inset: 0;
  background: rgba(0,0,0,0.45); border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  opacity: 0; transition: opacity 0.2s;
}
.avatar-wrap:hover .avatar-cam { opacity: 1; }
.gap-3 { gap: 12px; }
</style>