<template>
  <v-card
    class="photographer-card"
    :to="{ name: 'PhotographerProfile', params: { id: photographer.id } }"
    hover
  >
    <!-- Cover / Avatar -->
    <div class="card-header">
      <v-img
        :src="photographer.photographer_profile?.profile_photo || '/placeholder-profile.jpg'"
        height="180"
        cover
        class="card-img"
      />
      <div class="card-overlay" />
      <div class="card-badges">
        <v-chip v-if="isActive" size="x-small" color="success" variant="flat">Active</v-chip>
      </div>
    </div>

    <v-card-text class="pa-4">
      <div class="d-flex align-start justify-space-between mb-1">
        <div>
          <h3 class="text-subtitle-1 font-weight-bold text-truncate" style="max-width:160px">
            {{ photographer.name }}
          </h3>
          <div class="d-flex align-center gap-1 mt-1">
            <v-icon size="14" color="medium-emphasis">mdi-map-marker-outline</v-icon>
            <span class="text-caption text-medium-emphasis">
              {{ photographer.photographer_profile?.location || 'Kenya' }}
            </span>
          </div>
        </div>
        <div class="text-right">
          <div class="text-subtitle-2 font-weight-bold text-secondary">
            KSh {{ formatRate(photographer.photographer_profile?.hourly_rate) }}
          </div>
          <div class="text-caption text-medium-emphasis">/hr</div>
        </div>
      </div>

      <!-- Rating -->
      <div class="d-flex align-center gap-1 mt-2">
        <v-rating
          :model-value="photographer.photographer_profile?.average_rating || 0"
          density="compact"
          size="14"
          color="secondary"
          readonly half-increments
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

const isActive = computed(() =>
  props.photographer.photographer_profile?.subscription_status === 'active'
)

function formatRate(rate) {
  if (!rate) return '—'
  return Number(rate).toLocaleString()
}
</script>

<style scoped>
.photographer-card { transition: transform 0.2s, box-shadow 0.2s; overflow: hidden; }
.photographer-card:hover { transform: translateY(-4px); }
.card-header { position: relative; }
.card-img { border-radius: 16px 16px 0 0; }
.card-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 60%);
  border-radius: 16px 16px 0 0;
}
.card-badges { position: absolute; top: 10px; right: 10px; }
.bio-snippet {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.gap-1 { gap: 4px; }
</style>
