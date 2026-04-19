<template>
  <div>
    <NavBar />

    <!-- Hero -->
    <section class="hero-section">
      <div class="hero-bg" />
      <v-container style="max-width:1280px; position:relative; z-index:2">
        <v-row align="center" style="min-height:540px">
          <v-col cols="12" md="6">
            <v-chip color="secondary" size="small" class="mb-5" label>
              🇰🇪 Kenya's #1 Photography Platform
            </v-chip>
            <h1 class="hero-title">
              Find the perfect<br>
              <span class="text-secondary">photographer</span><br>
              for every moment
            </h1>
            <p class="hero-subtitle mt-4 mb-8">
              Browse hundreds of professional photographers across Kenya.
              Book, message, and pay via M-Pesa — all in one place.
            </p>
            <v-card class="hero-search pa-3 mb-6" rounded="xl">
              <div class="d-flex align-center gap-2 flex-wrap">
                <v-select
                  v-model="heroLocation"
                  :items="popularLocations"
                  placeholder="Location"
                  prepend-inner-icon="mdi-map-marker-outline"
                  hide-details density="compact" variant="plain"
                  style="min-width:140px; flex:1"
                />
                <v-divider vertical class="mx-1" style="height:28px" />
                <v-select
                  v-model="heroCategory"
                  :items="popularCategories"
                  placeholder="Category"
                  prepend-inner-icon="mdi-tag-outline"
                  hide-details density="compact" variant="plain"
                  style="min-width:140px; flex:1"
                />
                <v-btn color="primary" size="large" rounded="lg" @click="goSearch">
                  <v-icon start>mdi-magnify</v-icon>Search
                </v-btn>
              </div>
            </v-card>
            <div class="d-flex flex-wrap gap-2">
              <v-chip v-for="tag in trendingTags" :key="tag" size="small" variant="outlined" color="white"
                class="tag-chip" @click="heroCategory=tag">{{ tag }}</v-chip>
            </div>
          </v-col>
          <v-col cols="12" md="6" class="d-none d-md-block">
            <div class="hero-grid">
              <div v-for="(img,i) in heroImages" :key="i" class="hero-img-placeholder" :class="img.tall?'tall':''">
                <v-icon size="28" color="rgba(255,255,255,0.3)">mdi-camera</v-icon>
                <span class="hero-img-label">{{ img.label }}</span>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- Stats -->
    <section class="stats-bar">
      <v-container style="max-width:1280px">
        <v-row justify="center">
          <v-col v-for="stat in stats" :key="stat.label" cols="6" md="3" class="text-center">
            <div class="stat-number">{{ stat.value }}</div>
            <div class="stat-label">{{ stat.label }}</div>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- Categories -->
    <section class="py-10" style="background:rgb(var(--v-theme-surface))">
      <v-container style="max-width:1280px">
        <h2 class="text-h6 font-weight-bold mb-5">Browse by Category</h2>
        <div class="category-scroll">
          <div v-for="cat in categories" :key="cat.label" class="category-pill"
            @click="$router.push({ name:'Photographers', query:{ category: cat.label } })">
            <div class="category-icon"><v-icon :color="cat.color">{{ cat.icon }}</v-icon></div>
            <span>{{ cat.label }}</span>
          </div>
        </div>
      </v-container>
    </section>

    <!-- Featured Photographers -->
    <section class="py-14">
      <v-container style="max-width:1280px">
        <div class="d-flex align-center justify-space-between mb-8">
          <div>
            <h2 class="text-h5 font-weight-bold">Featured Photographers</h2>
            <p class="text-medium-emphasis mt-1">Top-rated professionals across Kenya</p>
          </div>
          <v-btn variant="text" color="secondary" :to="{ name: 'Photographers' }">
            View all <v-icon end>mdi-arrow-right</v-icon>
          </v-btn>
        </div>
        <v-row v-if="loading">
          <v-col v-for="i in 4" :key="i" cols="12" sm="6" md="3">
            <v-skeleton-loader type="card" rounded="xl" />
          </v-col>
        </v-row>
        <v-row v-else>
          <v-col v-for="p in photographers" :key="p.id" cols="12" sm="6" md="3">
            <PhotographerCard :photographer="p" />
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- How it works -->
    <section class="how-section py-16">
      <v-container style="max-width:1280px">
        <div class="text-center mb-12">
          <v-chip color="secondary" size="small" class="mb-3" label>Simple Process</v-chip>
          <h2 class="text-h4 font-weight-bold">Book in 3 easy steps</h2>
          <p class="text-medium-emphasis mt-2">From search to shoot in minutes</p>
        </div>
        <v-row justify="center">
          <v-col v-for="step in steps" :key="step.step" cols="12" md="4" class="text-center">
            <div class="step-number mx-auto">{{ step.step }}</div>
            <div class="step-icon mx-auto mb-4">
              <v-icon size="32" color="primary">{{ step.icon }}</v-icon>
            </div>
            <h3 class="text-subtitle-1 font-weight-bold mb-2">{{ step.title }}</h3>
            <p class="text-body-2 text-medium-emphasis">{{ step.desc }}</p>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- Testimonials -->
    <section class="py-16" style="background:rgb(var(--v-theme-surface))">
      <v-container style="max-width:1280px">
        <div class="text-center mb-10">
          <h2 class="text-h5 font-weight-bold">What our users say</h2>
          <p class="text-medium-emphasis mt-1">Trusted by thousands across Kenya</p>
        </div>
        <v-row>
          <v-col v-for="t in testimonials" :key="t.name" cols="12" md="4">
            <v-card rounded="xl" class="testimonial-card pa-6">
              <v-rating :model-value="5" density="compact" size="16" color="secondary" readonly class="mb-3" />
              <p class="text-body-2 mb-4">"{{ t.quote }}"</p>
              <div class="d-flex align-center gap-3">
                <v-avatar size="40" color="primary">
                  <span class="text-white font-weight-bold text-caption">{{ t.name.charAt(0) }}</span>
                </v-avatar>
                <div>
                  <p class="text-body-2 font-weight-semibold">{{ t.name }}</p>
                  <p class="text-caption text-medium-emphasis">{{ t.role }}</p>
                </div>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- CTA -->
    <section class="cta-section py-16">
      <v-container style="max-width:800px" class="text-center">
        <h2 class="text-h4 font-weight-bold text-white mb-3">Are you a photographer?</h2>
        <p class="mb-8" style="color:rgba(255,255,255,0.75);font-size:1.05rem">
          Join thousands of photographers earning on Pixxgram. Set your rates, manage bookings, get paid via M-Pesa.
        </p>
        <div class="d-flex gap-3 justify-center flex-wrap">
          <v-btn color="secondary" size="large" rounded="lg" :to="{ name:'Register' }">
            <v-icon start>mdi-camera</v-icon> Join as Photographer
          </v-btn>
          <v-btn variant="outlined" color="white" size="large" rounded="lg" :to="{ name:'HowItWorks' }">
            Learn More
          </v-btn>
        </div>
      </v-container>
    </section>

    <SiteFooter />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import NavBar from '@/components/shared/NavBar.vue'
import SiteFooter from '@/components/shared/SiteFooter.vue'
import PhotographerCard from '@/components/shared/PhotographerCard.vue'
import { photographersApi } from '@/api/photographers'

const router=useRouter(), loading=ref(true), photographers=ref([])
const heroLocation=ref(''), heroCategory=ref('')
const popularLocations=['Nairobi','Mombasa','Kisumu','Nakuru','Eldoret','Thika']
const popularCategories=['Wedding','Portrait','Corporate','Fashion','Events','Nature']
const trendingTags=['Wedding','Portrait','Events','Fashion','Corporate']
const heroImages=[{label:'Wedding',tall:false},{label:'Portrait',tall:true},{label:'Events',tall:false},{label:'Fashion',tall:false},{label:'Nature',tall:true},{label:'Corporate',tall:false}]
const stats=[{value:'500+',label:'Photographers'},{value:'2,000+',label:'Bookings Made'},{value:'47',label:'Counties Covered'},{value:'4.8★',label:'Average Rating'}]
const categories=[
  {label:'Wedding',icon:'mdi-ring',color:'pink'},{label:'Portrait',icon:'mdi-account-circle',color:'purple'},
  {label:'Events',icon:'mdi-party-popper',color:'orange'},{label:'Fashion',icon:'mdi-tshirt-crew',color:'teal'},
  {label:'Corporate',icon:'mdi-briefcase-outline',color:'blue'},{label:'Nature',icon:'mdi-tree',color:'green'},
  {label:'Real Estate',icon:'mdi-home-outline',color:'brown'},{label:'Sports',icon:'mdi-run',color:'red'},
]
const steps=[
  {step:1,icon:'mdi-magnify',title:'Browse & Filter',desc:'Search photographers by location, price, rating and category.'},
  {step:2,icon:'mdi-calendar-plus-outline',title:'Book & Message',desc:'Choose a date, send a message, and confirm your booking.'},
  {step:3,icon:'mdi-cellphone-check',title:'Pay with M-Pesa',desc:'Secure, instant payment directly from your Safaricom line.'},
]
const testimonials=[
  {name:'Charles Kariuki',role:'Bride, Nairobi',quote:'Found our wedding photographer within an hour. The whole process was so smooth and the photos were stunning.'},
  {name:'Brian Kamau',role:'Marketing Manager',quote:'We use Pixxgram for all our corporate events. Reliable photographers, great quality every time.'},
  {name:'Cynthia Weru',role:'Photographer, Kisumu',quote:"Joined 6 months ago and I've tripled my bookings. The platform handles everything — I just focus on shooting."},
]
function goSearch(){router.push({name:'Photographers',query:{...(heroLocation.value&&{location:heroLocation.value}),...( heroCategory.value&&{category:heroCategory.value})}})}
onMounted(async()=>{try{const{data}=await photographersApi.list({per_page:4});photographers.value=data.data||[]}catch(_){}finally{loading.value=false}})
</script>

<style scoped>
.hero-section{position:relative;background:rgb(var(--v-theme-primary));padding:80px 0;overflow:hidden}
.hero-bg{position:absolute;inset:0;background:radial-gradient(ellipse at 70% 50%,rgba(201,168,76,.18) 0%,transparent 65%),radial-gradient(ellipse at 10% 80%,rgba(232,98,58,.1) 0%,transparent 50%)}
.hero-title{font-size:clamp(2rem,4vw,3.2rem);font-weight:900;line-height:1.1;color:white;letter-spacing:-1.5px}
.hero-subtitle{font-size:1.05rem;color:rgba(255,255,255,.72);max-width:420px;line-height:1.6}
.hero-search{box-shadow:0 4px 24px rgba(0,0,0,.15) !important}
.tag-chip{cursor:pointer;opacity:.7;transition:opacity .2s;border-color:rgba(255,255,255,.3) !important}
.tag-chip:hover{opacity:1}
.hero-grid{display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(2,155px);gap:12px}
.hero-img-placeholder{background:rgba(255,255,255,.07);border-radius:16px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;border:1px solid rgba(255,255,255,.1);transition:background .3s}
.hero-img-placeholder.tall{grid-row:span 2}
.hero-img-placeholder:hover{background:rgba(255,255,255,.11)}
.hero-img-label{font-size:.7rem;color:rgba(255,255,255,.4);text-transform:uppercase;letter-spacing:.5px}
.stats-bar{background:rgb(var(--v-theme-surface));border-bottom:1px solid rgba(0,0,0,.06);padding:32px 0}
.stat-number{font-size:1.9rem;font-weight:800;color:rgb(var(--v-theme-primary))}
.stat-label{font-size:.8rem;color:rgba(0,0,0,.45);margin-top:2px}
.category-scroll{display:flex;gap:12px;overflow-x:auto;padding-bottom:8px;scrollbar-width:none}
.category-scroll::-webkit-scrollbar{display:none}
.category-pill{display:flex;flex-direction:column;align-items:center;gap:8px;flex-shrink:0;cursor:pointer;padding:16px 20px;border-radius:16px;border:1.5px solid rgba(0,0,0,.08);min-width:88px;transition:all .2s;background:rgb(var(--v-theme-surface))}
.category-pill:hover{border-color:rgb(var(--v-theme-primary));transform:translateY(-2px)}
.category-pill span{font-size:.78rem;font-weight:600;white-space:nowrap}
.category-icon{width:44px;height:44px;background:rgba(var(--v-theme-primary),.07);border-radius:12px;display:flex;align-items:center;justify-content:center}
.how-section{background:rgb(var(--v-theme-background))}
.step-number{width:32px;height:32px;background:rgb(var(--v-theme-secondary));border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-weight:800;font-size:.85rem;margin-bottom:16px}
.step-icon{width:80px;height:80px;background:rgba(var(--v-theme-primary),.07);border-radius:24px;display:flex;align-items:center;justify-content:center}
.testimonial-card{border:1px solid rgba(0,0,0,.07) !important}
.cta-section{background:linear-gradient(135deg,rgb(var(--v-theme-primary)) 0%,#2d1b69 100%)}
.gap-2{gap:8px}.gap-3{gap:12px}
</style>
