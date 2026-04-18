<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <h2 class="text-h6 font-weight-bold">Ratings & Reviews</h2>
        <p class="text-medium-emphasis text-body-2 mt-1">
          All photographer reviews across the platform
        </p>
      </div>
      <v-chip color="secondary" variant="tonal" size="small">
        <v-icon start size="14">mdi-star</v-icon>
        {{ ratings.length }} reviews · avg {{ overallAvg }}★
      </v-chip>
    </div>

    <!-- Filters -->
    <v-card rounded="xl" class="pa-4 mb-5 filter-card">
      <v-row align="center">
        <v-col cols="12" md="5">
          <v-text-field
            v-model="search"
            placeholder="Search by photographer, client, or comment..."
            prepend-inner-icon="mdi-magnify"
            density="compact" hide-details clearable variant="outlined"
          />
        </v-col>
        <v-col cols="6" md="3">
          <v-select
            v-model="starsFilter"
            :items="[
              { title: 'All Stars', value: null },
              { title: '5 Stars', value: 5 },
              { title: '4 Stars', value: 4 },
              { title: '3 Stars', value: 3 },
              { title: '2 Stars', value: 2 },
              { title: '1 Star',  value: 1 },
            ]"
            item-title="title" item-value="value"
            label="Stars" density="compact" hide-details variant="outlined"
          />
        </v-col>
        <v-col cols="6" md="3">
          <v-select
            v-model="sortBy"
            :items="[
              { title: 'Newest first',  value: 'newest' },
              { title: 'Oldest first',  value: 'oldest' },
              { title: 'Highest rated', value: 'high' },
              { title: 'Lowest rated',  value: 'low' },
            ]"
            item-title="title" item-value="value"
            label="Sort" density="compact" hide-details variant="outlined"
          />
        </v-col>
      </v-row>
    </v-card>

    <!-- Star summary cards -->
    <v-row class="mb-5">
      <v-col v-for="s in [5,4,3,2,1]" :key="s" cols="6" sm="4" md="2">
        <v-card rounded="xl" class="pa-4 text-center star-card"
          :class="{ active: starsFilter === s }"
          @click="starsFilter = starsFilter === s ? null : s"
          style="cursor:pointer">
          <v-icon color="amber" size="18">mdi-star</v-icon>
          <p class="text-h6 font-weight-bold mt-1">{{ s }}</p>
          <p class="text-caption text-medium-emphasis">{{ countByStars(s) }} reviews</p>
        </v-card>
      </v-col>
      <v-col cols="6" sm="4" md="2">
        <v-card rounded="xl" class="pa-4 text-center avg-card">
          <v-icon color="secondary" size="18">mdi-star-circle</v-icon>
          <p class="text-h6 font-weight-bold mt-1 text-secondary">{{ overallAvg }}</p>
          <p class="text-caption text-medium-emphasis">Platform avg</p>
        </v-card>
      </v-col>
    </v-row>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-12">
      <v-progress-circular indeterminate color="primary" size="44" />
      <p class="mt-4 text-medium-emphasis">Loading ratings...</p>
    </div>

    <!-- Error -->
    <v-alert v-else-if="loadError" type="error" variant="tonal" rounded="xl" class="mb-4">
      <p class="font-weight-bold mb-1">Could not load ratings</p>
      <p class="text-body-2 mb-3">{{ loadError }}</p>
      <v-btn size="small" color="error" variant="tonal" @click="loadRatings">Retry</v-btn>
    </v-alert>

    <!-- Empty -->
    <div v-else-if="!filtered.length" class="text-center py-16">
      <v-icon size="64" color="medium-emphasis">mdi-star-off-outline</v-icon>
      <p class="mt-3 text-medium-emphasis">No reviews found.</p>
    </div>

    <!-- Rating cards -->
    <v-row v-else>
      <v-col v-for="rating in filtered" :key="rating.id" cols="12" md="6">
        <v-card rounded="xl" class="rating-card pa-5">
          <div class="d-flex align-start justify-space-between mb-3">
            <div class="d-flex align-center" style="gap:12px">
              <v-avatar size="40" color="primary">
                <span class="text-white text-caption font-weight-bold">
                  {{ rating.client?.name?.charAt(0) || '?' }}
                </span>
              </v-avatar>
              <div>
                <p class="text-body-2 font-weight-semibold">{{ rating.client?.name }}</p>
                <p class="text-caption text-medium-emphasis">
                  reviewed <strong>{{ rating.photographer?.name }}</strong>
                </p>
              </div>
            </div>
            <div class="text-right">
              <div class="d-flex align-center justify-end" style="gap:2px">
                <v-icon v-for="i in 5" :key="i"
                  :color="i <= rating.stars ? 'amber' : 'grey-lighten-2'" size="13">
                  mdi-star
                </v-icon>
                <span class="text-caption font-weight-bold ml-1">{{ rating.stars }}/5</span>
              </div>
              <p class="text-caption text-medium-emphasis mt-1">
                {{ formatDate(rating.created_at) }}
              </p>
            </div>
          </div>

          <div v-if="rating.comment" class="comment-box pa-3 rounded-xl mb-3">
            <p class="text-body-2">"{{ rating.comment }}"</p>
          </div>
          <p v-else class="text-caption text-medium-emphasis mb-3 fst-italic">
            No written comment
          </p>

          <v-btn size="x-small" variant="tonal" color="error" rounded="lg"
            :loading="deleteLoading === rating.id"
            @click="deleteRating(rating)">
            <v-icon start size="12">mdi-trash-can-outline</v-icon>
            Remove
          </v-btn>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { adminApi } from '@/api/admin'
import { useAppStore } from '@/stores/app'

const appStore    = useAppStore()
const loading     = ref(true)
const loadError   = ref('')
const ratings     = ref([])
const search      = ref('')
const starsFilter = ref(null)
const sortBy      = ref('newest')
const deleteLoading = ref(null)

const countByStars = s => ratings.value.filter(r => r.stars === s).length

const overallAvg = computed(() => {
  if (!ratings.value.length) return '—'
  const avg = ratings.value.reduce((a, r) => a + r.stars, 0) / ratings.value.length
  return avg.toFixed(1)
})

const filtered = computed(() => {
  let list = [...ratings.value]
  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter(r =>
      r.photographer?.name?.toLowerCase().includes(q) ||
      r.client?.name?.toLowerCase().includes(q) ||
      r.comment?.toLowerCase().includes(q)
    )
  }
  if (starsFilter.value) list = list.filter(r => r.stars === starsFilter.value)
  if (sortBy.value === 'newest') list.sort((a,b) => new Date(b.created_at) - new Date(a.created_at))
  if (sortBy.value === 'oldest') list.sort((a,b) => new Date(a.created_at) - new Date(b.created_at))
  if (sortBy.value === 'high')   list.sort((a,b) => b.stars - a.stars)
  if (sortBy.value === 'low')    list.sort((a,b) => a.stars - b.stars)
  return list
})

function formatDate(d) {
  return d ? new Date(d).toLocaleDateString('en-KE', { dateStyle: 'medium' }) : '—'
}

async function loadRatings() {
  loading.value   = true
  loadError.value = ''
  try {
    const { data } = await adminApi.ratings()
    ratings.value = data?.data || data || []
  } catch (e) {
    const s = e.response?.status
    if (s === 403) loadError.value = 'Access denied. Make sure you are logged in as an admin.'
    else if (!e.response) loadError.value = 'Cannot reach server. Is Laravel running?'
    else loadError.value = e.response?.data?.message || `Error ${s}`
  } finally { loading.value = false }
}

async function deleteRating(rating) {
  if (!confirm(`Remove this ${rating.stars}-star review by ${rating.client?.name}?`)) return
  deleteLoading.value = rating.id
  try {
    await adminApi.deleteRating(rating.id)
    ratings.value = ratings.value.filter(r => r.id !== rating.id)
    appStore.notify('Review removed successfully')
  } catch (e) {
    appStore.notify(e.response?.data?.message || 'Failed to remove review', 'error')
  } finally { deleteLoading.value = null }
}

onMounted(loadRatings)
</script>

<style scoped>
.filter-card { border: 1px solid rgba(0,0,0,0.07) !important; }
.rating-card { border: 1px solid rgba(0,0,0,0.07) !important; }
.star-card   { border: 1px solid rgba(0,0,0,0.07) !important; transition: all 0.18s; }
.star-card:hover { border-color: rgb(var(--v-theme-primary)); }
.star-card.active { border-color: rgb(var(--v-theme-primary)); background: rgba(var(--v-theme-primary), 0.05); }
.avg-card    { border: 1px solid rgba(var(--v-theme-secondary), 0.3) !important; }
.comment-box { background: rgba(0,0,0,0.03); }
</style>
