import { onUnmounted, ref } from 'vue'
import gsap from 'gsap'
import { SplitText } from 'gsap/SplitText'

gsap.registerPlugin(SplitText)

export interface ShowcaseScene {
  /** Contenedor absoluto de la escena (mockup + titular) */
  el: HTMLElement
  /** Titular de la escena; se parte en caracteres con SplitText */
  title: HTMLElement
  /** Timeline interna del mockup, en pausa; la maestra la controla */
  mockTl: gsap.core.Timeline
}

// Duraciones por escena (segundos). El sostén real es HOLD + lo que dure la
// timeline del mockup solapada tras la entrada.
const ENTER = 0.85
const HOLD = 2.2
const EXIT = 0.65
/** Desplazamiento vertical del carrusel en las transiciones */
const SHIFT = 72
/** Tras una interacción manual, el autoplay vuelve pasado este tiempo (ms) */
const RESUME_MS = 6500

/**
 * Orquesta el showcase del auth: carrusel vertical con timeline maestra en
 * autoplay, navegación manual por puntos o rueda, pausa por hover y modo
 * estático bajo prefers-reduced-motion.
 *
 * Tiempo y scroll conviven: una interacción manual pausa el autoplay y lo
 * reprograma; si el usuario deja de interactuar unos segundos, el ciclo se
 * reanuda desde la escena en la que se quedó.
 *
 * La navegación manual no reproduce la maestra: hace un desplazamiento
 * vertical corto del contenedor y un seek al punto de "sostén" de la escena
 * destino, donde el mockup está completamente montado. Así no hay estados a
 * medias ni flashes de escenas intermedias.
 */
export function useShowcaseTimeline() {
  const activeScene = ref(0)
  const isAutoplay = ref(true)

  let master: gsap.core.Timeline | null = null
  let splits: SplitText[] = []
  let sceneEls: HTMLElement[] = []
  /** Tiempo global de la maestra en que cada escena está montada y sostenida */
  const holdTimes: number[] = []
  let sceneCount = 0
  let transitioning = false
  let reduced = false
  let hovering = false
  let resumeTimer: ReturnType<typeof setTimeout> | null = null

  const init = (scenes: ShowcaseScene[]) => {
    reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    sceneCount = scenes.length
    sceneEls = scenes.map((s) => s.el)
    // 'words,chars': los caracteres se animan pero el salto de línea respeta palabras
    splits = scenes.map((s) => new SplitText(s.title, { type: 'words,chars' }))
    gsap.set(sceneEls, { autoAlpha: 0 })

    master = gsap.timeline({ paused: true, repeat: -1 })
    let cursor = 0

    scenes.forEach((s, i) => {
      const tl = gsap.timeline()
      tl.call(() => {
        activeScene.value = i
      })
      tl.set(s.el, { zIndex: 2 })
      // Carrusel vertical: la escena entrante sube desde abajo y se enfoca
      tl.fromTo(
        s.el,
        { autoAlpha: 0, y: SHIFT, scale: 0.98, filter: 'blur(12px)' },
        { autoAlpha: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: ENTER, ease: 'power3.out' },
      )
      tl.fromTo(
        splits[i]!.chars,
        { yPercent: 70, autoAlpha: 0 },
        { yPercent: 0, autoAlpha: 1, duration: 0.5, stagger: 0.014, ease: 'power2.out' },
        '<0.2',
      )
      tl.add(s.mockTl.paused(false), ENTER * 0.55)
      holdTimes[i] = cursor + tl.duration()
      tl.to({}, { duration: HOLD })
      // La saliente se va hacia arriba con desenfoque
      tl.to(s.el, {
        autoAlpha: 0,
        y: -SHIFT,
        scale: 0.98,
        filter: 'blur(10px)',
        duration: EXIT,
        ease: 'power2.in',
      })
      tl.set(s.el, { zIndex: 1 })
      master!.add(tl, cursor)
      cursor += tl.duration()
    })

    if (reduced) {
      // Sin movimiento: escena 1 montada y estática. Los puntos siguen navegando.
      isAutoplay.value = false
      master.pause()
      master.seek(holdTimes[0]!)
      activeScene.value = 0
    } else {
      master.play()
    }
  }

  /** Reprograma la vuelta del autoplay tras un periodo sin interacción */
  const scheduleResume = () => {
    if (resumeTimer) clearTimeout(resumeTimer)
    if (reduced) return
    resumeTimer = setTimeout(() => {
      if (!master || transitioning) {
        scheduleResume()
        return
      }
      isAutoplay.value = true
      // La maestra quedó en el sostén de la escena actual: continúa desde ahí
      if (!hovering) master.play()
    }, RESUME_MS)
  }

  const goToScene = (i: number, dir?: 1 | -1) => {
    if (!master || i === activeScene.value || transitioning) return
    const direction: 1 | -1 = dir ?? (i > activeScene.value ? 1 : -1)
    isAutoplay.value = false
    master.pause()
    scheduleResume()

    if (reduced) {
      master.seek(holdTimes[i]!)
      activeScene.value = i
      return
    }

    transitioning = true
    const from = sceneEls[activeScene.value]!
    const to = sceneEls[i]!
    const swap = gsap.timeline({
      onComplete: () => {
        transitioning = false
      },
    })
    // Misma dirección vertical que el gesto: avanzar = subir, retroceder = bajar
    swap.to(from, {
      autoAlpha: 0,
      y: -SHIFT * direction,
      scale: 0.98,
      filter: 'blur(8px)',
      duration: 0.3,
      ease: 'power2.in',
    })
    swap.add(() => {
      // El seek deja la escena destino completa (mockup incluido) y el resto ocultas
      master!.seek(holdTimes[i]!)
      activeScene.value = i
    })
    swap.fromTo(
      to,
      { autoAlpha: 0, y: SHIFT * direction, scale: 0.98, filter: 'blur(10px)' },
      { autoAlpha: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 0.5, ease: 'power3.out' },
    )
  }

  const next = () => goToScene((activeScene.value + 1) % sceneCount, 1)
  const prev = () => goToScene((activeScene.value - 1 + sceneCount) % sceneCount, -1)

  const hoverPause = () => {
    hovering = true
    if (isAutoplay.value) master?.pause()
  }

  const hoverResume = () => {
    hovering = false
    if (isAutoplay.value) master?.play()
  }

  onUnmounted(() => {
    if (resumeTimer) clearTimeout(resumeTimer)
    master?.kill()
    master = null
    splits.forEach((s) => s.revert())
    splits = []
  })

  return { activeScene, isAutoplay, init, goToScene, next, prev, hoverPause, hoverResume }
}
