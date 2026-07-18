<script setup lang="ts">
import { ref } from 'vue'
import gsap from 'gsap'

const root = ref<HTMLElement | null>(null)

/**
 * Escena "Propiedades": el panel entra desde la derecha, los grupos caen en
 * cascada, y el slider de rotación se mueve 0° → 24° con el elemento del
 * mini-lienzo rotando en sincronía (causa y efecto en la misma toma). Los
 * checkboxes se marcan con trazo SVG.
 */
const buildTimeline = (): gsap.core.Timeline => {
  const q = gsap.utils.selector(root.value)
  const degEl = q('.mp-deg')[0]
  const deg = { v: 0 }
  const tl = gsap.timeline({ paused: true })

  tl.fromTo(
    q('.mp-panel'),
    { x: 44, autoAlpha: 0 },
    { x: 0, autoAlpha: 1, duration: 0.6, ease: 'power3.out' },
  )
  tl.fromTo(
    q('.mp-canvas'),
    { y: 18, autoAlpha: 0 },
    { y: 0, autoAlpha: 1, duration: 0.5, ease: 'power2.out' },
    '-=0.4',
  )
  tl.fromTo(
    q('.mp-group'),
    { y: 16, autoAlpha: 0 },
    { y: 0, autoAlpha: 1, duration: 0.45, stagger: 0.06, ease: 'power2.out' },
    '-=0.25',
  )

  // Slider y rotación del elemento, sincronizados
  tl.fromTo(q('.mp-thumb'), { x: 0 }, { x: 84, duration: 1, ease: 'power1.inOut' }, '+=0.2')
  tl.fromTo(q('.mp-fill'), { scaleX: 0 }, { scaleX: 0.7, duration: 1, ease: 'power1.inOut' }, '<')
  tl.fromTo(q('.mp-shape'), { rotation: 0 }, { rotation: 24, duration: 1, ease: 'power1.inOut' }, '<')
  tl.fromTo(
    deg,
    { v: 0 },
    {
      v: 24,
      duration: 1,
      ease: 'power1.inOut',
      onUpdate: () => {
        if (degEl) degEl.textContent = `${Math.round(deg.v)}°`
      },
    },
    '<',
  )

  // Checkboxes: trazo SVG
  tl.fromTo(
    q('.mp-check-path'),
    { strokeDashoffset: 14 },
    { strokeDashoffset: 0, duration: 0.35, stagger: 0.2, ease: 'power2.out' },
    '+=0.1',
  )
  return tl
}

defineExpose({ buildTimeline })
</script>

<template>
  <div class="mp" ref="root">
    <div class="mp-canvas">
      <div class="mp-shape">
        <span class="material-symbols-outlined">view_in_ar</span>
      </div>
    </div>

    <div class="mp-panel">
      <div class="mp-head">
        <span class="mp-head-title">Propiedades</span>
        <span class="mp-chip">3D</span>
      </div>

      <div class="mp-group">
        <span class="mp-glabel">Geometría</span>
        <div class="mp-grid">
          <span class="mp-input"><b>X</b> 16.5</span>
          <span class="mp-input"><b>Y</b> 71</span>
          <span class="mp-input"><b>W</b> 300</span>
          <span class="mp-input"><b>H</b> 300</span>
        </div>
      </div>

      <div class="mp-group">
        <span class="mp-glabel">Rotación</span>
        <div class="mp-slider">
          <span class="mp-track"><span class="mp-fill"></span></span>
          <span class="mp-thumb"></span>
          <span class="mp-deg">0°</span>
        </div>
      </div>

      <div class="mp-group">
        <span class="mp-glabel">Fuente multimedia</span>
        <span class="mp-upload">
          <span class="material-symbols-outlined">upload</span>
          Subir archivo
        </span>
        <span class="mp-url">modelviewer.dev/shared-assets…</span>
      </div>

      <div class="mp-group mp-checks">
        <span class="mp-check">
          <span class="mp-checkbox">
            <svg viewBox="0 0 12 10" aria-hidden="true">
              <polyline
                class="mp-check-path"
                points="1.5,5.5 4.5,8.5 10.5,1.5"
                fill="none"
                stroke="#fff"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-dasharray="14"
              />
            </svg>
          </span>
          Auto-rotar
        </span>
        <span class="mp-check">
          <span class="mp-checkbox">
            <svg viewBox="0 0 12 10" aria-hidden="true">
              <polyline
                class="mp-check-path"
                points="1.5,5.5 4.5,8.5 10.5,1.5"
                fill="none"
                stroke="#fff"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-dasharray="14"
              />
            </svg>
          </span>
          Controles
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mp {
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 220px;
  gap: 16px;
  align-items: stretch;
}

/* ── Mini lienzo con el elemento que rota ── */
.mp-canvas {
  background: #fff;
  border: 1px solid #e0c8a8;
  border-radius: 10px;
  box-shadow: 0 12px 32px rgba(60, 30, 10, 0.12);
  display: grid;
  place-items: center;
  min-height: 280px;
  background-image: radial-gradient(rgba(160, 100, 50, 0.14) 1px, transparent 1px);
  background-size: 18px 18px;
}

.mp-shape {
  width: 76px;
  height: 76px;
  border-radius: 14px;
  background: linear-gradient(160deg, #9a3412, var(--accent-primary, #ea580c));
  display: grid;
  place-items: center;
  box-shadow: 0 10px 26px rgba(154, 52, 18, 0.35);
}

.mp-shape .material-symbols-outlined {
  color: #fff;
  font-size: 2rem;
}

/* ── Panel de propiedades ── */
.mp-panel {
  background: #fdf9f5;
  border: 1px solid #e0c8a8;
  border-radius: 10px;
  box-shadow: var(--shadow-float, 0 20px 60px rgba(60, 30, 10, 0.16));
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.mp-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.mp-head-title {
  font-size: 0.62rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #7a5030;
}

.mp-chip {
  font-size: 0.56rem;
  font-weight: 700;
  color: #9a3412;
  background: rgba(234, 88, 12, 0.1);
  border: 1px solid rgba(234, 88, 12, 0.4);
  border-radius: 99px;
  padding: 2px 8px;
}

.mp-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.mp-glabel {
  font-size: 0.54rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #8c603a;
}

.mp-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 5px;
}

.mp-input {
  background: #fff;
  border: 1px solid #ecdcc4;
  border-radius: 5px;
  padding: 4px 7px;
  font-size: 0.6rem;
  color: #0a0604;
  font-variant-numeric: tabular-nums;
}

.mp-input b {
  color: #b08858;
  font-weight: 700;
  margin-right: 4px;
}

/* Slider */
.mp-slider {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  height: 18px;
}

.mp-track {
  position: relative;
  flex: 1;
  height: 4px;
  border-radius: 2px;
  background: #ecdcc4;
  overflow: hidden;
}

.mp-fill {
  position: absolute;
  inset: 0;
  background: var(--accent-primary, #ea580c);
  transform-origin: left center;
  transform: scaleX(0);
}

.mp-thumb {
  position: absolute;
  left: 0;
  top: 50%;
  margin-top: -7px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #fff;
  border: 2px solid var(--accent-primary, #ea580c);
  box-shadow: 0 2px 6px rgba(60, 30, 10, 0.2);
}

.mp-deg {
  font-size: 0.62rem;
  font-weight: 700;
  color: #9a3412;
  min-width: 24px;
  text-align: right;
  font-variant-numeric: tabular-nums;
}

/* Fuente multimedia */
.mp-upload {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  border: 1px solid #e0c8a8;
  background: #fff;
  border-radius: 5px;
  padding: 5px;
  font-size: 0.58rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #7a5030;
}

.mp-upload .material-symbols-outlined {
  font-size: 0.8rem;
  color: var(--accent-primary, #ea580c);
}

.mp-url {
  background: #fff;
  border: 1px solid #ecdcc4;
  border-radius: 5px;
  padding: 4px 7px;
  font-size: 0.56rem;
  color: #8c603a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Checkboxes */
.mp-checks {
  gap: 5px;
}

.mp-check {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 0.62rem;
  color: #5a3010;
  font-weight: 600;
}

.mp-checkbox {
  width: 14px;
  height: 14px;
  border-radius: 4px;
  background: var(--accent-primary, #ea580c);
  display: grid;
  place-items: center;
  flex-shrink: 0;
}

.mp-checkbox svg {
  width: 9px;
  height: 8px;
}
</style>
