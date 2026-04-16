<template>
  <div>
    <NavBar />

    <section class="contact-hero text-center">
      <v-container style="max-width:600px">
        <v-icon size="52" color="secondary" class="mb-4">mdi-headset</v-icon>
        <h1 class="text-h4 font-weight-black text-white mb-3">Get in Touch</h1>
        <p style="color:rgba(255,255,255,0.75)">
          Have a question or need help? We're here for you.
        </p>
      </v-container>
    </section>

    <v-container style="max-width:1100px" class="py-14">
      <v-row>
        <!-- Contact form -->
        <v-col cols="12" md="7">
          <v-card rounded="xl" class="pa-8 contact-card">
            <h2 class="text-h6 font-weight-bold mb-6">Send us a message</h2>

            <v-form ref="formRef" @submit.prevent="submit">
              <v-row>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="form.name"
                    label="Your name"
                    prepend-inner-icon="mdi-account-outline"
                    :rules="[v => !!v || 'Required']"
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="form.email"
                    label="Email address"
                    type="email"
                    prepend-inner-icon="mdi-email-outline"
                    :rules="[v => !!v || 'Required', v => /.+@.+\..+/.test(v) || 'Invalid email']"
                  />
                </v-col>
                <v-col cols="12">
                  <v-select
                    v-model="form.subject"
                    label="Subject"
                    :items="subjects"
                    prepend-inner-icon="mdi-tag-outline"
                    :rules="[v => !!v || 'Required']"
                  />
                </v-col>
                <v-col cols="12">
                  <v-textarea
                    v-model="form.message"
                    label="Your message"
                    rows="5"
                    :rules="[v => !!v || 'Required', v => v.length >= 20 || 'Please write at least 20 characters']"
                    counter
                    maxlength="1000"
                  />
                </v-col>
              </v-row>

              <v-alert v-if="successMsg" type="success" variant="tonal" rounded="lg" class="mb-4">
                {{ successMsg }}
              </v-alert>

              <v-btn
                type="submit"
                color="primary"
                size="large"
                :loading="loading"
                prepend-icon="mdi-send"
              >
                Send Message
              </v-btn>
            </v-form>
          </v-card>
        </v-col>

        <!-- Contact info -->
        <v-col cols="12" md="5">
          <div class="pl-md-6">
            <h2 class="text-h6 font-weight-bold mb-6">Contact Information</h2>

            <div v-for="info in contactInfo" :key="info.label" class="contact-info-item mb-6">
              <div class="d-flex align-start gap-3">
                <div class="contact-icon">
                  <v-icon :color="info.color" size="20">{{ info.icon }}</v-icon>
                </div>
                <div>
                  <p class="text-caption text-medium-emphasis text-uppercase font-weight-bold mb-1">{{ info.label }}</p>
                  <p class="text-body-2 font-weight-medium">{{ info.value }}</p>
                  <p v-if="info.sub" class="text-caption text-medium-emphasis">{{ info.sub }}</p>
                </div>
              </div>
            </div>

            <v-divider class="my-6" />

            <p class="text-subtitle-2 font-weight-bold mb-3">Follow us</p>
            <div class="d-flex gap-2">
              <v-btn icon size="small" variant="tonal" color="primary" href="#" target="_blank">
                <v-icon size="18">mdi-instagram</v-icon>
              </v-btn>
              <v-btn icon size="small" variant="tonal" color="primary" href="#" target="_blank">
                <v-icon size="18">mdi-twitter</v-icon>
              </v-btn>
              <v-btn icon size="small" variant="tonal" color="primary" href="#" target="_blank">
                <v-icon size="18">mdi-facebook</v-icon>
              </v-btn>
              <v-btn icon size="small" variant="tonal" color="primary" href="#" target="_blank">
                <v-icon size="18">mdi-linkedin</v-icon>
              </v-btn>
            </div>
          </div>
        </v-col>
      </v-row>
    </v-container>

    <SiteFooter />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import NavBar from '@/components/shared/NavBar.vue'
import SiteFooter from '@/components/shared/SiteFooter.vue'

const formRef   = ref(null)
const loading   = ref(false)
const successMsg = ref('')
const form = ref({ name: '', email: '', subject: '', message: '' })

const subjects = [
  'General Inquiry', 'Booking Issue', 'Payment Problem',
  'Report a Photographer', 'Photographer Support', 'Partnership', 'Other',
]

const contactInfo = [
  { label: 'Email',    icon: 'mdi-email-outline',  color: 'primary', value: 'pixxgram.help@gmail.com', sub: 'We reply within 24 hours' },
  { label: 'Phone',    icon: 'mdi-phone-outline',  color: 'green',   value: '+254 781544283', sub: 'Mon – Fri, 8am – 6pm EAT' },
  { label: 'Location', icon: 'mdi-map-marker-outline', color: 'red', value: 'Nairobi, Kenya', sub: 'Ruaraka, Nairobi' },
]

async function submit() {
  const { valid } = await formRef.value.validate()
  if (!valid) return
  loading.value = true
  // Simulate API call — wire to backend when ready
  await new Promise(r => setTimeout(r, 1200))
  loading.value  = false
  successMsg.value = 'Message sent! We\'ll get back to you within 24 hours.'
  form.value = { name: '', email: '', subject: '', message: '' }
  formRef.value.resetValidation()
}
</script>

<style scoped>
.contact-hero { background: rgb(var(--v-theme-primary)); padding: 80px 16px; }
.contact-card { border: 1px solid rgba(0,0,0,0.08) !important; }
.contact-icon {
  width: 40px; height: 40px; flex-shrink: 0;
  background: rgba(0,0,0,0.04); border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
}
.gap-2 { gap: 8px; }
.gap-3 { gap: 12px; }
</style>
