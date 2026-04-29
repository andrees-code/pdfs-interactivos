<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
// @ts-expect-error JS service module in mixed TS workspace
import { authService } from '@/services/auth.service.js'
import { useAuthStore } from '@/stores/auth'

const mode = ref<'login' | 'signup'>('login')
const isForgotMode = ref(false)
const isSubmitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const form = ref({
  username: '',
  email: '',
  password: '',
})

const forgotEmail = ref('')

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const isLogin = computed(() => mode.value === 'login')

const resetMessages = () => {
  errorMessage.value = ''
  successMessage.value = ''
}

const toggleMode = (nextMode: 'login' | 'signup') => {
  mode.value = nextMode
  isForgotMode.value = false
  resetMessages()
}

const enterForgotMode = () => {
  isForgotMode.value = true
  forgotEmail.value = form.value.email
  resetMessages()
}

const exitForgotMode = () => {
  isForgotMode.value = false
  resetMessages()
}

const handleSubmit = async () => {
  if (isSubmitting.value) return

  resetMessages()
  isSubmitting.value = true

  try {
    if (isLogin.value) {
      const result = await authService.login({
        email: form.value.email,
        password: form.value.password,
      })

      authStore.login(result.token, result.user)
      router.push('/devpresent/projects')
      return
    }

    await authService.register({
      username: form.value.username,
      email: form.value.email,
      password: form.value.password,
    })

    successMessage.value = 'Registro exitoso. Ahora inicia sesion.'
    form.value.password = ''
    mode.value = 'login'
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'No se pudo completar la solicitud.'
  } finally {
    isSubmitting.value = false
  }
}

const handleForgotSubmit = async () => {
  if (isSubmitting.value) return

  resetMessages()
  isSubmitting.value = true

  try {
    const response = await authService.forgotPassword(forgotEmail.value)
    successMessage.value = response?.message || 'Si el correo existe, se ha enviado un enlace de recuperación.'
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'No se pudo completar la solicitud.'
  } finally {
    isSubmitting.value = false
  }
}

const resolveOAuthRedirectTarget = () => {
  const url = new URL(window.location.href)
  url.search = ''
  url.hash = ''
  return url.toString()
}

const startGoogleLogin = () => {
  window.location.href = authService.getGoogleOAuthUrl(resolveOAuthRedirectTarget())
}

const parseOAuthUser = (encodedUser: string | null) => {
  if (!encodedUser) return null

  try {
    const normalized = encodedUser.replace(/-/g, '+').replace(/_/g, '/')
    const padding = normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4))
    const json = atob(normalized + padding)
    return JSON.parse(json)
  } catch {
    return null
  }
}

onMounted(() => {
  const oauthError = route.query.oauthError
  if (typeof oauthError === 'string' && oauthError.length) {
    errorMessage.value = oauthError
  }

  const oauthSuccess = route.query.oauthSuccess
  const token = route.query.token
  const encodedUser = route.query.user

  if (oauthSuccess === '1' && typeof token === 'string' && token.length) {
    const parsedUser = parseOAuthUser(typeof encodedUser === 'string' ? encodedUser : null)
    authStore.login(token, parsedUser)
    router.replace('/devpresent/projects')
  }
})
</script>

<template>
  <main class="flex min-h-screen w-full bg-surface-container-lowest text-on-surface antialiased selection:bg-primary-700/40 selection:text-white">
    <section class="relative hidden items-center justify-center overflow-hidden border-r border-outline-variant/30 bg-surface-dim p-12 lg:flex lg:w-1/2 lg:p-24">
      <div class="absolute inset-0 bg-gradient-to-br from-surface-container-lowest/90 via-surface-dim/80 to-primary-900/20"></div>
      <div class="relative z-10 max-w-xl">
        <span class="material-symbols-outlined mb-4 block text-6xl text-primary-200" style="font-variation-settings: 'FILL' 1;">view_in_ar</span>
        <h1 class="mb-6 font-display text-display-xl text-on-surface">DevPresent</h1>
        <p class="max-w-md text-body-lg text-on-surface-variant">
          The presentation layer for the modern developer-creator. Built for those who demand precision of code and impact of visionary design.
        </p>
        <pre class="mt-8 rounded-lg border border-outline-variant/50 bg-surface-container-low/50 p-6 text-code-sm text-on-surface-variant">import { Scene, Camera } from '@devpresent/core';

const presentation = new Scene({
  theme: 'kinetic-dark',
  highFidelity: true
});

presentation.render();</pre>
      </div>
    </section>

    <section class="relative flex w-full items-center justify-center bg-surface-container-lowest p-8 sm:p-12 lg:w-1/2 lg:p-24">
      <div class="absolute left-8 top-8 flex items-center gap-2 lg:hidden">
        <span class="material-symbols-outlined text-2xl text-primary-200" style="font-variation-settings: 'FILL' 1;">view_in_ar</span>
        <span class="text-headline-md">DevPresent</span>
      </div>

      <div class="w-full max-w-md">
        <div class="mb-8 text-center lg:text-left">
          <h2 class="text-headline-lg text-on-surface">{{ isForgotMode ? 'Recuperar contraseña' : (isLogin ? 'Bienvenido de vuelta' : 'Crea tu cuenta') }}</h2>
          <p class="mt-2 text-body-md text-on-surface-variant">
            {{ isForgotMode ? 'Te enviaremos un enlace para restablecer tu contraseña.' : (isLogin ? 'Inicia sesion para continuar en tu workspace.' : 'Empieza a crear presentaciones interactivas.') }}
          </p>
        </div>

        <div v-if="!isForgotMode" class="mb-6 flex rounded-lg bg-surface-container p-1">
          <button type="button" class="flex-1 rounded-md px-4 py-2 text-label-caps transition-all" :class="mode === 'login' ? 'bg-surface-bright text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-on-surface'" @click="toggleMode('login')">
            Iniciar sesion
          </button>
          <button type="button" class="flex-1 rounded-md px-4 py-2 text-label-caps transition-all" :class="mode === 'signup' ? 'bg-surface-bright text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-on-surface'" @click="toggleMode('signup')">
            Registrarse
          </button>
        </div>

        <div v-if="!isForgotMode" class="mb-6 flex flex-col gap-stack-sm">
          <button type="button" class="w-full rounded border border-outline-variant bg-surface px-4 py-3 font-semibold text-on-surface transition-colors hover:bg-surface-container-high" @click="startGoogleLogin">
            <span class="flex items-center justify-center gap-3"><span class="material-symbols-outlined text-on-surface-variant">public</span>Continuar con Google</span>
          </button>
        </div>

        <div v-if="!isForgotMode" class="relative mb-6 flex items-center">
          <div class="grow border-t border-outline-variant/50"></div>
          <span class="mx-4 shrink-0 text-label-caps text-on-surface-variant">O continua con email</span>
          <div class="grow border-t border-outline-variant/50"></div>
        </div>

        <form v-if="isForgotMode" class="flex flex-col gap-stack-md" @submit.prevent="handleForgotSubmit">
          <div>
            <label for="forgot-email" class="mb-1 block text-label-caps text-on-surface-variant">Correo</label>
            <div class="relative">
              <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">mail</span>
              <input id="forgot-email" v-model="forgotEmail" type="email" placeholder="developer@example.com" class="w-full rounded-md border border-outline-variant bg-surface py-3 pl-12 pr-4 text-on-surface outline-none transition-all placeholder:text-outline focus:border-primary-300 focus:ring-1 focus:ring-primary-300" required />
            </div>
          </div>

          <button type="submit" class="mt-2 w-full rounded-md bg-gradient-to-r from-primary-300 to-tertiary-container py-4 text-label-caps text-surface-container-lowest shadow-[0_0_20px_rgba(192,193,255,0.2)] transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-70" :disabled="isSubmitting">
            {{ isSubmitting ? 'Procesando...' : 'Enviar enlace de recuperacion' }}
          </button>

          <button type="button" class="w-full rounded-md border border-outline-variant bg-surface py-3 text-label-caps text-on-surface transition-colors hover:bg-surface-container-high" @click="exitForgotMode">
            Volver al inicio de sesion
          </button>

          <p v-if="errorMessage" class="rounded-md border border-red-400/30 bg-red-900/20 px-3 py-2 text-sm text-red-200">{{ errorMessage }}</p>
          <p v-if="successMessage" class="rounded-md border border-emerald-400/30 bg-emerald-900/20 px-3 py-2 text-sm text-emerald-200">{{ successMessage }}</p>
        </form>

        <form v-else class="flex flex-col gap-stack-md" @submit.prevent="handleSubmit">
          <div v-if="!isLogin">
            <label for="username" class="mb-1 block text-label-caps text-on-surface-variant">Nombre de usuario</label>
            <div class="relative">
              <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">person</span>
              <input id="username" v-model="form.username" type="text" placeholder="ej. dev_master" class="w-full rounded-md border border-outline-variant bg-surface py-3 pl-12 pr-4 text-on-surface outline-none transition-all placeholder:text-outline focus:border-primary-300 focus:ring-1 focus:ring-primary-300" required />
            </div>
          </div>

          <div>
            <label for="email" class="mb-1 block text-label-caps text-on-surface-variant">Correo</label>
            <div class="relative">
              <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">mail</span>
              <input id="email" v-model="form.email" type="email" placeholder="developer@example.com" class="w-full rounded-md border border-outline-variant bg-surface py-3 pl-12 pr-4 text-on-surface outline-none transition-all placeholder:text-outline focus:border-primary-300 focus:ring-1 focus:ring-primary-300" required />
            </div>
          </div>

          <div>
            <div class="mb-1 flex items-center justify-between">
              <label for="password" class="text-label-caps text-on-surface-variant">Contraseña</label>
              <button v-if="isLogin" type="button" class="text-sm text-primary-200 transition-colors hover:text-primary-100" @click="enterForgotMode">Olvide mi contrasena</button>
            </div>
            <div class="relative">
              <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">lock</span>
              <input id="password" v-model="form.password" type="password" placeholder="••••••••" class="w-full rounded-md border border-outline-variant bg-surface py-3 pl-12 pr-4 text-on-surface outline-none transition-all placeholder:text-outline focus:border-primary-300 focus:ring-1 focus:ring-primary-300" required />
            </div>
          </div>

          <button type="submit" class="mt-2 w-full rounded-md bg-gradient-to-r from-primary-300 to-tertiary-container py-4 text-label-caps text-surface-container-lowest shadow-[0_0_20px_rgba(192,193,255,0.2)] transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-70" :disabled="isSubmitting">
            {{ isSubmitting ? 'Procesando...' : (mode === 'login' ? 'Entrar al editor' : 'Crear cuenta') }}
          </button>

          <p v-if="errorMessage" class="rounded-md border border-red-400/30 bg-red-900/20 px-3 py-2 text-sm text-red-200">{{ errorMessage }}</p>
          <p v-if="successMessage" class="rounded-md border border-emerald-400/30 bg-emerald-900/20 px-3 py-2 text-sm text-emerald-200">{{ successMessage }}</p>
        </form>
      </div>
    </section>
  </main>
</template>
