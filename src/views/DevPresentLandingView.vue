<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const primaryRoute = computed(() => (authStore.isAuthenticated ? '/devpresent/projects' : '/devpresent/auth'))
const primaryCopy = computed(() => (authStore.isAuthenticated ? 'Abrir editor' : 'Probar gratis'))
</script>

<template>
  <div class="landing-page">
    <header class="landing-header">
      <RouterLink to="/devpresent/projects" class="brand-mark">
        <span class="brand-icon">D</span>
        <span class="brand-copy">
          <strong>DocFlow</strong>
          <small>Presentaciones interactivas</small>
        </span>
      </RouterLink>

      <nav class="landing-nav">
        <a href="#producto">Producto</a>
        <a href="#casos">Casos</a>
        <a href="#features">Funciones</a>
        <RouterLink to="/devpresent/templates">Plantillas</RouterLink>
      </nav>

      <div class="landing-actions">
        <RouterLink to="/devpresent/auth" class="nav-link nav-link-muted">Acceder</RouterLink>
        <RouterLink :to="primaryRoute" class="nav-link nav-link-primary">{{ primaryCopy }}</RouterLink>
      </div>
    </header>

    <main>
      <section class="hero-shell" id="producto">
        <div class="hero-copy">
          <div class="eyebrow">EDITOR + PLAYER + EXPORT WEB</div>
          <h1>
            Presentaciones y PDFs interactivos
            <span>con el canvas al centro.</span>
          </h1>
          <p>
            Diseña slides, hotspots, audio, modelos 3D, mapas y experiencias web fluidas desde un solo editor.
            Importa tu deck. Refínalo visualmente. Publícalo sin fricción.
          </p>

          <div class="hero-actions">
            <RouterLink :to="primaryRoute" class="button-primary">{{ primaryCopy }}</RouterLink>
            <RouterLink to="/devpresent/templates" class="button-secondary">Explorar plantillas</RouterLink>
          </div>

          <div class="proof-strip">
            <div>
              <strong>PPTX + PDF</strong>
              <span>importación editable</span>
            </div>
            <div>
              <strong>HTML export</strong>
              <span>presentación publicable</span>
            </div>
            <div>
              <strong>Canvas interactivo</strong>
              <span>audio, mapas, 3D, hotspots</span>
            </div>
          </div>
        </div>

        <div class="hero-stage">
          <div class="editor-preview glass-card">
            <div class="preview-topbar">
              <div class="preview-pills">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <div class="preview-toolbar">
                <span>Texto</span>
                <span>Media</span>
                <span>Interacción</span>
                <span class="is-active">Presentar</span>
              </div>
            </div>

            <div class="preview-body">
              <aside class="preview-sidebar">
                <div class="mini-slide is-active"></div>
                <div class="mini-slide"></div>
                <div class="mini-slide"></div>
                <div class="mini-slide"></div>
              </aside>

              <div class="preview-canvas-wrap">
                <div class="preview-floating-tools">
                  <span>Seleccionar</span>
                  <span>Texto</span>
                  <span>Mapa</span>
                  <span>3D</span>
                </div>

                <div class="preview-canvas">
                  <div class="canvas-badge">Diapositiva 07</div>
                  <div class="canvas-content">
                    <div class="canvas-title">Clase interactiva de geografía</div>
                    <div class="canvas-subtitle">Mapa vivo, audio narrado y capas editables en una sola escena.</div>

                    <div class="canvas-cards">
                      <article>
                        <span>Hotspots</span>
                        <strong>12 activos</strong>
                      </article>
                      <article>
                        <span>Audio guía</span>
                        <strong>3 pistas</strong>
                      </article>
                      <article>
                        <span>Mapa</span>
                        <strong>Zoom + marcadores</strong>
                      </article>
                    </div>
                  </div>
                </div>
              </div>

              <aside class="preview-inspector">
                <div class="inspector-tabs">
                  <span class="is-active">Diseño</span>
                  <span>Datos</span>
                  <span>Animación</span>
                </div>
                <div class="inspector-panel">
                  <div class="inspector-row"></div>
                  <div class="inspector-row short"></div>
                  <div class="inspector-row"></div>
                  <div class="inspector-swatch"></div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </section>

      <section class="feature-grid" id="features">
        <article class="feature-card feature-card-wide glass-card">
          <div class="feature-icon">01</div>
          <h2>Importa decks. Refina cada capa.</h2>
          <p>
            Convierte presentaciones existentes en slides editables y trabaja encima con un flujo visual moderno.
          </p>
          <ul>
            <li>Importación desde PDF y PPTX</li>
            <li>Miniaturas, capas y propiedades en vivo</li>
            <li>Edición visual pensada para velocidad</li>
          </ul>
        </article>

        <article class="feature-card glass-card">
          <div class="feature-icon">02</div>
          <h2>Interactividad sin plugins.</h2>
          <p>
            Añade hotspots, audio, embeds, comparadores, mapas y componentes especiales dentro del mismo canvas.
          </p>
        </article>

        <article class="feature-card glass-card">
          <div class="feature-icon">03</div>
          <h2>Presenta y exporta web.</h2>
          <p>
            Lo que diseñas en el editor se convierte en una experiencia presentable y compartible desde navegador.
          </p>
        </article>
      </section>

      <section class="use-cases" id="casos">
        <div class="section-copy">
          <div class="eyebrow">Hecho para trabajo real</div>
          <h2>No es solo una app de slides.</h2>
          <p>
            Sirve para clases, demos comerciales, onboarding, manuales interactivos y storytelling visual con contenido vivo.
          </p>
        </div>

        <div class="use-case-grid">
          <article class="use-case glass-card">
            <strong>Profesores</strong>
            <p>Convierte una clase estática en una lección con mapa, audio, comparadores y navegación guiada.</p>
          </article>
          <article class="use-case glass-card">
            <strong>Equipos comerciales</strong>
            <p>Construye demos navegables, catálogos y propuestas visuales que se sienten como producto, no como PDF plano.</p>
          </article>
          <article class="use-case glass-card">
            <strong>Creadores</strong>
            <p>Diseña secuencias visuales, portfolios interactivos y experiencias para compartir por link sin sacrificar control.</p>
          </article>
        </div>
      </section>

      <section class="final-cta glass-card">
        <div>
          <div class="eyebrow">DocFlow</div>
          <h2>Empieza con una plantilla o abre el editor vacío.</h2>
          <p>
            La app ya tiene el motor. Ahora también tiene una entrada clara para mostrar lo que hace.
          </p>
        </div>

        <div class="final-actions">
          <RouterLink :to="primaryRoute" class="button-primary">{{ primaryCopy }}</RouterLink>
          <RouterLink to="/devpresent/projects" class="button-secondary">Ir a proyectos</RouterLink>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.landing-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at top, rgba(var(--accent-rgb), 0.14), transparent 26%),
    linear-gradient(180deg, #05070b 0%, #090b11 46%, #05070b 100%);
  color: var(--text-primary);
  padding: 18px;
}

.landing-header {
  max-width: 1380px;
  margin: 0 auto 22px;
  padding: 14px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: var(--radius-xl);
  background: rgba(10, 13, 20, 0.74);
  backdrop-filter: blur(var(--blur-md));
  -webkit-backdrop-filter: blur(var(--blur-md));
  box-shadow: var(--shadow-float);
}

.brand-mark {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  color: inherit;
  text-decoration: none;
}

.brand-icon {
  width: 42px;
  height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(var(--accent-rgb), 0.9), rgba(68, 131, 255, 0.75));
  color: #06111b;
  font-weight: 800;
}

.brand-copy {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.brand-copy strong {
  font-size: 0.96rem;
  letter-spacing: -0.02em;
}

.brand-copy small {
  color: var(--text-tertiary);
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.landing-nav,
.landing-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.landing-nav a,
.nav-link {
  padding: 10px 14px;
  border-radius: var(--radius-pill);
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 0.86rem;
  transition: background-color var(--transition-normal), color var(--transition-normal), transform var(--transition-bounce);
}

.landing-nav a:hover,
.nav-link:hover {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.05);
  transform: translateY(-1px);
}

.nav-link-primary,
.button-primary {
  background: linear-gradient(135deg, rgba(var(--accent-rgb), 0.98), rgba(108, 210, 255, 0.84));
  color: #06111b;
  box-shadow: 0 16px 32px rgba(var(--accent-rgb), 0.18);
}

.nav-link-primary:hover,
.button-primary:hover {
  color: #06111b;
  background: linear-gradient(135deg, rgba(var(--accent-rgb), 1), rgba(126, 214, 255, 0.92));
}

.hero-shell,
.feature-grid,
.use-cases,
.final-cta {
  max-width: 1380px;
  margin: 0 auto;
}

.hero-shell {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr);
  gap: 26px;
  padding: 34px 0 48px;
  align-items: center;
}

.hero-copy {
  padding: 12px 8px;
}

.eyebrow {
  display: inline-flex;
  align-items: center;
  margin-bottom: 18px;
  padding: 8px 12px;
  border-radius: var(--radius-pill);
  background: rgba(var(--accent-rgb), 0.1);
  border: 1px solid rgba(var(--accent-rgb), 0.14);
  color: var(--accent-hover);
  font-size: 0.72rem;
  font-weight: 650;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.hero-copy h1 {
  margin: 0;
  font-size: clamp(3.3rem, 6vw, 6.2rem);
  line-height: 0.96;
  letter-spacing: -0.06em;
}

.hero-copy h1 span {
  display: block;
  color: var(--text-secondary);
}

.hero-copy p {
  max-width: 640px;
  margin-top: 22px;
  color: var(--text-secondary);
  font-size: 1.08rem;
  line-height: 1.7;
}

.hero-actions,
.final-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 28px;
  flex-wrap: wrap;
}

.button-primary,
.button-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  padding: 0 18px;
  border-radius: var(--radius-pill);
  text-decoration: none;
  font-weight: 650;
  transition: transform var(--transition-bounce), background-color var(--transition-normal), color var(--transition-normal), border-color var(--transition-normal);
}

.button-primary {
  color: #06111b;
}

.button-secondary {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: var(--text-primary);
}

.button-secondary:hover {
  transform: translateY(-1px);
  background: rgba(255, 255, 255, 0.07);
}

.proof-strip {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-top: 28px;
}

.proof-strip div,
.use-case,
.feature-card,
.final-cta,
.editor-preview {
  border: 1px solid rgba(255, 255, 255, 0.06);
  background: linear-gradient(180deg, rgba(17, 21, 30, 0.84), rgba(10, 12, 18, 0.76));
  backdrop-filter: blur(var(--blur-md));
  -webkit-backdrop-filter: blur(var(--blur-md));
  box-shadow: var(--shadow-float);
}

.proof-strip div {
  padding: 16px;
  border-radius: var(--radius-lg);
}

.proof-strip strong {
  display: block;
  font-size: 0.95rem;
}

.proof-strip span {
  display: block;
  margin-top: 6px;
  color: var(--text-tertiary);
  font-size: 0.84rem;
}

.hero-stage {
  position: relative;
}

.editor-preview {
  border-radius: 30px;
  overflow: hidden;
}

.preview-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  background: rgba(255, 255, 255, 0.02);
}

.preview-pills {
  display: flex;
  gap: 8px;
}

.preview-pills span {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.18);
}

.preview-pills span:first-child {
  background: rgba(255, 107, 124, 0.8);
}

.preview-pills span:nth-child(2) {
  background: rgba(255, 190, 92, 0.8);
}

.preview-pills span:nth-child(3) {
  background: rgba(87, 211, 155, 0.8);
}

.preview-toolbar {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.preview-toolbar span,
.preview-floating-tools span,
.inspector-tabs span {
  padding: 8px 12px;
  border-radius: var(--radius-pill);
  background: rgba(255, 255, 255, 0.04);
  color: var(--text-secondary);
  font-size: 0.76rem;
}

.preview-toolbar .is-active,
.inspector-tabs .is-active {
  background: rgba(var(--accent-rgb), 0.16);
  color: var(--accent-hover);
}

.preview-body {
  display: grid;
  grid-template-columns: 92px minmax(0, 1fr) 210px;
  min-height: 560px;
}

.preview-sidebar,
.preview-inspector {
  padding: 16px;
  background: rgba(255, 255, 255, 0.015);
}

.preview-sidebar {
  display: flex;
  flex-direction: column;
  gap: 12px;
  border-right: 1px solid rgba(255, 255, 255, 0.05);
}

.mini-slide {
  height: 62px;
  border-radius: 14px;
  background: linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03));
  border: 1px solid rgba(255,255,255,0.05);
}

.mini-slide.is-active {
  background: linear-gradient(180deg, rgba(var(--accent-rgb), 0.18), rgba(var(--accent-rgb), 0.08));
  border-color: rgba(var(--accent-rgb), 0.16);
  box-shadow: inset 3px 0 0 var(--accent-primary);
}

.preview-canvas-wrap {
  position: relative;
  padding: 24px;
  background:
    radial-gradient(circle, rgba(255,255,255,0.14) 0.8px, transparent 1px),
    #000000;
  background-size: 22px 22px;
}

.preview-floating-tools {
  position: absolute;
  left: 50%;
  top: 18px;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  padding: 10px;
  border-radius: var(--radius-xl);
  background: rgba(13, 16, 23, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.preview-canvas {
  position: relative;
  display: flex;
  height: 100%;
  min-height: 440px;
  align-items: center;
  justify-content: center;
  border-radius: 30px;
  background: linear-gradient(160deg, #0d2031 0%, #102a44 44%, #0b1724 100%);
  box-shadow: 0 28px 60px rgba(0, 0, 0, 0.35);
  overflow: hidden;
}

.canvas-badge {
  position: absolute;
  left: 18px;
  top: 18px;
  padding: 8px 12px;
  border-radius: var(--radius-pill);
  background: rgba(255, 255, 255, 0.12);
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.canvas-content {
  max-width: 560px;
  padding: 34px;
  text-align: center;
}

.canvas-title {
  font-size: clamp(2rem, 3vw, 3.2rem);
  font-weight: 680;
  line-height: 1;
  letter-spacing: -0.05em;
}

.canvas-subtitle {
  margin-top: 16px;
  color: rgba(255, 255, 255, 0.74);
  line-height: 1.6;
}

.canvas-cards {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-top: 24px;
}

.canvas-cards article {
  padding: 14px;
  border-radius: var(--radius-lg);
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.canvas-cards span {
  display: block;
  color: rgba(255, 255, 255, 0.66);
  font-size: 0.78rem;
}

.canvas-cards strong {
  display: block;
  margin-top: 8px;
  font-size: 0.92rem;
}

.preview-inspector {
  border-left: 1px solid rgba(255, 255, 255, 0.05);
}

.inspector-tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.inspector-panel {
  margin-top: 18px;
  padding: 16px;
  border-radius: var(--radius-lg);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.inspector-row,
.inspector-swatch {
  height: 40px;
  margin-bottom: 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.06);
}

.inspector-row.short {
  width: 62%;
}

.inspector-swatch {
  height: 84px;
  background: linear-gradient(135deg, rgba(var(--accent-rgb), 0.46), rgba(255, 255, 255, 0.08));
  margin-bottom: 0;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
  padding: 24px 0 44px;
}

.feature-card {
  padding: 22px;
  border-radius: 28px;
}

.feature-card-wide {
  grid-column: span 2;
}

.feature-icon {
  width: 40px;
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  margin-bottom: 18px;
  background: rgba(var(--accent-rgb), 0.12);
  color: var(--accent-hover);
  font-size: 0.8rem;
  font-weight: 700;
}

.feature-card h2,
.section-copy h2,
.final-cta h2 {
  margin: 0;
  font-size: clamp(1.6rem, 3vw, 2.7rem);
  line-height: 1.02;
  letter-spacing: -0.05em;
}

.feature-card p,
.section-copy p,
.final-cta p,
.use-case p {
  margin-top: 14px;
  color: var(--text-secondary);
  line-height: 1.65;
}

.feature-card ul {
  margin: 20px 0 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 10px;
}

.feature-card li {
  color: var(--text-primary);
  padding-left: 18px;
  position: relative;
}

.feature-card li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 10px;
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: var(--accent-primary);
}

.use-cases {
  padding: 30px 0 44px;
}

.section-copy {
  max-width: 760px;
}

.use-case-grid {
  margin-top: 24px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.use-case {
  padding: 22px;
  border-radius: 26px;
}

.use-case strong {
  font-size: 1rem;
}

.final-cta {
  margin-top: 18px;
  margin-bottom: 40px;
  padding: 26px;
  border-radius: 30px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
}

@media (max-width: 1180px) {
  .landing-header,
  .hero-shell,
  .feature-grid,
  .use-case-grid,
  .final-cta {
    grid-template-columns: 1fr;
  }

  .hero-shell {
    grid-template-columns: 1fr;
  }

  .preview-body {
    grid-template-columns: 76px minmax(0, 1fr);
  }

  .preview-inspector {
    display: none;
  }

  .feature-card-wide {
    grid-column: auto;
  }

  .final-cta {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 860px) {
  .landing-page {
    padding: 12px;
  }

  .landing-header {
    flex-wrap: wrap;
  }

  .landing-nav {
    order: 3;
    width: 100%;
    overflow-x: auto;
  }

  .landing-nav a {
    white-space: nowrap;
  }

  .proof-strip,
  .canvas-cards,
  .use-case-grid,
  .feature-grid {
    grid-template-columns: 1fr;
  }

  .preview-body {
    grid-template-columns: 1fr;
  }

  .preview-sidebar {
    display: none;
  }

  .preview-canvas-wrap {
    min-height: 420px;
  }

  .hero-copy h1 {
    font-size: clamp(2.5rem, 12vw, 4rem);
  }
}
</style>
