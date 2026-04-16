<template>
  <v-footer class="site-footer pa-0">
    <div class="footer-top">
      <v-container style="max-width:1280px">
        <v-row>
          <!-- Brand -->
          <v-col cols="12" md="4" class="mb-6 mb-md-0">
            <div class="d-flex align-center mb-4">
              <div class="footer-logo-icon mr-2">
                <v-icon size="20" color="white">mdi-camera-iris</v-icon>
              </div>
              <span class="footer-brand">Pixxgram</span>
            </div>
            <p class="footer-desc">
              Kenya's leading photography marketplace. Connecting talented photographers with clients across all 47 counties.
            </p>
            <div class="d-flex gap-2 mt-4">
              <v-btn icon size="small" variant="outlined" color="white" href="#" density="compact">
                <v-icon size="16">mdi-instagram</v-icon>
              </v-btn>
              <v-btn icon size="small" variant="outlined" color="white" href="#" density="compact">
                <v-icon size="16">mdi-twitter</v-icon>
              </v-btn>
              <v-btn icon size="small" variant="outlined" color="white" href="#" density="compact">
                <v-icon size="16">mdi-facebook</v-icon>
              </v-btn>
            </div>
          </v-col>

          <!-- Links -->
          <v-col cols="6" md="2">
            <p class="footer-heading">Platform</p>
            <div class="footer-links">
              <router-link to="/photographers">Browse Photographers</router-link>
              <router-link to="/register">Join as Photographer</router-link>
              <router-link to="/login">Sign In</router-link>
            </div>
          </v-col>
          <v-col cols="6" md="2">
            <p class="footer-heading">Company</p>
            <div class="footer-links">
              <router-link to="/about">About Us</router-link>
              <router-link to="/how-it-works">How It Works</router-link>
              <router-link to="/contact">Contact</router-link>
            </div>
          </v-col>
          <v-col cols="6" md="2">
            <p class="footer-heading">Legal</p>
            <div class="footer-links">
              <router-link to="/privacy">Privacy Policy</router-link>
              <router-link to="/terms">Terms of Service</router-link>
            </div>
          </v-col>
          <v-col cols="6" md="2">
            <p class="footer-heading">Support</p>
            <div class="footer-links">
              <router-link to="/faq">FAQ</router-link>
              <router-link to="/contact">Help Center</router-link>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </div>
    <div class="footer-bottom">
      <v-container style="max-width:1280px" class="d-flex flex-wrap align-center justify-space-between">
        <span class="text-caption" style="color:rgba(255,255,255,0.5)">
          © {{ new Date().getFullYear() }} Pixxgram. All rights reserved.
        </span>
        <span class="text-caption" style="color:rgba(255,255,255,0.5)">
          Made with ❤️ in Kenya 🇰🇪
        </span>
      </v-container>
    </div>
  </v-footer>
</template>

<script setup></script>

<style scoped>
.site-footer { display: block; }
.footer-top {
  background: rgb(var(--v-theme-primary));
  padding: 64px 0 48px;
}
.footer-bottom {
  background: rgba(0,0,0,0.25);
  padding: 16px 0;
  background: #0d0d1a;
}
.footer-logo-icon {
  width: 36px; height: 36px;
  background: rgba(255,255,255,0.15);
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
}
.footer-brand { font-size: 1.3rem; font-weight: 800; color: white; letter-spacing: -0.5px; }
.footer-desc  { color: rgba(255,255,255,0.6); font-size: 0.875rem; line-height: 1.6; max-width: 280px; }
.footer-heading { color: rgba(255,255,255,0.45); font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 14px; }
.footer-links { display: flex; flex-direction: column; gap: 10px; }
.footer-links a {
  color: rgba(255,255,255,0.7);
  text-decoration: none;
  font-size: 0.875rem;
  transition: color 0.2s;
}
.footer-links a:hover { color: white; }
.gap-2 { gap: 8px; }
</style>
