<template>
  <div>
    <NavBar />

    <section class="hiw-hero text-center">
      <v-container style="max-width:700px">
        <v-chip color="secondary" size="small" class="mb-4" label>Simple & Fast</v-chip>
        <h1 class="text-h3 font-weight-black text-white mb-4">How Pixxgram Works</h1>
        <p style="color:rgba(255,255,255,0.75);font-size:1.1rem">
          Whether you're looking to book a photographer or grow your photography business,
          Pixxgram makes it easy.
        </p>
      </v-container>
    </section>

    <!-- For Clients -->
    <section class="py-16">
      <v-container style="max-width:1100px">
        <div class="text-center mb-12">
          <v-chip color="primary" size="small" class="mb-3">For Clients</v-chip>
          <h2 class="text-h5 font-weight-bold">Find & Book a Photographer</h2>
        </div>
        <v-row>
          <v-col v-for="(step, i) in clientSteps" :key="i" cols="12" md="3">
            <div class="flow-step">
              <div class="flow-number">{{ i + 1 }}</div>
              <div class="flow-connector" v-if="i < clientSteps.length - 1" />
              <div class="flow-icon">
                <v-icon size="28" color="primary">{{ step.icon }}</v-icon>
              </div>
              <h4 class="text-subtitle-2 font-weight-bold mt-4 mb-2">{{ step.title }}</h4>
              <p class="text-caption text-medium-emphasis">{{ step.desc }}</p>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- For Photographers -->
    <section class="py-16" style="background:rgb(var(--v-theme-surface))">
      <v-container style="max-width:1100px">
        <div class="text-center mb-12">
          <v-chip color="secondary" size="small" class="mb-3">For Photographers</v-chip>
          <h2 class="text-h5 font-weight-bold">Grow Your Photography Business</h2>
        </div>
        <v-row>
          <v-col v-for="(step, i) in photographerSteps" :key="i" cols="12" md="3">
            <div class="flow-step">
              <div class="flow-number secondary">{{ i + 1 }}</div>
              <div class="flow-icon secondary-bg">
                <v-icon size="28" color="secondary">{{ step.icon }}</v-icon>
              </div>
              <h4 class="text-subtitle-2 font-weight-bold mt-4 mb-2">{{ step.title }}</h4>
              <p class="text-caption text-medium-emphasis">{{ step.desc }}</p>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- M-Pesa section -->
    <section class="mpesa-section py-16">
      <v-container style="max-width:900px">
        <v-row align="center">
          <v-col cols="12" md="6">
            <v-chip color="success" size="small" class="mb-4" label>🇰🇪 Proudly Kenyan</v-chip>
            <h2 class="text-h5 font-weight-bold text-white mb-4">Pay easily with M-Pesa</h2>
            <p style="color:rgba(255,255,255,0.75)" class="mb-6">
              No credit cards needed. Photographers get paid directly to their M-Pesa. Fast, familiar, secure.
            </p>
            <div class="d-flex flex-column gap-3">
              <div v-for="f in mpesaFeatures" :key="f" class="d-flex align-center gap-2">
                <v-icon color="success" size="20">mdi-check-circle</v-icon>
                <span style="color:rgba(255,255,255,0.85);font-size:0.9rem">{{ f }}</span>
              </div>
            </div>
          </v-col>
          <v-col cols="12" md="6" class="text-center">
            <div class="mpesa-card pa-8">
              <v-icon size="64" color="success" class="mb-4">mdi-cellphone-check</v-icon>
              <h3 class="text-h6 font-weight-bold text-white mb-2">STK Push Payment</h3>
              <p style="color:rgba(255,255,255,0.65);font-size:0.875rem">
                You receive a prompt on your phone. Enter your PIN. Done. It takes less than 30 seconds.
              </p>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- FAQ Preview -->
    <section class="py-16">
      <v-container style="max-width:800px">
        <div class="text-center mb-10">
          <h2 class="text-h5 font-weight-bold mb-2">Common Questions</h2>
        </div>
        <v-expansion-panels variant="accordion" rounded="xl">
          <v-expansion-panel v-for="faq in faqs" :key="faq.q" rounded="xl" class="mb-2">
            <v-expansion-panel-title class="font-weight-semibold">{{ faq.q }}</v-expansion-panel-title>
            <v-expansion-panel-text class="text-medium-emphasis">{{ faq.a }}</v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
        <div class="text-center mt-6">
          <v-btn variant="text" color="secondary" :to="{ name: 'FAQ' }">
            View all FAQs <v-icon end>mdi-arrow-right</v-icon>
          </v-btn>
        </div>
      </v-container>
    </section>

    <!-- CTA -->
    <section style="background:rgb(var(--v-theme-primary))" class="py-14">
      <v-container style="max-width:700px" class="text-center">
        <h2 class="text-h5 font-weight-bold text-white mb-4">Ready to get started?</h2>
        <div class="d-flex gap-3 justify-center flex-wrap">
          <v-btn color="secondary" size="large" rounded="lg" :to="{ name: 'Photographers' }">
            Find a Photographer
          </v-btn>
          <v-btn variant="outlined" color="white" size="large" rounded="lg" :to="{ name: 'Register' }">
            Join as Photographer
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

const clientSteps = [
  { icon: 'mdi-magnify',               title: 'Search',          desc: 'Filter by location, category, price, and rating to find your perfect match.' },
  { icon: 'mdi-account-eye-outline',   title: 'View Profiles',   desc: 'Browse portfolios, read reviews, and check availability.' },
  { icon: 'mdi-calendar-plus-outline', title: 'Book',            desc: 'Select your date and send a booking request in seconds.' },
  { icon: 'mdi-cellphone-check',       title: 'Pay via M-Pesa',  desc: 'Confirm your booking with a secure M-Pesa STK push payment.' },
]
const photographerSteps = [
  { icon: 'mdi-account-plus-outline',  title: 'Sign Up',         desc: 'Create your free account and set up your photographer profile.' },
  { icon: 'mdi-crown-outline',         title: 'Subscribe',       desc: 'Choose a plan and pay via M-Pesa to activate your listing.' },
  { icon: 'mdi-image-plus-outline',    title: 'Build Portfolio', desc: 'Upload your best work to attract more clients.' },
  { icon: 'mdi-cash-multiple',         title: 'Get Paid',        desc: 'Accept bookings and receive M-Pesa payments directly.' },
]
const mpesaFeatures = [
  'Instant STK push to your phone',
  'Funds sent directly to photographer',
  'Full transaction history',
  'Receipts for every payment',
]
const faqs = [
  { q: 'Is Pixxgram free to use for clients?', a: 'Yes! Searching and browsing photographers is completely free. You only pay when you confirm a booking.' },
  { q: 'How do photographers get paid?', a: 'Photographers receive payment directly to their M-Pesa number after a booking is confirmed.' },
  { q: 'What if I need to cancel a booking?', a: 'You can cancel a pending booking from your bookings dashboard. Cancellation policies vary by photographer.' },
  { q: 'How are photographers verified?', a: 'Photographers complete profile verification and are reviewed by our team before appearing in search results.' },
]
</script>

<style scoped>
.hiw-hero { background: rgb(var(--v-theme-primary)); padding: 100px 16px; }
.flow-step { text-align: center; position: relative; padding: 0 16px; }
.flow-number {
  width: 36px; height: 36px; border-radius: 50%;
  background: rgb(var(--v-theme-primary)); color: white;
  font-weight: 800; font-size: 0.9rem;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 20px;
}
.flow-number.secondary { background: rgb(var(--v-theme-secondary)); }
.flow-icon {
  width: 72px; height: 72px; border-radius: 20px;
  background: rgba(var(--v-theme-primary), 0.08);
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto;
}
.flow-icon.secondary-bg { background: rgba(var(--v-theme-secondary), 0.1); }
.mpesa-section { background: #0d3b1e; }
.mpesa-card {
  background: rgba(255,255,255,0.06);
  border-radius: 20px;
  border: 1px solid rgba(255,255,255,0.1);
}
.gap-2 { gap: 8px; }
.gap-3 { gap: 12px; }
</style>
