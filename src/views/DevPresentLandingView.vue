<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const primaryRoute = computed(() => (authStore.isAuthenticated ? '/devpresent/projects' : '/devpresent/auth'))
const primaryCopy = computed(() => (authStore.isAuthenticated ? 'Entrar al editor' : 'Solicitar acceso'))

const slides = [
  {
    title: 'Editor visual para presentaciones interactivas',
    description: 'Diseña escenas, ordena capas y controla cada bloque de contenido con precisión.',
    image: '/landing/hero-slide-1.svg',
  },
  {
    title: 'Flujo unificado de importación y edición',
    description: 'Importa PDF o PPTX, ajusta estructura y aplica interactividad sin cambiar de plataforma.',
    image: '/landing/hero-slide-2.svg',
  },
  {
    title: 'Publicación web lista para producción',
    description: 'Exporta un player optimizado para demos comerciales, formación y documentación visual.',
    image: '/landing/hero-slide-3.svg',
  },
]

const currentSlide = ref(0)
const activeSlide = computed(() => slides[currentSlide.value]!)
let carouselTimer: ReturnType<typeof setInterval> | null = null
let observer: IntersectionObserver | null = null

const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % slides.length
}

const prevSlide = () => {
  currentSlide.value = (currentSlide.value - 1 + slides.length) % slides.length
}

const goToSlide = (index: number) => {
  currentSlide.value = index
}

const scrollToSection = (sectionId: string) => {
  const section = document.getElementById(sectionId)
  if (!section) {
    return
  }
  const top = section.getBoundingClientRect().top + window.scrollY - 94
  window.scrollTo({ top, behavior: 'smooth' })
}

const startCarousel = () => {
  carouselTimer = setInterval(() => {
    nextSlide()
  }, 4800)
}

const stopCarousel = () => {
  if (!carouselTimer) {
    return
  }
  clearInterval(carouselTimer)
  carouselTimer = null
}

const initScrollAnimations = () => {
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          // Optional: stop observing once it's visible to keep it rendered
          // observer?.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
  )

  document.querySelectorAll('.reveal, .reveal-stagger').forEach((el) => {
    observer?.observe(el)
  })
}

onMounted(() => {
  startCarousel()
  initScrollAnimations()
})

onUnmounted(() => {
  stopCarousel()
  if (observer) {
    observer.disconnect()
  }
})
</script>

<template>
  <div class="landing-page">
    <header class="landing-header">
      <RouterLink to="/devpresent/projects" class="brand">
        <!-- ¡El cohete ahora tiene clase para temblar en hover! -->
        <img src="/landing/rocket-logo.svg" alt="DocFlow Rocket" class="brand-logo" />
        <span class="brand-copy">
          <strong>DocFlow</strong>
          <small>Interactive Presentation Platform</small>
        </span>
      </RouterLink>

      <nav class="landing-nav">
        <a href="#producto" class="hover-underline" @click.prevent="scrollToSection('producto')">Producto</a>
        <a href="#secciones" class="hover-underline" @click.prevent="scrollToSection('secciones')">Capacidades</a>
        <a href="#casos" class="hover-underline" @click.prevent="scrollToSection('casos')">Casos de uso</a>
        <a href="#proceso" class="hover-underline" @click.prevent="scrollToSection('proceso')">Proceso</a>
        <a href="#plantillas" class="hover-underline" @click.prevent="scrollToSection('plantillas')">Plantillas</a>
      </nav>

      <div class="header-actions">
        <RouterLink to="/devpresent/auth" class="btn btn-ghost">Acceder</RouterLink>
        <RouterLink :to="primaryRoute" class="btn btn-dark">{{ primaryCopy }}</RouterLink>
      </div>
    </header>

    <main class="main-shell">
      <section class="hero reveal" id="producto">
        <div class="hero-copy">
          <p class="section-label">DocFlow Studio</p>
          <h1>Editor de presentaciones WEB (html).</h1>
          <h2>Con soporte powerpoint y pdf</h2>
          <p class="hero-description">
            Diseñado para equipos que necesitan control visual, consistencia de marca y publicación web en un solo flujo.
            Importa, edita y presenta desde una interfaz sólida orientada a producción.
          </p>

          <div class="hero-actions">
            <RouterLink :to="primaryRoute" class="btn btn-dark">{{ primaryCopy }}</RouterLink>
            <RouterLink to="/devpresent/projects" class="btn btn-light">Ver proyectos</RouterLink>
          </div>

          <div class="hero-facts reveal-stagger">
            <div class="fact-card">
              <strong>PDF + PPTX</strong>
              <span>Importación editable</span>
            </div>
            <div class="fact-card">
              <strong>Canvas interactivo</strong>
              <span>Hotspots, audio, mapas, 3D</span>
            </div>
            <div class="fact-card">
              <strong>Exportación web</strong>
              <span>Player listo para compartir</span>
            </div>
          </div>
        </div>

        <div class="hero-carousel" @mouseenter="stopCarousel" @mouseleave="startCarousel">
          <div class="carousel-frame">
            <Transition name="hero-slide" mode="out-in">
              <img
                :key="activeSlide.image"
                :src="activeSlide.image"
                :alt="activeSlide.title"
                class="carousel-image"
              />
            </Transition>
            <Transition name="hero-content" mode="out-in">
              <div class="carousel-overlay" :key="activeSlide.title">
                <h2>{{ activeSlide.title }}</h2>
                <p>{{ activeSlide.description }}</p>
              </div>
            </Transition>
          </div>

          <div class="carousel-controls">
            <button type="button" class="carousel-arrow" @click="prevSlide" aria-label="Slide anterior">&#8592;</button>
            <div class="carousel-dots">
              <button
                v-for="(slide, index) in slides"
                :key="slide.title"
                type="button"
                class="dot"
                :class="{ active: index === currentSlide }"
                @click="goToSlide(index)"
                :aria-label="`Ir a slide ${index + 1}`"
              ></button>
            </div>
            <button type="button" class="carousel-arrow" @click="nextSlide" aria-label="Slide siguiente">&#8594;</button>
          </div>
        </div>
      </section>

      <section class="capabilities reveal" id="secciones">
        <header class="section-header">
          <p class="section-label">Capacidades</p>
          <h2>Arquitectura pensada para operación real</h2>
        </header>

        <div class="cap-grid reveal-stagger">
          <article class="cap-card">
            <div class="icon-blob">🛠️</div>
            <h3>Editor de escenas</h3>
            <p>Manipula bloques visuales con precisión, panel lateral de propiedades y timeline de contenido.</p>
          </article>
          <article class="cap-card">
            <div class="icon-blob">✨</div>
            <h3>Componentes interactivos</h3>
            <p>Integra hotspots, comparadores, audio, mapas y módulos 3D en la misma experiencia.</p>
          </article>
          <article class="cap-card">
            <div class="icon-blob">📚</div>
            <h3>Biblioteca y plantillas</h3>
            <p>Estandariza estilos y acelera producción con plantillas reutilizables por equipo.</p>
          </article>
          <article class="cap-card">
            <div class="icon-blob">🚀</div>
            <h3>Publicación y playback</h3>
            <p>Genera un player web estable para sesiones comerciales, clases y documentación guiada.</p>
          </article>
        </div>
      </section>

      <section class="use-cases reveal" id="casos">
        <header class="section-header">
          <p class="section-label">Casos de uso</p>
          <h2>Una plataforma para diferentes equipos</h2>
        </header>

        <div class="cases-grid reveal-stagger">
          <article class="case-card">
            <h3>Educación y formación</h3>
            <p>Lecciones navegables con recursos multimedia para mejorar retención y comprensión.</p>
          </article>
          <article class="case-card">
            <h3>Ventas y preventa</h3>
            <p>Demos guiadas y propuestas visuales con mayor claridad comercial.</p>
          </article>
          <article class="case-card">
            <h3>Producto y onboarding</h3>
            <p>Explicación visual de funcionalidades, procesos y recorridos de usuario.</p>
          </article>
        </div>
      </section>

      <section class="process reveal" id="proceso">
        <header class="section-header">
          <p class="section-label">Proceso</p>
          <h2>Tres pasos para pasar de archivo a experiencia web</h2>
        </header>

        <ol class="process-list reveal-stagger">
          <li class="process-step">
            <span>01</span>
            <div>
              <h3>Importar base documental</h3>
              <p>Sube material existente y organiza estructura inicial del proyecto.</p>
            </div>
          </li>
          <li class="process-step">
            <span>02</span>
            <div>
              <h3>Editar e integrar interacciones</h3>
              <p>Ajusta diseño, añade lógica visual y valida flujo de navegación.</p>
            </div>
          </li>
          <li class="process-step">
            <span>03</span>
            <div>
              <h3>Publicar y compartir</h3>
              <p>Exporta presentación interactiva para distribuir por enlace y reproducir en navegador.</p>
            </div>
          </li>
        </ol>
      </section>

      <section class="templates reveal" id="plantillas">
        <header class="section-header">
          <p class="section-label">Plantillas</p>
          <h2>Base visual lista para acelerar entregas</h2>
        </header>

        <div class="templates-grid reveal-stagger">
          <article class="template-card">
            <strong>Sales Deck Pro</strong>
            <p>Estructura pensada para demos comerciales con narrativa por etapas.</p>
          </article>
          <article class="template-card">
            <strong>Training Flow</strong>
            <p>Plantilla de formación con checkpoints y recursos interactivos.</p>
          </article>
          <article class="template-card">
            <strong>Product Storyboard</strong>
            <p>Formato de lanzamiento con comparación visual y módulos multimedia.</p>
          </article>
        </div>

        <div class="templates-actions">
          <RouterLink to="/devpresent/templates" class="btn btn-dark">Ir a plantillas</RouterLink>
        </div>
      </section>

      <section class="final-cta reveal">
        <div>
          <p class="section-label">DocFlow</p>
          <h2>Empieza con una plantilla o crea tu flujo desde cero.</h2>
          <p class="cta-copy">Control total de diseño, interactividad y publicación en una única plataforma.</p>
        </div>
        <div class="final-actions">
          <RouterLink :to="primaryRoute" class="btn btn-dark">{{ primaryCopy }}</RouterLink>
          <RouterLink to="/devpresent/templates" class="btn btn-light">Ver plantillas</RouterLink>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
/* ── Keyframes ─────────────────────────────────────────── */
@keyframes headerFadeIn {
  from { transform: translateY(-20px); opacity: 0; }
  to   { transform: translateY(0);     opacity: 1; }
}

@keyframes sectionFadeUp {
  from { transform: translateY(32px); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}

@keyframes staggerFadeUp {
  from {
    opacity: 0;
    transform: translateY(22px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ── Base ───────────────────────────────────────────────── */
.landing-page {
  min-height: 100vh;
  background:
    radial-gradient(ellipse at 12% 0%, rgba(234, 88, 12, 0.1) 0%, transparent 38%),
    radial-gradient(ellipse at 88% 0%, rgba(154, 52, 18, 0.07) 0%, transparent 40%),
    #faf8f5;
  color: #1c140c;
  padding: 22px;
  font-family: 'Plus Jakarta Sans', var(--font-main);
  overflow-x: hidden;
}

/* ── Contenedor global ───────────────────── */
.landing-header,
.hero,
.capabilities,
.use-cases,
.process,
.templates,
.final-cta {
  max-width: 1400px;
  margin: 0 auto;
}

/* ── Header ─────────────────────────────── */
.landing-header {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 24px;
  align-items: center;
  border: 1px solid rgba(234, 88, 12, 0.18);
  background: rgba(255, 250, 245, 0.92);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  padding: 12px 20px;
  position: sticky;
  top: 12px;
  z-index: 25;
  border-radius: 8px;
  box-shadow: 0 2px 16px rgba(80, 30, 10, 0.07);
  animation: headerFadeIn 0.5s ease both;
}

/* ── Marca ───────────────────────────────── */
.brand {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: inherit;
}

.brand-logo {
  width: 42px;
  height: 42px;
  border: 1px solid #c2410c;
  padding: 4px;
  background: linear-gradient(160deg, #7c2d12, #9a3412);
  border-radius: 6px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.brand:hover .brand-logo {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(154, 52, 18, 0.28);
}

.brand-copy {
  display: flex;
  flex-direction: column;
}

.brand-copy strong {
  font-size: 0.95rem;
  letter-spacing: -0.02em;
  color: #280e04;
}

.brand-copy small {
  font-size: 0.64rem;
  letter-spacing: 0.13em;
  text-transform: uppercase;
  color: #7a5030;
}

/* ── Nav ─────────────────────────────────── */
.landing-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.landing-nav a {
  text-decoration: none;
  color: #5a3820;
  font-size: 0.82rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 9px 13px;
  border-radius: 8px;
  position: relative;
  transition: color 0.22s ease, background-color 0.22s ease;
}

.landing-nav a::after {
  content: '';
  position: absolute;
  bottom: 6px;
  left: 50%;
  width: 0;
  height: 2px;
  background: #ea580c;
  border-radius: 2px;
  transform: translateX(-50%);
  transition: width 0.28s ease;
}

.landing-nav a:hover {
  color: #280e04;
  background: rgba(234, 88, 12, 0.07);
}

.landing-nav a:hover::after {
  width: 60%;
}

/* ── Botones ─────────────────────────────── */
.header-actions,
.hero-actions,
.final-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.btn {
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  padding: 0 20px;
  font-size: 0.82rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  font-weight: 700;
  border: 1px solid transparent;
  border-radius: 5px;
  transition: transform 0.22s ease, box-shadow 0.22s ease, background-color 0.22s ease;
}

.btn:hover {
  transform: translateY(-2px);
}

.btn-dark {
  color: #fff0e8;
  border-color: #c2410c;
  background: linear-gradient(160deg, #9a3412, #ea580c);
  box-shadow: 0 4px 14px rgba(154, 52, 18, 0.22);
}

.btn-dark:hover {
  background: linear-gradient(160deg, #c2410c, #f97316);
  box-shadow: 0 6px 20px rgba(154, 52, 18, 0.32);
}

.btn-light,
.btn-ghost {
  color: #5a2810;
  border-color: #e8c8a8;
  background: #fdf5ee;
}

.btn-light:hover,
.btn-ghost:hover {
  background: #f8ece0;
  box-shadow: 0 4px 12px rgba(154, 52, 18, 0.1);
}

/* ── Shell principal ─────────────────────── */
.main-shell {
  padding-top: 20px;
}

/* ── Scroll reveal ───────────────────────── */
.reveal {
  opacity: 0;
  transform: translateY(28px);
  transition: opacity 0.65s ease, transform 0.65s cubic-bezier(0.22, 1, 0.36, 1);
}

.reveal.is-visible {
  opacity: 1;
  transform: translateY(0);
}

.reveal-stagger > * {
  opacity: 0; /* Ocultos hasta que la animación tome el control */
}

/* Aplicación del stagger con keyframes en vez de transition */
.reveal.is-visible .reveal-stagger > *:nth-child(1) { animation: staggerFadeUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.08s both; }
.reveal.is-visible .reveal-stagger > *:nth-child(2) { animation: staggerFadeUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.16s both; }
.reveal.is-visible .reveal-stagger > *:nth-child(3) { animation: staggerFadeUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.24s both; }
.reveal.is-visible .reveal-stagger > *:nth-child(4) { animation: staggerFadeUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.32s both; }

/* ── Hero ────────────────────────────────── */
.hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.14fr);
  gap: 28px;
  border: 1px solid #f0d8c0;
  background: #fefaf6;
  padding: 36px;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(80, 30, 10, 0.05);
}

/* ── Etiqueta de sección ─────────────────── */
.section-label {
  margin: 0;
  display: inline-flex;
  align-items: center;
  font-size: 0.68rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: #e85c20;
  background: rgba(232, 92, 32, 0.09);
  border: 1px solid rgba(232, 92, 32, 0.16);
  padding: 5px 11px;
  border-radius: 99px;
}

/* ── Titular del hero ────────────────────── */
.hero-copy h1 {
  margin: 14px 0 0;
  font-family: 'Space Grotesk', var(--font-heading);
  font-size: clamp(2.1rem, 4vw, 3.4rem);
  line-height: 1.04;
  letter-spacing: -0.045em;
  color: #1c140c;
  background: linear-gradient(140deg, #280e04 30%, #ea580c);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.hero-copy h2 {
  margin: 14px 0 0;
  font-family: 'Space Grotesk', var(--font-heading);
  font-size: clamp(2.1rem, 4vw, 3.4rem);
  line-height: 1.04;
  letter-spacing: -0.045em;
  color: #1c140c;
  background: linear-gradient(140deg, #280e04 30%, #ea580c);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-description {
  margin-top: 16px;
  color: #6a4830;
  line-height: 1.76;
  max-width: 580px;
  font-size: 1.03rem;
}

.hero-actions {
  margin-top: 24px;
}

/* ── Tarjetas (Unificadas y suaves) ──────── */
.hero-facts {
  margin-top: 28px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.fact-card {
  border: 1px solid #f0d8c0;
  background: #fef8f2;
  padding: 14px 16px;
  border-radius: 5px;
  transition: all 0.35s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.fact-card:hover {
  transform: translateY(-4px);
  border-color: #ea580c;
  box-shadow: 0 8px 24px rgba(154, 52, 18, 0.1);
}

.fact-card strong {
  display: block;
  font-size: 0.88rem;
  color: #280e04;
}

.fact-card span {
  display: block;
  margin-top: 5px;
  font-size: 0.79rem;
  color: #7a5030;
}

/* ── Carrusel ────────────────────────────── */
.hero-carousel {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.carousel-frame {
  position: relative;
  border: 1px solid #7c2d12;
  background: #1c100a;
  min-height: 520px;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 12px 36px rgba(30, 12, 4, 0.18);
}

.carousel-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.carousel-overlay {
  position: absolute;
  inset: 0;
  top: auto;
  background: linear-gradient(180deg, transparent 0%, rgba(12, 6, 2, 0.94) 100%);
  color: #f0e0d0;
  padding: 24px 26px;
}

.carousel-overlay h2 {
  margin: 0;
  font-family: 'Space Grotesk', var(--font-heading);
  font-size: 1.22rem;
  letter-spacing: -0.025em;
  line-height: 1.25;
}

.carousel-overlay p {
  margin-top: 8px;
  color: #b89078;
  line-height: 1.56;
  font-size: 0.9rem;
}

.carousel-controls {
  display: grid;
  grid-template-columns: 44px 1fr 44px;
  gap: 8px;
  align-items: center;
}

.carousel-arrow {
  width: 40px;
  height: 40px;
  border: 1px solid #e8c8a8;
  background: #fdf5ee;
  color: #7a3010;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.22s ease, color 0.22s ease, transform 0.22s ease;
}

.carousel-arrow:hover {
  background: #9a3412;
  color: #fff0e8;
  transform: scale(1.04);
}

.carousel-dots {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  padding: 0 16px;
}

.dot {
  border: none;
  height: 5px;
  border-radius: 4px;
  background: #e8c8a8;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.3s ease;
}

.dot.active {
  background: #e85c20;
  transform: scaleX(1.2);
}

/* ── Secciones de contenido ──────────────── */
.capabilities,
.use-cases,
.process,
.templates,
.final-cta {
  margin-top: 20px;
  border: 1px solid #f0d8c0;
  background: #fefaf6;
  padding: 36px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(80, 30, 10, 0.04);
}

.section-header h2 {
  margin-top: 10px;
  font-family: 'Space Grotesk', var(--font-heading);
  font-size: clamp(1.5rem, 2.8vw, 2.3rem);
  letter-spacing: -0.04em;
  color: #1c140c;
  line-height: 1.1;
}

/* ── Grids de contenido ──────────────────── */
.cap-grid,
.cases-grid {
  margin-top: 26px;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.cases-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

/* ── Icon blob ───────────────────────────── */
.icon-blob {
  font-size: 1.6rem;
  margin-bottom: 14px;
  display: inline-flex;
  width: 46px;
  height: 46px;
  align-items: center;
  justify-content: center;
  background: linear-gradient(140deg, #fff0e8, #fde0c8);
  border: 1px solid #f0c8a0;
  border-radius: 6px;
  transition: all 0.35s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.cap-card:hover .icon-blob {
  transform: scale(1.1);
  background: linear-gradient(140deg, #fde0c8, #fbc8a0);
}

/* ── Tarjetas Generales ──────────────────── */
.cap-card,
.case-card,
.process-step,
.template-card {
  border: 1px solid #f0d8c0;
  background: #ffffff;
  padding: 22px;
  border-radius: 6px;
  transition: all 0.25s ease;
}

.cap-card:hover,
.case-card:hover,
.process-step:hover,
.template-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(80, 30, 10, 0.09);
  border-color: #ea580c;
}

.cap-card h3,
.case-card h3,
.process-list h3 {
  margin: 0;
  font-size: 1.02rem;
  letter-spacing: -0.02em;
  color: #280e04;
  font-weight: 700;
}

.cap-card p,
.case-card p,
.process-list p,
.cta-copy {
  margin-top: 10px;
  color: #6a4830;
  line-height: 1.68;
  font-size: 0.92rem;
}

/* ── Proceso ─────────────────────────────── */
.process-list {
  list-style: none;
  padding: 0;
  margin: 26px 0 0;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.process-step span {
  display: inline-flex;
  width: 40px;
  height: 40px;
  align-items: center;
  justify-content: center;
  border: 1px solid #c2410c;
  background: linear-gradient(140deg, #9a3412, #ea580c);
  color: #fff0e8;
  font-size: 0.88rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  margin-bottom: 14px;
  border-radius: 5px;
}

/* ── Plantillas ──────────────────────────── */
.templates-grid {
  margin-top: 26px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.template-card strong {
  display: block;
  color: #280e04;
  font-size: 1rem;
  font-weight: 700;
}

.templates-actions {
  margin-top: 22px;
  text-align: center;
}

/* ── CTA Final ───────────────────────────── */
.final-cta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 40px;
  padding: 40px;
  background: linear-gradient(140deg, #1c0e06 0%, #3d1a0a 100%);
  border: 1px solid #7c2d12;
  border-radius: 8px;
  box-shadow: 0 8px 28px rgba(30, 10, 2, 0.22);
}}

.final-cta .section-label {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 200, 160, 0.2);
  color: #f0c8a0;
}

.final-cta h2 {
  margin-top: 10px;
  font-family: 'Space Grotesk', var(--font-heading);
  font-size: clamp(1.4rem, 2.6vw, 2.2rem);
  letter-spacing: -0.035em;
  color: #f0e0d0;
  line-height: 1.14;
}

.final-cta .cta-copy {
  color: #b09080;
  font-size: 0.96rem;
}

.final-cta .btn-dark {
  background: linear-gradient(140deg, #ea580c, #f97316);
  border-color: #c2410c;
  box-shadow: 0 4px 16px rgba(234, 88, 12, 0.36);
}

.final-cta .btn-dark:hover {
  background: linear-gradient(140deg, #f97316, #fb923c);
  box-shadow: 0 8px 24px rgba(234, 88, 12, 0.46);
}

.final-cta .btn-light {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 200, 160, 0.24);
  color: #f0d8c0;
}

.final-cta .btn-light:hover {
  background: rgba(255, 255, 255, 0.14);
}

/* ── Transiciones Vue del carrusel ───────── */
.hero-slide-enter-active {
  transition: opacity 480ms ease, transform 480ms cubic-bezier(0.22, 1, 0.36, 1);
}

.hero-slide-leave-active {
  transition: opacity 280ms ease, transform 280ms ease;
  position: absolute;
  inset: 0;
}

.hero-slide-enter-from {
  opacity: 0;
  transform: translateX(24px);
}

.hero-slide-leave-to {
  opacity: 0;
  transform: translateX(-18px);
}

.hero-content-enter-active {
  transition: opacity 360ms ease 100ms, transform 360ms cubic-bezier(0.22, 1, 0.36, 1) 100ms;
}

.hero-content-leave-active {
  transition: opacity 200ms ease;
  position: absolute;
  inset: 0;
  top: auto;
}

.hero-content-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

.hero-content-leave-to {
  opacity: 0;
}

/* ── Responsive ──────────────────────────── */
@media (max-width: 1220px) {
  .landing-header {
    grid-template-columns: 1fr;
    justify-items: center;
  }

  .landing-nav {
    width: 100%;
    justify-content: center;
    flex-wrap: wrap;
  }

  .hero {
    grid-template-columns: 1fr;
  }

  .cap-grid,
  .cases-grid,
  .process-list,
  .templates-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .final-cta {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 780px) {
  .landing-page {
    padding: 12px;
  }

  .hero,
  .capabilities,
  .use-cases,
  .process,
  .templates,
  .final-cta {
    padding: 20px;
  }

  .hero-facts,
  .cap-grid,
  .cases-grid,
  .process-list,
  .templates-grid {
    grid-template-columns: 1fr;
  }

  .carousel-frame {
    min-height: 360px;
  }

  .carousel-controls {
    grid-template-columns: 44px 1fr 44px;
  }
}
</style>
