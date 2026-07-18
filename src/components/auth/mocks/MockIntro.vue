<script setup lang="ts">
import { ref } from 'vue'
import gsap from 'gsap'

const root = ref<HTMLElement | null>(null)

/**
 * Escena de introducción: una diapositiva clásica se monta y, acto seguido,
 * se convierte en página web — el marco de navegador se despliega alrededor y
 * un cursor fantasma pulsa un botón DENTRO de la diapositiva, que responde con
 * un ripple y el badge "interactivo". Es el concepto de la app en una toma:
 * presentaciones tipo PowerPoint que son webs con interactividad.
 */
const buildTimeline = (): gsap.core.Timeline => {
  const q = gsap.utils.selector(root.value)
  const tl = gsap.timeline({ paused: true })

  // 1. La diapositiva se monta como en un editor clásico
  tl.fromTo(
    q('.mi-slide-title'),
    { y: 18, autoAlpha: 0 },
    { y: 0, autoAlpha: 1, duration: 0.5, ease: 'power2.out' },
  )
  tl.fromTo(
    q('.mi-slide-line'),
    { scaleX: 0 },
    { scaleX: 1, duration: 0.4, stagger: 0.08, ease: 'power2.out' },
    '-=0.2',
  )
  tl.fromTo(
    q('.mi-btn'),
    { scale: 0.6, autoAlpha: 0 },
    { scale: 1, autoAlpha: 1, duration: 0.45, ease: 'back.out(2)' },
    '-=0.15',
  )

  // 2. …y se convierte en web: la barra de navegador se despliega encima
  tl.fromTo(
    q('.mi-bar'),
    { height: 0, autoAlpha: 0 },
    { height: 30, autoAlpha: 1, duration: 0.5, ease: 'power3.out' },
    '+=0.25',
  )
  tl.fromTo(
    q('.mi-url'),
    { autoAlpha: 0 },
    { autoAlpha: 1, duration: 0.3 },
    '-=0.2',
  )

  // 3. El cursor pulsa el botón dentro de la diapositiva: interactividad real
  tl.fromTo(
    q('.mi-cursor'),
    { x: 90, y: 70, autoAlpha: 0 },
    { x: 0, y: 0, autoAlpha: 1, duration: 0.55, ease: 'power2.out' },
  )
  tl.fromTo(q('.mi-btn'), { scale: 1 }, { scale: 0.92, duration: 0.1, ease: 'power2.in' })
  tl.to(q('.mi-btn'), { scale: 1, duration: 0.3, ease: 'back.out(3)' })
  tl.fromTo(
    q('.mi-ripple'),
    { scale: 0, autoAlpha: 0.5 },
    { scale: 3.4, autoAlpha: 0, duration: 0.7, ease: 'power1.out' },
    '<',
  )
  tl.fromTo(
    q('.mi-badge'),
    { scale: 0.5, autoAlpha: 0, y: 8 },
    { scale: 1, autoAlpha: 1, y: 0, duration: 0.45, ease: 'back.out(2.2)' },
    '-=0.35',
  )
  return tl
}

defineExpose({ buildTimeline })
</script>

<template>
  <div class="mi" ref="root">
    <div class="mi-frame">
      <div class="mi-bar">
        <i class="mi-dot"></i>
        <i class="mi-dot"></i>
        <i class="mi-dot"></i>
        <span class="mi-url">tuzona.app/v/mi-presentacion</span>
      </div>
      <div class="mi-slide">
        <span class="mi-topline"></span>
        <div class="mi-slide-body">
          <span class="mi-slide-title">BIENVENIDO/A</span>
          <span class="mi-slide-line" style="width: 56%"></span>
          <span class="mi-slide-line" style="width: 42%"></span>
          <span class="mi-btn-wrap">
            <span class="mi-ripple"></span>
            <span class="mi-btn">
              <span class="material-symbols-outlined">play_arrow</span>
              Ver demo
            </span>
          </span>
        </div>
        <span class="mi-badge">
          <span class="material-symbols-outlined">code</span>
          interactivo
        </span>
      </div>
    </div>

    <svg class="mi-cursor" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
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
.mi {
  position: relative;
  width: 100%;
}

.mi-frame {
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid #e0c8a8;
  box-shadow: var(--shadow-float, 0 20px 60px rgba(60, 30, 10, 0.16));
  background: #fff;
}

/* Barra de navegador: nace con altura 0 (la despliega la timeline) */
.mi-bar {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0 10px;
  height: 0;
  overflow: hidden;
  background: #fdf9f5;
  border-bottom: 1px solid #f0e2ce;
}

.mi-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #e0c8a8;
  flex-shrink: 0;
}

.mi-url {
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

.mi-slide {
  position: relative;
  aspect-ratio: 16 / 9;
  background-image: radial-gradient(rgba(160, 100, 50, 0.12) 1px, transparent 1px);
  background-size: 18px 18px;
}

.mi-topline {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #9a3412, var(--accent-primary, #ea580c));
}

.mi-slide-body {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 12px;
  padding: 0 12%;
}

.mi-slide-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: clamp(1.2rem, 2vw, 1.7rem);
  font-weight: 700;
  letter-spacing: 0.04em;
  color: #0a0604;
}

.mi-slide-line {
  height: 7px;
  border-radius: 4px;
  background: #ecdcc4;
}

.mi-btn-wrap {
  position: relative;
  margin-top: 8px;
  display: inline-flex;
}

.mi-btn {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: linear-gradient(160deg, #9a3412, var(--accent-primary, #ea580c));
  color: #fff;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 8px 16px;
  border-radius: 99px;
  box-shadow: 0 6px 18px rgba(154, 52, 18, 0.3);
}

.mi-btn .material-symbols-outlined {
  font-size: 1rem;
}

.mi-ripple {
  position: absolute;
  inset: 0;
  border-radius: 99px;
  background: rgba(234, 88, 12, 0.35);
  pointer-events: none;
}

.mi-badge {
  position: absolute;
  right: 8%;
  bottom: 12%;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.6rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #9a3412;
  background: rgba(234, 88, 12, 0.1);
  border: 1px solid rgba(234, 88, 12, 0.4);
  border-radius: 99px;
  padding: 4px 10px;
}

.mi-badge .material-symbols-outlined {
  font-size: 0.85rem;
}

.mi-cursor {
  position: absolute;
  left: calc(12% + 118px);
  top: 62%;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.25));
  pointer-events: none;
}
</style>
