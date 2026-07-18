<script setup lang="ts">
import { ref } from 'vue'
import gsap from 'gsap'

const root = ref<HTMLElement | null>(null)

/**
 * Escena "Proyectos": la vista de proyectos real — dropzone y trabajo
 * reciente. Un fichero PPTX cae dentro de la zona de arrastre, la barra de
 * progreso se llena y la presentación aparece como tarjeta nueva en la fila.
 */
const buildTimeline = (): gsap.core.Timeline => {
  const q = gsap.utils.selector(root.value)
  const tl = gsap.timeline({ paused: true })

  tl.fromTo(q('.pr-head'), { y: -10, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.4 })
  tl.fromTo(
    q('.pr-drop'),
    { scale: 0.96, autoAlpha: 0 },
    { scale: 1, autoAlpha: 1, duration: 0.45, ease: 'power2.out' },
    '-=0.15',
  )
  tl.fromTo(
    q('.pr-card--old'),
    { y: 16, autoAlpha: 0 },
    { y: 0, autoAlpha: 1, duration: 0.4, stagger: 0.08, ease: 'power2.out' },
    '-=0.2',
  )

  // El fichero cae en la dropzone
  tl.fromTo(
    q('.pr-file'),
    { y: -70, rotation: -8, autoAlpha: 0 },
    { y: 0, rotation: 0, autoAlpha: 1, duration: 0.6, ease: 'back.out(1.4)' },
    '+=0.1',
  )
  tl.to(q('.pr-drop'), {
    borderColor: 'rgba(234, 88, 12, 0.8)',
    backgroundColor: 'rgba(234, 88, 12, 0.05)',
    duration: 0.25,
  }, '<0.3')

  // Progreso de importación
  tl.fromTo(q('.pr-progress'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2 })
  tl.fromTo(
    q('.pr-progress-fill'),
    { scaleX: 0 },
    { scaleX: 1, duration: 0.8, ease: 'power1.inOut' },
    '<',
  )

  // La presentación importada aparece como tarjeta nueva
  tl.fromTo(
    q('.pr-file'),
    { scale: 1, autoAlpha: 1 },
    { scale: 0.5, autoAlpha: 0, duration: 0.3, ease: 'power2.in' },
  )
  tl.to(q('.pr-drop'), {
    borderColor: 'rgba(234, 88, 12, 0.4)',
    backgroundColor: 'rgba(255, 255, 255, 0)',
    duration: 0.3,
  }, '<')
  tl.fromTo(
    q('.pr-card--new'),
    { scale: 0.7, autoAlpha: 0, y: 10 },
    { scale: 1, autoAlpha: 1, y: 0, duration: 0.5, ease: 'back.out(1.8)' },
  )
  return tl
}

defineExpose({ buildTimeline })
</script>

<template>
  <div class="pr" ref="root">
    <div class="pr-head">
      <div>
        <span class="pr-h1">Proyectos</span>
        <span class="pr-sub">Gestiona tus presentaciones</span>
      </div>
      <span class="pr-btn">+ Crear nueva</span>
    </div>

    <div class="pr-drop">
      <span class="pr-file">
        <span class="material-symbols-outlined">description</span>
        PPTX
      </span>
      <span class="material-symbols-outlined pr-drop-icon">upload_file</span>
      <span class="pr-drop-title">Nuevo proyecto</span>
      <span class="pr-drop-desc">Arrastra PDF, PPTX o HTML para importarlo directo</span>
      <span class="pr-progress"><span class="pr-progress-fill"></span></span>
    </div>

    <div class="pr-recent">Trabajo reciente</div>
    <div class="pr-cards">
      <div class="pr-card pr-card--old">
        <div class="pr-thumb pr-thumb--doc"></div>
        <span class="pr-card-title">Mi Nueva Presentación</span>
      </div>
      <div class="pr-card pr-card--old">
        <div class="pr-thumb pr-thumb--dark">
          <span class="material-symbols-outlined">play_arrow</span>
        </div>
        <span class="pr-card-title">Demo interactiva</span>
      </div>
      <div class="pr-card pr-card--new">
        <div class="pr-thumb pr-thumb--fresh">
          <span class="material-symbols-outlined">check_circle</span>
        </div>
        <span class="pr-card-title">Importada.pptx</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pr {
  width: 100%;
  background: #fdf9f5;
  border: 1px solid #e0c8a8;
  border-radius: 10px;
  box-shadow: var(--shadow-float, 0 20px 60px rgba(60, 30, 10, 0.16));
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.pr-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}

.pr-h1 {
  display: block;
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  font-size: 1.05rem;
  color: #0a0604;
}

.pr-sub {
  display: block;
  font-size: 0.66rem;
  color: #8c603a;
  margin-top: 2px;
}

.pr-btn {
  flex-shrink: 0;
  background: linear-gradient(160deg, #9a3412, var(--accent-primary, #ea580c));
  color: #fff;
  font-size: 0.64rem;
  font-weight: 700;
  padding: 7px 12px;
  border-radius: 6px;
  white-space: nowrap;
}

.pr-drop {
  position: relative;
  border: 1.5px dashed rgba(234, 88, 12, 0.4);
  border-radius: 8px;
  padding: 18px 12px 22px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  text-align: center;
}

.pr-file {
  position: absolute;
  top: 12px;
  right: 16%;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #fff;
  border: 1px solid #e0c8a8;
  border-radius: 6px;
  padding: 5px 9px;
  font-size: 0.6rem;
  font-weight: 700;
  color: #9a3412;
  box-shadow: 0 8px 20px rgba(60, 30, 10, 0.18);
  z-index: 1;
}

.pr-file .material-symbols-outlined {
  font-size: 0.9rem;
  color: var(--accent-primary, #ea580c);
}

.pr-drop-icon {
  font-size: 1.5rem;
  color: var(--accent-primary, #ea580c);
}

.pr-drop-title {
  font-size: 0.78rem;
  font-weight: 700;
  color: #0a0604;
}

.pr-drop-desc {
  font-size: 0.62rem;
  color: #8c603a;
  max-width: 260px;
}

.pr-progress {
  position: absolute;
  left: 18%;
  right: 18%;
  bottom: 10px;
  height: 4px;
  border-radius: 2px;
  background: rgba(234, 88, 12, 0.15);
  overflow: hidden;
}

.pr-progress-fill {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, #9a3412, var(--accent-primary, #ea580c));
  transform-origin: left center;
  transform: scaleX(0);
}

.pr-recent {
  font-size: 0.62rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #7a5030;
}

.pr-cards {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.pr-card {
  border: 1px solid #e0c8a8;
  border-radius: 7px;
  overflow: hidden;
  background: #fff;
}

.pr-thumb {
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pr-thumb--doc {
  background: linear-gradient(135deg, #f5ede4, #e8d8c4);
}

.pr-thumb--dark {
  background: linear-gradient(160deg, #1e3a5f, #0d1b2e);
}

.pr-thumb--dark .material-symbols-outlined {
  color: #fff;
  font-size: 1.2rem;
}

.pr-thumb--fresh {
  background: linear-gradient(135deg, rgba(234, 88, 12, 0.18), rgba(234, 88, 12, 0.05));
}

.pr-thumb--fresh .material-symbols-outlined {
  color: var(--accent-primary, #ea580c);
  font-size: 1.2rem;
}

.pr-card-title {
  display: block;
  font-size: 0.6rem;
  padding: 6px 8px;
  color: #5a3010;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
