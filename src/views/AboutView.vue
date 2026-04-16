<template>
  <div>
    <NavBar />

    <!-- Hero -->
    <section class="about-hero">
      <v-container style="max-width:900px" class="text-center">
        <v-chip color="secondary" size="small" class="mb-4" label>Our Story</v-chip>
        <h1 class="text-h3 font-weight-black text-white mb-4">
          Connecting Kenya's photographers<br>with the world
        </h1>
        <p style="color:rgba(255,255,255,0.75);font-size:1.1rem;max-width:600px;margin:0 auto">
          Pixxgram was born from a simple belief — every moment deserves to be captured beautifully,
          and every talented photographer deserves to be discovered.
        </p>
      </v-container>
    </section>

    <!-- Mission -->
    <section class="py-16">
      <v-container style="max-width:1100px">
        <v-row align="center" class="gap-row">
          <v-col cols="12" md="6">
            <v-chip color="secondary" size="small" class="mb-3" label>Our Mission</v-chip>
            <h2 class="text-h5 font-weight-bold mb-4">
              Empowering photographers,<br>delighting clients
            </h2>
            <p class="text-body-1 text-medium-emphasis mb-4">
              We built Pixxgram to solve a real problem: finding a reliable, talented photographer in Kenya was hard.
              At the same time, skilled photographers struggled to reach clients beyond their immediate networks.
            </p>
            <p class="text-body-1 text-medium-emphasis">
              Today, Pixxgram is the bridge — a transparent, easy-to-use marketplace where both sides thrive.
            </p>
          </v-col>
          <v-col cols="12" md="6">
            <v-row>
              <v-col v-for="val in values" :key="val.title" cols="6">
                <v-card rounded="xl" class="value-card pa-5 text-center">
                  <div class="value-icon mx-auto mb-3">
                    <v-icon :color="val.color" size="24">{{ val.icon }}</v-icon>
                  </div>
                  <h4 class="text-subtitle-2 font-weight-bold mb-1">{{ val.title }}</h4>
                  <p class="text-caption text-medium-emphasis">{{ val.desc }}</p>
                </v-card>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- Stats -->
    <section class="stats-section py-14">
      <v-container style="max-width:1000px">
        <v-row justify="center">
          <v-col v-for="s in bigStats" :key="s.label" cols="6" md="3" class="text-center">
            <div class="big-stat-number">{{ s.value }}</div>
            <div class="big-stat-label">{{ s.label }}</div>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- Team -->
    <section class="py-16">
      <v-container style="max-width:1100px">
        <div class="text-center mb-10">
          <h2 class="text-h5 font-weight-bold mb-2">Meet the Team</h2>
          <p class="text-medium-emphasis">The people building Pixxgram</p>
        </div>
        <v-row justify="center">
          <v-col v-for="member in team" :key="member.name" cols="12" sm="6" md="3">
            <v-card rounded="xl" class="team-card pa-6 text-center">
              <v-avatar size="80" :color="member.color" class="mb-4">
                <span class="text-white text-h5 font-weight-bold">{{ member.name.charAt(0) }}</span>
              </v-avatar>
              <h4 class="text-subtitle-2 font-weight-bold">{{ member.name }}</h4>
              <p class="text-caption text-secondary font-weight-medium mt-1">{{ member.role }}</p>
              <p class="text-caption text-medium-emphasis mt-2">{{ member.bio }}</p>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- CTA -->
    <section class="about-cta py-14">
      <v-container style="max-width:700px" class="text-center">
        <h2 class="text-h5 font-weight-bold text-white mb-3">Ready to get started?</h2>
        <p class="mb-6" style="color:rgba(255,255,255,0.75)">
          Join thousands of photographers and clients already on Pixxgram.
        </p>
        <div class="d-flex gap-3 justify-center flex-wrap">
          <v-btn color="secondary" size="large" rounded="lg" :to="{ name: 'Register' }">Sign Up Free</v-btn>
          <v-btn variant="outlined" color="white" size="large" rounded="lg" :to="{ name: 'Photographers' }">
            Browse Photographers
          </v-btn>
        </div>
      </v-container>
    </section>

    <SiteFooter />
  </div>
</template>

<script setup>
import NavBar from '@/components/shared/NavBar.vue'
import SiteFooter from '@/components/shared/SiteFooter.vue'

const values = [
  { title: 'Transparency',  icon: 'mdi-eye-outline',       color: 'blue',   desc: 'Clear pricing, honest reviews, no hidden fees.' },
  { title: 'Trust',         icon: 'mdi-shield-check',      color: 'green',  desc: 'Verified photographers, secure payments.' },
  { title: 'Local First',   icon: 'mdi-map-marker-outline',color: 'orange', desc: 'Built for Kenya, by Kenyans.' },
  { title: 'Quality',       icon: 'mdi-star-outline',      color: 'amber',  desc: 'Ratings and reviews keep standards high.' },
]
const bigStats = [
  { value: '500+',  label: 'Active Photographers' },
  { value: '47',    label: 'Counties Covered' },
  { value: '2,000+',label: 'Successful Bookings' },
  { value: '4.8/5', label: 'Average Rating' },
]
const team = [
  { name: 'David Mwangi',  role: 'Co-founder & CEO',     color: 'primary',   bio: 'Former software engineer passionate about creative economy.' },
  { name: 'Faith Akinyi',  role: 'Co-founder & Design',  color: 'secondary', bio: 'Designer who believes great UX changes industries.' },
  { name: 'James Ochieng', role: 'Lead Engineer',         color: 'teal',      bio: 'Full-stack developer building scalable systems.' },
  { name: 'Sharon Njeri',  role: 'Community Manager',    color: 'purple',    bio: 'Growing our photographer community across Kenya.' },
]
</script>

<style scoped>
.about-hero {
  background: rgb(var(--v-theme-primary));
  padding: 100px 16px;
}
.value-card { border: 1px solid rgba(0,0,0,0.07) !important; }
.value-icon { width: 48px; height: 48px; background: rgba(0,0,0,0.04); border-radius: 14px; display: flex; align-items: center; justify-content: center; }
.stats-section { background: rgb(var(--v-theme-primary)); }
.big-stat-number { font-size: 2.4rem; font-weight: 900; color: white; }
.big-stat-label  { font-size: 0.85rem; color: rgba(255,255,255,0.65); margin-top: 4px; }
.team-card { border: 1px solid rgba(0,0,0,0.07) !important; }
.about-cta { background: rgb(var(--v-theme-primary)); }
.gap-3 { gap: 12px; }
</style>
