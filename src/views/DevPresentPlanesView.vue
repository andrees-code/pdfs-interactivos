<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import EditorHeader from '@/components/EditorHeader.vue'
import { useAuthStore } from '@/stores/auth'
import { SUBSCRIPTIONS_API } from '@/config/api.js'

const router = useRouter()
const authStore = useAuthStore()
const isLoadingCheckout = ref<'monthly' | 'yearly' | null>(null)
const checkoutError = ref('')

const currentPlan = computed(() => {
  const sub = authStore.user?.subscription
  if (!sub || sub.plan === 'free') return 'free'
  if (sub.endDate) {
    const parsed = new Date(sub.endDate)
    if (!Number.isNaN(parsed.getTime()) && parsed < new Date()) return 'free'
  }
  if (!sub.endDate && !['active', 'canceled'].includes(sub.status)) return 'free'
  return sub.plan
})

const endDate = computed(() => {
  const sub = authStore.user?.subscription
  if (!sub?.endDate) return null
  const parsed = new Date(sub.endDate)
  if (Number.isNaN(parsed.getTime())) return null
  return parsed.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })
})

const isCancellationScheduled = computed(() => {
  const sub = authStore.user?.subscription
  if (!sub) return false
  return !!sub.cancelAtPeriodEnd || sub.status === 'canceled'
})

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const redirectToCheckout = async (plan: 'monthly' | 'yearly') => {
  checkoutError.value = ''
  isLoadingCheckout.value = plan

  const authToken = authStore.token || localStorage.getItem('userToken')
  if (!authToken) {
    router.push('/devpresent/auth')
    return
  }

  try {
    for (let attempt = 0; attempt < 2; attempt++) {
      const res = await fetch(`${SUBSCRIPTIONS_API}/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ plan }),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.url) {
          window.location.href = data.url
          return
        }
        throw new Error('No se recibió URL de checkout')
      }

      const payload = await res.json().catch(() => ({}))
      if (import.meta.env.DEV || import.meta.env.PROD) {
        console.error('Checkout error payload:', payload)
      }

      const isRetryable = res.status === 503
      if (isRetryable && attempt === 0) {
        await wait(500)
        continue
      }

      if (res.status === 401) {
        authStore.logout()
        router.push('/devpresent/auth')
        return
      }

      throw new Error(payload?.message || `No se pudo iniciar el proceso de pago (HTTP ${res.status})`)
    }
  } catch (e: any) {
    checkoutError.value = e?.message || 'Error al conectar con el servicio de pago'
  } finally {
    isLoadingCheckout.value = null
  }
}

const plans = [
  {
    id: 'free',
    name: 'Gratuito',
    price: '0',
    period: '',
    description: 'Para empezar sin compromisos.',
    features: [
      'Hasta 2 proyectos',
      'Editor completo',
      'Plantillas básicas',
      'Visor público compartible',
    ],
    locked: [
      'Exportación HTML offline',
      'Proyectos ilimitados',
      'Soporte prioritario',
    ],
    cta: null,
    highlight: false,
  },
  {
    id: 'monthly',
    name: 'Pro Mensual',
    price: '2,99',
    period: '/ mes',
    description: 'Acceso completo, sin ataduras.',
    features: [
      'Proyectos ilimitados',
      'Exportación HTML offline',
      'Player interactivo sin límites',
      'Plantillas premium',
      'Soporte prioritario',
    ],
    locked: [],
    cta: 'monthly',
    highlight: false,
  },
  {
    id: 'yearly',
    name: 'Pro Anual',
    price: '29,99',
    period: '/ año',
    badge: 'Ahorra 35%',
    description: 'La mejor relación calidad-precio.',
    features: [
      'Todo lo de Pro Mensual',
      'Equivale a 2,50 € / mes',
      'Acceso a novedades anticipadas',
    ],
    locked: [],
    cta: 'yearly',
    highlight: true,
  },
]

onMounted(() => {
  // App.vue ya llama a refreshUser() al montar. Solo refresca si el usuario
  // vuelve de Stripe (parámetros ?success o ?canceled en la URL).
  const urlParams = new URLSearchParams(window.location.search)
  if (urlParams.has('success') || urlParams.has('canceled')) {
    authStore.refreshUser()
  }
})
</script>

<template>
  <div class="min-h-screen bg-background text-on-background antialiased selection:bg-primary-700/40 selection:text-white">
    <EditorHeader
      mode="projects"
      active-view="projects"
      :is-converting="false"
      :has-doc="false"
      :zoom="1"
      :play-mode="false"
      :is-saving="false"
    />

    <main class="mx-auto flex w-full max-w-5xl flex-col gap-12 px-4 pb-20 pt-[calc(64px+48px)]">
      <!-- Header -->
      <header class="text-center">
        <div class="mb-3 inline-flex items-center gap-2 rounded-full border border-primary-700/40 bg-primary/10 px-4 py-1 text-sm text-primary-900">
          <span class="material-symbols-outlined text-[15px]" style="font-variation-settings:'FILL' 1;">workspace_premium</span>
          Suscripción
        </div>
        <h1 class="font-display-xl text-display-xl text-on-surface">Elige tu plan</h1>
        <p class="mt-2 text-body-lg text-on-surface-variant">Sin sorpresas. Cancela cuando quieras.</p>

        <!-- Plan activo -->
        <div v-if="currentPlan !== 'free'" class="mt-4 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm"
          :class="isCancellationScheduled
            ? 'border-amber-500/40 bg-amber-500/10 text-amber-300'
            : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'"
        >
          <span class="material-symbols-outlined text-[15px]" style="font-variation-settings:'FILL' 1;">verified</span>
          <template v-if="!isCancellationScheduled">
            Plan <strong class="ml-1 capitalize">{{ currentPlan === 'monthly' ? 'Pro Mensual' : 'Pro Anual' }}</strong> activo
            <span v-if="endDate" class="ml-1">· renueva {{ endDate }}</span>
          </template>
          <template v-else>
            Plan <strong class="ml-1 capitalize">{{ currentPlan === 'monthly' ? 'Pro Mensual' : 'Pro Anual' }}</strong> cancelado
            <span v-if="endDate" class="ml-1">· activo hasta {{ endDate }}</span>
          </template>
        </div>
      </header>

      <!-- Error checkout -->
      <div v-if="checkoutError" class="rounded-xl border border-red-400 bg-red-500/10 px-5 py-3 text-center text-sm text-red-400">
        {{ checkoutError }}
      </div>

      <!-- Cards -->
      <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
        <article
          v-for="plan in plans"
          :key="plan.id"
          class="relative flex flex-col rounded-2xl border bg-surface-container p-6 shadow-lg transition-all duration-300"
          :class="plan.highlight
            ? 'border-primary-600 shadow-[0_0_40px_rgba(194,65,12,0.25)] ring-1 ring-primary-600/50'
            : 'border-outline'"
        >
          <!-- Badge -->
          <div v-if="plan.badge" class="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-primary-500 to-primary-700 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-white shadow-md">
            {{ plan.badge }}
          </div>

          <!-- Active indicator -->
          <div v-if="currentPlan === plan.id" class="mb-3 inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-0.5 text-xs text-emerald-400">
            <span class="material-symbols-outlined text-[12px]" style="font-variation-settings:'FILL' 1;">check_circle</span>
            Plan actual
          </div>

          <!-- Name + price -->
          <div class="mb-4">
            <h2 class="text-headline-md text-on-surface">{{ plan.name }}</h2>
            <div class="mt-2 flex items-end gap-1">
              <span class="text-[2.5rem] font-bold leading-none text-on-surface">{{ plan.price }}€</span>
              <span class="mb-1 text-body-md text-on-surface-variant">{{ plan.period }}</span>
            </div>
            <p class="mt-1 text-body-sm text-on-surface-variant">{{ plan.description }}</p>
          </div>

          <!-- Divider -->
          <hr class="mb-4 border-outline-variant" />

          <!-- Features -->
          <ul class="mb-4 flex flex-col gap-2">
            <li v-for="feat in plan.features" :key="feat" class="flex items-start gap-2 text-body-sm text-on-surface">
              <span class="material-symbols-outlined mt-0.5 text-[16px] text-emerald-400" style="font-variation-settings:'FILL' 1;">check_circle</span>
              {{ feat }}
            </li>
            <li v-for="feat in plan.locked" :key="feat" class="flex items-start gap-2 text-body-sm text-on-surface-variant/60">
              <span class="material-symbols-outlined mt-0.5 text-[16px] text-outline" style="font-variation-settings:'FILL' 0;">lock</span>
              {{ feat }}
            </li>
          </ul>

          <div class="mt-auto">
            <!-- Free plan: ir a proyectos -->
            <button
              v-if="plan.cta === null"
              type="button"
              class="w-full rounded-lg border border-outline px-4 py-2.5 text-label-caps text-on-surface-variant transition-colors hover:bg-surface-container-high"
              @click="router.push('/devpresent/projects')"
            >
              {{ currentPlan === 'free' ? 'Plan actual' : 'Continuar gratis' }}
            </button>

            <!-- Paid plans: checkout -->
            <button
              v-else-if="currentPlan !== plan.id"
              type="button"
              class="w-full rounded-lg px-4 py-3 text-label-caps text-white shadow-md transition-all hover:opacity-90 disabled:opacity-50"
              :class="plan.highlight
                ? 'bg-gradient-to-r from-primary-500 to-primary-700 shadow-[0_8px_20px_rgba(194,65,12,0.3)]'
                : 'bg-gradient-to-r from-neutral-600 to-neutral-800'"
              :disabled="isLoadingCheckout !== null"
              @click="redirectToCheckout(plan.cta as 'monthly' | 'yearly')"
            >
              <span class="flex items-center justify-center gap-2">
                <span class="material-symbols-outlined text-[17px]">bolt</span>
                {{ isLoadingCheckout === plan.cta ? 'Redirigiendo...' : 'Suscribirme' }}
              </span>
            </button>

            <!-- Ya suscrito a este plan -->
            <div
              v-else
              class="flex w-full items-center justify-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-label-caps text-emerald-400"
            >
              <span class="material-symbols-outlined text-[16px]" style="font-variation-settings:'FILL' 1;">verified</span>
              Activo
            </div>
          </div>
        </article>
      </div>

      <!-- Note -->
      <p class="text-center text-body-sm text-on-surface-variant">
        Los pagos son procesados de forma segura por <strong class="text-on-surface">Stripe</strong>. Puedes cancelar en cualquier momento desde tu cuenta.
      </p>
    </main>
  </div>
</template>
