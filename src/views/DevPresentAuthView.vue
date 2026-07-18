<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
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

  setupDecoObserver()
})

onUnmounted(() => {
  decoObserver?.disconnect()
})

// --- Demo scroll-driven del auth-deco ---
// El panel es su propio contenedor de scroll (scroll-snap). El observer solo
// marca que escena esta activa para el fade-up y los puntos de progreso: si no
// llega a montarse (ej. panel oculto <1024px), las escenas quedan legibles
// igualmente, solo sin el resaltado de la activa.
const decoScrollRef = ref<HTMLElement | null>(null)
const scene1Ref = ref<HTMLElement | null>(null)
const scene2Ref = ref<HTMLElement | null>(null)
const scene3Ref = ref<HTMLElement | null>(null)
const activeScene = ref(0)
let decoObserver: IntersectionObserver | null = null

const setupDecoObserver = () => {
  const root = decoScrollRef.value
  const scenes = [scene1Ref.value, scene2Ref.value, scene3Ref.value].filter(
    (el): el is HTMLElement => el !== null,
  )
  if (!root || scenes.length !== 3) return

  decoObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting || entry.intersectionRatio <= 0.5) return
        const index = scenes.indexOf(entry.target as HTMLElement)
        if (index !== -1) activeScene.value = index
      })
    },
    { root, threshold: [0.5] },
  )
  scenes.forEach((scene) => decoObserver?.observe(scene))
}
</script>

<template>
  <main class="auth-page">
    <!-- Panel decorativo izquierdo: demo scroll-driven de la app (estilo Apple) -->
    <section class="auth-deco">
      <div class="deco-scroll" ref="decoScrollRef">
        <!-- Escena 1: Proyectos -->
        <article class="deco-scene" ref="scene1Ref" :class="{ 'is-active': activeScene === 0 }">
          <div class="deco-scene-inner">
            <div class="deco-mockup mock-projects">
              <div class="mock-projects-head">
                <div>
                  <span class="mock-h1">Proyectos</span>
                  <span class="mock-sub">Gestiona tus presentaciones</span>
                </div>
                <span class="mock-btn-primary">+ Crear nueva</span>
              </div>
              <div class="mock-dropzone">
                <span class="material-symbols-outlined">upload_file</span>
                <span>Nuevo proyecto</span>
              </div>
              <div class="mock-recent-label">Trabajo reciente</div>
              <div class="mock-cards-row">
                <div class="mock-card">
                  <div class="mock-card-thumb mock-thumb-doc"></div>
                  <span class="mock-card-title">Mi Nueva Presentación</span>
                </div>
                <div class="mock-card">
                  <div class="mock-card-thumb mock-thumb-dark">
                    <span class="material-symbols-outlined">play_arrow</span>
                  </div>
                  <span class="mock-card-title">Mi Nueva Presentación</span>
                </div>
              </div>
            </div>
            <div class="deco-scene-caption">
              <p class="section-label">01 · Tus proyectos</p>
              <h3 class="deco-scene-title">Todo tu trabajo, siempre a mano</h3>
              <p class="deco-scene-desc">Gestiona tus presentaciones y vuelve al editor con un clic. Importa PDF, PPTX o empieza en blanco.</p>
            </div>
          </div>
          <div class="deco-scroll-hint">
            <span>Desliza para ver más</span>
            <span class="material-symbols-outlined">expand_more</span>
          </div>
        </article>

        <!-- Escena 2: Nuevo proyecto -->
        <article class="deco-scene" ref="scene2Ref" :class="{ 'is-active': activeScene === 1 }">
          <div class="deco-scene-inner">
            <div class="deco-mockup mock-modal">
              <div class="mock-modal-head">
                <span class="mock-modal-title">Crear nuevo proyecto</span>
                <span class="material-symbols-outlined mock-modal-close">close</span>
              </div>
              <div class="mock-modal-tabs">
                <span class="mock-modal-tab mock-modal-tab--active">Proyecto base</span>
                <span class="mock-modal-tab">Subir archivo</span>
              </div>
              <div class="mock-field-label">Tamaño del lienzo</div>
              <div class="mock-select">16:9 HD (1280x720)</div>
              <div class="mock-field-label">Plantilla base</div>
              <div class="mock-template-row">
                <span class="mock-template mock-template--active">En blanco</span>
                <span class="mock-template">Moderna</span>
                <span class="mock-template">Oscura</span>
                <span class="mock-template">Mi plantilla</span>
              </div>
              <div class="mock-modal-actions">
                <span class="mock-btn-ghost">Cancelar</span>
                <span class="mock-btn-primary">Continuar al editor</span>
              </div>
            </div>
            <div class="deco-scene-caption">
              <p class="section-label">02 · Arranque rápido</p>
              <h3 class="deco-scene-title">Elige lienzo y estilo en segundos</h3>
              <p class="deco-scene-desc">Define el tamaño y parte de una base — en blanco, moderna u oscura — antes de entrar al editor.</p>
            </div>
          </div>
        </article>

        <!-- Escena 3: Editor -->
        <article class="deco-scene" ref="scene3Ref" :class="{ 'is-active': activeScene === 2 }">
          <div class="deco-scene-inner">
            <div class="deco-mockup mock-editor">
              <div class="mock-editor-topbar">
                <span class="mock-editor-logo">Doc<b>Flow</b></span>
                <span class="mock-editor-toolbtn">Importar</span>
                <span class="mock-editor-toolbtn">Guardar</span>
                <span class="mock-editor-toolbtn">Exportar Web</span>
                <span class="mock-editor-play">Iniciar Presentación</span>
              </div>
              <div class="mock-editor-body">
                <div class="mock-editor-sidebar">
                  <span class="mock-editor-sidebar-label">Diapositivas</span>
                  <div class="mock-editor-slide">
                    <span class="mock-editor-slide-text">BIENVENIDO/A</span>
                  </div>
                  <div class="mock-editor-layer">Flecha: Línea</div>
                  <div class="mock-editor-layer">Texto</div>
                </div>
                <div class="mock-editor-canvas">
                  <span>BIENVENIDO/A</span>
                </div>
                <div class="mock-editor-props">
                  <span class="mock-editor-props-label">Propiedades</span>
                  <div class="mock-editor-props-row"></div>
                  <div class="mock-editor-props-row"></div>
                  <div class="mock-editor-props-row short"></div>
                </div>
              </div>
            </div>
            <div class="deco-scene-caption">
              <p class="section-label">03 · Editor en vivo</p>
              <h3 class="deco-scene-title">Precisión de diseño, en el navegador</h3>
              <p class="deco-scene-desc">Capas, propiedades y lienzo interactivo en tiempo real. Sin instalar nada.</p>
            </div>
          </div>
        </article>
      </div>

      <div class="deco-progress">
        <span class="deco-progress-dot" :class="{ 'is-active': activeScene === 0 }"></span>
        <span class="deco-progress-dot" :class="{ 'is-active': activeScene === 1 }"></span>
        <span class="deco-progress-dot" :class="{ 'is-active': activeScene === 2 }"></span>
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
  color: #9a3412;
  background: rgba(154, 52, 18, 0.1);
  border: 1px solid rgba(154, 52, 18, 0.28);
  padding: 5px 11px;
  border-radius: 99px;
  margin: 0;
}

/* ── Panel decorativo: demo scroll-driven ─────────────── */
.auth-deco {
  display: none;
  width: 50%;
  height: calc(100vh - 44px);
  border: 1px solid #e0c8a8;
  border-radius: 8px;
  box-shadow: 0 4px 24px rgba(60, 30, 10, 0.08);
  position: relative;
  overflow: hidden; /* recorta al border-radius; el scroll real vive en .deco-scroll */
  background:
    radial-gradient(ellipse at 20% 10%, rgba(234, 88, 12, 0.05) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 85%, rgba(154, 52, 18, 0.03) 0%, transparent 45%),
    #ffffff;
}

@media (min-width: 1024px) {
  .auth-deco { display: block; }
}

/* Contenedor de scroll real: separado del marco (.auth-deco) para que
   .deco-progress, un hermano suyo, quede fijo y no se desplace con el scroll. */
.deco-scroll {
  position: absolute;
  inset: 0;
  overflow-y: auto;
  overflow-x: hidden;
  scroll-snap-type: y mandatory;
  scroll-behavior: smooth;
  scrollbar-width: none;
}
.deco-scroll::-webkit-scrollbar { width: 0; height: 0; }

.deco-scene {
  position: relative;
  min-height: 100%;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  padding: 48px 60px 48px 44px;
  scroll-snap-align: start;
  scroll-snap-stop: always;
}

.deco-scene-inner {
  position: relative;
  z-index: 1;
  max-width: 440px;
  margin: 0 auto;
  opacity: 0.55;
  transform: translateY(10px) scale(0.985);
  transition: opacity 0.5s cubic-bezier(0.22, 1, 0.36, 1), transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
}

.deco-scene.is-active .deco-scene-inner {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.deco-scene-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: clamp(1.3rem, 2vw, 1.7rem);
  line-height: 1.15;
  letter-spacing: -0.03em;
  color: #0a0604;
  margin: 14px 0 10px;
}

.deco-scene-desc {
  color: #6a4820;
  line-height: 1.7;
  font-size: 0.92rem;
  margin: 0;
  max-width: 380px;
}

/* Pista de scroll: vive dentro de la escena 1, así que desaparece con ella en
   cuanto el usuario hace scroll a la escena 2 (sin JS extra para ocultarla). */
.deco-scroll-hint {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 22px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  color: #b08858;
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  pointer-events: none;
  animation: decoHintFade 2.6s ease-in-out infinite;
}
.deco-scroll-hint .material-symbols-outlined {
  font-size: 1.3rem;
  animation: decoHintBounce 1.6s ease-in-out infinite;
}

@keyframes decoHintBounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(5px); }
}
@keyframes decoHintFade {
  0%, 100% { opacity: 0.9; }
  50% { opacity: 0.35; }
}

/* Puntos de progreso: hermano de .deco-scroll, no descendiente, para no
   scrollear con el contenido. */
.deco-progress {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 2;
}
.deco-progress-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(154, 52, 18, 0.22);
  transition: all 0.3s ease;
}
.deco-progress-dot.is-active {
  background: #ea580c;
  height: 20px;
  border-radius: 3px;
}

/* ── Mockups de la demo ───────────────────────────────── */
.deco-mockup {
  border: 1px solid #e0c8a8;
  background: #fdf9f5;
  border-radius: 10px;
  padding: 18px;
  box-shadow: 0 10px 30px rgba(60, 30, 10, 0.1);
  margin-bottom: 26px;
  font-family: 'Plus Jakarta Sans', sans-serif;
}

/* Escena 1: Proyectos */
.mock-projects-head { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 16px; gap: 10px; }
.mock-h1 { display: block; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 1.1rem; color: #0a0604; }
.mock-sub { display: block; font-size: 0.72rem; color: #8c603a; margin-top: 2px; }
.mock-btn-primary {
  flex-shrink: 0;
  background: linear-gradient(160deg, #9a3412, #ea580c);
  color: #fff;
  font-size: 0.68rem;
  font-weight: 700;
  padding: 7px 12px;
  border-radius: 6px;
  white-space: nowrap;
}
.mock-dropzone {
  border: 1.5px dashed rgba(234, 88, 12, 0.4);
  border-radius: 8px;
  padding: 20px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  color: #8c603a;
  font-size: 0.72rem;
  margin-bottom: 16px;
}
.mock-dropzone .material-symbols-outlined { font-size: 1.6rem; color: #ea580c; }
.mock-recent-label { font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #7a5030; margin-bottom: 8px; }
.mock-cards-row { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
.mock-card { border: 1px solid #e0c8a8; border-radius: 7px; overflow: hidden; background: #fff; }
.mock-card-thumb { height: 56px; display: flex; align-items: center; justify-content: center; }
.mock-thumb-doc { background: linear-gradient(135deg, #f5ede4, #e8d8c4); }
.mock-thumb-dark { background: linear-gradient(160deg, #1e3a5f, #0d1b2e); }
.mock-thumb-dark .material-symbols-outlined { color: #fff; font-size: 1.2rem; }
.mock-card-title { display: block; font-size: 0.66rem; padding: 6px 8px; color: #5a3010; }

/* Escena 2: Modal nuevo proyecto */
.mock-modal-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.mock-modal-title { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 0.95rem; color: #0a0604; }
.mock-modal-close { font-size: 1rem; color: #b08858; }
.mock-modal-tabs { display: flex; gap: 4px; background: #f9f4ee; border: 1px solid #e0c8a8; border-radius: 6px; padding: 3px; margin-bottom: 14px; }
.mock-modal-tab { flex: 1; text-align: center; font-size: 0.66rem; font-weight: 700; padding: 6px; border-radius: 4px; color: #8c603a; }
.mock-modal-tab--active { background: #fff; color: #9a3412; box-shadow: 0 1px 4px rgba(60, 30, 10, 0.1); }
.mock-field-label { font-size: 0.62rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #7a5030; margin: 12px 0 6px; }
.mock-select { border: 1px solid #e0c8a8; background: #fff; border-radius: 6px; padding: 8px 10px; font-size: 0.74rem; color: #0a0604; }
.mock-template-row { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px; }
.mock-template { border: 1px solid #e0c8a8; border-radius: 6px; padding: 7px; font-size: 0.66rem; text-align: center; color: #7a5030; background: #fff; }
.mock-template--active { border-color: #ea580c; background: rgba(234, 88, 12, 0.08); color: #9a3412; font-weight: 700; }
.mock-modal-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; }
.mock-btn-ghost { border: 1px solid #e0c8a8; border-radius: 6px; padding: 7px 12px; font-size: 0.68rem; color: #7a5030; background: #fff; }

/* Escena 3: Editor */
.mock-editor { padding: 0; overflow: hidden; }
.mock-editor-topbar { display: flex; align-items: center; gap: 8px; padding: 9px 12px; border-bottom: 1px solid #e0c8a8; background: #fff; flex-wrap: wrap; }
.mock-editor-logo { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 0.72rem; color: #0a0604; }
.mock-editor-logo b { color: #ea580c; }
.mock-editor-toolbtn { font-size: 0.6rem; color: #7a5030; padding: 4px 7px; border: 1px solid #e0c8a8; border-radius: 5px; background: #fdf9f5; }
.mock-editor-play { margin-left: auto; font-size: 0.6rem; font-weight: 700; color: #fff; background: linear-gradient(160deg, #9a3412, #ea580c); padding: 5px 10px; border-radius: 99px; white-space: nowrap; }
.mock-editor-body { display: grid; grid-template-columns: 78px 1fr 64px; min-height: 190px; }
.mock-editor-sidebar { border-right: 1px solid #e0c8a8; padding: 8px 7px; background: #fdf9f5; }
.mock-editor-sidebar-label { display: block; font-size: 0.52rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #8c603a; margin-bottom: 6px; }
.mock-editor-slide { background: #94949a; border-radius: 4px; height: 40px; display: flex; align-items: center; justify-content: center; margin-bottom: 6px; border: 1.5px solid #ea580c; }
.mock-editor-slide-text { font-size: 0.42rem; color: #fff; font-weight: 700; letter-spacing: 0.03em; }
.mock-editor-layer { font-size: 0.52rem; color: #6a4820; padding: 3px 5px; border-radius: 3px; margin-bottom: 3px; background: #fff; border: 1px solid #ecdcc4; }
.mock-editor-canvas { background: #f2ede6; display: flex; align-items: center; justify-content: center; }
.mock-editor-canvas span { background: #94949a; color: #fff; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.05em; padding: 18px 26px; border-radius: 3px; box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15); }
.mock-editor-props { border-left: 1px solid #e0c8a8; padding: 8px 6px; background: #fdf9f5; }
.mock-editor-props-label { display: block; font-size: 0.5rem; font-weight: 700; text-transform: uppercase; color: #8c603a; margin-bottom: 8px; }
.mock-editor-props-row { height: 6px; border-radius: 3px; background: #ecdcc4; margin-bottom: 6px; }
.mock-editor-props-row.short { width: 60%; }

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
  color: #7c5625;
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
  color: #9a3412;
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
  color: #8c603a;
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
  color: #9a3412;
  cursor: pointer;
  padding: 0;
  transition: color 0.18s ease;
}

.form-forgot:hover { color: #7c2d12; }

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
