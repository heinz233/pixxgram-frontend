<template>
  <div>
    <NavBar />
    <section class="legal-hero">
      <v-container style="max-width:800px" class="text-center">
        <h1 class="text-h4 font-weight-black text-white mb-2">Privacy Policy</h1>
        <p style="color:rgba(255,255,255,0.65)">Last updated: January 2025</p>
      </v-container>
    </section>
    <v-container style="max-width:800px" class="py-12">
      <v-card rounded="xl" class="pa-8 legal-card">
        <div v-for="section in sections" :key="section.title" class="legal-section mb-8">
          <h2 class="text-subtitle-1 font-weight-bold mb-3">{{ section.title }}</h2>
          <p v-for="(para, i) in section.content" :key="i" class="text-body-2 text-medium-emphasis mb-3" style="line-height:1.8">
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
  { title: '1. Information We Collect', content: ['We collect information you provide directly to us, such as when you create an account, book a photographer, or contact us for support. This includes your name, email address, phone number, and payment information.', 'We also collect usage data automatically when you use our platform, including your IP address, browser type, pages visited, and the time and date of your visit.'] },
  { title: '2. How We Use Your Information', content: ['We use the information we collect to provide, maintain, and improve our services, process transactions, send you technical notices and support messages, and respond to your comments and questions.', 'We may also use your information to send promotional communications, such as information about services, features, and events, subject to your communication preferences.'] },
  { title: '3. M-Pesa Payments', content: ['When you make a payment through Pixxgram, your M-Pesa transaction is processed by Safaricom via the official Daraja API. We do not store your M-Pesa PIN at any point. We only store your M-Pesa phone number and transaction reference numbers for record-keeping.'] },
  { title: '4. Information Sharing', content: ['We do not sell or rent your personal information to third parties. We may share your information with third-party vendors and service providers who support our business operations, such as cloud storage and analytics providers.', 'We may disclose your information if we believe disclosure is in accordance with, or required by, any applicable law or legal process.'] },
  { title: '5. Data Security', content: ['We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction. However, no internet or email transmission is ever fully secure or error free.'] },
  { title: '6. Your Rights', content: ['You have the right to access, update or delete the information we have on you. You may update your account information through your profile settings at any time. To request deletion of your account, please contact us at support@pixxgram.com.'] },
  { title: '7. Contact Us', content: ['If you have any questions about this Privacy Policy, please contact us at: privacy@pixxgram.com or write to us at Pixxgram, Nairobi, Kenya.'] },
]
</script>

<style scoped>
.legal-hero { background: rgb(var(--v-theme-primary)); padding: 80px 16px; }
.legal-card { border: 1px solid rgba(0,0,0,0.08) !important; }
.legal-section:not(:last-child) { border-bottom: 1px solid rgba(0,0,0,0.06); padding-bottom: 32px; }
</style>
