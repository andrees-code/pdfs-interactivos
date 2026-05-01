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
  <main class="auth-page">
    <!-- Panel decorativo izquierdo -->
    <section class="auth-deco">
      <div class="deco-inner">
        <div class="deco-brand">
          <span class="material-symbols-outlined deco-icon" style="font-variation-settings: 'FILL' 1;">view_in_ar</span>
          <p class="section-label">DevPresent</p>
        </div>
        <h1 class="deco-title">The presentation layer for the modern developer-creator.</h1>
        <p class="deco-desc">
          Precision of code. Impact of visionary design. Build interactive presentations that ship to the web.
        </p>
        <pre class="deco-code">import { Scene, Camera } from '@devpresent/core';

const presentation = new Scene({
  theme: 'kinetic-dark',
  highFidelity: true
});

presentation.render();</pre>
        <div class="deco-facts">
          <div class="deco-fact">
            <strong>PDF + PPTX</strong>
            <span>Importación editable</span>
          </div>
          <div class="deco-fact">
            <strong>Canvas interactivo</strong>
            <span>Hotspots, audio, 3D</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Panel del formulario -->
    <section class="auth-form-panel">
      <!-- Logo móvil -->
      <div class="auth-mobile-brand">
        <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1; font-size: 1.5rem; color: #7ab4e8;">view_in_ar</span>
        <span class="auth-mobile-brand-name">DevPresent</span>
      </div>

      <div class="auth-card">
        <div class="auth-card-header">
          <p class="section-label">
            {{ isForgotMode ? 'Recuperación' : (isLogin ? 'Acceder' : 'Registro') }}
          </p>
          <h2 class="auth-title">
            {{ isForgotMode ? 'Recuperar contraseña' : (isLogin ? 'Bienvenido de vuelta' : 'Crea tu cuenta') }}
          </h2>
          <p class="auth-subtitle">
            {{ isForgotMode ? 'Te enviaremos un enlace para restablecer tu contraseña.' : (isLogin ? 'Inicia sesión para continuar en tu workspace.' : 'Empieza a crear presentaciones interactivas.') }}
          </p>
        </div>

        <!-- Tabs login/registro -->
        <div v-if="!isForgotMode" class="auth-tabs">
          <button type="button" class="auth-tab" :class="{ 'auth-tab--active': mode === 'login' }" @click="toggleMode('login')">
            Iniciar sesión
          </button>
          <button type="button" class="auth-tab" :class="{ 'auth-tab--active': mode === 'signup' }" @click="toggleMode('signup')">
            Registrarse
          </button>
        </div>

        <!-- Google OAuth -->
        <div v-if="!isForgotMode" class="auth-oauth">
          <button type="button" class="auth-btn-google" @click="startGoogleLogin">
            <span class="material-symbols-outlined">public</span>
            Continuar con Google
          </button>
        </div>

        <!-- Separador -->
        <div v-if="!isForgotMode" class="auth-separator">
          <div class="auth-sep-line"></div>
          <span class="auth-sep-label">O continúa con email</span>
          <div class="auth-sep-line"></div>
        </div>

        <!-- Formulario recuperación -->
        <form v-if="isForgotMode" class="auth-form" @submit.prevent="handleForgotSubmit">
          <div class="form-field">
            <label for="forgot-email" class="form-label">Correo</label>
            <div class="form-input-wrap">
              <span class="material-symbols-outlined form-icon">mail</span>
              <input id="forgot-email" v-model="forgotEmail" type="email" placeholder="developer@example.com" class="form-input" required />
            </div>
          </div>

          <button type="submit" class="auth-btn-primary" :disabled="isSubmitting">
            {{ isSubmitting ? 'Procesando...' : 'Enviar enlace de recuperación' }}
          </button>

          <button type="button" class="auth-btn-secondary" @click="exitForgotMode">
            Volver al inicio de sesión
          </button>

          <p v-if="errorMessage" class="form-error">{{ errorMessage }}</p>
          <p v-if="successMessage" class="form-success">{{ successMessage }}</p>
        </form>

        <!-- Formulario login / registro -->
        <form v-else class="auth-form" @submit.prevent="handleSubmit">
          <div v-if="!isLogin" class="form-field">
            <label for="username" class="form-label">Nombre de usuario</label>
            <div class="form-input-wrap">
              <span class="material-symbols-outlined form-icon">person</span>
              <input id="username" v-model="form.username" type="text" placeholder="ej. dev_master" class="form-input" required />
            </div>
          </div>

          <div class="form-field">
            <label for="email" class="form-label">Correo</label>
            <div class="form-input-wrap">
              <span class="material-symbols-outlined form-icon">mail</span>
              <input id="email" v-model="form.email" type="email" placeholder="developer@example.com" class="form-input" required />
            </div>
          </div>

          <div class="form-field">
            <div class="form-label-row">
              <label for="password" class="form-label">Contraseña</label>
              <button v-if="isLogin" type="button" class="form-forgot" @click="enterForgotMode">Olvidé mi contraseña</button>
            </div>
            <div class="form-input-wrap">
              <span class="material-symbols-outlined form-icon">lock</span>
              <input id="password" v-model="form.password" type="password" placeholder="••••••••" class="form-input" required />
            </div>
          </div>

          <button type="submit" class="auth-btn-primary" :disabled="isSubmitting">
            {{ isSubmitting ? 'Procesando...' : (mode === 'login' ? 'Entrar al editor' : 'Crear cuenta') }}
          </button>

          <p v-if="errorMessage" class="form-error">{{ errorMessage }}</p>
          <p v-if="successMessage" class="form-success">{{ successMessage }}</p>
        </form>
      </div>
    </section>
  </main>
</template>

<style scoped>
/* ── Base ─────────────────────────────────────────────── */
.auth-page {
  min-height: 100vh;
  display: flex;
  background:
    radial-gradient(ellipse at 15% 0%, rgba(234, 88, 12, 0.07) 0%, transparent 40%),
    radial-gradient(ellipse at 85% 10%, rgba(154, 52, 18, 0.04) 0%, transparent 38%),
    #faf8f5;
  font-family: 'Plus Jakarta Sans', sans-serif;
  color: #0a0604;
  padding: 22px;
  gap: 22px;
  overflow-x: hidden;
}

.section-label {
  display: inline-flex;
  align-items: center;
  font-size: 0.67rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: #ea580c;
  background: rgba(234, 88, 12, 0.08);
  border: 1px solid rgba(234, 88, 12, 0.2);
  padding: 5px 11px;
  border-radius: 99px;
  margin: 0;
}

/* ── Panel decorativo ─────────────────────────────────── */
.auth-deco {
  display: none;
  flex-direction: column;
  justify-content: center;
  width: 50%;
  border: 1px solid #e0c8a8;
  background: #ffffff;
  border-radius: 8px;
  padding: 48px;
  box-shadow: 0 4px 24px rgba(60, 30, 10, 0.08);
  position: relative;
  overflow: hidden;
}

.auth-deco::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 20% 10%, rgba(234, 88, 12, 0.05) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 85%, rgba(154, 52, 18, 0.03) 0%, transparent 45%);
  pointer-events: none;
}

@media (min-width: 1024px) {
  .auth-deco { display: flex; }
}

.deco-inner { position: relative; z-index: 1; max-width: 480px; }

.deco-brand { display: flex; align-items: center; gap: 14px; margin-bottom: 32px; }

.deco-icon { font-size: 3rem; color: #ea580c; }

.deco-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: clamp(1.8rem, 2.8vw, 2.6rem);
  line-height: 1.1;
  letter-spacing: -0.04em;
  color: #0a0604;
  margin: 0 0 18px;
}

.deco-desc {
  color: #6a4820;
  line-height: 1.76;
  font-size: 1rem;
  margin: 0 0 28px;
  max-width: 400px;
}

.deco-code {
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 0.8rem;
  line-height: 1.6;
  color: #7a5030;
  background: #f5ede4;
  border: 1px solid #e0c8a8;
  border-radius: 5px;
  padding: 20px 24px;
  margin: 0 0 28px;
  overflow: auto;
  white-space: pre;
}

.deco-facts {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.deco-fact {
  border: 1px solid #e0c8a8;
  background: #fdf9f5;
  padding: 14px 16px;
  border-radius: 5px;
  transition: all 0.22s ease;
}

.deco-fact:hover {
  transform: translateY(-2px);
  border-color: rgba(234, 88, 12, 0.4);
  box-shadow: 0 4px 14px rgba(60, 30, 10, 0.08);
}

.deco-fact strong { display: block; font-size: 0.88rem; color: #0a0604; }
.deco-fact span { display: block; margin-top: 4px; font-size: 0.79rem; color: #7a5030; }

/* ── Panel formulario ─────────────────────────────────── */
.auth-form-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12px 8px;
  position: relative;
}

.auth-mobile-brand {
  display: flex;
  align-items: center;
  gap: 8px;
  position: absolute;
  top: 16px;
  left: 16px;
}

@media (min-width: 1024px) {
  .auth-mobile-brand { display: none; }
}

.auth-mobile-brand-name {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.05rem;
  font-weight: 700;
  color: #5a2810;
  letter-spacing: -0.02em;
}

/* ── Card ─────────────────────────────────────────────── */
.auth-card {
  width: 100%;
  max-width: 440px;
  border: 1px solid #e0c8a8;
  background: #ffffff;
  border-radius: 8px;
  padding: 36px 32px;
  box-shadow: 0 4px 24px rgba(60, 30, 10, 0.09);
}

.auth-card-header {
  margin-bottom: 26px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.auth-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.7rem;
  font-weight: 700;
  letter-spacing: -0.035em;
  color: #0a0604;
  margin: 0;
  line-height: 1.2;
}

.auth-subtitle {
  color: #7a5030;
  font-size: 0.93rem;
  line-height: 1.6;
  margin: 0;
}

/* ── Tabs ─────────────────────────────────────────────── */
.auth-tabs {
  display: flex;
  border: 1px solid #e0c8a8;
  background: #f9f4ee;
  border-radius: 5px;
  padding: 3px;
  margin-bottom: 20px;
  gap: 3px;
}

.auth-tab {
  flex: 1;
  border: none;
  background: transparent;
  color: #a07848;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  padding: 9px 12px;
  border-radius: 3px;
  cursor: pointer;
  transition: all 0.18s ease;
}

.auth-tab:hover { color: #3d1a00; }

.auth-tab--active {
  background: #ffffff;
  color: #ea580c;
  box-shadow: 0 1px 5px rgba(60, 30, 10, 0.1);
  border: 1px solid #e0c8a8;
}

/* ── OAuth ────────────────────────────────────────────── */
.auth-oauth { margin-bottom: 20px; }

.auth-btn-google {
  width: 100%;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border: 1px solid #e0c8a8;
  background: #fdf9f5;
  color: #5a3010;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 0.82rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  border-radius: 5px;
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease, border-color 0.18s ease;
}

.auth-btn-google:hover {
  background: #faf4ee;
  border-color: rgba(234, 88, 12, 0.35);
  color: #3d1a00;
  transform: translateY(-1px);
  box-shadow: 0 3px 10px rgba(60, 30, 10, 0.08);
}

.auth-btn-google .material-symbols-outlined {
  font-size: 1.1rem;
  color: #ea580c;
}

/* ── Separador ────────────────────────────────────────── */
.auth-separator { display: flex; align-items: center; gap: 14px; margin-bottom: 20px; }

.auth-sep-line { flex: 1; height: 1px; background: #e0c8a8; }

.auth-sep-label {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: #b89070;
  white-space: nowrap;
}

/* ── Formulario ───────────────────────────────────────── */
.auth-form { display: flex; flex-direction: column; gap: 16px; }

.form-field { display: flex; flex-direction: column; gap: 6px; }

.form-label {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #7a5030;
}

.form-label-row { display: flex; align-items: center; justify-content: space-between; }

.form-forgot {
  background: none;
  border: none;
  font-size: 0.82rem;
  color: #ea580c;
  cursor: pointer;
  padding: 0;
  transition: color 0.18s ease;
}

.form-forgot:hover { color: #c2410c; }

.form-input-wrap { position: relative; }

.form-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.1rem;
  color: #b89070;
  pointer-events: none;
}

.form-input {
  width: 100%;
  background: #fdf9f5;
  border: 1px solid #e0c8a8;
  border-radius: 5px;
  color: #0a0604;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 0.93rem;
  padding: 11px 14px 11px 40px;
  outline: none;
  transition: border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
  box-sizing: border-box;
}

.form-input::placeholder { color: #c0a080; }

.form-input:focus {
  background: #fff;
  border-color: #ea580c;
  box-shadow: 0 0 0 3px rgba(234, 88, 12, 0.1);
}

/* ── Botón primario ───────────────────────────────────── */
.auth-btn-primary {
  min-height: 46px;
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #c2410c;
  background: linear-gradient(160deg, #9a3412, #ea580c);
  color: #fff;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 0.82rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  border-radius: 5px;
  cursor: pointer;
  box-shadow: 0 3px 14px rgba(154, 52, 18, 0.22);
  transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
  margin-top: 4px;
}

.auth-btn-primary:hover:not(:disabled) {
  background: linear-gradient(160deg, #c2410c, #f97316);
  box-shadow: 0 5px 20px rgba(234, 88, 12, 0.28);
  transform: translateY(-1px);
}

.auth-btn-primary:active { transform: scale(0.98); }
.auth-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

/* ── Botón secundario ─────────────────────────────────── */
.auth-btn-secondary {
  min-height: 44px;
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e0c8a8;
  background: #fdf9f5;
  color: #7a5030;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 0.82rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  border-radius: 5px;
  cursor: pointer;
  transition: transform 0.18s ease, background 0.18s ease, color 0.18s ease, border-color 0.18s ease;
}

.auth-btn-secondary:hover {
  background: #faf4ee;
  border-color: rgba(234, 88, 12, 0.3);
  color: #3d1a00;
  transform: translateY(-1px);
}

/* ── Mensajes ─────────────────────────────────────────── */
.form-error {
  font-size: 0.86rem;
  color: #b91c1c;
  background: rgba(220, 38, 38, 0.06);
  border: 1px solid rgba(220, 38, 38, 0.18);
  border-radius: 4px;
  padding: 10px 14px;
  margin: 0;
  line-height: 1.5;
}

.form-success {
  font-size: 0.86rem;
  color: #15803d;
  background: rgba(22, 163, 74, 0.06);
  border: 1px solid rgba(22, 163, 74, 0.18);
  border-radius: 4px;
  padding: 10px 14px;
  margin: 0;
  line-height: 1.5;
}

/* ── Responsive ───────────────────────────────────────── */
@media (max-width: 1023px) {
  .auth-page {
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 32px 16px;
  }

  .auth-form-panel {
    padding-top: 60px;
    width: 100%;
  }
}
</style>
