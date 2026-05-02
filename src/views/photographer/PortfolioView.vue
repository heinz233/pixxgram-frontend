<template>
  <div>

    <!-- Header -->
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <h2 class="text-h6 font-weight-bold">My Portfolio</h2>
        <p class="text-medium-emphasis mt-1">
          {{ items.length }} photo{{ items.length !== 1 ? 's' : '' }} uploaded
        </p>
      </div>
      <v-btn
        color="primary" rounded="lg"
        prepend-icon="mdi-plus"
        @click="openUploadDialog"
      >
        Upload Photos
      </v-btn>
    </div>

    <!-- Subscription warning -->
    <v-alert
      v-if="subscriptionWarning"
      color="warning" variant="tonal" rounded="xl"
      class="mb-5" border="start"
      prepend-icon="mdi-crown-outline"
    >
      <p class="font-weight-bold mb-1">Subscription required to upload</p>
      <p class="text-body-2 mb-2">
        You need an active subscription to add photos to your portfolio.
      </p>
      <v-btn size="small" color="warning" variant="flat" rounded="lg"
        :to="{ name: 'Subscription' }">
        Subscribe Now
      </v-btn>
    </v-alert>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-16">
      <v-progress-circular indeterminate color="primary" size="48" />
      <p class="mt-4 text-medium-emphasis">Loading your portfolio...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="loadError" class="text-center py-16">
      <v-icon size="64" color="error">mdi-alert-circle-outline</v-icon>
      <p class="mt-3 text-medium-emphasis">{{ loadError }}</p>
      <v-btn color="primary" variant="tonal" class="mt-4" @click="loadPortfolio">
        <v-icon start>mdi-refresh</v-icon> Try Again
      </v-btn>
    </div>

    <template v-else>

      <!-- Category filter tabs -->
      <div v-if="items.length > 0" class="category-tabs mb-5">
        <v-chip
          :variant="activeCategory === '' ? 'flat' : 'outlined'"
          color="primary" class="mr-2 mb-2"
          @click="activeCategory = ''"
        >
          All ({{ items.length }})
        </v-chip>
        <v-chip
          v-for="cat in categories"
          :key="cat"
          :variant="activeCategory === cat ? 'flat' : 'outlined'"
          color="primary" class="mr-2 mb-2"
          @click="activeCategory = cat"
        >
          {{ cat }} ({{ categoryCount(cat) }})
        </v-chip>
      </div>

      <!-- Empty state -->
      <div v-if="!filteredItems.length" class="empty-state text-center py-16">
        <div class="empty-icon mx-auto mb-4">
          <v-icon size="48" color="medium-emphasis">mdi-image-plus-outline</v-icon>
        </div>
        <h3 class="text-subtitle-1 font-weight-bold mb-2">
          {{ activeCategory ? 'No photos in this category' : 'Your portfolio is empty' }}
        </h3>
        <p class="text-body-2 text-medium-emphasis mb-5" style="max-width:360px;margin:0 auto">
          {{ activeCategory
            ? 'Try selecting a different category or upload new photos.'
            : 'Start building your portfolio by uploading your best work. Clients will see these when browsing your profile.' }}
        </p>
        <v-btn
          v-if="!activeCategory"
          color="primary" rounded="lg"
          prepend-icon="mdi-cloud-upload-outline"
          @click="openUploadDialog"
        >
          Upload Your First Photo
        </v-btn>
        <v-btn
          v-else
          variant="tonal" color="primary" rounded="lg"
          @click="activeCategory = ''"
        >
          Show All Photos
        </v-btn>
      </div>

      <!-- Portfolio grid -->
      <div v-else class="portfolio-grid">
        <div
          v-for="item in filteredItems"
          :key="item.id"
          class="portfolio-item"
        >
          <!-- Image -->
          <v-img
            :src="buildUrl(item.thumbnail_url || item.image_url)"
            cover aspect-ratio="1"
            class="portfolio-img"
            @click="openLightbox(item)"
          >
            <template #placeholder>
              <div class="d-flex align-center justify-center fill-height">
                <v-progress-circular indeterminate color="primary" size="24" />
              </div>
            </template>
          </v-img>

          <!-- Hover overlay -->
          <div class="portfolio-overlay" @click="openLightbox(item)">
            <v-icon color="white" size="22" class="mb-2">mdi-eye</v-icon>
            <p class="text-white text-caption font-weight-bold text-center px-2">
              {{ item.title }}
            </p>
            <p class="text-white text-caption opacity-75 text-center">
              {{ item.category }}
            </p>
            <div class="d-flex gap-2 mt-2">
              <v-chip size="x-small" color="white" variant="outlined">
                <v-icon start size="10">mdi-eye</v-icon>{{ item.views || 0 }}
              </v-chip>
            </div>
          </div>

          <!-- Delete button -->
          <v-btn
            icon size="x-small"
            color="error" variant="flat"
            class="delete-btn"
            :loading="deleteLoading === item.id"
            @click.stop="confirmDelete(item)"
          >
            <v-icon size="14">mdi-trash-can</v-icon>
          </v-btn>
        </div>
      </div>

    </template>

    <!-- ── UPLOAD DIALOG ─────────────────────────────────────────── -->
    <v-dialog v-model="uploadDialog" max-width="560" persistent>
      <v-card rounded="xl" class="pa-6">
        <div class="d-flex align-center justify-space-between mb-5">
          <h3 class="text-subtitle-1 font-weight-bold">Upload to Portfolio</h3>
          <v-btn icon size="small" variant="text" @click="closeUploadDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>

        <v-form ref="formRef" @submit.prevent="upload">

          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="uploadForm.title"
                label="Title"
                prepend-inner-icon="mdi-format-title"
                :rules="[v => !!v || 'Title is required']"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-combobox
                v-model="uploadForm.category"
                label="Category"
                :items="categoryOptions"
                prepend-inner-icon="mdi-tag-outline"
                :rules="[v => !!v || 'Category is required']"
              />
            </v-col>
            <v-col cols="12">
              <v-textarea
                v-model="uploadForm.description"
                label="Description (optional)"
                rows="2"
                prepend-inner-icon="mdi-text-box-outline"
              />
            </v-col>
          </v-row>

          <!-- Drop zone -->
          <div
            class="drop-zone mb-4"
            :class="{ dragover: isDragging }"
            @click="fileInput?.click()"
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            @drop.prevent="onDrop"
          >
            <div v-if="!selectedFiles.length" class="text-center py-4">
              <v-icon size="40" color="medium-emphasis" class="mb-2">
                mdi-cloud-upload-outline
              </v-icon>
              <p class="text-body-2 font-weight-semibold">
                Click to browse or drag photos here
              </p>
              <p class="text-caption text-medium-emphasis mt-1">
                JPG, PNG, GIF, WEBP · Max 5MB each · Up to 10 photos
              </p>
            </div>

            <div v-else class="selected-previews">
              <div
                v-for="(f, i) in selectedFiles"
                :key="i"
                class="preview-thumb"
              >
                <img :src="f.preview" alt="preview" />
                <v-btn
                  icon size="x-small" color="error" variant="flat"
                  class="remove-btn"
                  @click.stop="removeFile(i)"
                >
                  <v-icon size="12">mdi-close</v-icon>
                </v-btn>
              </div>
              <!-- Add more button -->
              <div
                class="preview-thumb add-more"
                @click.stop="fileInput?.click()"
              >
                <v-icon size="22" color="primary">mdi-plus</v-icon>
              </div>
            </div>

            <input
              ref="fileInput"
              type="file"
              multiple
              accept="image/jpeg,image/png,image/gif,image/webp"
              hidden
              @change="onFilesSelected"
            />
          </div>

          <!-- File count -->
          <p v-if="selectedFiles.length" class="text-caption text-medium-emphasis mb-3">
            {{ selectedFiles.length }} photo{{ selectedFiles.length !== 1 ? 's' : '' }} selected
          </p>

          <!-- Upload progress -->
          <v-progress-linear
            v-if="uploading"
            :model-value="uploadProgress"
            color="primary" rounded height="6"
            class="mb-4"
          />

          <!-- Error -->
          <v-alert
            v-if="uploadError"
            type="error" variant="tonal" rounded="xl"
            density="compact" class="mb-4"
          >
            {{ uploadError }}
            <template v-if="uploadError.includes('subscription')">
              <br>
              <router-link to="/photographer/subscription" class="font-weight-bold">
                Subscribe here →
              </router-link>
            </template>
          </v-alert>

          <div class="d-flex gap-3">
            <v-btn
              variant="text" @click="closeUploadDialog"
              class="flex-grow-1" :disabled="uploading"
            >
              Cancel
            </v-btn>
            <v-btn
              type="submit" color="primary" rounded="lg"
              :loading="uploading"
              :disabled="!selectedFiles.length"
              class="flex-grow-1"
            >
              <v-icon start>mdi-cloud-upload</v-icon>
              Upload {{ selectedFiles.length > 0 ? `(${selectedFiles.length})` : '' }}
            </v-btn>
          </div>
        </v-form>
      </v-card>
    </v-dialog>

    <!-- ── LIGHTBOX ──────────────────────────────────────────────── -->
    <v-dialog v-model="lightboxOpen" max-width="900">
      <v-card rounded="xl" class="pa-0 overflow-hidden" v-if="lightboxItem">
        <v-img
          :src="buildUrl(lightboxItem.image_url)"
          max-height="580"
          contain
          style="background:#000"
        />
        <div class="pa-4 d-flex align-start justify-space-between">
          <div>
            <p class="text-subtitle-2 font-weight-bold">{{ lightboxItem.title }}</p>
            <p class="text-caption text-medium-emphasis">{{ lightboxItem.category }}</p>
            <p v-if="lightboxItem.description" class="text-body-2 mt-1">
              {{ lightboxItem.description }}
            </p>
          </div>
          <v-btn icon size="small" variant="text" @click="lightboxOpen = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
      </v-card>
    </v-dialog>

    <!-- ── DELETE CONFIRM ────────────────────────────────────────── -->
    <v-dialog v-model="deleteDialog" max-width="380">
      <v-card rounded="xl" class="pa-7 text-center">
        <v-icon size="48" color="error" class="mb-3">mdi-trash-can-outline</v-icon>
        <h3 class="text-subtitle-1 font-weight-bold mb-2">Delete Photo?</h3>
        <p class="text-body-2 text-medium-emphasis mb-6">
          "<strong>{{ deleteTarget?.title }}</strong>" will be permanently removed from your portfolio.
        </p>
        <div class="d-flex gap-3">
          <v-btn variant="text" @click="deleteDialog = false" class="flex-grow-1">
            Cancel
          </v-btn>
          <v-btn
            color="error" rounded="lg"
            :loading="deleteLoading === deleteTarget?.id"
            @click="doDelete"
            class="flex-grow-1"
          >
            Delete
          </v-btn>
        </div>
      </v-card>
    </v-dialog>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { photographersApi } from '@/api/photographers'
import api from '@/api/axios'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'

const authStore = useAuthStore()
const appStore  = useAppStore()

// ── State ──────────────────────────────────────────────────────────
const items          = ref([])
const loading        = ref(true)
const loadError      = ref('')
const activeCategory = ref('')

// Upload
const uploadDialog   = ref(false)
const uploading      = ref(false)
const uploadProgress = ref(0)
const uploadError    = ref('')
const isDragging     = ref(false)
const selectedFiles  = ref([])
const fileInput      = ref(null)
const formRef        = ref(null)
const uploadForm     = ref({ title: '', category: '', description: '' })
const subscriptionWarning = ref(false)

// Lightbox
const lightboxOpen = ref(false)
const lightboxItem = ref(null)

// Delete
const deleteDialog  = ref(false)
const deleteTarget  = ref(null)
const deleteLoading = ref(null)

// ── Constants ──────────────────────────────────────────────────────
const categoryOptions = [
  'Wedding', 'Portrait', 'Events', 'Fashion', 'Corporate',
  'Nature', 'Real Estate', 'Sports', 'Travel', 'Family', 'Other',
]

// ── Backend URL builder ─────────────────────────────────────────────
const BACKEND = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api')
  .replace(/\/api\/?$/, '').replace(/\/$/, '')

function buildUrl(path) {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  if (path.startsWith('/storage/')) return `${BACKEND}${path}`
  if (path.startsWith('storage/'))  return `${BACKEND}/${path}`
  return `${BACKEND}/storage/${path.replace(/^\/+/, '')}`
}

// ── Computed ───────────────────────────────────────────────────────
const categories = computed(() => {
  const cats = items.value.map(i => i.category).filter(Boolean)
  return [...new Set(cats)].sort()
})

const filteredItems = computed(() => {
  if (!activeCategory.value) return items.value
  return items.value.filter(i => i.category === activeCategory.value)
})

function categoryCount(cat) {
  return items.value.filter(i => i.category === cat).length
}

// ── Data loading ───────────────────────────────────────────────────
async function loadPortfolio() {
  loading.value  = true
  loadError.value = ''

  try {
    // Use the dashboard endpoint to get OWN portfolio regardless of active status
    const { data } = await photographersApi.dashboard()
    items.value = data.portfolio_analysis || []

    // If portfolio_analysis only has stats, fetch full portfolio separately
    if (items.value.length === 0 || !items.value[0]?.image_url) {
      await loadPortfolioFallback()
    }
  } catch (e) {
    // Fallback: try fetching portfolio directly from show endpoint
    await loadPortfolioFallback()
  } finally {
    loading.value = false
  }
}

async function loadPortfolioFallback() {
  try {
    const userId = authStore.user?.id
    if (!userId) return

    // Try the public show endpoint
    const { data } = await photographersApi.show(userId)
    items.value = data.portfolios || []
  } catch (e) {
    // Try fetching portfolio directly
    try {
      const { data } = await api.get('/photographer/portfolio')
      items.value = data.portfolios || data || []
    } catch (e2) {
      if (e2.response?.status === 401) {
        loadError.value = 'Session expired. Please log in again.'
      } else if (e2.response?.status === 403) {
        loadError.value = 'Access denied. Make sure you are logged in as a photographer.'
      } else {
        // Not a fatal error — portfolio might just be empty
        items.value = []
      }
    }
  }
}

// ── Upload ─────────────────────────────────────────────────────────
function openUploadDialog() {
  subscriptionWarning.value = false
  uploadError.value = ''
  uploadDialog.value = true
}

function closeUploadDialog() {
  if (uploading.value) return
  uploadDialog.value = false
  selectedFiles.value = []
  uploadForm.value = { title: '', category: '', description: '' }
  uploadError.value = ''
  uploadProgress.value = 0
}

function onFilesSelected(e) {
  addFiles(Array.from(e.target.files))
  // Reset input so same file can be reselected
  if (fileInput.value) fileInput.value.value = ''
}

function onDrop(e) {
  isDragging.value = false
  addFiles(Array.from(e.dataTransfer.files))
}

function addFiles(files) {
  const imageFiles = files.filter(f => f.type.startsWith('image/'))
  const remaining  = 10 - selectedFiles.value.length

  if (imageFiles.length > remaining) {
    appStore.notify(`Maximum 10 photos per upload. Only first ${remaining} added.`, 'warning')
  }

  imageFiles.slice(0, remaining).forEach(f => {
    // Check size (5MB)
    if (f.size > 5 * 1024 * 1024) {
      appStore.notify(`"${f.name}" is too large. Max 5MB per image.`, 'warning')
      return
    }
    selectedFiles.value.push({
      file:    f,
      preview: URL.createObjectURL(f),
      name:    f.name,
    })
  })
}

function removeFile(i) {
  URL.revokeObjectURL(selectedFiles.value[i].preview)
  selectedFiles.value.splice(i, 1)
}

async function upload() {
  const { valid } = await formRef.value.validate()
  if (!valid || !selectedFiles.value.length) return

  uploading.value      = true
  uploadError.value    = ''
  uploadProgress.value = 0

  try {
    const fd = new FormData()
    fd.append('title',    uploadForm.value.title)
    fd.append('category', uploadForm.value.category)
    if (uploadForm.value.description) {
      fd.append('description', uploadForm.value.description)
    }
    selectedFiles.value.forEach((f, i) => {
      fd.append(`images[${i}]`, f.file)
    })

    // Simulate progress
    uploadProgress.value = 30
    const { data } = await photographersApi.uploadPortfolio(fd)
    uploadProgress.value = 100

    // Add new items to top of list
    const newItems = data.images || []
    items.value.unshift(...newItems)

    closeUploadDialog()
    appStore.notify(`${newItems.length} photo${newItems.length !== 1 ? 's' : ''} uploaded successfully! 🎉`, 'success')

  } catch (e) {
    uploadProgress.value = 0
    const status  = e.response?.status
    const message = e.response?.data?.message || e.response?.data?.error || ''

    if (status === 403) {
      if (message.toLowerCase().includes('subscription')) {
        uploadError.value = 'An active subscription is required to upload photos.'
        subscriptionWarning.value = true
      } else {
        uploadError.value = 'Access denied. Only photographers can upload portfolio photos.'
      }
    } else if (status === 422) {
      const errors = e.response?.data?.errors || {}
      const firstError = Object.values(errors).flat()[0]
      uploadError.value = firstError || message || 'Validation failed. Check your files and try again.'
    } else if (status === 404) {
      uploadError.value = 'Upload endpoint not found. Please check your backend routes.'
    } else {
      uploadError.value = message || 'Upload failed. Please try again.'
    }
  } finally {
    uploading.value = false
  }
}

// ── Lightbox ───────────────────────────────────────────────────────
function openLightbox(item) {
  lightboxItem.value = item
  lightboxOpen.value = true
}

// ── Delete ─────────────────────────────────────────────────────────
function confirmDelete(item) {
  deleteTarget.value = item
  deleteDialog.value = true
}

async function doDelete() {
  if (!deleteTarget.value) return
  deleteLoading.value = deleteTarget.value.id
  try {
    await api.delete(`/photographer/portfolio/${deleteTarget.value.id}`)
    items.value = items.value.filter(i => i.id !== deleteTarget.value.id)
    deleteDialog.value = false
    appStore.notify('Photo deleted from portfolio.')
  } catch (e) {
    appStore.notify(
      e.response?.data?.message || 'Failed to delete photo.',
      'error'
    )
  } finally {
    deleteLoading.value = null
  }
}

onMounted(loadPortfolio)
</script>

<style scoped>
/* Portfolio grid */
.portfolio-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
  gap: 14px;
}

.portfolio-item {
  position: relative;
  border-radius: 14px;
  overflow: hidden;
  cursor: pointer;
  aspect-ratio: 1;
  background: rgba(0,0,0,0.05);
}

.portfolio-img {
  width: 100%; height: 100%;
  border-radius: 14px;
  transition: transform 0.25s;
}
.portfolio-item:hover .portfolio-img { transform: scale(1.04); }

.portfolio-overlay {
  position: absolute; inset: 0;
  background: rgba(0,0,0,0.55);
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  opacity: 0; transition: opacity 0.2s;
  border-radius: 14px; padding: 12px;
  gap: 4px;
}
.portfolio-item:hover .portfolio-overlay { opacity: 1; }

.delete-btn {
  position: absolute;
  top: 8px; right: 8px;
  opacity: 0;
  transition: opacity 0.2s;
}
.portfolio-item:hover .delete-btn { opacity: 1; }

/* Category filter */
.category-tabs { display: flex; flex-wrap: wrap; }

/* Empty state */
.empty-icon {
  width: 96px; height: 96px;
  background: rgba(0,0,0,0.04);
  border-radius: 28px;
  display: flex; align-items: center; justify-content: center;
}

/* Drop zone */
.drop-zone {
  border: 2px dashed rgba(0,0,0,0.15);
  border-radius: 14px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s;
  min-height: 130px;
  display: flex; align-items: center; justify-content: center;
}
.drop-zone:hover  { border-color: rgb(var(--v-theme-primary)); }
.drop-zone.dragover {
  border-color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.04);
}

/* Previews */
.selected-previews {
  display: flex; flex-wrap: wrap; gap: 10px;
  width: 100%; padding: 4px;
}
.preview-thumb {
  position: relative;
  width: 76px; height: 76px;
  border-radius: 10px;
  overflow: visible;
  flex-shrink: 0;
}
.preview-thumb img {
  width: 100%; height: 100%;
  object-fit: cover;
  border-radius: 10px;
  border: 1px solid rgba(0,0,0,0.08);
}
.preview-thumb.add-more {
  border: 2px dashed rgba(0,0,0,0.15);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; border-radius: 10px;
  transition: border-color 0.2s;
}
.preview-thumb.add-more:hover { border-color: rgb(var(--v-theme-primary)); }
.remove-btn {
  position: absolute;
  top: -7px; right: -7px;
  z-index: 1;
}

.gap-2 { gap: 8px; }
.gap-3 { gap: 12px; }
</style>