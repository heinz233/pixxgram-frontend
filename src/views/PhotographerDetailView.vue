<template>
  <div>
    <NavBar />
    <v-container style="max-width:1100px" class="py-8">

      <v-btn variant="text" size="small" prepend-icon="mdi-arrow-left" @click="$router.back()" class="mb-4">
        Back
      </v-btn>

      <div v-if="loading" class="text-center py-16">
        <v-progress-circular indeterminate color="primary" />
      </div>

      <template v-else-if="photographer">
        <v-row>
          <!-- Left col -->
          <v-col cols="12" md="4">
            <v-card rounded="xl" class="pa-6 text-center profile-card">
              <v-avatar size="120" class="mb-4" color="primary">
                <v-img v-if="photographer.photographer_profile?.profile_photo" :src="photographer.photographer_profile.profile_photo" />
                <span v-else class="text-white text-h4 font-weight-bold">{{ initials }}</span>
              </v-avatar>

              <h2 class="text-h6 font-weight-bold">{{ photographer.name }}</h2>

              <div class="d-flex align-center justify-center gap-1 mt-1">
                <v-icon size="14" color="medium-emphasis">mdi-map-marker-outline</v-icon>
                <span class="text-caption text-medium-emphasis">{{ photographer.photographer_profile?.location || 'Kenya' }}</span>
              </div>

              <div class="d-flex align-center justify-center gap-1 mt-2">
                <v-rating :model-value="photographer.photographer_profile?.average_rating || 0"
                  density="compact" size="16" color="secondary" readonly half-increments />
                <span class="text-caption">({{ photographer.photographer_profile?.total_ratings || 0 }})</span>
              </div>

              <v-divider class="my-4" />

              <div class="info-row">
                <span class="info-label">Rate</span>
                <span class="info-value">KSh {{ formatRate(photographer.photographer_profile?.hourly_rate) }}/hr</span>
              </div>
              <div class="info-row" v-if="photographer.photographer_profile?.gender">
                <span class="info-label">Gender</span>
                <span class="info-value text-capitalize">{{ photographer.photographer_profile.gender }}</span>
              </div>
              <div class="info-row" v-if="photographer.photographer_profile?.age">
                <span class="info-label">Age</span>
                <span class="info-value">{{ photographer.photographer_profile.age }} yrs</span>
              </div>

              <v-divider class="my-4" />

              <v-btn v-if="authStore.isClient" block color="primary" rounded="lg" class="mb-3" @click="bookingDialog = true">
                <v-icon start>mdi-calendar-plus</v-icon> Book Now
              </v-btn>
              <v-btn v-if="authStore.isLoggedIn && !authStore.isAdmin" block variant="outlined" color="primary" rounded="lg" class="mb-3"
                :to="{ name: authStore.isClient ? 'ClientMessages' : 'PhotographerMessages' }">
                <v-icon start>mdi-message-outline</v-icon> Message
              </v-btn>
              <v-btn v-if="authStore.isClient" block variant="tonal" color="secondary" rounded="lg" class="mb-2" @click="ratingDialog = true">
                <v-icon start>mdi-star-outline</v-icon> Leave Review
              </v-btn>
              <v-btn v-if="authStore.isClient" block variant="text" color="error" size="small" rounded="lg" @click="reportDialog = true">
                <v-icon start size="14">mdi-flag-outline</v-icon> Report
              </v-btn>
            </v-card>
          </v-col>

          <!-- Right col -->
          <v-col cols="12" md="8">
            <!-- Bio -->
            <v-card rounded="xl" class="pa-6 mb-4 detail-card">
              <h3 class="text-subtitle-1 font-weight-bold mb-3">About</h3>
              <p class="text-body-2" style="line-height:1.7">
                {{ photographer.photographer_profile?.bio || 'No bio provided yet.' }}
              </p>

              <!-- Service tags -->
              <div v-if="photographer.photographer_profile?.service_rates" class="mt-4">
                <p class="text-caption text-medium-emphasis font-weight-bold text-uppercase mb-2">Services</p>
                <div class="d-flex flex-wrap gap-2">
                  <v-chip v-for="(rate, service) in photographer.photographer_profile.service_rates"
                    :key="service" size="small" variant="tonal" color="primary">
                    {{ service }} — KSh {{ Number(rate).toLocaleString() }}
                  </v-chip>
                </div>
              </div>
            </v-card>

            <!-- Portfolio -->
            <v-card rounded="xl" class="pa-6 mb-4 detail-card">
              <div class="d-flex align-center justify-space-between mb-4">
                <h3 class="text-subtitle-1 font-weight-bold">Portfolio</h3>
                <span class="text-caption text-medium-emphasis">{{ photographer.portfolios?.length || 0 }} photos</span>
              </div>

              <div v-if="!photographer.portfolios?.length" class="text-center py-8 text-medium-emphasis">
                <v-icon size="52">mdi-image-off-outline</v-icon>
                <p class="mt-2 text-body-2">No portfolio items yet.</p>
              </div>

              <div v-else>
                <!-- Category filter tabs -->
                <div class="portfolio-categories mb-4">
                  <v-chip size="small" :variant="activeCategory === '' ? 'flat' : 'outlined'"
                    color="primary" class="mr-2" @click="activeCategory = ''">All</v-chip>
                  <v-chip v-for="cat in portfolioCategories" :key="cat" size="small"
                    :variant="activeCategory === cat ? 'flat' : 'outlined'"
                    color="primary" class="mr-2" @click="activeCategory = cat">{{ cat }}</v-chip>
                </div>

                <div class="portfolio-grid">
                  <div v-for="item in filteredPortfolio" :key="item.id" class="portfolio-item" @click="lightboxItem = item">
                    <v-img :src="item.thumbnail_url || item.image_url" cover aspect-ratio="1" rounded="lg" />
                    <div class="portfolio-overlay">
                      <v-icon color="white" size="20">mdi-eye</v-icon>
                      <span class="text-white text-caption mt-1">{{ item.title }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </v-card>

            <!-- Reviews -->
            <v-card rounded="xl" class="pa-6 detail-card">
              <div class="d-flex align-center justify-space-between mb-4">
                <h3 class="text-subtitle-1 font-weight-bold">Reviews</h3>
                <div v-if="photographer.photographer_profile?.average_rating" class="d-flex align-center gap-1">
                  <span class="text-h6 font-weight-bold text-secondary">
                    {{ photographer.photographer_profile.average_rating.toFixed(1) }}
                  </span>
                  <v-icon color="secondary" size="18">mdi-star</v-icon>
                </div>
              </div>

              <div v-if="!photographer.ratings_received?.length" class="text-center py-8 text-medium-emphasis">
                <v-icon size="52">mdi-star-off-outline</v-icon>
                <p class="mt-2 text-body-2">No reviews yet. Be the first!</p>
              </div>

              <div v-else class="reviews-list">
                <div v-for="(rating, i) in photographer.ratings_received" :key="rating.id"
                  class="review-item pa-4 rounded-xl mb-3">
                  <div class="d-flex align-center justify-space-between mb-2">
                    <div class="d-flex align-center gap-3">
                      <v-avatar size="36" color="primary">
                        <span class="text-white text-caption font-weight-bold">
                          {{ rating.client?.name?.charAt(0) }}
                        </span>
                      </v-avatar>
                      <div>
                        <p class="text-body-2 font-weight-semibold">{{ rating.client?.name }}</p>
                        <v-rating :model-value="rating.stars" density="compact" size="12" color="secondary" readonly />
                      </div>
                    </div>
                    <span class="text-caption text-medium-emphasis">
                      {{ new Date(rating.created_at).toLocaleDateString() }}
                    </span>
                  </div>
                  <p v-if="rating.comment" class="text-body-2 text-medium-emphasis">{{ rating.comment }}</p>
                </div>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </template>
    </v-container>

    <!-- Lightbox -->
    <v-dialog v-model="lightboxOpen" max-width="900">
      <v-card rounded="xl" class="pa-2" v-if="lightboxItem">
        <v-img :src="lightboxItem.image_url" max-height="600" contain rounded="xl" />
        <div class="pa-3">
          <p class="text-subtitle-2 font-weight-bold">{{ lightboxItem.title }}</p>
          <p v-if="lightboxItem.description" class="text-caption text-medium-emphasis">{{ lightboxItem.description }}</p>
        </div>
      </v-card>
    </v-dialog>

    <BookingDialog v-if="photographer" v-model="bookingDialog" :photographer="photographer"
      @booked="appStore.notify('Booking submitted!', 'success')" />

    <RatingDialog v-if="photographer" v-model="ratingDialog" :photographer-id="photographer.id"
      @rated="appStore.notify('Rating submitted! Thank you.', 'success')" />

    <ReportDialog v-if="photographer" v-model="reportDialog" :photographer-id="photographer.id" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import NavBar from '@/components/shared/NavBar.vue'
import BookingDialog from '@/components/client/BookingDialog.vue'
import RatingDialog from '@/components/client/RatingDialog.vue'
import ReportDialog from '@/components/client/ReportDialog.vue'
import { photographersApi } from '@/api/photographers'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'

const route = useRoute(), authStore = useAuthStore(), appStore = useAppStore()
const photographer = ref(null), loading = ref(true)
const bookingDialog = ref(false), ratingDialog = ref(false), reportDialog = ref(false)
const lightboxItem = ref(null), activeCategory = ref('')
const lightboxOpen = computed({ get: () => !!lightboxItem.value, set: v => { if (!v) lightboxItem.value = null } })

const initials = computed(() => {
  const n = photographer.value?.name || ''
  return n.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()
})

const portfolioCategories = computed(() => {
  const cats = photographer.value?.portfolios?.map(p => p.category).filter(Boolean) || []
  return [...new Set(cats)]
})

const filteredPortfolio = computed(() => {
  if (!activeCategory.value) return photographer.value?.portfolios || []
  return (photographer.value?.portfolios || []).filter(p => p.category === activeCategory.value)
})

function formatRate(rate) {
  if (!rate) return '—'
  return Number(rate).toLocaleString()
}

onMounted(async () => {
  try {
    const { data } = await photographersApi.show(route.params.id)
    photographer.value = data
  } catch (_) {}
  finally { loading.value = false }
})
</script>

<style scoped>
.profile-card { border: 1px solid rgba(0,0,0,0.07) !important; }
.detail-card  { border: 1px solid rgba(0,0,0,0.07) !important; }
.info-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
.info-label { font-size: 0.8rem; color: rgba(0,0,0,0.45); }
.info-value { font-size: 0.875rem; font-weight: 600; }
.portfolio-categories { display: flex; flex-wrap: wrap; gap: 6px; }
.portfolio-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.portfolio-item { position: relative; cursor: pointer; border-radius: 12px; overflow: hidden; }
.portfolio-item:hover .portfolio-overlay { opacity: 1; }
.portfolio-overlay {
  position: absolute; inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  opacity: 0; transition: opacity 0.2s; border-radius: 12px; padding: 8px;
}
.review-item { background: rgba(0,0,0,0.025); }
.gap-1 { gap: 4px; }
.gap-2 { gap: 8px; }
.gap-3 { gap: 12px; }
</style>
