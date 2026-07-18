<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import gsap from 'gsap'

const root = ref<HTMLElement | null>(null)
let ambient: gsap.core.Tween[] = []

/**
 * Escena "Lienzo vivo": la línea superior se dibuja, el cubo 3D entra desde
 * abajo y rota en continuo (tween ambiental, fuera de la timeline), la tarjeta
 * web hace flip, y un cursor fantasma arrastra la esquina mientras el badge
 * cuenta 300 → 340.
 */
const buildTimeline = (): gsap.core.Timeline => {
  const q = gsap.utils.selector(root.value)
  const badge = q('.mc-badge')[0]
  const size = { v: 300 }
  const tl = gsap.timeline({ paused: true })

  tl.fromTo(q('.mc-topline'), { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: 'power2.inOut' })
  tl.fromTo(
    q('.mc-el3d'),
    { y: 46, autoAlpha: 0 },
    { y: 0, autoAlpha: 1, duration: 0.8, ease: 'back.out(1.6)' },
    '-=0.2',
  )
  tl.fromTo(
    q('.mc-web'),
    { rotationY: 15, autoAlpha: 0, transformPerspective: 600 },
    { rotationY: 0, autoAlpha: 1, duration: 0.7, ease: 'power3.out' },
    '-=0.35',
  )
  tl.fromTo(q('.mc-sel'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.25 }, '-=0.15')
  tl.fromTo(
    q('.mc-cursor'),
    { x: 70, y: 80, autoAlpha: 0 },
    { x: 0, y: 0, autoAlpha: 1, duration: 0.55, ease: 'power2.out' },
    '<',
  )
  // Arrastre: cubo crece, cursor acompaña, badge cuenta
  tl.fromTo(q('.mc-el3d'), { scale: 1 }, { scale: 1.12, duration: 0.9, ease: 'power1.inOut' }, '+=0.15')
  tl.fromTo(q('.mc-cursor'), { x: 0, y: 0 }, { x: 15, y: 15, duration: 0.9, ease: 'power1.inOut' }, '<')
  tl.fromTo(
    size,
    { v: 300 },
    {
      v: 340,
      duration: 0.9,
      ease: 'power1.inOut',
      onUpdate: () => {
        if (badge) badge.textContent = `${Math.round(size.v)} × ${Math.round(size.v)}`
      },
    },
    '<',
  )
  return tl
}

onMounted(() => {
  const q = gsap.utils.selector(root.value)
  ambient = [
    gsap.to(q('.mc-cube'), { rotationY: 360, duration: 10, ease: 'none', repeat: -1 }),
    gsap.to(q('.mc-web'), { y: -5, duration: 2.4, yoyo: true, repeat: -1, ease: 'sine.inOut' }),
  ]
})

onUnmounted(() => {
  ambient.forEach((t) => t.kill())
  ambient = []
})

defineExpose({ buildTimeline })
</script>

<template>
  <div class="mc" ref="root">
    <div class="mc-canvas">
      <span class="mc-topline"></span>

      <div class="mc-el3d">
        <div class="mc-cube-persp">
          <div class="mc-cube">
            <span class="mc-face mc-face--front"></span>
            <span class="mc-face mc-face--back"></span>
            <span class="mc-face mc-face--right"></span>
            <span class="mc-face mc-face--left"></span>
            <span class="mc-face mc-face--top"></span>
            <span class="mc-face mc-face--bottom"></span>
          </div>
        </div>
        <div class="mc-sel">
          <i class="mc-handle mc-handle--tl"></i>
          <i class="mc-handle mc-handle--tr"></i>
          <i class="mc-handle mc-handle--bl"></i>
          <i class="mc-handle mc-handle--br"></i>
          <span class="mc-badge">300 × 300</span>
        </div>
      </div>

      <div class="mc-web">
        <div class="mc-web-bar">
          <i class="mc-web-dot"></i>
          <i class="mc-web-dot"></i>
          <i class="mc-web-dot"></i>
          <span class="mc-web-url">wikipedia.org</span>
        </div>
        <div class="mc-web-body">
          <span class="mc-web-line" style="width: 82%"></span>
          <span class="mc-web-line" style="width: 58%"></span>
          <span class="mc-web-line" style="width: 70%"></span>
          <span class="mc-web-block"></span>
        </div>
      </div>

      <svg class="mc-cursor" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
        <path
          d="M5 2 L19 11 L12 12.5 L15.5 19.5 L12.8 20.8 L9.5 13.8 L5 17 Z"
          fill="#1c1008"
          stroke="#fff"
          stroke-width="1.4"
          stroke-linejoin="round"
        />
      </svg>
    </div>
  </div>
</template>

<style scoped>
.mc {
  width: 100%;
}

/* Diapositiva sobre la que viven los elementos */
.mc-canvas {
  position: relative;
  aspect-ratio: 16 / 10;
  background: #ffffff;
  border: 1px solid #e0c8a8;
  border-radius: 10px;
  box-shadow: var(--shadow-float, 0 20px 60px rgba(60, 30, 10, 0.16));
  overflow: hidden;
  background-image: radial-gradient(rgba(160, 100, 50, 0.14) 1px, transparent 1px);
  background-size: 18px 18px;
}

.mc-topline {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #9a3412, var(--accent-primary, #ea580c));
  transform-origin: left center;
}

/* ── Elemento 3D: cubo CSS ── */
.mc-el3d {
  position: absolute;
  left: 12%;
  top: 50%;
  translate: 0 -50%;
  width: 112px;
  height: 112px;
}

.mc-cube-persp {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  perspective: 420px;
}

.mc-cube {
  position: relative;
  width: 64px;
  height: 64px;
  transform-style: preserve-3d;
}

.mc-face {
  position: absolute;
  inset: 0;
  border: 1px solid rgba(234, 88, 12, 0.6);
  background: rgba(234, 88, 12, 0.1);
}
.mc-face--front { transform: translateZ(32px); background: rgba(234, 88, 12, 0.16); }
.mc-face--back { transform: rotateY(180deg) translateZ(32px); }
.mc-face--right { transform: rotateY(90deg) translateZ(32px); background: rgba(234, 88, 12, 0.22); }
.mc-face--left { transform: rotateY(-90deg) translateZ(32px); }
.mc-face--top { transform: rotateX(90deg) translateZ(32px); background: rgba(234, 88, 12, 0.08); }
.mc-face--bottom { transform: rotateX(-90deg) translateZ(32px); }

/* Caja de selección con tiradores */
.mc-sel {
  position: absolute;
  inset: -6px;
  border: 1.5px dashed var(--accent-primary, #ea580c);
  border-radius: 4px;
}

.mc-handle {
  position: absolute;
  width: 8px;
  height: 8px;
  background: #fff;
  border: 1.5px solid var(--accent-primary, #ea580c);
  border-radius: 2px;
}
.mc-handle--tl { top: -5px; left: -5px; }
.mc-handle--tr { top: -5px; right: -5px; }
.mc-handle--bl { bottom: -5px; left: -5px; }
.mc-handle--br { bottom: -5px; right: -5px; }

.mc-badge {
  position: absolute;
  left: 50%;
  bottom: -26px;
  transform: translateX(-50%);
  background: #1c1008;
  color: #fff;
  font-size: 0.58rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  padding: 3px 8px;
  border-radius: 4px;
  white-space: nowrap;
}

/* ── Tarjeta de web embebida ── */
.mc-web {
  position: absolute;
  right: 8%;
  top: 16%;
  width: 44%;
  background: #fff;
  border: 1px solid #e0c8a8;
  border-radius: 8px;
  box-shadow: 0 12px 32px rgba(60, 30, 10, 0.16);
  overflow: hidden;
}

.mc-web-bar {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 7px 9px;
  border-bottom: 1px solid #f0e2ce;
  background: #fdf9f5;
}

.mc-web-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #e0c8a8;
}

.mc-web-url {
  margin-left: 6px;
  flex: 1;
  font-size: 0.55rem;
  color: #8c603a;
  background: #fff;
  border: 1px solid #f0e2ce;
  border-radius: 99px;
  padding: 2px 8px;
}

.mc-web-body {
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.mc-web-line {
  height: 6px;
  border-radius: 3px;
  background: #ecdcc4;
}

.mc-web-block {
  height: 34px;
  border-radius: 5px;
  background: linear-gradient(135deg, rgba(234, 88, 12, 0.18), rgba(234, 88, 12, 0.06));
  border: 1px solid rgba(234, 88, 12, 0.25);
}

/* ── Cursor fantasma ── */
.mc-cursor {
  position: absolute;
  left: calc(12% + 106px);
  top: calc(50% + 42px);
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.25));
  pointer-events: none;
}
</style>
