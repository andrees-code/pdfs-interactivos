<script setup lang="ts">
import { ref } from 'vue'
import gsap from 'gsap'

const root = ref<HTMLElement | null>(null)

/**
 * Escena "Exportar Web": la topbar del editor real (Importar · Guardar ·
 * Exportar Web · Iniciar Presentación). El cursor pulsa "Exportar Web" y la
 * presentación aparece publicada en una tarjeta de navegador con su enlace,
 * rematada por el toast "Enlace copiado".
 */
const buildTimeline = (): gsap.core.Timeline => {
  const q = gsap.utils.selector(root.value)
  const tl = gsap.timeline({ paused: true })

  tl.fromTo(q('.ex-topbar'), { y: -14, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.45, ease: 'power2.out' })
  tl.fromTo(
    q('.ex-toolbtn, .ex-play'),
    { y: -8, autoAlpha: 0 },
    { y: 0, autoAlpha: 1, duration: 0.35, stagger: 0.06, ease: 'power2.out' },
    '-=0.2',
  )

  // El cursor pulsa "Exportar Web"
  tl.fromTo(
    q('.ex-cursor'),
    { x: 120, y: 90, autoAlpha: 0 },
    { x: 0, y: 0, autoAlpha: 1, duration: 0.55, ease: 'power2.out' },
    '+=0.1',
  )
  tl.fromTo(q('.ex-toolbtn--export'), { scale: 1 }, { scale: 0.92, duration: 0.1, ease: 'power2.in' })
  tl.to(q('.ex-toolbtn--export'), { scale: 1, duration: 0.25, ease: 'back.out(3)' })
  tl.to(
    q('.ex-toolbtn--export'),
    { borderColor: 'rgba(234, 88, 12, 0.7)', color: '#9a3412', duration: 0.2 },
    '<',
  )

  // La presentación publicada sube como tarjeta de navegador
  tl.fromTo(
    q('.ex-browser'),
    { y: 40, autoAlpha: 0, scale: 0.94 },
    { y: 0, autoAlpha: 1, scale: 1, duration: 0.65, ease: 'power3.out' },
    '-=0.05',
  )
  tl.fromTo(
    q('.ex-slide-el'),
    { autoAlpha: 0, y: 10 },
    { autoAlpha: 1, y: 0, duration: 0.35, stagger: 0.08, ease: 'power2.out' },
    '-=0.25',
  )

  // Toast "Enlace copiado"
  tl.fromTo(
    q('.ex-toast'),
    { y: 12, autoAlpha: 0, scale: 0.8 },
    { y: 0, autoAlpha: 1, scale: 1, duration: 0.45, ease: 'back.out(2)' },
    '-=0.1',
  )
  return tl
}

defineExpose({ buildTimeline })
</script>

<template>
  <div class="ex" ref="root">
    <div class="ex-topbar">
      <span class="ex-logo">Doc<b>Flow</b></span>
      <span class="ex-toolbtn">Importar</span>
      <span class="ex-toolbtn">Guardar</span>
      <span class="ex-toolbtn ex-toolbtn--export">Exportar Web</span>
      <span class="ex-play">
        <span class="material-symbols-outlined">play_arrow</span>
        Iniciar Presentación
      </span>
    </div>

    <div class="ex-browser">
      <div class="ex-bar">
        <i class="ex-dot"></i>
        <i class="ex-dot"></i>
        <i class="ex-dot"></i>
        <span class="ex-url">tuzona.app/v/mi-presentacion</span>
      </div>
      <div class="ex-slide">
        <span class="ex-slide-el ex-slide-title">BIENVENIDO/A</span>
        <span class="ex-slide-el ex-slide-line" style="width: 48%"></span>
        <span class="ex-slide-el ex-slide-line" style="width: 36%"></span>
        <span class="ex-slide-el ex-slide-cube">
          <span class="material-symbols-outlined">view_in_ar</span>
        </span>
      </div>
      <span class="ex-toast">
        <span class="material-symbols-outlined">link</span>
        Enlace copiado
      </span>
    </div>

    <svg class="ex-cursor" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path
        d="M5 2 L19 11 L12 12.5 L15.5 19.5 L12.8 20.8 L9.5 13.8 L5 17 Z"
        fill="#1c1008"
        stroke="#fff"
        stroke-width="1.4"
        stroke-linejoin="round"
      />
    </svg>
  </div>
</template>

<style scoped>
.ex {
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* ── Topbar del editor ── */
.ex-topbar {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fdf9f5;
  border: 1px solid #e0c8a8;
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(60, 30, 10, 0.1);
  padding: 10px 14px;
}

.ex-logo {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  font-size: 0.82rem;
  color: #0a0604;
  margin-right: 4px;
}

.ex-logo b {
  color: var(--accent-primary, #ea580c);
}

.ex-toolbtn {
  font-size: 0.62rem;
  font-weight: 600;
  color: #7a5030;
  padding: 5px 9px;
  border: 1px solid #e0c8a8;
  border-radius: 6px;
  background: #fff;
  white-space: nowrap;
}

.ex-play {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 0.62rem;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(160deg, #9a3412, var(--accent-primary, #ea580c));
  padding: 6px 11px;
  border-radius: 99px;
  white-space: nowrap;
}

.ex-play .material-symbols-outlined {
  font-size: 0.85rem;
}

/* ── Navegador con la presentación publicada ── */
.ex-browser {
  position: relative;
  border: 1px solid #e0c8a8;
  border-radius: 10px;
  overflow: hidden;
  background: #fff;
  box-shadow: var(--shadow-float, 0 20px 60px rgba(60, 30, 10, 0.16));
}

.ex-bar {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 7px 10px;
  border-bottom: 1px solid #f0e2ce;
  background: #fdf9f5;
}

.ex-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #e0c8a8;
  flex-shrink: 0;
}

.ex-url {
  margin-left: 8px;
  flex: 1;
  font-size: 0.62rem;
  color: #8c603a;
  background: #fff;
  border: 1px solid #f0e2ce;
  border-radius: 99px;
  padding: 2px 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ex-slide {
  position: relative;
  aspect-ratio: 16 / 8;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 9px;
  padding: 0 10%;
  background-image: radial-gradient(rgba(160, 100, 50, 0.12) 1px, transparent 1px);
  background-size: 18px 18px;
}

.ex-slide-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.05rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: #0a0604;
}

.ex-slide-line {
  height: 6px;
  border-radius: 3px;
  background: #ecdcc4;
}

.ex-slide-cube {
  position: absolute;
  right: 12%;
  top: 50%;
  translate: 0 -50%;
  width: 52px;
  height: 52px;
  border-radius: 12px;
  background: linear-gradient(160deg, rgba(234, 88, 12, 0.2), rgba(234, 88, 12, 0.06));
  border: 1px solid rgba(234, 88, 12, 0.4);
  display: grid;
  place-items: center;
}

.ex-slide-cube .material-symbols-outlined {
  color: var(--accent-primary, #ea580c);
  font-size: 1.5rem;
}

.ex-toast {
  position: absolute;
  right: 12px;
  bottom: 12px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: #1c1008;
  color: #fff;
  font-size: 0.62rem;
  font-weight: 700;
  padding: 6px 12px;
  border-radius: 99px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
}

.ex-toast .material-symbols-outlined {
  font-size: 0.85rem;
  color: #fdba74;
}

.ex-cursor {
  position: absolute;
  left: 240px;
  top: 30px;
  z-index: 2;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.25));
  pointer-events: none;
}
</style>
