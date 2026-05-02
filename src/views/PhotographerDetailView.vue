<template>
  <div>
    <NavBar />
    <v-container style="max-width:1100px" class="py-8">

      <v-btn variant="text" size="small" prepend-icon="mdi-arrow-left"
        @click="$router.back()" class="mb-5">
        Back to Browse
      </v-btn>

      <!-- LOADING -->
      <div v-if="pageState === 'loading'" class="text-center py-16">
        <v-progress-circular indeterminate color="primary" size="52" />
        <p class="mt-4 text-medium-emphasis">Loading profile...</p>
      </div>

      <!-- ERROR -->
      <div v-else-if="pageState === 'error'" class="text-center py-16">
        <v-icon size="64" color="error">mdi-alert-circle-outline</v-icon>
        <p class="mt-4 text-subtitle-1 font-weight-bold">Could not load profile</p>
        <p class="mt-1 text-body-2 text-medium-emphasis" style="max-width:380px;margin:8px auto 0">
          {{ errorMessage }}
        </p>
        <div class="d-flex gap-3 justify-center mt-6">
          <v-btn color="primary" rounded="lg" @click="load">
            <v-icon start>mdi-refresh</v-icon> Retry
          </v-btn>
          <v-btn variant="outlined" rounded="lg" :to="{ name: 'Photographers' }">
            Browse All
          </v-btn>
        </div>
      </div>

      <!-- READY -->
      <v-row v-else-if="pageState === 'ready'">

        <!-- LEFT: identity card -->
        <v-col cols="12" md="4">
          <v-card rounded="xl" class="pa-6 text-center profile-card mb-4">

            <v-avatar size="120" class="mb-4" color="primary">
              <v-img v-if="profilePhotoUrl && !photoError"
                :src="profilePhotoUrl" cover
                @error="photoError = true" />
              <span v-else class="text-white text-h4 font-weight-bold">
                {{ initials }}
              </span>
            </v-avatar>

            <h2 class="text-h6 font-weight-bold">{{ photographer.name }}</h2>

            <div class="d-flex align-center justify-center mt-2" style="gap:4px">
              <v-icon size="14" color="medium-emphasis">mdi-map-marker-outline</v-icon>
              <span class="text-caption text-medium-emphasis">
                {{ profile?.location || 'Kenya' }}
              </span>
            </div>

            <div class="d-flex align-center justify-center mt-2 mb-1" style="gap:4px">
              <v-rating :model-value="profile?.average_rating || 0"
                density="compact" size="14" color="amber" readonly half-increments />
              <span class="text-caption text-medium-emphasis">
                ({{ profile?.total_ratings || 0 }})
              </span>
            </div>

            <v-divider class="my-4" />

            <div class="info-row">
              <span class="info-label">Hourly Rate</span>
              <span class="info-value">
                {{ profile?.hourly_rate
                  ? `KSh ${Number(profile.hourly_rate).toLocaleString()}/hr`
                  : '—' }}
              </span>
            </div>
            <div v-if="profile?.gender" class="info-row">
              <span class="info-label">Gender</span>
              <span class="info-value text-capitalize">{{ profile.gender }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Portfolio</span>
              <span class="info-value">{{ photographer.portfolios?.length || 0 }} photos</span>
            </div>
            <div class="info-row">
              <span class="info-label">Reviews</span>
              <span class="info-value">{{ ratings.length }}</span>
            </div>

            <v-divider class="my-4" />

            <!-- Book Now (clients only) -->
            <v-btn v-if="authStore.isClient"
              block color="primary" rounded="lg" size="large" class="mb-3"
              @click="bookingDialog = true">
              <v-icon start>mdi-calendar-plus</v-icon> Book Now
            </v-btn>

            <!-- Not logged in -->
            <v-btn v-else-if="!authStore.isLoggedIn"
              block color="primary" rounded="lg" size="large" class="mb-3"
              :to="{ name: 'Register' }">
              <v-icon start>mdi-account-plus</v-icon> Sign Up to Book
            </v-btn>

            <!-- Message -->
            <v-btn v-if="authStore.isLoggedIn && !authStore.isAdmin"
              block variant="outlined" color="primary" rounded="lg" class="mb-3"
              :to="{ name: authStore.isClient ? 'ClientMessages' : 'PhotographerMessages' }">
              <v-icon start>mdi-message-outline</v-icon> Send Message
            </v-btn>

            <!-- Rate -->
            <v-btn v-if="authStore.isClient"
              block variant="text" color="secondary" rounded="lg"
              @click="ratingDialog = true">
              <v-icon start>mdi-star-outline</v-icon> Leave a Review
            </v-btn>

            <!-- Report -->
            <v-btn v-if="authStore.isClient"
              block variant="text" color="error" rounded="lg" size="small"
              class="mt-1"
              @click="reportDialog = true">
              <v-icon start size="14">mdi-flag-outline</v-icon>
              Report Photographer
            </v-btn>

          </v-card>
        </v-col>

        <!-- RIGHT: bio, portfolio, reviews -->
        <v-col cols="12" md="8">

          <!-- Bio -->
          <v-card rounded="xl" class="pa-6 mb-4 content-card">
            <h3 class="section-title mb-3">About</h3>
            <p class="text-body-2" style="line-height:1.8">
              {{ profile?.bio || 'This photographer has not added a bio yet.' }}
            </p>
          </v-card>

          <!-- Portfolio -->
          <v-card rounded="xl" class="pa-6 mb-4 content-card">
            <div class="d-flex align-center justify-space-between mb-4">
              <h3 class="section-title">Portfolio</h3>
              <v-chip v-if="photographer.portfolios?.length"
                color="primary" variant="tonal" size="small">
                {{ photographer.portfolios.length }} photos
              </v-chip>
            </div>

            <div v-if="!photographer.portfolios?.length" class="text-center py-8">
              <v-icon size="52" color="medium-emphasis">mdi-image-off-outline</v-icon>
              <p class="mt-2 text-body-2 text-medium-emphasis">No portfolio photos yet.</p>
            </div>

            <template v-else>
              <!-- Category chips -->
              <div class="mb-4" style="display:flex;flex-wrap:wrap;gap:8px">
                <v-chip size="small"
                  :variant="activeCategory === '' ? 'flat' : 'outlined'"
                  color="primary" @click="activeCategory = ''">All</v-chip>
                <v-chip v-for="cat in portfolioCategories" :key="cat" size="small"
                  :variant="activeCategory === cat ? 'flat' : 'outlined'"
                  color="primary" @click="activeCategory = cat">{{ cat }}</v-chip>
              </div>

              <div class="portfolio-grid">
                <div v-for="item in filteredPortfolio" :key="item.id"
                  class="portfolio-item" @click="openLightbox(item)">
                  <v-img :src="buildUrl(item.thumbnail_url || item.image_url)"
                    cover aspect-ratio="1" class="portfolio-img">
                    <template #placeholder>
                      <div class="d-flex align-center justify-center fill-height">
                        <v-progress-circular indeterminate size="20" color="primary" />
                      </div>
                    </template>
                  </v-img>
                  <div class="portfolio-overlay">
                    <v-icon color="white" size="24">mdi-eye</v-icon>
                    <p class="text-white text-caption mt-1 px-2 text-center">{{ item.title }}</p>
                  </div>
                </div>
              </div>
            </template>
          </v-card>

          <!-- Reviews -->
          <v-card rounded="xl" class="pa-6 content-card">
            <div class="d-flex align-center justify-space-between mb-4">
              <h3 class="section-title">Reviews</h3>
              <div v-if="ratings.length" class="d-flex align-center" style="gap:6px">
                <v-icon size="16" color="amber">mdi-star</v-icon>
                <span class="text-body-2 font-weight-bold">{{ avgRating }} / 5</span>
              </div>
            </div>

            <div v-if="!ratings.length" class="text-center py-8">
              <v-icon size="52" color="medium-emphasis">mdi-star-off-outline</v-icon>
              <p class="mt-2 text-body-2 text-medium-emphasis">No reviews yet. Be the first!</p>
            </div>

            <div v-else>
              <div v-for="rating in ratings" :key="rating.id" class="review-row py-4">
                <div class="d-flex align-start justify-space-between">
                  <div class="d-flex align-center" style="gap:12px">
                    <v-avatar size="36" color="primary">
                      <span class="text-white text-caption font-weight-bold">
                        {{ rating.client?.name?.charAt(0) || '?' }}
                      </span>
                    </v-avatar>
                    <div>
                      <p class="text-body-2 font-weight-semibold">
                        {{ rating.client?.name || 'Anonymous' }}
                      </p>
                      <div class="d-flex align-center" style="gap:4px">
                        <v-rating :model-value="rating.stars"
                          density="compact" size="12" color="amber" readonly />
                        <span class="text-caption text-medium-emphasis">
                          {{ rating.stars }}/5
                        </span>
                      </div>
                    </div>
                  </div>
                  <span class="text-caption text-medium-emphasis">
                    {{ formatDate(rating.created_at) }}
                  </span>
                </div>
                <p v-if="rating.comment"
                  class="text-body-2 text-medium-emphasis mt-2 ml-12">
                  "{{ rating.comment }}"
                </p>
              </div>
            </div>
          </v-card>

        </v-col>
      </v-row>
    </v-container>

    <!-- LIGHTBOX -->
    <v-dialog v-model="lightboxOpen" max-width="900">
      <v-card v-if="lightboxItem" rounded="xl" class="pa-0 overflow-hidden">
        <v-img :src="buildUrl(lightboxItem.image_url)"
          max-height="600" contain style="background:#111" />
        <div class="pa-4 d-flex align-start justify-space-between">
          <div>
            <p class="font-weight-bold">{{ lightboxItem.title }}</p>
            <p class="text-caption text-medium-emphasis">{{ lightboxItem.category }}</p>
            <p v-if="lightboxItem.description"
              class="text-body-2 mt-1 text-medium-emphasis">
              {{ lightboxItem.description }}
            </p>
          </div>
          <v-btn icon size="small" variant="text" @click="lightboxOpen = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
      </v-card>
    </v-dialog>

    <!-- BOOKING DIALOG -->
    <BookingDialog
      v-if="photographer && authStore.isClient"
      v-model="bookingDialog"
      :photographer="photographer"
      @booked="onBooked"
    />

    <!-- RATING DIALOG -->
    <RatingDialog
      v-if="photographer && authStore.isClient"
      v-model="ratingDialog"
      :photographer-id="photographer.id"
      @rated="onRated"
    />

    <!-- REPORT DIALOG -->
    <ReportDialog
      v-if="photographer && authStore.isClient"
      v-model="reportDialog"
      :photographer-id="photographer.id"
      :photographer-name="photographer.name"
    />

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import NavBar        from '@/components/shared/NavBar.vue'
import BookingDialog from '@/components/client/BookingDialog.vue'
import RatingDialog  from '@/components/client/RatingDialog.vue'
import ReportDialog  from '@/components/client/ReportDialog.vue'
import { photographersApi } from '@/api/photographers'
import { useAuthStore } from '@/stores/auth'
import { useAppStore  } from '@/stores/app'

const route     = useRoute()
const authStore = useAuthStore()
const appStore  = useAppStore()

// state
const pageState    = ref('loading')
const errorMessage = ref('')
const photographer = ref(null)
const photoError   = ref(false)
const bookingDialog= ref(false)
const ratingDialog = ref(false)
const reportDialog = ref(false)
const lightboxOpen = ref(false)
const lightboxItem = ref(null)
const activeCategory = ref('')

// backend base URL — strip /api suffix
const BACKEND = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api')
  .replace(/\/api\/?$/, '').replace(/\/$/, '')

// build full URL for stored paths
function buildUrl(path) {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  if (path.startsWith('/storage/')) return `${BACKEND}${path}`
  if (path.startsWith('storage/'))  return `${BACKEND}/${path}`
  return `${BACKEND}/storage/${path.replace(/^\/+/, '')}`
}

// computed
const profile = computed(() => photographer.value?.photographer_profile ?? null)

const profilePhotoUrl = computed(() => {
  const p = profile.value?.profile_photo
  return p ? buildUrl(p) : ''
})

const initials = computed(() => {
  const n = photographer.value?.name || ''
  return n.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?'
})

// Laravel serialises ratingsReceived → ratings_received
const ratings = computed(() =>
  photographer.value?.ratings_received ?? []
)

const avgRating = computed(() => {
  if (!ratings.value.length) return '0.0'
  const sum = ratings.value.reduce((a, r) => a + (r.stars || 0), 0)
  return (sum / ratings.value.length).toFixed(1)
})

const portfolioCategories = computed(() => {
  const cats = (photographer.value?.portfolios || []).map(p => p.category).filter(Boolean)
  return [...new Set(cats)]
})

const filteredPortfolio = computed(() => {
  const items = photographer.value?.portfolios || []
  if (!activeCategory.value) return items
  return items.filter(p => p.category === activeCategory.value)
})

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-KE', { dateStyle: 'medium' })
}

function openLightbox(item) {
  lightboxItem.value = item
  lightboxOpen.value = true
  // Record the view — fire and forget (don't block UI)
  recordView(item)
}

async function recordView(item) {
  if (!item?.id || !photographer.value?.id) return
  try {
    const { data } = await api.post(
      `/photographers/${photographer.value.id}/portfolio/${item.id}/view`
    )
    // Update view count locally so the photographer sees it immediately
    item.views = data.views ?? (item.views || 0) + 1
  } catch (_) {
    // Silently ignore — view tracking should never break the UI
  }
}

function onBooked(booking) {
  bookingDialog.value = false
  appStore.notify('Booking request sent! The photographer will confirm shortly.', 'success')
}

function onRated() {
  ratingDialog.value = false
  appStore.notify('Thank you for your review!', 'success')
  load() // reload to show updated rating
}

// load photographer data
async function load() {
  pageState.value    = 'loading'
  errorMessage.value = ''
  photoError.value   = false

  const id = route.params.id
  if (!id) {
    errorMessage.value = 'No photographer ID found in the URL.'
    pageState.value    = 'error'
    return
  }

  try {
    const { data } = await photographersApi.show(id)

    if (!data || !data.id) {
      errorMessage.value = 'Photographer not found.'
      pageState.value    = 'error'
      return
    }

    photographer.value = data
    pageState.value    = 'ready'

  } catch (e) {
    const s = e.response?.status

    if (s === 404) {
      errorMessage.value = 'This photographer profile does not exist or has been removed.'
    } else if (s === 403) {
      errorMessage.value = 'You do not have permission to view this profile.'
    } else if (!e.response) {
      errorMessage.value = `Cannot reach the server. Make sure Laravel is running at ${BACKEND}.`
    } else {
      errorMessage.value = e.response?.data?.message || `Failed to load profile (error ${s}).`
    }
    pageState.value = 'error'
  }
}

onMounted(load)
</script>

<style scoped>
.profile-card { border: 1px solid rgba(0,0,0,0.07) !important; }
.content-card { border: 1px solid rgba(0,0,0,0.07) !important; }

.section-title { font-size: 0.95rem; font-weight: 700; }

.info-row {
  display: flex; justify-content: space-between;
  align-items: center; margin-bottom: 10px;
}
.info-label { font-size: 0.78rem; color: rgba(0,0,0,0.45); }
.info-value { font-size: 0.85rem; font-weight: 600; }

.portfolio-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}
@media (max-width: 600px) {
  .portfolio-grid { grid-template-columns: repeat(2, 1fr); }
}

.portfolio-item {
  position: relative; cursor: pointer;
  border-radius: 12px; overflow: hidden;
  aspect-ratio: 1; background: rgba(0,0,0,0.05);
}
.portfolio-img { width: 100%; height: 100%; transition: transform 0.25s; }
.portfolio-item:hover .portfolio-img { transform: scale(1.05); }
.portfolio-overlay {
  position: absolute; inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  opacity: 0; transition: opacity 0.2s;
  border-radius: 12px;
}
.portfolio-item:hover .portfolio-overlay { opacity: 1; }

.review-row { border-bottom: 1px solid rgba(0,0,0,0.06); }
.review-row:last-child { border-bottom: none; }
</style>