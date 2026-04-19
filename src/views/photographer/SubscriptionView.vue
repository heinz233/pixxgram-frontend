<template>
  <div>

    <!-- Page header -->
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <h2 class="text-h6 font-weight-bold">Subscription</h2>
        <p class="text-medium-emphasis mt-1">Manage your Pixxgram plan</p>
      </div>
      <v-btn
        variant="text" size="small" color="primary"
        prepend-icon="mdi-refresh"
        :loading="loading"
        @click="loadData"
      >
        Refresh
      </v-btn>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="text-center py-16">
      <v-progress-circular indeterminate color="primary" size="48" />
      <p class="mt-4 text-medium-emphasis">Loading subscription details...</p>
    </div>

    <template v-else>

      <!-- ── ACTIVE SUBSCRIPTION BANNER ─────────────────────────── -->
      <v-card v-if="current" rounded="xl" class="active-sub-card pa-6 mb-8">
        <div class="d-flex align-center justify-space-between flex-wrap gap-3">
          <div class="d-flex align-center gap-3">
            <div class="crown-icon">
              <v-icon color="secondary" size="28">mdi-crown</v-icon>
            </div>
            <div>
              <p class="text-white text-caption text-uppercase font-weight-bold" style="opacity:.7">
                Current Plan
              </p>
              <p class="text-white text-h6 font-weight-bold text-capitalize mt-1">
                {{ current._from_profile ? 'Active' : current.plan }} Plan
              </p>
            </div>
          </div>
          <v-chip color="success" size="small" label>
            <v-icon start size="12">mdi-check-circle</v-icon>
            Active
          </v-chip>
        </div>

        <v-divider class="my-4" style="border-color:rgba(255,255,255,0.15)" />

        <v-row>
          <v-col cols="12" sm="4">
            <p class="text-white text-caption" style="opacity:.65">Amount Paid</p>
            <p class="text-white font-weight-bold mt-1">
              KSh {{ Number(current.amount).toLocaleString() }}
            </p>
          </v-col>
          <v-col cols="12" sm="4">
            <p class="text-white text-caption" style="opacity:.65">Expires</p>
            <p class="text-white font-weight-bold mt-1">
              {{ formatDate(current.ends_at) }}
            </p>
          </v-col>
          <v-col cols="12" sm="4">
            <p class="text-white text-caption" style="opacity:.65">Days Remaining</p>
            <p class="font-weight-bold mt-1" :class="daysColor">
              {{ current.days_remaining }} days
            </p>
          </v-col>
        </v-row>

        <!-- Expiry progress bar -->
        <v-progress-linear
          :model-value="expiryPercent"
          :color="daysColor"
          rounded height="6"
          bg-color="rgba(255,255,255,0.15)"
          class="mt-4"
        />
        <p class="text-caption mt-2" style="color:rgba(255,255,255,0.5)">
          {{ expiryPercent }}% of subscription period remaining
        </p>

        <div class="mt-4 d-flex gap-2 flex-wrap">
          <v-btn
            variant="outlined" color="white" size="small" rounded="lg"
            :loading="cancelling"
            @click="confirmCancelDialog = true"
          >
            <v-icon start size="14">mdi-close-circle-outline</v-icon>
            Cancel Subscription
          </v-btn>
          <v-btn
            variant="tonal" color="white" size="small" rounded="lg"
            @click="tab = 'history'"
          >
            <v-icon start size="14">mdi-history</v-icon>
            View History
          </v-btn>
        </div>
      </v-card>

      <!-- ── NO SUBSCRIPTION BANNER ─────────────────────────────── -->
      <v-alert
        v-else
        color="warning" variant="tonal" rounded="xl"
        class="mb-8" border="start"
        prepend-icon="mdi-alert-circle-outline"
      >
        <p class="font-weight-bold mb-1">No active subscription</p>
        <p class="text-body-2">
          You need an active subscription to appear in search results and receive bookings.
          Choose a plan below to get started.
        </p>
      </v-alert>

      <!-- ── TABS: Plans / History ────────────────────────────────── -->
      <v-tabs v-model="tab" color="primary" class="mb-6">
        <v-tab value="plans">
          <v-icon start size="16">mdi-crown-outline</v-icon>
          {{ current ? 'Change Plan' : 'Choose a Plan' }}
        </v-tab>
        <v-tab value="history">
          <v-icon start size="16">mdi-history</v-icon>
          Billing History
        </v-tab>
      </v-tabs>

      <!-- ── PLANS TAB ───────────────────────────────────────────── -->
      <div v-if="tab === 'plans'">

        <!-- Plans failed to load -->
        <v-alert
          v-if="plansError"
          type="error" variant="tonal" rounded="xl" class="mb-6"
        >
          <p class="font-weight-bold mb-1">Could not load plans</p>
          <p class="text-body-2 mb-3">{{ plansError }}</p>
          <v-btn size="small" color="error" variant="tonal" @click="loadData">
            Try Again
          </v-btn>
        </v-alert>

        <!-- Plans grid -->
        <v-row v-else>
          <v-col
            v-for="(plan, key) in plans"
            :key="key"
            cols="12" md="4"
          >
            <div
              class="plan-card"
              :class="{
                selected:  selectedPlan === key,
                popular:   key === 'quarterly',
                'current-plan': current?.plan === key
              }"
              @click="selectedPlan = key"
            >
              <!-- Popular badge -->
              <div v-if="key === 'quarterly'" class="popular-badge">
                Most Popular
              </div>
              <!-- Current plan badge -->
              <div v-if="current?.plan === key" class="current-badge">
                Current Plan
              </div>

              <div class="d-flex align-center justify-space-between mb-4">
                <h3 class="text-subtitle-1 font-weight-bold text-capitalize">
                  {{ plan.label }}
                </h3>
                <div
                  class="plan-select-dot"
                  :class="{ active: selectedPlan === key }"
                >
                  <v-icon v-if="selectedPlan === key" size="14" color="white">
                    mdi-check
                  </v-icon>
                </div>
              </div>

              <div class="plan-price">
                <span class="currency">KSh</span>
                <span class="amount">{{ Number(plan.amount).toLocaleString() }}</span>
              </div>
              <p class="text-caption text-medium-emphasis mb-5">
                {{ plan.days }} days access
                <span v-if="key === 'quarterly'" class="text-success font-weight-bold">
                  · Save KSh {{ savings.quarterly.toLocaleString() }}
                </span>
                <span v-if="key === 'annual'" class="text-success font-weight-bold">
                  · Save KSh {{ savings.annual.toLocaleString() }}
                </span>
              </p>

              <v-divider class="mb-4" />

              <ul class="plan-features">
                <li v-for="feature in planFeatures(key)" :key="feature">
                  <v-icon size="14" color="success" class="mr-2">mdi-check-circle</v-icon>
                  {{ feature }}
                </li>
              </ul>
            </div>
          </v-col>
        </v-row>

        <!-- Empty plans -->
        <div v-if="!Object.keys(plans).length && !plansError" class="text-center py-12">
          <v-icon size="56" color="medium-emphasis">mdi-package-variant-closed</v-icon>
          <p class="mt-3 text-medium-emphasis">No plans available right now.</p>
        </div>

        <!-- Payment section -->
        <v-expand-transition>
          <v-card v-if="selectedPlan" rounded="xl" class="payment-card pa-6 mt-6">
            <h3 class="text-subtitle-1 font-weight-bold mb-1">
              Complete Payment
            </h3>
            <p class="text-medium-emphasis text-body-2 mb-5">
              You're subscribing to the
              <strong class="text-capitalize">{{ selectedPlan }}</strong> plan for
              <strong>KSh {{ Number(plans[selectedPlan]?.amount).toLocaleString() }}</strong>
            </p>

            <!-- Payment method tabs -->
            <div class="payment-methods mb-5">
              <button
                v-for="method in paymentMethods"
                :key="method.value"
                class="payment-method-btn"
                :class="{ active: paymentMethod === method.value }"
                @click="paymentMethod = method.value"
                type="button"
              >
                <v-icon size="18" class="mr-2">{{ method.icon }}</v-icon>
                {{ method.label }}
              </button>
            </div>

            <!-- M-Pesa fields -->
            <div v-if="paymentMethod === 'mpesa'">
              <v-text-field
                v-model="phone"
                label="M-Pesa phone number"
                placeholder="07xxxxxxxx or 254xxxxxxxxx"
                prepend-inner-icon="mdi-cellphone"
                :rules="[v => !!v || 'Phone number is required']"
                :error-messages="phoneError"
                style="max-width:340px"
                class="mb-2"
              />
              <p class="text-caption text-medium-emphasis mb-4">
                <v-icon size="12" class="mr-1">mdi-information-outline</v-icon>
                You will receive an STK push on this number. Enter your M-Pesa PIN to confirm.
              </p>
            </div>

            <!-- Card / PayPal coming soon -->
            <v-alert
              v-if="paymentMethod !== 'mpesa'"
              type="info" variant="tonal" rounded="xl" density="compact" class="mb-4"
            >
              {{ paymentMethod === 'card' ? 'Card' : 'PayPal' }} payments are coming soon. Please use M-Pesa for now.
            </v-alert>

            <v-alert v-if="subscribeError" type="error" variant="tonal" rounded="xl" density="compact" class="mb-4">
              {{ subscribeError }}
            </v-alert>

            <v-btn
              color="success"
              size="large"
              rounded="xl"
              :loading="subscribing"
              :disabled="paymentMethod !== 'mpesa'"
              @click="subscribe"
            >
              <v-icon start>mdi-cellphone-check</v-icon>
              Pay KSh {{ Number(plans[selectedPlan]?.amount).toLocaleString() }} via M-Pesa
            </v-btn>
          </v-card>
        </v-expand-transition>
      </div>

      <!-- ── HISTORY TAB ─────────────────────────────────────────── -->
      <div v-if="tab === 'history'">
        <div v-if="historyLoading" class="text-center py-10">
          <v-progress-circular indeterminate color="primary" size="32" />
        </div>

        <div v-else-if="!history.length" class="text-center py-16">
          <v-icon size="64" color="medium-emphasis">mdi-receipt-text-outline</v-icon>
          <p class="mt-3 text-medium-emphasis">No billing history yet.</p>
        </div>

        <div v-else>
          <v-card
            v-for="sub in history"
            :key="sub.id"
            rounded="xl"
            class="history-card pa-5 mb-3"
          >
            <div class="d-flex align-center justify-space-between flex-wrap gap-2">
              <div class="d-flex align-center gap-3">
                <div class="history-icon" :class="historyIconBg(sub.status)">
                  <v-icon size="18" :color="historyIconColor(sub.status)">
                    {{ historyIcon(sub.status) }}
                  </v-icon>
                </div>
                <div>
                  <p class="text-body-2 font-weight-semibold text-capitalize">
                    {{ sub.plan }} Plan
                  </p>
                  <p class="text-caption text-medium-emphasis">
                    {{ formatDate(sub.starts_at) }} → {{ sub.ends_at ? formatDate(sub.ends_at) : '—' }}
                  </p>
                  <p v-if="sub.mpesa_receipt" class="text-caption text-medium-emphasis">
                    <v-icon size="11" class="mr-1">mdi-receipt</v-icon>
                    Receipt: {{ sub.mpesa_receipt }}
                  </p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-body-2 font-weight-bold">
                  KSh {{ Number(sub.amount).toLocaleString() }}
                </p>
                <v-chip :color="statusColor(sub.status)" size="x-small" label class="mt-1">
                  {{ sub.status }}
                </v-chip>
              </div>
            </div>
          </v-card>
        </div>
      </div>

    </template>

    <!-- ── M-PESA POLLING DIALOG ────────────────────────────────── -->
    <v-dialog v-model="pollingDialog" persistent max-width="400">
      <v-card rounded="xl" class="pa-8 text-center">
        <div v-if="pollStatus !== 'failed'">
          <v-progress-circular
            indeterminate color="success" size="64" width="5"
            class="mb-5"
          />
          <h3 class="text-subtitle-1 font-weight-bold mb-2">Waiting for payment</h3>
          <p class="text-body-2 text-medium-emphasis mb-4">
            Check your phone <strong>{{ phone }}</strong> for the M-Pesa prompt.<br>
            Enter your M-Pesa PIN to complete the payment.
          </p>
          <v-chip color="info" size="small" class="mb-5">
            <v-icon start size="14">mdi-timer-outline</v-icon>
            {{ pollMessage }}
          </v-chip>
        </div>

        <div v-else>
          <v-icon size="64" color="error" class="mb-4">mdi-close-circle-outline</v-icon>
          <h3 class="text-subtitle-1 font-weight-bold mb-2">Payment Failed</h3>
          <p class="text-body-2 text-medium-emphasis mb-4">
            The payment was cancelled or failed. Please try again.
          </p>
        </div>

        <v-btn variant="outlined" color="error" rounded="xl" @click="cancelPolling">
          Cancel
        </v-btn>
      </v-card>
    </v-dialog>

    <!-- ── CANCEL CONFIRM DIALOG ────────────────────────────────── -->
    <v-dialog v-model="confirmCancelDialog" max-width="400">
      <v-card rounded="xl" class="pa-7 text-center">
        <v-icon size="52" color="warning" class="mb-3">mdi-alert-circle-outline</v-icon>
        <h3 class="text-subtitle-1 font-weight-bold mb-2">Cancel Subscription?</h3>
        <p class="text-body-2 text-medium-emphasis mb-6">
          You will lose access to search listing and booking features when your current period ends
          on <strong>{{ formatDate(current?.ends_at) }}</strong>.
        </p>
        <div class="d-flex gap-3">
          <v-btn variant="text" @click="confirmCancelDialog = false" class="flex-grow-1">
            Keep Subscription
          </v-btn>
          <v-btn
            color="error" variant="tonal" rounded="xl"
            :loading="cancelling"
            @click="cancelSub"
            class="flex-grow-1"
          >
            Yes, Cancel
          </v-btn>
        </div>
      </v-card>
    </v-dialog>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { subscriptionsApi } from '@/api/subscriptions'
import { useAppStore } from '@/stores/app'
import { useRouter } from 'vue-router'

const appStore  = useAppStore()
const router    = useRouter()

// ── State ──────────────────────────────────────────────────────────
const loading        = ref(true)
const historyLoading = ref(false)
const plans          = ref({})
const current        = ref(null)
const history        = ref([])
const plansError     = ref('')
const subscribeError = ref('')
const phoneError     = ref('')
const selectedPlan   = ref(null)
const paymentMethod  = ref('mpesa')
const phone          = ref('')
const subscribing    = ref(false)
const cancelling     = ref(false)
const tab            = ref('plans')
const confirmCancelDialog = ref(false)

// Polling
const pollingDialog = ref(false)
const pollStatus    = ref('pending')
const pollMessage   = ref('Waiting...')
let   pollInterval  = null

// ── Computed ───────────────────────────────────────────────────────
const daysColor = computed(() => {
  const d = current.value?.days_remaining ?? 0
  if (d <= 5)  return 'text-error'
  if (d <= 10) return 'text-warning'
  return 'text-success'
})

const expiryPercent = computed(() => {
  if (!current.value) return 0
  const planDays = plans.value[current.value.plan]?.days || 30
  const remaining = current.value.days_remaining || 0
  return Math.round((remaining / planDays) * 100)
})

const savings = computed(() => {
  const monthly = plans.value.monthly?.amount || 150
  return {
    quarterly: (monthly * 3) - (plans.value.quarterly?.amount || 3999),
    annual:    (monthly * 12) - (plans.value.annual?.amount || 14000),
  }
})

const paymentMethods = [
  { value: 'mpesa',  label: 'M-Pesa',  icon: 'mdi-cellphone' },
  { value: 'card',   label: 'Card',    icon: 'mdi-credit-card-outline' },
  { value: 'paypal', label: 'PayPal',  icon: 'mdi-web' },
]

// ── Methods ────────────────────────────────────────────────────────
function planFeatures(key) {
  const base = [
    'Appear in search results',
    'Receive booking requests',
    'Unlimited portfolio uploads',
    'Client messaging',
    'M-Pesa payments',
  ]
  if (key === 'quarterly') return [...base, 'Priority support']
  if (key === 'annual')    return [...base, 'Priority support', 'Featured listing badge']
  return base
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-KE', { dateStyle: 'medium' })
}

function statusColor(s) {
  return { active:'success', pending:'warning', cancelled:'error', failed:'error', expired:'default' }[s] || 'default'
}

function historyIcon(s) {
  return { active:'mdi-check-circle', pending:'mdi-clock-outline', cancelled:'mdi-close-circle', failed:'mdi-alert-circle', expired:'mdi-calendar-remove' }[s] || 'mdi-circle'
}
function historyIconColor(s) {
  return { active:'success', pending:'warning', cancelled:'error', failed:'error', expired:'grey' }[s] || 'grey'
}
function historyIconBg(s) {
  return { active:'bg-green', pending:'bg-amber', cancelled:'bg-red', failed:'bg-red', expired:'bg-grey' }[s] || 'bg-grey'
}

async function loadData() {
  loading.value    = true
  plansError.value = ''

  try {
    // Load plans
    try {
      const { data } = await subscriptionsApi.plans()
      plans.value = data.plans || {}
    } catch (e) {
      plansError.value = e.response?.data?.message || 'Failed to load subscription plans.'
    }

    // Load current subscription
    try {
      const { data } = await subscriptionsApi.current()
      current.value = data.subscription || null

      // FALLBACK: if the API returned null but the user's profile shows active,
      // the subscriptions table is out of sync with photographer_profiles.
      // Show active state using the profile data so the UI is correct.
      if (!current.value) {
        const { data: userData } = await import('@/api/axios').then(m => m.default.get('/user'))
        const profile = (userData?.user ?? userData)?.photographer_profile
        if (
          profile?.subscription_status === 'active' &&
          profile?.subscription_end_date &&
          new Date(profile.subscription_end_date) > new Date()
        ) {
          // Build a synthetic subscription object from the profile
          current.value = {
            id:         null,
            plan:       'active',
            amount:     0,
            status:     'active',
            ends_at:    profile.subscription_end_date,
            starts_at:  null,
            created_at: null,
            // Signal to the UI that this came from the profile fallback
            _from_profile: true,
          }
          // Calculate days remaining
          const msLeft = new Date(profile.subscription_end_date) - new Date()
          current.value.days_remaining = Math.max(0, Math.floor(msLeft / 86400000))
        }
      } else {
        // Attach days_remaining from the response if present
        if (data.days_remaining !== undefined) {
          current.value.days_remaining = data.days_remaining
        }
      }
    } catch (_) {
      current.value = null
    }

  } finally {
    loading.value = false
  }
}

async function loadHistory() {
  historyLoading.value = true
  try {
    const { data } = await subscriptionsApi.history()
    history.value = data.subscriptions || []
  } catch (_) {
    history.value = []
  } finally {
    historyLoading.value = false
  }
}

async function subscribe() {
  subscribeError.value = ''
  phoneError.value     = ''

  if (!phone.value) {
    phoneError.value = 'Please enter your M-Pesa phone number'
    return
  }
  if (!selectedPlan.value) return

  subscribing.value = true
  try {
    const { data } = await subscriptionsApi.subscribe({
      plan:           selectedPlan.value,
      payment_method: 'mpesa',
      phone:          phone.value,
    })

    pollingDialog.value = true
    startPolling(data.checkout_request_id)

  } catch (e) {
    const msg = e.response?.data?.error || e.response?.data?.message || 'Subscription failed. Please try again.'
    subscribeError.value = msg
  } finally {
    subscribing.value = false
  }
}

function startPolling(checkoutId) {
  let attempts  = 0
  pollStatus.value  = 'pending'
  pollMessage.value = 'Waiting for your M-Pesa PIN...'

  pollInterval = setInterval(async () => {
    attempts++
    try {
      const { data } = await subscriptionsApi.mpesaStatus(checkoutId)

      if (data.status === 'active') {
        clearInterval(pollInterval)
        pollingDialog.value = false
        appStore.notify('🎉 Subscription activated! Welcome to Pixxgram Pro.', 'success')
        await loadData()
        tab.value = 'plans'
        return
      }

      if (data.status === 'failed') {
        clearInterval(pollInterval)
        pollStatus.value  = 'failed'
        pollMessage.value = 'Payment failed or was cancelled.'
        return
      }

      pollMessage.value = `Checking... (${attempts * 5}s elapsed)`

    } catch (_) {}

    // Timeout after 2 minutes (24 × 5s)
    if (attempts >= 24) {
      clearInterval(pollInterval)
      pollingDialog.value = false
      appStore.notify('Payment timed out. If you paid, please contact support.', 'warning')
    }
  }, 5000)
}

function cancelPolling() {
  clearInterval(pollInterval)
  pollingDialog.value = false
  pollStatus.value    = 'pending'
}

async function cancelSub() {
  if (!current.value) return
  cancelling.value = true
  try {
    await subscriptionsApi.cancel(current.value.id)
    current.value         = null
    confirmCancelDialog.value = false
    appStore.notify('Subscription cancelled. Access continues until the end of your billing period.')
    await loadData()
  } catch (e) {
    appStore.notify(e.response?.data?.error || e.response?.data?.message || 'Failed to cancel', 'error')
  } finally {
    cancelling.value = false }
}

// Watch tab change to load history lazily
import { watch } from 'vue'
watch(tab, (val) => {
  if (val === 'history' && !history.value.length) {
    loadHistory()
  }
})

onMounted(loadData)
onUnmounted(() => clearInterval(pollInterval))
</script>

<style scoped>
/* Active subscription card */
.active-sub-card {
  background: linear-gradient(135deg, rgb(var(--v-theme-primary)) 0%, #2d1b69 100%) !important;
  border: none !important;
}
.crown-icon {
  width: 52px; height: 52px;
  background: rgba(255,255,255,0.12);
  border-radius: 16px;
  display: flex; align-items: center; justify-content: center;
}

/* Plan cards */
.plan-card {
  border: 2px solid rgba(0,0,0,0.09);
  border-radius: 20px;
  padding: 28px 24px;
  cursor: pointer;
  transition: all 0.2s;
  background: rgb(var(--v-theme-surface));
  position: relative;
  height: 100%;
  margin-bottom: 16px;
}
.plan-card:hover {
  border-color: rgb(var(--v-theme-primary));
  transform: translateY(-3px);
  box-shadow: 0 8px 28px rgba(0,0,0,0.1);
}
.plan-card.selected {
  border-color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.04);
  box-shadow: 0 0 0 4px rgba(var(--v-theme-primary), 0.12);
  transform: translateY(-3px);
}
.plan-card.popular {
  border-color: rgb(var(--v-theme-secondary));
}
.plan-card.popular.selected {
  border-color: rgb(var(--v-theme-secondary));
  background: rgba(var(--v-theme-secondary), 0.04);
  box-shadow: 0 0 0 4px rgba(var(--v-theme-secondary), 0.12);
}

.popular-badge {
  position: absolute;
  top: -12px; left: 50%; transform: translateX(-50%);
  background: rgb(var(--v-theme-secondary));
  color: white;
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  padding: 3px 14px;
  border-radius: 50px;
  white-space: nowrap;
}
.current-badge {
  position: absolute;
  top: -12px; left: 50%; transform: translateX(-50%);
  background: rgb(var(--v-theme-success));
  color: white;
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  padding: 3px 14px;
  border-radius: 50px;
  white-space: nowrap;
}

.plan-select-dot {
  width: 22px; height: 22px;
  border-radius: 50%;
  border: 2px solid rgba(0,0,0,0.15);
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}
.plan-select-dot.active {
  background: rgb(var(--v-theme-primary));
  border-color: rgb(var(--v-theme-primary));
}

.plan-price { display: flex; align-items: baseline; gap: 4px; margin-bottom: 4px; }
.plan-price .currency { font-size: 0.9rem; font-weight: 700; color: rgba(var(--v-theme-on-surface), 0.6); }
.plan-price .amount   { font-size: 2rem; font-weight: 900; letter-spacing: -1px; }

.plan-features {
  list-style: none; padding: 0;
  display: flex; flex-direction: column; gap: 10px;
}
.plan-features li {
  display: flex; align-items: center;
  font-size: 0.85rem;
  color: rgba(var(--v-theme-on-surface), 0.75);
}

/* Payment section */
.payment-card { border: 1px solid rgba(0,0,0,0.08) !important; }
.payment-methods { display: flex; gap: 10px; flex-wrap: wrap; }
.payment-method-btn {
  display: flex; align-items: center;
  padding: 8px 20px;
  border-radius: 50px;
  border: 2px solid rgba(0,0,0,0.1);
  font-size: 0.875rem; font-weight: 600;
  cursor: pointer; background: white;
  transition: all 0.2s;
}
.payment-method-btn.active {
  border-color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.06);
  color: rgb(var(--v-theme-primary));
}

/* History */
.history-card { border: 1px solid rgba(0,0,0,0.07) !important; }
.history-icon { width: 42px; height: 42px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
.bg-green  { background: rgba(76,175,80,0.1); }
.bg-amber  { background: rgba(255,193,7,0.1); }
.bg-red    { background: rgba(244,67,54,0.1); }
.bg-grey   { background: rgba(0,0,0,0.06); }

.gap-2 { gap: 8px; }
.gap-3 { gap: 12px; }
</style>