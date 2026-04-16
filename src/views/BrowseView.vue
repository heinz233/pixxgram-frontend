<template>
  <div>
    <NavBar />

    <!-- Page header -->
    <div class="browse-header">
      <v-container style="max-width:1280px">
        <div class="d-flex align-center justify-space-between flex-wrap gap-3">
          <div>
            <h1 class="text-h5 font-weight-bold">Browse Photographers</h1>
            <p class="text-medium-emphasis mt-1">
              {{ loading ? 'Searching...' : `${photographers.length} photographer${photographers.length !== 1 ? 's' : ''} found` }}
            </p>
          </div>
          <v-btn-toggle v-model="viewMode" mandatory density="compact" rounded="lg" color="primary">
            <v-btn value="grid" size="small">
              <v-icon start size="16">mdi-view-grid-outline</v-icon> Grid
            </v-btn>
            <v-btn value="map" size="small">
              <v-icon start size="16">mdi-map-outline</v-icon> Map
            </v-btn>
          </v-btn-toggle>
        </div>
      </v-container>
    </div>

    <v-container style="max-width:1280px" class="py-6">
      <v-row>

        <!-- ── Filters Sidebar ─────────────────────────── -->
        <v-col cols="12" md="3">
          <v-card class="filters-card pa-5" rounded="xl">
            <div class="d-flex align-center justify-space-between mb-5">
              <span class="text-subtitle-2 font-weight-bold">Filters</span>
              <v-btn variant="text" size="x-small" color="secondary" @click="clearFilters">Clear all</v-btn>
            </div>

            <!-- Location search -->
            <div class="filter-group mb-5">
              <p class="filter-label">Location</p>
              <div class="location-wrap">
                <v-icon class="loc-icon" size="16" color="medium-emphasis">mdi-map-marker-outline</v-icon>
                <input
                  ref="locationInputRef"
                  v-model="locationSearchText"
                  placeholder="Search city or area..."
                  class="loc-input"
                  autocomplete="off"
                  @input="onLocationInput"
                  @keydown.enter.prevent="applyFilters"
                  @keydown.escape="locationSuggestions = []"
                />
                <button v-if="locationSearchText" class="loc-clear" @click="clearLocation">
                  <v-icon size="13">mdi-close</v-icon>
                </button>

                <!-- Autocomplete dropdown -->
                <div v-if="locationSuggestions.length" class="loc-dropdown">
                  <div
                    v-for="s in locationSuggestions"
                    :key="s.place_id"
                    class="loc-suggestion"
                    @mousedown.prevent="selectSuggestion(s)"
                  >
                    <v-icon size="13" color="secondary" class="mr-2">mdi-map-marker</v-icon>
                    <div>
                      <p class="text-body-2 font-weight-medium">{{ s.structured_formatting.main_text }}</p>
                      <p class="text-caption text-medium-emphasis">{{ s.structured_formatting.secondary_text }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- No API key fallback — plain select -->
              <div v-if="!googleMapsLoaded && locations.length" class="mt-2">
                <v-select
                  v-model="filters.location"
                  :items="locations"
                  placeholder="Or pick from list"
                  clearable density="compact" hide-details
                  @update:model-value="onSelectLocation"
                />
              </div>

              <!-- Quick location chips -->
              <div class="d-flex flex-wrap gap-1 mt-3">
                <v-chip
                  v-for="loc in quickLocations" :key="loc"
                  size="x-small"
                  :variant="filters.location === loc ? 'flat' : 'outlined'"
                  :color="filters.location === loc ? 'primary' : 'default'"
                  style="cursor:pointer"
                  @click="setQuickLocation(loc)"
                >
                  {{ loc }}
                </v-chip>
              </div>
            </div>

            <!-- Category -->
            <div class="filter-group mb-5">
              <p class="filter-label">Category</p>
              <v-select
                v-model="filters.category"
                :items="categories"
                placeholder="Any category"
                clearable density="compact" hide-details
              />
            </div>

            <!-- Gender -->
            <div class="filter-group mb-5">
              <p class="filter-label">Gender</p>
              <v-btn-toggle v-model="filters.gender" divided rounded="lg" density="compact" class="w-100">
                <v-btn value=""       size="small" class="flex-grow-1">Any</v-btn>
                <v-btn value="male"   size="small" class="flex-grow-1">Male</v-btn>
                <v-btn value="female" size="small" class="flex-grow-1">Female</v-btn>
              </v-btn-toggle>
            </div>

            <!-- Price range -->
            <div class="filter-group mb-5">
              <div class="d-flex justify-space-between mb-1">
                <p class="filter-label mb-0">Price / hr (KSh)</p>
              </div>
              <v-range-slider
                v-model="priceRange"
                :min="0" :max="50000" :step="500"
                color="primary" thumb-label density="compact"
              />
              <div class="d-flex justify-space-between text-caption text-medium-emphasis mt-n2">
                <span>KSh {{ priceRange[0].toLocaleString() }}</span>
                <span>KSh {{ priceRange[1].toLocaleString() }}</span>
              </div>
            </div>

            <!-- Min rating -->
            <div class="filter-group mb-6">
              <p class="filter-label">Minimum Rating</p>
              <v-rating v-model="filters.min_rating" color="secondary" density="compact" half-increments />
            </div>

            <v-btn block color="primary" rounded="lg" @click="applyFilters">
              <v-icon start>mdi-magnify</v-icon> Search
            </v-btn>
          </v-card>
        </v-col>

        <!-- ── Main Content ─────────────────────────────── -->
        <v-col cols="12" md="9">

          <!-- Search bar -->
          <v-text-field
            v-model="searchQuery"
            placeholder="Search photographer by name..."
            prepend-inner-icon="mdi-magnify"
            clearable hide-details class="mb-4"
            @keyup.enter="applyFilters"
            @click:clear="() => { searchQuery = ''; applyFilters() }"
          />

          <!-- Active filter chips -->
          <div v-if="activeFilterChips.length" class="d-flex flex-wrap gap-2 mb-4">
            <v-chip
              v-for="chip in activeFilterChips" :key="chip.key"
              size="small" closable color="primary" variant="tonal"
              @click:close="removeFilter(chip.key)"
            >
              {{ chip.label }}
            </v-chip>
          </div>

          <!-- GRID VIEW -->
          <template v-if="viewMode === 'grid'">
            <v-row v-if="loading">
              <v-col v-for="i in 6" :key="i" cols="12" sm="6" lg="4">
                <v-skeleton-loader type="card" rounded="xl" />
              </v-col>
            </v-row>

            <div v-else-if="!photographers.length" class="text-center py-16">
              <v-icon size="64" color="medium-emphasis">mdi-camera-off-outline</v-icon>
              <p class="mt-4 text-medium-emphasis">
                No photographers found{{ filters.location ? ` in ${filters.location}` : '' }}.
              </p>
              <v-btn variant="text" color="secondary" class="mt-3" @click="clearFilters">Clear filters</v-btn>
            </div>

            <v-row v-else>
              <v-col v-for="p in photographers" :key="p.id" cols="12" sm="6" lg="4">
                <PhotographerCard :photographer="p" />
              </v-col>
            </v-row>

            <div v-if="totalPages > 1" class="d-flex justify-center mt-8">
              <v-pagination v-model="page" :length="totalPages" @update:model-value="fetchPhotographers" />
            </div>
          </template>

          <!-- MAP VIEW -->
          <template v-else>
            <div class="map-wrap">
              <!-- Map canvas -->
              <div ref="mapRef" class="gmap" />

              <!-- No API key message -->
              <div v-if="!GOOGLE_MAPS_API_KEY" class="gmap-placeholder">
                <v-icon size="48" color="medium-emphasis" class="mb-3">mdi-map-off-outline</v-icon>
                <p class="text-subtitle-2 font-weight-bold mb-1">Google Maps not configured</p>
                <p class="text-caption text-medium-emphasis mb-4">
                  Add <code>VITE_GOOGLE_MAPS_API_KEY</code> to your <code>.env</code> file.
                </p>
                <v-btn size="small" variant="tonal" color="primary" href="https://console.cloud.google.com" target="_blank">
                  Get API Key
                </v-btn>
              </div>

              <!-- Sidebar list -->
              <div class="map-sidebar">
                <div class="map-sidebar-head">
                  <span class="text-subtitle-2 font-weight-bold">
                    {{ photographers.length }} result{{ photographers.length !== 1 ? 's' : '' }}
                  </span>
                </div>

                <div v-if="loading" class="pa-3">
                  <v-skeleton-loader v-for="i in 4" :key="i" type="list-item-avatar-two-line" class="mb-2" />
                </div>

                <div
                  v-for="p in photographers" :key="p.id"
                  class="map-p-item"
                  :class="{ 'map-p-item--active': hoveredId === p.id }"
                  @click="selectOnMap(p)"
                  @mouseenter="highlightMarker(p.id, true)"
                  @mouseleave="highlightMarker(p.id, false)"
                >
                  <v-avatar size="38" color="primary" class="flex-shrink-0">
                    <v-img v-if="p.photographer_profile?.profile_photo" :src="p.photographer_profile.profile_photo" />
                    <span v-else class="text-white text-caption font-weight-bold">{{ p.name?.charAt(0) }}</span>
                  </v-avatar>
                  <div class="ml-3 overflow-hidden">
                    <p class="text-body-2 font-weight-semibold text-truncate">{{ p.name }}</p>
                    <p class="text-caption text-medium-emphasis text-truncate">
                      <v-icon size="10">mdi-map-marker-outline</v-icon>
                      {{ p.photographer_profile?.location || 'Kenya' }}
                    </p>
                    <div class="d-flex align-center justify-space-between mt-1">
                      <v-rating :model-value="p.photographer_profile?.average_rating || 0"
                        density="compact" size="10" color="secondary" readonly />
                      <span class="text-caption font-weight-bold text-secondary">
                        KSh {{ formatRate(p.photographer_profile?.hourly_rate) }}/hr
                      </span>
                    </div>
                  </div>
                </div>

                <div v-if="!loading && !photographers.length" class="pa-6 text-center text-medium-emphasis">
                  <v-icon size="36">mdi-map-marker-off-outline</v-icon>
                  <p class="text-caption mt-2">No photographers in this area.</p>
                </div>
              </div>

              <!-- Selected photographer popup -->
              <v-card v-if="selectedP" class="map-popup pa-4" rounded="xl" elevation="6">
                <div class="d-flex align-center gap-3 mb-3">
                  <v-avatar size="44" color="primary">
                    <v-img v-if="selectedP.photographer_profile?.profile_photo" :src="selectedP.photographer_profile.profile_photo" />
                    <span v-else class="text-white font-weight-bold">{{ selectedP.name?.charAt(0) }}</span>
                  </v-avatar>
                  <div class="flex-grow-1 overflow-hidden">
                    <p class="text-body-2 font-weight-bold text-truncate">{{ selectedP.name }}</p>
                    <p class="text-caption text-medium-emphasis">{{ selectedP.photographer_profile?.location }}</p>
                  </div>
                  <v-btn icon size="x-small" variant="text" @click="selectedP = null">
                    <v-icon size="16">mdi-close</v-icon>
                  </v-btn>
                </div>
                <div class="d-flex align-center justify-space-between mb-3">
                  <v-rating :model-value="selectedP.photographer_profile?.average_rating || 0"
                    density="compact" size="13" color="secondary" readonly half-increments />
                  <span class="text-subtitle-2 font-weight-bold text-secondary">
                    KSh {{ formatRate(selectedP.photographer_profile?.hourly_rate) }}/hr
                  </span>
                </div>
                <v-btn block color="primary" size="small" rounded="lg"
                  :to="{ name: 'PhotographerProfile', params: { id: selectedP.id } }">
                  View Profile <v-icon end size="14">mdi-arrow-right</v-icon>
                </v-btn>
              </v-card>
            </div>
          </template>

        </v-col>
      </v-row>
    </v-container>

    <SiteFooter />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import NavBar from '@/components/shared/NavBar.vue'
import SiteFooter from '@/components/shared/SiteFooter.vue'
import PhotographerCard from '@/components/shared/PhotographerCard.vue'
import { photographersApi } from '@/api/photographers'
import { adminApi } from '@/api/admin'

// ── Config ────────────────────────────────────────────────
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
const KENYA = { lat: 0.0236, lng: 37.9062 }

// ── State ─────────────────────────────────────────────────
const route  = useRoute()
const router = useRouter()

const loading             = ref(true)
const googleMapsLoaded    = ref(false)
const photographers       = ref([])
const locations           = ref([])
const categories          = ref([])
const page                = ref(1)
const totalPages          = ref(1)
const viewMode            = ref('grid')
const searchQuery         = ref('')
const locationSearchText  = ref('')
const locationSuggestions = ref([])
const priceRange          = ref([0, 50000])
const hoveredId           = ref(null)
const selectedP           = ref(null)
const mapRef              = ref(null)
const locationInputRef    = ref(null)

const filters = ref({
  location: '', category: '', gender: '', min_rating: 0,
})

const quickLocations = ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika']

let map = null, markers = {}, autocompleteService = null, placesService = null

// ── Computed ──────────────────────────────────────────────
const activeFilterChips = computed(() => {
  const chips = []
  if (filters.value.location)   chips.push({ key: 'location',   label: `📍 ${filters.value.location}` })
  if (filters.value.category)   chips.push({ key: 'category',   label: `🏷️ ${filters.value.category}` })
  if (filters.value.gender)     chips.push({ key: 'gender',     label: `👤 ${filters.value.gender}` })
  if (filters.value.min_rating) chips.push({ key: 'min_rating', label: `⭐ ${filters.value.min_rating}+` })
  if (priceRange.value[0] > 0 || priceRange.value[1] < 50000)
    chips.push({ key: 'price', label: `💰 KSh ${priceRange.value[0].toLocaleString()}–${priceRange.value[1].toLocaleString()}` })
  if (searchQuery.value)        chips.push({ key: 'search',     label: `🔍 "${searchQuery.value}"` })
  return chips
})

// ── Fetch ─────────────────────────────────────────────────
async function fetchPhotographers() {
  loading.value = true
  try {
    const params = {
      page:       page.value,
      location:   filters.value.location   || undefined,
      gender:     filters.value.gender     || undefined,
      min_rating: filters.value.min_rating || undefined,
      min_price:  priceRange.value[0] > 0     ? priceRange.value[0] : undefined,
      max_price:  priceRange.value[1] < 50000 ? priceRange.value[1] : undefined,
    }
    if (searchQuery.value) params.name = searchQuery.value
    const { data } = await photographersApi.list(params)
    photographers.value = data.data || []
    totalPages.value    = data.last_page || 1
    if (viewMode.value === 'map') await nextTick().then(plotMarkers)
  } catch (_) {}
  finally { loading.value = false }
}

function applyFilters() { page.value = 1; fetchPhotographers(); updateUrl() }

function clearFilters() {
  filters.value = { location: '', category: '', gender: '', min_rating: 0 }
  priceRange.value = [0, 50000]
  searchQuery.value = locationSearchText.value = ''
  locationSuggestions.value = []
  page.value = 1
  fetchPhotographers()
  if (map) { map.setCenter(KENYA); map.setZoom(6) }
}

function removeFilter(key) {
  if (key === 'location')   { filters.value.location = ''; locationSearchText.value = '' }
  if (key === 'category')   filters.value.category   = ''
  if (key === 'gender')     filters.value.gender     = ''
  if (key === 'min_rating') filters.value.min_rating = 0
  if (key === 'price')      priceRange.value = [0, 50000]
  if (key === 'search')     searchQuery.value = ''
  applyFilters()
}

function updateUrl() {
  const q = {}
  if (filters.value.location) q.location = filters.value.location
  if (filters.value.category) q.category = filters.value.category
  if (filters.value.gender)   q.gender   = filters.value.gender
  if (searchQuery.value)      q.search   = searchQuery.value
  router.replace({ name: 'Photographers', query: q })
}

function formatRate(r) { return r ? Number(r).toLocaleString() : '—' }

// ── Location autocomplete ─────────────────────────────────
function onLocationInput() {
  if (!locationSearchText.value.trim() || !autocompleteService) {
    locationSuggestions.value = []
    return
  }
  autocompleteService.getPlacePredictions(
    { input: locationSearchText.value, componentRestrictions: { country: 'ke' }, types: ['(cities)'] },
    (predictions, status) => {
      locationSuggestions.value =
        status === window.google.maps.places.PlacesServiceStatus.OK ? predictions || [] : []
    }
  )
}

function selectSuggestion(s) {
  const name = s.structured_formatting.main_text
  locationSearchText.value  = name
  filters.value.location    = name
  locationSuggestions.value = []
  // Pan map to location
  if (placesService && map) {
    placesService.getDetails({ placeId: s.place_id, fields: ['geometry'] }, (place, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && place.geometry) {
        map.panTo(place.geometry.location)
        map.setZoom(11)
      }
    })
  }
  applyFilters()
}

function setQuickLocation(loc) {
  const same = filters.value.location === loc
  filters.value.location   = same ? '' : loc
  locationSearchText.value = filters.value.location
  locationSuggestions.value = []
  if (filters.value.location) geocode(filters.value.location)
  else if (map) { map.setCenter(KENYA); map.setZoom(6) }
  applyFilters()
}

function clearLocation() {
  filters.value.location = locationSearchText.value = ''
  locationSuggestions.value = []
  if (map) { map.setCenter(KENYA); map.setZoom(6) }
  applyFilters()
}

function onSelectLocation(val) {
  filters.value.location    = val || ''
  locationSearchText.value  = val || ''
  if (val) geocode(val)
  applyFilters()
}

function geocode(name) {
  if (!window.google) return
  new window.google.maps.Geocoder().geocode(
    { address: `${name}, Kenya` },
    (res, status) => {
      if (status === 'OK' && res[0] && map) {
        map.panTo(res[0].geometry.location)
        map.setZoom(11)
      }
    }
  )
}

// ── Google Maps ───────────────────────────────────────────
function initMap() {
  if (!window.google?.maps || !mapRef.value) return
  map = new window.google.maps.Map(mapRef.value, {
    center: KENYA, zoom: 6,
    mapTypeControl: false, streetViewControl: false,
    styles: [{ featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] }],
  })
  const dummy = document.createElement('div')
  autocompleteService = new window.google.maps.places.AutocompleteService()
  placesService       = new window.google.maps.places.PlacesService(dummy)
  googleMapsLoaded.value = true
  plotMarkers()
}

function plotMarkers() {
  if (!map || !window.google) return
  Object.values(markers).forEach(m => m.setMap(null))
  markers = {}
  const geo = new window.google.maps.Geocoder()
  photographers.value.forEach(p => {
    const loc = p.photographer_profile?.location
    if (!loc) return
    geo.geocode({ address: `${loc}, Kenya` }, (res, st) => {
      if (st !== 'OK' || !res[0]) return
      const marker = new window.google.maps.Marker({
        position: res[0].geometry.location,
        map,
        title: p.name,
        icon: markerIcon(false),
        label: { text: p.name?.charAt(0) || '?', color: 'white', fontSize: '11px', fontWeight: 'bold' },
      })
      marker.addListener('click', () => { selectedP.value = p; hoveredId.value = p.id })
      marker.addListener('mouseover', () => { highlightMarker(p.id, true) })
      marker.addListener('mouseout',  () => { if (selectedP.value?.id !== p.id) highlightMarker(p.id, false) })
      markers[p.id] = marker
    })
  })
}

function markerIcon(active) {
  return {
    path: window.google.maps.SymbolPath.CIRCLE,
    fillColor:   active ? '#C9A84C' : '#1A1A2E',
    fillOpacity: 1,
    strokeColor: active ? '#1A1A2E' : '#C9A84C',
    strokeWeight: 2,
    scale: active ? 13 : 10,
  }
}

function highlightMarker(id, on) {
  hoveredId.value = on ? id : null
  const m = markers[id]
  if (m) m.setIcon(markerIcon(on))
}

function selectOnMap(p) {
  selectedP.value = p
  highlightMarker(p.id, true)
  const m = markers[p.id]
  if (m && map) { map.panTo(m.getPosition()); map.setZoom(13) }
}

async function loadGoogleMaps() {
  if (window.google?.maps) return
  if (!GOOGLE_MAPS_API_KEY) return
  await new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src     = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`
    s.async   = true
    s.onload  = resolve
    s.onerror = reject
    document.head.appendChild(s)
  })
}

// ── Watchers ──────────────────────────────────────────────
watch(viewMode, async (val) => {
  if (val === 'map') {
    await loadGoogleMaps()
    await nextTick()
    if (!map) initMap()
    else plotMarkers()
  }
})

// Close suggestions on outside click
function onDocClick(e) {
  if (locationInputRef.value && !locationInputRef.value.contains(e.target)) {
    locationSuggestions.value = []
  }
}

// ── Lifecycle ─────────────────────────────────────────────
onMounted(async () => {
  if (route.query.location) { filters.value.location = route.query.location; locationSearchText.value = route.query.location }
  if (route.query.category) filters.value.category = route.query.category
  if (route.query.gender)   filters.value.gender   = route.query.gender
  if (route.query.search)   searchQuery.value      = route.query.search

  fetchPhotographers()

  try {
    const [locRes, catRes] = await Promise.allSettled([adminApi.locations(), adminApi.categories()])
    if (locRes.status === 'fulfilled') locations.value  = locRes.value.data?.map?.(l => l.name)  || []
    if (catRes.status === 'fulfilled') categories.value = catRes.value.data?.map?.(c => c.name) || []
  } catch (_) {}

  document.addEventListener('click', onDocClick)
})

onUnmounted(() => {
  document.removeEventListener('click', onDocClick)
  Object.values(markers).forEach(m => m.setMap(null))
})
</script>

<style scoped>
.browse-header {
  background: rgb(var(--v-theme-surface));
  border-bottom: 1px solid rgba(0,0,0,0.07);
  padding: 20px 0;
}
.filters-card {
  position: sticky; top: 80px;
  border: 1px solid rgba(0,0,0,0.07) !important;
  max-height: calc(100vh - 100px);
  overflow-y: auto; scrollbar-width: none;
}
.filters-card::-webkit-scrollbar { display: none; }
.filter-label {
  font-size: 0.7rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.8px;
  margin-bottom: 8px; opacity: 0.55;
}
.w-100 { width: 100%; }

/* Location input */
.location-wrap { position: relative; }
.loc-input {
  width: 100%; padding: 10px 32px 10px 30px;
  border: 1.5px solid rgba(0,0,0,0.15); border-radius: 10px;
  font-size: 0.875rem;
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));
  outline: none; transition: border-color 0.2s;
}
.loc-input:focus { border-color: rgb(var(--v-theme-primary)); }
.loc-icon { position: absolute; left: 9px; top: 50%; transform: translateY(-50%); pointer-events: none; }
.loc-clear {
  position: absolute; right: 8px; top: 50%; transform: translateY(-50%);
  background: none; border: none; cursor: pointer; padding: 2px;
  color: rgba(0,0,0,0.4); display: flex; align-items: center;
}
.loc-dropdown {
  position: absolute; z-index: 200; width: 100%;
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(0,0,0,0.1); border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.13); margin-top: 4px; overflow: hidden;
}
.loc-suggestion {
  display: flex; align-items: center; padding: 10px 14px;
  cursor: pointer; transition: background 0.15s;
}
.loc-suggestion:hover { background: rgba(0,0,0,0.04); }

/* Map */
.map-wrap {
  position: relative; height: calc(100vh - 200px); min-height: 520px;
  border-radius: 16px; overflow: hidden; border: 1px solid rgba(0,0,0,0.08);
}
.gmap { width: 100%; height: 100%; }
.gmap-placeholder {
  position: absolute; inset: 0;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  background: rgba(0,0,0,0.03); z-index: 5;
}
.map-sidebar {
  position: absolute; top: 0; right: 0; width: 290px; height: 100%;
  background: rgb(var(--v-theme-surface));
  border-left: 1px solid rgba(0,0,0,0.08);
  overflow-y: auto; z-index: 10;
}
.map-sidebar-head {
  padding: 14px 16px; border-bottom: 1px solid rgba(0,0,0,0.07);
  position: sticky; top: 0; background: rgb(var(--v-theme-surface)); z-index: 1;
}
.map-p-item {
  display: flex; align-items: center; padding: 12px 16px;
  cursor: pointer; transition: background 0.15s;
  border-bottom: 1px solid rgba(0,0,0,0.04);
}
.map-p-item:hover, .map-p-item--active {
  background: rgba(var(--v-theme-primary), 0.06);
}
.map-popup {
  position: absolute; bottom: 16px; left: 16px; width: 270px; z-index: 20;
}

.gap-1 { gap: 4px; }
.gap-2 { gap: 8px; }
.gap-3 { gap: 12px; }
</style>
