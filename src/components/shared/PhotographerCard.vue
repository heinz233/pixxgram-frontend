<template>
  <v-card
    class="photographer-card"
    :to="{ name: 'PhotographerProfile', params: { id: photographer.id } }"
    hover
    rounded="xl"
  >
    <!-- Cover image / avatar header -->
    <div class="card-header">
      <v-img
        :src="coverPhoto"
        height="180"
        cover
        class="card-img"
      >
        <template #placeholder>
          <div class="card-placeholder d-flex align-center justify-center fill-height">
            <v-icon size="48" color="white" style="opacity:0.4">mdi-camera</v-icon>
          </div>
        </template>
        <template #error>
          <div class="card-placeholder d-flex align-center justify-center fill-height">
            <span class="text-white text-h4 font-weight-bold" style="opacity:0.7">
              {{ initials }}
            </span>
          </div>
        </template>
      </v-img>
      <div class="card-overlay" />
      <div class="card-badges">
        <v-chip v-if="isActive" size="x-small" color="success" variant="flat">
          <v-icon start size="10">mdi-check-circle</v-icon>Active
        </v-chip>
      </div>
    </div>

    <v-card-text class="pa-4">
      <div class="d-flex align-start justify-space-between mb-1">
        <div class="flex-grow-1 min-width-0">
          <h3 class="text-subtitle-1 font-weight-bold text-truncate">
            {{ photographer.name }}
          </h3>
          <div class="d-flex align-center mt-1" style="gap:4px">
            <v-icon size="13" color="medium-emphasis">mdi-map-marker-outline</v-icon>
            <span class="text-caption text-medium-emphasis text-truncate">
              {{ photographer.photographer_profile?.location || 'Kenya' }}
            </span>
          </div>
        </div>
        <div class="text-right flex-shrink-0 ml-2">
          <div class="text-subtitle-2 font-weight-bold text-secondary">
            {{ rateDisplay }}
          </div>
          <div class="text-caption text-medium-emphasis">/hr</div>
        </div>
      </div>

      <!-- Stars -->
      <div class="d-flex align-center mt-2" style="gap:4px">
        <v-rating
          :model-value="photographer.photographer_profile?.average_rating || 0"
          density="compact" size="13"
          color="amber" readonly half-increments
        />
        <span class="text-caption text-medium-emphasis">
          ({{ photographer.photographer_profile?.total_ratings || 0 }})
        </span>
      </div>

      <!-- Bio snippet -->
      <p class="text-caption text-medium-emphasis mt-2 bio-snippet">
        {{ photographer.photographer_profile?.bio || 'Professional photographer available for bookings.' }}
      </p>
    </v-card-text>

    <v-card-actions class="pa-4 pt-0">
      <v-btn variant="tonal" color="primary" size="small" block rounded="lg">
        View Profile
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  photographer: { type: Object, required: true },
})

// Backend base URL — strip /api suffix
const BACKEND = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api')
  .replace(/\/api\/?$/, '').replace(/\/$/, '')

function buildUrl(path) {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  if (path.startsWith('/storage/')) return `${BACKEND}${path}`
  if (path.startsWith('storage/'))  return `${BACKEND}/${path}`
  return `${BACKEND}/storage/${path.replace(/^\/+/, '')}`
}

const coverPhoto = computed(() => {
  const photo = props.photographer.photographer_profile?.profile_photo
  return photo ? buildUrl(photo) : ''
})

const initials = computed(() => {
  const n = props.photographer.name || ''
  return n.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?'
})

const isActive = computed(() =>
  props.photographer.photographer_profile?.subscription_status === 'active'
)

const rateDisplay = computed(() => {
  const rate = props.photographer.photographer_profile?.hourly_rate
  return rate ? `KSh ${Number(rate).toLocaleString()}` : '—'
})
</script>

<style scoped>
.photographer-card {
  transition: transform 0.2s, box-shadow 0.2s;
  overflow: hidden;
  border: 1px solid rgba(0,0,0,0.07) !important;
}
.photographer-card:hover { transform: translateY(-4px); }

.card-header { position: relative; }
.card-img { border-radius: 12px 12px 0 0; }

/* Dark gradient background as fallback when no photo */
.card-placeholder {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  border-radius: 12px 12px 0 0;
  height: 180px;
}

.card-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 60%);
  border-radius: 12px 12px 0 0;
  pointer-events: none;
}

.card-badges { position: absolute; top: 10px; right: 10px; }

.bio-snippet {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.5;
}
</style>
