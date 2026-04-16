import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  // ── Public ──────────────────────────────────────────────
  { path: '/',             name: 'Home',         component: () => import('@/views/HomeView.vue') },
  { path: '/about',        name: 'About',        component: () => import('@/views/AboutView.vue') },
  { path: '/how-it-works', name: 'HowItWorks',   component: () => import('@/views/HowItWorksView.vue') },
  { path: '/faq',          name: 'FAQ',           component: () => import('@/views/FAQView.vue') },
  { path: '/contact',      name: 'Contact',       component: () => import('@/views/ContactView.vue') },
  { path: '/privacy',      name: 'Privacy',       component: () => import('@/views/PrivacyView.vue') },
  { path: '/terms',        name: 'Terms',         component: () => import('@/views/TermsView.vue') },

  // ── Auth ─────────────────────────────────────────────────
  { path: '/login',           name: 'Login',          component: () => import('@/views/auth/LoginView.vue') },
  { path: '/register',        name: 'Register',       component: () => import('@/views/auth/RegisterView.vue') },
  { path: '/verify-email',    name: 'VerifyEmail',    component: () => import('@/views/auth/VerifyEmailView.vue') },
  { path: '/forgot-password', name: 'ForgotPassword', component: () => import('@/views/auth/ForgotPasswordView.vue') },
  { path: '/reset-password',  name: 'ResetPassword',  component: () => import('@/views/auth/ResetPasswordView.vue') },

  // ── Browse ───────────────────────────────────────────────
  { path: '/photographers',     name: 'Photographers',       component: () => import('@/views/BrowseView.vue') },
  { path: '/photographers/:id', name: 'PhotographerProfile', component: () => import('@/views/PhotographerDetailView.vue') },

  // ── Client ───────────────────────────────────────────────
  {
    path: '/client',
    component: () => import('@/views/client/ClientLayout.vue'),
    meta: { requiresAuth: true, role: 'client' },
    children: [
      { path: 'bookings', name: 'ClientBookings', component: () => import('@/views/client/BookingsView.vue') },
      { path: 'messages', name: 'ClientMessages', component: () => import('@/views/client/MessagesView.vue') },
      { path: 'profile',  name: 'ClientProfile',  component: () => import('@/views/client/ProfileView.vue') },
    ],
  },

  // ── Photographer ─────────────────────────────────────────
  {
    path: '/photographer',
    component: () => import('@/views/photographer/PhotographerLayout.vue'),
    meta: { requiresAuth: true, role: 'photographer' },
    children: [
      { path: '',             name: 'PhotographerDashboard',   component: () => import('@/views/photographer/DashboardView.vue') },
      { path: 'profile',      name: 'PhotographerProfileEdit', component: () => import('@/views/photographer/ProfileView.vue') },
      { path: 'portfolio',    name: 'Portfolio',               component: () => import('@/views/photographer/PortfolioView.vue') },
      { path: 'bookings',     name: 'PhotographerBookings',    component: () => import('@/views/photographer/BookingsView.vue') },
      { path: 'messages',     name: 'PhotographerMessages',    component: () => import('@/views/photographer/MessagesView.vue') },
      { path: 'subscription', name: 'Subscription',            component: () => import('@/views/photographer/SubscriptionView.vue') },
      { path: 'earnings',     name: 'Earnings',                component: () => import('@/views/photographer/EarningsView.vue') },
    ],
  },

  // ── Admin ────────────────────────────────────────────────
  {
    path: '/admin',
    component: () => import('@/views/admin/AdminLayout.vue'),
    meta: { requiresAuth: true, role: 'admin' },
    children: [
      { path: '',              name: 'AdminDashboard',     component: () => import('@/views/admin/DashboardView.vue') },
      { path: 'activity',      name: 'AdminActivity',      component: () => import('@/views/admin/ActivityView.vue') },
      { path: 'photographers', name: 'AdminPhotographers', component: () => import('@/views/admin/PhotographersView.vue') },
      { path: 'users',         name: 'AdminUsers',         component: () => import('@/views/admin/UsersView.vue') },
      { path: 'ratings',       name: 'AdminRatings',       component: () => import('@/views/admin/RatingsView.vue') },
      { path: 'reports',       name: 'AdminReports',       component: () => import('@/views/admin/ReportsView.vue') },
      { path: 'subscriptions', name: 'AdminSubscriptions', component: () => import('@/views/admin/SubscriptionsView.vue') },
      { path: 'categories',    name: 'AdminCategories',    component: () => import('@/views/admin/CategoriesView.vue') },
      { path: 'locations',     name: 'AdminLocations',     component: () => import('@/views/admin/LocationsView.vue') },
    ],
  },

  // ── Fallback ─────────────────────────────────────────────
  { path: '/unauthorized', name: 'Unauthorized', component: () => import('@/views/UnauthorizedView.vue') },
  { path: '/:pathMatch(.*)*', name: 'NotFound',  component: () => import('@/views/NotFoundView.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

router.beforeEach((to, _from, next) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return next({ name: 'Login', query: { redirect: to.fullPath } })
  }

  if (to.meta.role && auth.isLoggedIn && auth.roleName && auth.roleName !== to.meta.role) {
    return next({ name: 'Unauthorized' })
  }

  if ((to.name === 'Login' || to.name === 'Register') && auth.isLoggedIn) {
    if (auth.isAdmin)        return next({ name: 'AdminDashboard' })
    if (auth.isPhotographer) return next({ name: 'PhotographerDashboard' })
    if (auth.isClient)       return next({ name: 'ClientBookings' })
  }

  next()
})

export default router
