<template>
  <div>
    <NavBar />
    <section class="legal-hero">
      <v-container style="max-width:800px" class="text-center">
        <h1 class="text-h4 font-weight-black text-white mb-2">Terms of Service</h1>
        <p style="color:rgba(255,255,255,0.65)">Last updated: January 2025</p>
      </v-container>
    </section>
    <v-container style="max-width:800px" class="py-12">
      <v-card rounded="xl" class="pa-8 legal-card">
        <div v-for="section in sections" :key="section.title" class="legal-section mb-8">
          <h2 class="text-subtitle-1 font-weight-bold mb-3">{{ section.title }}</h2>
          <p v-for="(para, i) in section.content" :key="i"
             class="text-body-2 text-medium-emphasis mb-3" style="line-height:1.8">
            {{ para }}
          </p>
        </div>
      </v-card>
    </v-container>
    <SiteFooter />
  </div>
</template>

<script setup>
import NavBar from '@/components/shared/NavBar.vue'
import SiteFooter from '@/components/shared/SiteFooter.vue'

const sections = [
  { title: '1. Acceptance of Terms', content: ['By accessing or using Pixxgram, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform.'] },
  { title: '2. User Accounts', content: ['You must be at least 18 years old to create an account. You are responsible for maintaining the confidentiality of your account credentials. You agree to provide accurate and complete information when creating your account.', 'Pixxgram reserves the right to suspend or terminate accounts that violate these terms or engage in fraudulent activity.'] },
  { title: '3. For Photographers', content: ['Photographers must subscribe to an active plan to appear in search results and receive bookings. Subscription fees are non-refundable once a billing period has commenced.', 'Photographers are independent contractors and not employees of Pixxgram. You are responsible for your own taxes, insurance, and professional obligations.'] },
  { title: '4. For Clients', content: ['Clients agree to provide accurate information when making bookings. Bookings constitute a binding agreement between the client and the photographer.', 'Pixxgram is not responsible for the quality of photography services delivered. Any disputes should first be attempted to be resolved directly between the client and photographer.'] },
  { title: '5. Payments', content: ['All payments are processed via Safaricom M-Pesa. By making a payment, you authorize Pixxgram to initiate an M-Pesa transaction for the stated amount.', 'Pixxgram charges no additional platform fees on top of the photographer\'s quoted rates. Subscription fees for photographers are clearly disclosed before purchase.'] },
  { title: '6. Prohibited Conduct', content: ['You agree not to: post false or misleading information, harass other users, attempt to circumvent our payment system by booking and paying photographers off-platform, or use the platform for any illegal purpose.'] },
  { title: '7. Limitation of Liability', content: ['Pixxgram is a marketplace platform and is not responsible for the actions of photographers or clients. Our liability is limited to the maximum extent permitted by Kenyan law.'] },
  { title: '8. Changes to Terms', content: ['We may update these terms from time to time. We will notify you of significant changes by email or through the platform. Continued use after changes constitutes acceptance of the new terms.'] },
  { title: '9. Governing Law', content: ['These terms are governed by the laws of the Republic of Kenya. Any disputes shall be resolved in the courts of Kenya.'] },
  { title: '10. Contact', content: ['Questions about these Terms of Service may be sent to: legal@pixxgram.com'] },
]
</script>

<style scoped>
.legal-hero { background: rgb(var(--v-theme-primary)); padding: 80px 16px; }
.legal-card { border: 1px solid rgba(0,0,0,0.08) !important; }
.legal-section:not(:last-child) { border-bottom: 1px solid rgba(0,0,0,0.06); padding-bottom: 32px; }
</style>
