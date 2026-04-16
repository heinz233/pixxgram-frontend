<template>
  <div>
    <h2 class="text-h6 font-weight-bold mb-6">My Profile</h2>

    <v-row>
      <!-- Avatar & basic info -->
      <v-col cols="12" md="4">
        <v-card rounded="xl" class="pa-6 text-center profile-card">
          <v-avatar size="96" color="primary" class="mb-4" style="cursor:pointer" @click="fileInput?.click()">
            <v-img v-if="preview || authStore.user?.user_image" :src="preview || authStore.user?.user_image" />
            <span v-else class="text-white text-h4 font-weight-bold">{{ initials }}</span>
          </v-avatar>
          <input ref="fileInput" type="file" accept="image/*" hidden @change="onPhoto" />
          <v-btn variant="text" size="small" color="secondary" @click="fileInput?.click()">
            <v-icon start size="14">mdi-camera</v-icon> Change Photo
          </v-btn>
          <v-divider class="my-4" />
          <div class="text-left">
            <div class="info-row"><span class="info-label">Name</span><span class="info-value">{{ authStore.user?.name }}</span></div>
            <div class="info-row"><span class="info-label">Email</span><span class="info-value text-truncate" style="max-width:160px">{{ authStore.user?.email }}</span></div>
            <div class="info-row"><span class="info-label">Role</span><v-chip size="x-small" color="primary">Client</v-chip></div>
          </div>
        </v-card>
      </v-col>

      <!-- Edit form -->
      <v-col cols="12" md="8">
        <v-card rounded="xl" class="pa-6 profile-card">
          <h3 class="text-subtitle-2 font-weight-bold mb-5">Edit Details</h3>
          <v-form ref="formRef" @submit.prevent="save">
            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field v-model="form.name" label="Full name" :rules="[v => !!v || 'Required']" prepend-inner-icon="mdi-account-outline" />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field v-model="form.phoneNumber" label="Phone number" prepend-inner-icon="mdi-phone-outline" placeholder="07xxxxxxxx" />
              </v-col>
              <v-col cols="12" sm="6">
                <v-select v-model="form.gender" label="Gender" :items="['male','female','other']" prepend-inner-icon="mdi-gender-male-female" />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field v-model="form.dob" label="Date of birth" type="date" prepend-inner-icon="mdi-calendar-outline" />
              </v-col>
              <v-col cols="12">
                <v-text-field v-model="form.gymLocation" label="City / Location" prepend-inner-icon="mdi-map-marker-outline" />
              </v-col>
            </v-row>

            <v-alert v-if="error" type="error" variant="tonal" density="compact" rounded="lg" class="mb-4">{{ error }}</v-alert>
            <v-alert v-if="success" type="success" variant="tonal" density="compact" rounded="lg" class="mb-4">Profile updated successfully!</v-alert>

            <v-btn type="submit" color="primary" :loading="loading">Save Changes</v-btn>
          </v-form>
        </v-card>

        <!-- Change password -->
        <v-card rounded="xl" class="pa-6 profile-card mt-4">
          <h3 class="text-subtitle-2 font-weight-bold mb-5">Change Password</h3>
          <v-form ref="pwFormRef" @submit.prevent="changePassword">
            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field v-model="pw.current" label="Current password" type="password" prepend-inner-icon="mdi-lock-outline" :rules="[v => !!v || 'Required']" />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field v-model="pw.new" label="New password" type="password" prepend-inner-icon="mdi-lock-reset" :rules="[v => !!v || 'Required', v => v.length >= 6 || 'Min 6 characters']" />
              </v-col>
            </v-row>
            <v-alert v-if="pwError" type="error" variant="tonal" density="compact" rounded="lg" class="mb-4">{{ pwError }}</v-alert>
            <v-alert v-if="pwSuccess" type="success" variant="tonal" density="compact" rounded="lg" class="mb-4">Password updated!</v-alert>
            <v-btn type="submit" variant="tonal" color="primary" :loading="pwLoading">Update Password</v-btn>
          </v-form>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import api from '@/api/axios'

const authStore = useAuthStore()
const formRef   = ref(null)
const pwFormRef = ref(null)
const fileInput = ref(null)
const loading   = ref(false)
const error     = ref(''), success = ref(false)
const pwLoading = ref(false), pwError = ref(''), pwSuccess = ref(false)
const preview   = ref(null), photoFile = ref(null)

const form = ref({ name: '', phoneNumber: '', gender: '', dob: '', gymLocation: '' })
const pw   = ref({ current: '', new: '' })

const initials = computed(() => {
  const n = authStore.user?.name || ''
  return n.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()
})

function onPhoto(e) {
  const f = e.target.files[0]
  if (!f) return
  photoFile.value = f
  preview.value   = URL.createObjectURL(f)
}

async function save() {
  const { valid } = await formRef.value.validate()
  if (!valid) return
  loading.value = true; error.value = ''; success.value = false
  try {
    const fd = new FormData()
    Object.entries(form.value).forEach(([k, v]) => { if (v) fd.append(k, v) })
    if (photoFile.value) fd.append('user_image', photoFile.value)
    await api.post('/profile', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    success.value = true
    await authStore.fetchMe()
  } catch (e) { error.value = e.response?.data?.message || 'Update failed' }
  finally { loading.value = false }
}

async function changePassword() {
  const { valid } = await pwFormRef.value.validate()
  if (!valid) return
  pwLoading.value = true; pwError.value = ''; pwSuccess.value = false
  try {
    await api.put('/password', { current_password: pw.value.current, password: pw.value.new, password_confirmation: pw.value.new })
    pwSuccess.value = true
    pw.value = { current: '', new: '' }
    pwFormRef.value.resetValidation()
  } catch (e) { pwError.value = e.response?.data?.message || 'Password update failed' }
  finally { pwLoading.value = false }
}

onMounted(() => {
  const u = authStore.user
  if (u) form.value = { name: u.name || '', phoneNumber: u.phoneNumber || '', gender: u.gender || '', dob: u.dob || '', gymLocation: u.gymLocation || '' }
})
</script>

<style scoped>
.profile-card { border: 1px solid rgba(0,0,0,0.07) !important; }
.info-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.info-label { font-size: 0.78rem; color: rgba(0,0,0,0.45); }
.info-value { font-size: 0.85rem; font-weight: 600; }
</style>
