<template>
  <div>
    <NavBar />

    <section class="faq-hero text-center">
      <v-container style="max-width:700px">
        <v-icon size="56" color="secondary" class="mb-4">mdi-help-circle-outline</v-icon>
        <h1 class="text-h4 font-weight-black text-white mb-3">Frequently Asked Questions</h1>
        <p style="color:rgba(255,255,255,0.75)">
          Everything you need to know about Pixxgram.
        </p>
        <v-text-field
          v-model="search"
          placeholder="Search questions..."
          prepend-inner-icon="mdi-magnify"
          class="mt-6" rounded="xl"
          bg-color="white" variant="solo"
          hide-details clearable
          style="max-width:480px;margin:0 auto"
        />
      </v-container>
    </section>

    <v-container style="max-width:860px" class="py-12">

      <div v-for="section in filteredSections" :key="section.title" class="mb-10">
        <div class="d-flex align-center gap-2 mb-4">
          <div class="section-icon">
            <v-icon :color="section.color" size="20">{{ section.icon }}</v-icon>
          </div>
          <h2 class="text-h6 font-weight-bold">{{ section.title }}</h2>
        </div>

        <v-expansion-panels variant="accordion">
          <v-expansion-panel
            v-for="faq in section.faqs"
            :key="faq.q"
            rounded="xl"
            class="mb-2 faq-panel"
          >
            <v-expansion-panel-title class="font-weight-semibold">
              {{ faq.q }}
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <p class="text-body-2 text-medium-emphasis" style="line-height:1.7">{{ faq.a }}</p>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </div>

      <div v-if="!filteredSections.length" class="text-center py-16">
        <v-icon size="56" color="medium-emphasis">mdi-magnify-close</v-icon>
        <p class="mt-3 text-medium-emphasis">No results for "{{ search }}"</p>
      </div>

      <!-- Still need help -->
      <v-card rounded="xl" color="primary" class="pa-8 text-center mt-8">
        <v-icon size="36" color="secondary" class="mb-3">mdi-headset</v-icon>
        <h3 class="text-subtitle-1 font-weight-bold text-white mb-2">Still have questions?</h3>
        <p style="color:rgba(255,255,255,0.75)" class="mb-5">Our team is happy to help you out.</p>
        <v-btn color="secondary" rounded="lg" :to="{ name: 'Contact' }">Contact Support</v-btn>
      </v-card>
    </v-container>

    <SiteFooter />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import NavBar from '@/components/shared/NavBar.vue'
import SiteFooter from '@/components/shared/SiteFooter.vue'

const search = ref('')

const sections = [
  {
    title: 'For Clients', icon: 'mdi-account-outline', color: 'primary',
    faqs: [
      { q: 'Is it free to browse photographers?', a: 'Yes, browsing and viewing photographer profiles is completely free. You only pay when you confirm a booking.' },
      { q: 'How do I book a photographer?', a: 'Find a photographer you like, click "Book Now" on their profile, select your date and time, add any notes, and confirm. Payment is made via M-Pesa.' },
      { q: 'Can I cancel a booking?', a: 'You can cancel a pending booking from your bookings dashboard. Once a booking is confirmed by the photographer, please contact them directly to discuss cancellation.' },
      { q: 'How do I know a photographer is trustworthy?', a: 'All photographers on Pixxgram have verified profiles. You can read genuine reviews from past clients, see their portfolio, and check their rating before booking.' },
      { q: 'What if I am not satisfied with the photos?', a: 'We encourage you to discuss your expectations with the photographer before the shoot. If there is a serious issue, you can file a report through our platform and our team will investigate.' },
    ],
  },
  {
    title: 'For Photographers', icon: 'mdi-camera-outline', color: 'secondary',
    faqs: [
      { q: 'How do I join as a photographer?', a: 'Register an account, select the "Photographer" role, complete your profile, upload your portfolio, and subscribe to one of our plans to appear in search results.' },
      { q: 'What are the subscription plans?', a: 'We offer Monthly (KSh 1,500), Quarterly (KSh 3,999), and Annual (KSh 14,000) plans. All plans give you full access to bookings, messaging, and portfolio uploads.' },
      { q: 'How do I get paid?', a: 'Clients pay via M-Pesa when confirming a booking. Funds are processed and sent to your registered M-Pesa number.' },
      { q: 'Can I set my own rates?', a: 'Absolutely. You set your hourly rate and can specify service-specific rates in your profile. You have full control over your pricing.' },
      { q: 'How do I manage bookings?', a: 'All booking requests appear in your Bookings dashboard. You can accept, decline, or mark bookings as completed from there.' },
    ],
  },
  {
    title: 'Payments & M-Pesa', icon: 'mdi-cellphone-check', color: 'success',
    faqs: [
      { q: 'How does M-Pesa payment work?', a: 'When you confirm a booking, you enter your M-Pesa number and receive an STK push (prompt) on your phone. Enter your PIN to complete the payment in seconds.' },
      { q: 'Is my payment information secure?', a: 'Yes. We use Safaricom\'s official Daraja API for all M-Pesa transactions. We never store your M-Pesa PIN.' },
      { q: 'What payment methods are accepted?', a: 'Currently we support M-Pesa (STK push). Card and PayPal payments are coming soon.' },
      { q: 'Can I get a receipt for my payment?', a: 'Yes. Every successful M-Pesa transaction generates a receipt number that you can find in your booking history.' },
    ],
  },
  {
    title: 'Account & Profile', icon: 'mdi-account-cog-outline', color: 'info',
    faqs: [
      { q: 'How do I verify my email?', a: 'After registering, check your email for a verification link. Click it to activate your account. If you did not receive it, use the resend option on the verify email page.' },
      { q: 'Can I change my role from client to photographer?', a: 'Currently role changes require contacting our support team. We are working on self-service role switching.' },
      { q: 'How do I delete my account?', a: 'Contact our support team at support@pixxgram.com to request account deletion.' },
    ],
  },
]

const filteredSections = computed(() => {
  if (!search.value.trim()) return sections
  const q = search.value.toLowerCase()
  return sections
    .map(s => ({ ...s, faqs: s.faqs.filter(f => f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q)) }))
    .filter(s => s.faqs.length > 0)
})
</script>

<style scoped>
.faq-hero { background: rgb(var(--v-theme-primary)); padding: 80px 16px 60px; }
.section-icon {
  width: 36px; height: 36px; border-radius: 10px;
  background: rgba(0,0,0,0.05);
  display: flex; align-items: center; justify-content: center;
}
.faq-panel { border: 1px solid rgba(0,0,0,0.06) !important; }
.gap-2 { gap: 8px; }
</style>
