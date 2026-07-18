<script setup lang="ts">
import { ref } from 'vue'
import gsap from 'gsap'

const root = ref<HTMLElement | null>(null)

/** Alto de fila (miniatura 54px + gap 10px): el reorden se mueve en estos saltos */
const ROW_H = 64

/**
 * Escena "Diapositivas": el contador anima 1 → 16, las miniaturas caen en
 * cascada con rebote y desenfoque que se resuelve, y una miniatura se arrastra
 * sola a la posición siguiente mientras la desplazada sube a ocupar su hueco.
 * Solo se mueven las tarjetas; la columna de números queda fija.
 */
const buildTimeline = (): gsap.core.Timeline => {
  const q = gsap.utils.selector(root.value)
  const countEl = q('.ms-count')[0]
  const thumbs = q('.ms-thumb')
  const thumbDown = thumbs[1]!
  const thumbUp = thumbs[2]!
  const count = { v: 1 }
  const tl = gsap.timeline({ paused: true })

  tl.fromTo(q('.ms-head'), { y: -10, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.4 })
  tl.fromTo(
    q('.ms-row'),
    { y: -84, autoAlpha: 0, filter: 'blur(6px)' },
    {
      y: 0,
      autoAlpha: 1,
      filter: 'blur(0px)',
      duration: 0.65,
      stagger: 0.11,
      ease: 'back.out(1.3)',
    },
    '-=0.1',
  )
  tl.fromTo(
    count,
    { v: 1 },
    {
      v: 16,
      duration: 1.1,
      ease: 'power1.out',
      onUpdate: () => {
        if (countEl) countEl.textContent = String(Math.round(count.v))
      },
    },
    '<0.2',
  )
  tl.fromTo(q('.ms-new'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 }, '-=0.4')

  // Reorden: la tarjeta 2 baja un hueco, la 3 sube a ocupar el suyo
  tl.set(thumbDown, { zIndex: 3 }, '+=0.2')
  tl.fromTo(
    thumbDown,
    { scale: 1, boxShadow: '0 1px 4px rgba(60, 30, 10, 0.1)' },
    { scale: 1.05, boxShadow: '0 12px 26px rgba(60, 30, 10, 0.24)', duration: 0.25, ease: 'power2.out' },
  )
  tl.fromTo(thumbDown, { y: 0 }, { y: ROW_H, duration: 0.6, ease: 'power2.inOut' })
  tl.fromTo(thumbUp, { y: 0 }, { y: -ROW_H, duration: 0.55, ease: 'power2.inOut' }, '<0.08')
  tl.to(thumbDown, {
    scale: 1,
    boxShadow: '0 1px 4px rgba(60, 30, 10, 0.1)',
    duration: 0.3,
    ease: 'power2.out',
  })
  tl.set(thumbDown, { zIndex: 1 })
  return tl
}

defineExpose({ buildTimeline })
</script>

<template>
  <div class="ms" ref="root">
    <div class="ms-head">
      <span class="ms-head-title">Diapositivas</span>
      <span class="ms-count">1</span>
    </div>

    <div class="ms-list">
      <div class="ms-row">
        <span class="ms-num">1</span>
        <div class="ms-thumb">
          <span class="ms-t-title"></span>
          <span class="ms-t-sub"></span>
        </div>
      </div>
      <div class="ms-row">
        <span class="ms-num">2</span>
        <div class="ms-thumb">
          <span class="ms-t-line" style="width: 78%"></span>
          <span class="ms-t-line" style="width: 62%"></span>
          <span class="ms-t-line" style="width: 70%"></span>
        </div>
      </div>
      <div class="ms-row">
        <span class="ms-num">3</span>
        <div class="ms-thumb ms-thumb--venn">
          <span class="ms-t-circle ms-t-circle--a"></span>
          <span class="ms-t-circle ms-t-circle--b"></span>
        </div>
      </div>
      <div class="ms-row">
        <span class="ms-num">4</span>
        <div class="ms-thumb ms-thumb--nodes">
          <span class="ms-t-node" style="left: 18%; top: 30%"></span>
          <span class="ms-t-node" style="left: 46%; top: 58%"></span>
          <span class="ms-t-node" style="left: 74%; top: 26%"></span>
          <span class="ms-t-edge" style="left: 22%; top: 44%; width: 26%; transform: rotate(28deg)"></span>
          <span class="ms-t-edge" style="left: 50%; top: 42%; width: 26%; transform: rotate(-32deg)"></span>
        </div>
      </div>
    </div>

    <div class="ms-new">
      <span class="material-symbols-outlined">add</span>
      Nueva diapositiva
    </div>
  </div>
</template>

<style scoped>
.ms {
  width: min(340px, 100%);
  margin: 0 auto;
  background: #fdf9f5;
  border: 1px solid #e0c8a8;
  border-radius: 10px;
  box-shadow: var(--shadow-float, 0 20px 60px rgba(60, 30, 10, 0.16));
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ms-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.ms-head-title {
  font-size: 0.66rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: #7a5030;
}

.ms-count {
  min-width: 26px;
  text-align: center;
  font-size: 0.66rem;
  font-weight: 700;
  color: #9a3412;
  background: rgba(234, 88, 12, 0.1);
  border: 1px solid rgba(234, 88, 12, 0.35);
  border-radius: 99px;
  padding: 2px 7px;
  font-variant-numeric: tabular-nums;
}

.ms-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ms-row {
  display: grid;
  grid-template-columns: 16px 1fr;
  gap: 8px;
  align-items: center;
}

.ms-num {
  font-size: 0.62rem;
  font-weight: 700;
  color: #b08858;
  text-align: center;
  font-variant-numeric: tabular-nums;
}

.ms-thumb {
  position: relative;
  height: 54px;
  background: #fff;
  border: 1px solid #e0c8a8;
  border-radius: 6px;
  box-shadow: 0 1px 4px rgba(60, 30, 10, 0.1);
  padding: 9px 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  overflow: hidden;
}

/* Miniatura 1: portada */
.ms-t-title {
  height: 8px;
  width: 62%;
  border-radius: 3px;
  background: linear-gradient(90deg, #9a3412, var(--accent-primary, #ea580c));
}

.ms-t-sub {
  height: 5px;
  width: 40%;
  border-radius: 3px;
  background: #ecdcc4;
}

/* Miniatura 2: bullets */
.ms-t-line {
  height: 5px;
  border-radius: 3px;
  background: #ecdcc4;
}

/* Miniatura 3: diagrama venn */
.ms-thumb--venn {
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 0;
}

.ms-t-circle {
  width: 26px;
  height: 26px;
  border-radius: 50%;
}

.ms-t-circle--a {
  background: rgba(234, 88, 12, 0.55);
  margin-right: -9px;
}

.ms-t-circle--b {
  background: rgba(217, 119, 6, 0.4);
}

/* Miniatura 4: nodos */
.ms-t-node {
  position: absolute;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--accent-primary, #ea580c);
}

.ms-t-edge {
  position: absolute;
  height: 1.5px;
  background: #d8bc96;
  transform-origin: left center;
}

.ms-new {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  border: 1.5px dashed rgba(234, 88, 12, 0.4);
  border-radius: 6px;
  padding: 8px;
  font-size: 0.64rem;
  font-weight: 700;
  color: #8c603a;
}

.ms-new .material-symbols-outlined {
  font-size: 0.9rem;
  color: var(--accent-primary, #ea580c);
}
</style>
