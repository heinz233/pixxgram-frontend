<template>
  <v-app-bar flat border="b" color="surface" height="64">
    <v-container class="d-flex align-center pa-0" style="max-width:1280px">

      <router-link to="/" class="brand d-flex align-center text-decoration-none mr-6">
        <div class="brand-icon mr-2">
          <v-icon size="20" color="white">mdi-camera-iris</v-icon>
        </div>
        <span class="brand-text">Pixxgram</span>
      </router-link>

      <!-- Desktop nav -->
      <nav class="d-none d-md-flex align-center gap-1">
        <v-btn variant="text" size="small" :to="{ name: 'Photographers' }">Browse</v-btn>
        <v-btn variant="text" size="small" :to="{ name: 'HowItWorks' }">How it Works</v-btn>
        <v-btn variant="text" size="small" :to="{ name: 'About' }">About</v-btn>
      </nav>

      <v-spacer />

      <!-- Unread messages -->
      <v-btn v-if="authStore.isLoggedIn" :to="messageRoute" icon variant="text" class="mr-1">
        <v-badge :content="appStore.unreadMessages||''" :model-value="appStore.unreadMessages>0" color="accent">
          <v-icon>mdi-message-outline</v-icon>
        </v-badge>
      </v-btn>

      <!-- Theme toggle -->
      <v-btn icon variant="text" class="mr-1" @click="toggleTheme">
        <v-icon>{{ isDark ? 'mdi-weather-sunny' : 'mdi-weather-night' }}</v-icon>
      </v-btn>

      <!-- Mobile menu -->
      <v-btn class="d-md-none mr-1" icon variant="text" @click="mobileMenu = true">
        <v-icon>mdi-menu</v-icon>
      </v-btn>

      <!-- Not logged in -->
      <template v-if="!authStore.isLoggedIn">
        <v-btn variant="text" size="small" :to="{ name: 'Login' }" class="mr-1 d-none d-md-flex">Sign in</v-btn>
        <v-btn color="primary" size="small" :to="{ name: 'Register' }" class="d-none d-md-flex">Get started</v-btn>
      </template>

      <!-- Logged in avatar menu -->
      <template v-else>
        <v-menu offset-y rounded="xl">
          <template #activator="{ props }">
            <v-btn v-bind="props" icon variant="text">
              <v-avatar size="36" color="primary">
                <v-img v-if="authStore.user?.user_image" :src="authStore.user.user_image" />
                <span v-else class="text-white font-weight-bold text-body-2">{{ initials }}</span>
              </v-avatar>
            </v-btn>
          </template>
          <v-list rounded="xl" density="compact" min-width="220">
            <v-list-item :subtitle="authStore.user?.email" class="py-3">
              <template #title><span class="font-weight-semibold">{{ authStore.user?.name }}</span></template>
            </v-list-item>
            <v-divider />
            <v-list-item v-for="item in menuItems" :key="item.label"
              :prepend-icon="item.icon" :to="item.to" :title="item.label" rounded="lg" />
            <v-divider />
            <v-list-item prepend-icon="mdi-logout" title="Sign out" rounded="lg" @click="handleLogout" />
          </v-list>
        </v-menu>
      </template>
    </v-container>
  </v-app-bar>

  <!-- Mobile drawer -->
  <v-navigation-drawer v-model="mobileMenu" temporary location="right" width="280">
    <div class="pa-4 pb-2 d-flex align-center justify-space-between">
      <span class="font-weight-bold text-subtitle-1">Menu</span>
      <v-btn icon size="small" variant="text" @click="mobileMenu=false"><v-icon>mdi-close</v-icon></v-btn>
    </div>
    <v-list nav density="compact">
      <v-list-item title="Browse Photographers" prepend-icon="mdi-magnify" :to="{name:'Photographers'}" rounded="lg" @click="mobileMenu=false" />
      <v-list-item title="How it Works" prepend-icon="mdi-information-outline" :to="{name:'HowItWorks'}" rounded="lg" @click="mobileMenu=false" />
      <v-list-item title="About" prepend-icon="mdi-account-group-outline" :to="{name:'About'}" rounded="lg" @click="mobileMenu=false" />
      <v-list-item title="FAQ" prepend-icon="mdi-help-circle-outline" :to="{name:'FAQ'}" rounded="lg" @click="mobileMenu=false" />
      <v-list-item title="Contact" prepend-icon="mdi-headset" :to="{name:'Contact'}" rounded="lg" @click="mobileMenu=false" />
      <v-divider class="my-2" />
      <template v-if="!authStore.isLoggedIn">
        <v-list-item title="Sign In" prepend-icon="mdi-login" :to="{name:'Login'}" rounded="lg" @click="mobileMenu=false" />
        <v-list-item title="Get Started" prepend-icon="mdi-account-plus" :to="{name:'Register'}" rounded="lg" @click="mobileMenu=false" />
      </template>
      <template v-else>
        <v-list-item v-for="item in menuItems" :key="item.label"
          :prepend-icon="item.icon" :to="item.to" :title="item.label" rounded="lg" @click="mobileMenu=false" />
        <v-list-item prepend-icon="mdi-logout" title="Sign out" rounded="lg" @click="handleLogout" />
      </template>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useTheme } from 'vuetify'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'

const router=useRouter(), authStore=useAuthStore(), appStore=useAppStore()
const theme=useTheme(), mobileMenu=ref(false)
const isDark=computed(()=>theme.global.current.value.dark)
function toggleTheme(){theme.global.name.value=isDark.value?'pixxgramLight':'pixxgramDark'}
const initials=computed(()=>{const n=authStore.user?.name||'';return n.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()})
const messageRoute=computed(()=>authStore.isPhotographer?{name:'PhotographerMessages'}:{name:'ClientMessages'})
const menuItems=computed(()=>{
  if(authStore.isAdmin) return [{label:'Dashboard',icon:'mdi-view-dashboard-outline',to:{name:'AdminDashboard'}}]
  if(authStore.isPhotographer) return [
    {label:'Dashboard',icon:'mdi-view-dashboard-outline',to:{name:'PhotographerDashboard'}},
    {label:'My Profile',icon:'mdi-account-edit-outline',to:{name:'PhotographerProfileEdit'}},
    {label:'Portfolio',icon:'mdi-image-multiple-outline',to:{name:'Portfolio'}},
    {label:'Bookings',icon:'mdi-calendar-check-outline',to:{name:'PhotographerBookings'}},
    {label:'Subscription',icon:'mdi-crown-outline',to:{name:'Subscription'}},
  ]
  return [
    {label:'My Bookings',icon:'mdi-calendar-check-outline',to:{name:'ClientBookings'}},
    {label:'Messages',icon:'mdi-message-outline',to:{name:'ClientMessages'}},
    {label:'My Profile',icon:'mdi-account-outline',to:{name:'ClientProfile'}},
  ]
})
async function handleLogout(){await authStore.logout();router.push({name:'Home'});mobileMenu.value=false}
</script>

<style scoped>
.brand-icon{width:32px;height:32px;background:rgb(var(--v-theme-primary));border-radius:10px;display:flex;align-items:center;justify-content:center}
.brand-text{font-weight:800;font-size:1.2rem;letter-spacing:-.5px;color:rgb(var(--v-theme-primary))}
.gap-1{gap:4px}
</style>
