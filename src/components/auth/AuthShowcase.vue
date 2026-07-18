<script setup lang="ts">
import { onMounted, ref } from 'vue'
import MockIntro from './mocks/MockIntro.vue'
import MockCanvas from './mocks/MockCanvas.vue'
import MockProperties from './mocks/MockProperties.vue'
import MockSlides from './mocks/MockSlides.vue'
import MockProjects from './mocks/MockProjects.vue'
import MockExport from './mocks/MockExport.vue'
import { useShowcaseTimeline } from '@/composables/useShowcaseTimeline'

const sceneTitles = [
  'Como PowerPoint, pero web e interactivo',
  '3D y páginas web dentro de tu diapositiva',
  'Control exacto, sin tocar código',
  'Capas y diapositivas, todo a la vista',
  'Importa PDF, PPTX o HTML y sigue editando',
  'Publica con un enlace, presenta en el navegador',
]

const scene0 = ref<HTMLElement | null>(null)
const scene1 = ref<HTMLElement | null>(null)
const scene2 = ref<HTMLElement | null>(null)
const scene3 = ref<HTMLElement | null>(null)
const scene4 = ref<HTMLElement | null>(null)
const scene5 = ref<HTMLElement | null>(null)
const title0 = ref<HTMLElement | null>(null)
const title1 = ref<HTMLElement | null>(null)
const title2 = ref<HTMLElement | null>(null)
const title3 = ref<HTMLElement | null>(null)
const title4 = ref<HTMLElement | null>(null)
const title5 = ref<HTMLElement | null>(null)
const mock0 = ref<InstanceType<typeof MockIntro> | null>(null)
const mock1 = ref<InstanceType<typeof MockCanvas> | null>(null)
const mock2 = ref<InstanceType<typeof MockProperties> | null>(null)
const mock3 = ref<InstanceType<typeof MockSlides> | null>(null)
const mock4 = ref<InstanceType<typeof MockProjects> | null>(null)
const mock5 = ref<InstanceType<typeof MockExport> | null>(null)

const { activeScene, init, goToScene, next, prev, hoverPause, hoverResume } = useShowcaseTimeline()

// Rueda: carrusel vertical. Umbral + bloqueo corto para no saltar varias
// escenas con un solo gesto de trackpad.
let wheelLock = false
const onWheel = (e: WheelEvent) => {
  if (wheelLock || Math.abs(e.deltaY) < 24) return
  wheelLock = true
  setTimeout(() => {
    wheelLock = false
  }, 600)
  if (e.deltaY > 0) next()
  else prev()
}

// Arrastre vertical (táctil/ratón)
let downY = 0
const onPointerDown = (e: PointerEvent) => {
  downY = e.clientY
}
const onPointerUp = (e: PointerEvent) => {
  const dy = e.clientY - downY
  if (Math.abs(dy) < 48) return
  if (dy < 0) next()
  else prev()
}

onMounted(() => {
  init([
    { el: scene0.value!, title: title0.value!, mockTl: mock0.value!.buildTimeline() },
    { el: scene1.value!, title: title1.value!, mockTl: mock1.value!.buildTimeline() },
    { el: scene2.value!, title: title2.value!, mockTl: mock2.value!.buildTimeline() },
    { el: scene3.value!, title: title3.value!, mockTl: mock3.value!.buildTimeline() },
    { el: scene4.value!, title: title4.value!, mockTl: mock4.value!.buildTimeline() },
    { el: scene5.value!, title: title5.value!, mockTl: mock5.value!.buildTimeline() },
  ])
})
</script>

<template>
  <section
    class="sc"
    aria-label="Demostración del editor"
    @mouseenter="hoverPause"
    @mouseleave="hoverResume"
    @wheel.prevent="onWheel"
    @pointerdown="onPointerDown"
    @pointerup="onPointerUp"
  >
    <div class="sc-stage">
      <article class="sc-scene" ref="scene0">
        <MockIntro ref="mock0" class="sc-mock" />
        <h3 class="sc-title" ref="title0">{{ sceneTitles[0] }}</h3>
      </article>

      <article class="sc-scene" ref="scene1">
        <MockCanvas ref="mock1" class="sc-mock" />
        <h3 class="sc-title" ref="title1">{{ sceneTitles[1] }}</h3>
      </article>

      <article class="sc-scene" ref="scene2">
        <MockProperties ref="mock2" class="sc-mock" />
        <h3 class="sc-title" ref="title2">{{ sceneTitles[2] }}</h3>
      </article>

      <article class="sc-scene" ref="scene3">
        <MockSlides ref="mock3" class="sc-mock" />
        <h3 class="sc-title" ref="title3">{{ sceneTitles[3] }}</h3>
      </article>

      <article class="sc-scene" ref="scene4">
        <MockProjects ref="mock4" class="sc-mock" />
        <h3 class="sc-title" ref="title4">{{ sceneTitles[4] }}</h3>
      </article>

      <article class="sc-scene" ref="scene5">
        <MockExport ref="mock5" class="sc-mock" />
        <h3 class="sc-title" ref="title5">{{ sceneTitles[5] }}</h3>
      </article>
    </div>

    <nav class="sc-dots" aria-label="Escenas de la demostración">
      <button
        v-for="(title, i) in sceneTitles"
        :key="i"
        type="button"
        class="sc-dot"
        :class="{ 'is-active': activeScene === i }"
        :aria-label="`Escena ${i + 1}: ${title}`"
        :aria-current="activeScene === i ? 'true' : undefined"
        @click="goToScene(i)"
      ></button>
    </nav>
  </section>
</template>

<style scoped>
.sc {
  width: 50%;
  height: calc(100vh - 44px);
  position: relative;
  overflow: hidden;
  border: 1px solid #e0c8a8;
  border-radius: 8px;
  box-shadow: 0 4px 24px rgba(60, 30, 10, 0.08);
  background:
    radial-gradient(ellipse at 20% 10%, rgba(234, 88, 12, 0.06) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 85%, rgba(154, 52, 18, 0.04) 0%, transparent 45%),
    #ffffff;
  user-select: none;
  touch-action: none;
}

.sc-stage {
  position: absolute;
  inset: 0;
}

.sc-scene {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 28px;
  padding: 44px 72px 44px 56px;
  visibility: hidden; /* gsap toma el control con autoAlpha en el init */
  will-change: transform, filter, opacity;
}

.sc-mock {
  width: 100%;
  max-width: 560px;
}

.sc-title {
  margin: 0;
  font-family: 'Space Grotesk', sans-serif;
  font-size: clamp(1.35rem, 1.9vw, 1.8rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.2;
  color: #0a0604;
  text-align: center;
  max-width: 460px;
}

/* Puntos de progreso: columna vertical, como el carrusel */
.sc-dots {
  position: absolute;
  right: 22px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  z-index: 5;
}

.sc-dot {
  width: 8px;
  height: 8px;
  padding: 0;
  border: none;
  border-radius: 99px;
  background: rgba(154, 52, 18, 0.25);
  cursor: pointer;
  transition:
    height 0.3s ease,
    background 0.3s ease;
}

.sc-dot:hover {
  background: rgba(154, 52, 18, 0.5);
}

.sc-dot.is-active {
  height: 24px;
  background: var(--accent-primary, #ea580c);
}

.sc-dot:focus-visible {
  outline: 2px solid var(--accent-primary, #ea580c);
  outline-offset: 3px;
}
</style>
