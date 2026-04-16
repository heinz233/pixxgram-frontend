<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <h2 class="text-h6 font-weight-bold">Ratings & Reviews</h2>
        <p class="text-medium-emphasis mt-1">All photographer reviews across the platform</p>
      </div>
      <div class="d-flex gap-2 align-center">
        <v-chip color="secondary" variant="tonal" size="small">
          <v-icon start size="14">mdi-star</v-icon>
          {{ ratings.length }} total reviews
        </v-chip>
      </div>
    </div>

    <!-- Filters -->
    <v-card rounded="xl" class="pa-4 mb-5 filter-card">
      <v-row align="center">
        <v-col cols="12" md="4">
          <v-text-field
            v-model="search"
            placeholder="Search by photographer or client..."
            prepend-inner-icon="mdi-magnify"
            density="compact" hide-details clearable
          />
        </v-col>
        <v-col cols="12" md="3">
          <v-select
            v-model="starsFilter"
            :items="starOptions"
            item-title="label" item-value="value"
            label="Stars" density="compact" hide-details clearable
          />
        </v-col>
        <v-col cols="12" md="3">
          <v-select
            v-model="sortBy"
            :items="sortOptions"
            item-title="label" item-value="value"
            label="Sort by" density="compact" hide-details
          />
        </v-col>
        <v-col cols="12" md="2">
          <v-btn variant="tonal" color="primary" block @click="clearFilters" density="compact">
            Clear
          </v-btn>
        </v-col>
      </v-row>
    </v-card>

    <!-- Average rating summary -->
    <v-row class="mb-5">
      <v-col v-for="s in starSummary" :key="s.stars" cols="6" sm="4" md="2">
        <v-card rounded="xl" class="pa-4 text-center star-summary-card"
          :class="{ active: starsFilter == s.stars }"
          @click="starsFilter = starsFilter == s.stars ? null : s.stars"
          style="cursor:pointer">
          <v-icon color="amber" size="20">mdi-star</v-icon>
          <p class="text-h6 font-weight-bold mt-1">{{ s.stars }}</p>
          <p class="text-caption text-medium-emphasis">{{ s.count }} reviews</p>
        </v-card>
      </v-col>
      <v-col cols="6" sm="4" md="2">
        <v-card rounded="xl" class="pa-4 text-center overall-avg-card">
          <v-icon color="secondary" size="20">mdi-star-circle</v-icon>
          <p class="text-h6 font-weight-bold mt-1 text-secondary">{{ overallAvg }}</p>
          <p class="text-caption text-medium-emphasis">Platform avg</p>
        </v-card>
      </v-col>
    </v-row>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-12">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <!-- Empty -->
    <div v-else-if="!filtered.length" class="text-center py-16">
      <v-icon size="64" color="medium-emphasis">mdi-star-off-outline</v-icon>
      <p class="mt-3 text-medium-emphasis">No reviews found.</p>
    </div>

    <!-- Ratings grid -->
    <v-row v-else>
      <v-col v-for="rating in filtered" :key="rating.id" cols="12" md="6">
        <v-card rounded="xl" class="rating-card pa-5">
          <div class="d-flex align-start justify-space-between mb-3">
            <div class="d-flex align-center gap-3">
              <v-avatar size="40" color="primary">
                <span class="text-white text-caption font-weight-bold">
                  {{ rating.client?.name?.charAt(0) }}
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
              <div class="d-flex align-center gap-1 justify-end">
                <v-icon
                  v-for="i in 5" :key="i"
                  :color="i <= rating.stars ? 'amber' : 'grey-lighten-2'"
                  size="14"
                >mdi-star</v-icon>
                <span class="text-caption font-weight-bold ml-1">{{ rating.stars }}/5</span>
              </div>
              <p class="text-caption text-medium-emphasis mt-1">
                {{ new Date(rating.created_at).toLocaleDateString() }}
              </p>
            </div>
          </div>

          <div v-if="rating.comment" class="comment-box pa-3 rounded-xl mb-3">
            <p class="text-body-2">"{{ rating.comment }}"</p>
          </div>
          <div v-else class="mb-3">
            <p class="text-caption text-medium-emphasis fst-italic">No written review</p>
          </div>

          <!-- Admin actions -->
          <div class="d-flex justify-end gap-2">
            <v-btn
              size="x-small" variant="tonal" color="error" rounded="lg"
              :loading="deleteLoading === rating.id"
              @click="deleteRating(rating)"
            >
              <v-icon start size="12">mdi-trash-can-outline</v-icon>
              Remove
            </v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/api/axios'
import { useAppStore } from '@/stores/app'

const appStore     = useAppStore()
const loading      = ref(true)
const ratings      = ref([])
const search       = ref('')
const starsFilter  = ref(null)
const sortBy       = ref('newest')
const deleteLoading= ref(null)

const starOptions  = [1,2,3,4,5].map(n => ({ label: `${n} Star${n>1?'s':''}`, value: n }))
const sortOptions  = [
  { label: 'Newest first',  value: 'newest' },
  { label: 'Oldest first',  value: 'oldest' },
  { label: 'Highest rated', value: 'high'   },
  { label: 'Lowest rated',  value: 'low'    },
]

const starSummary = computed(() =>
  [5,4,3,2,1].map(s => ({
    stars: s,
    count: ratings.value.filter(r => r.stars === s).length,
  }))
)

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
  if (starsFilter.value) list = list.filter(r => r.stars == starsFilter.value)
  if (sortBy.value === 'newest') list.sort((a,b) => new Date(b.created_at) - new Date(a.created_at))
  if (sortBy.value === 'oldest') list.sort((a,b) => new Date(a.created_at) - new Date(b.created_at))
  if (sortBy.value === 'high')   list.sort((a,b) => b.stars - a.stars)
  if (sortBy.value === 'low')    list.sort((a,b) => a.stars - b.stars)
  return list
})

function clearFilters() {
  search.value = ''
  starsFilter.value = null
  sortBy.value = 'newest'
}

async function deleteRating(rating) {
  if (!confirm(`Remove this ${rating.stars}-star review by ${rating.client?.name}?`)) return
  deleteLoading.value = rating.id
  try {
    await api.delete(`/admin/ratings/${rating.id}`)
    ratings.value = ratings.value.filter(r => r.id !== rating.id)
    appStore.notify('Review removed successfully')
  } catch (e) {
    appStore.notify(e.response?.data?.message || 'Failed to remove review', 'error')
  } finally {
    deleteLoading.value = null
  }
}

onMounted(async () => {
  try {
    const { data } = await api.get('/admin/ratings')
    ratings.value = data.data || data
  } catch (_) {}
  finally { loading.value = false }
})
</script>

<style scoped>
.filter-card { border: 1px solid rgba(0,0,0,0.07) !important; }
.rating-card { border: 1px solid rgba(0,0,0,0.07) !important; }
.star-summary-card { border: 1px solid rgba(0,0,0,0.07) !important; transition: all 0.2s; }
.star-summary-card:hover { border-color: rgb(var(--v-theme-primary)); }
.star-summary-card.active { border-color: rgb(var(--v-theme-primary)); background: rgba(var(--v-theme-primary), 0.05); }
.overall-avg-card { border: 1px solid rgba(var(--v-theme-secondary), 0.3) !important; }
.comment-box { background: rgba(0,0,0,0.03); }
.gap-1 { gap: 4px; }
.gap-2 { gap: 8px; }
.gap-3 { gap: 12px; }
</style>
