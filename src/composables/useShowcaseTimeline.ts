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
const ENTER = 0.9
const HOLD = 2.8
const EXIT = 0.7

/**
 * Orquesta el showcase del auth: timeline maestra en autoplay con las tres
 * escenas anidadas, navegación manual (que desactiva el autoplay de forma
 * permanente), pausa por hover y modo estático bajo prefers-reduced-motion.
 *
 * La navegación manual no reproduce la maestra: hace un fundido corto del
 * contenedor y un seek al punto de "sostén" de la escena destino, donde el
 * mockup está completamente montado. Así no hay estados a medias ni flashes
 * de escenas intermedias.
 */
export function useShowcaseTimeline() {
  const activeScene = ref(0)
  const isAutoplay = ref(true)

  let master: gsap.core.Timeline | null = null
  let splits: SplitText[] = []
  let sceneEls: HTMLElement[] = []
  /** Tiempo global de la maestra en que cada escena está montada y sostenida */
  const holdTimes: number[] = []
  let transitioning = false
  let reduced = false

  const init = (scenes: ShowcaseScene[]) => {
    reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
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
      // La escena entrante llega desde delante (escala > 1) y se enfoca
      tl.fromTo(
        s.el,
        { autoAlpha: 0, scale: 1.1, filter: 'blur(14px)' },
        { autoAlpha: 1, scale: 1, filter: 'blur(0px)', duration: ENTER, ease: 'power3.out' },
      )
      tl.fromTo(
        splits[i]!.chars,
        { yPercent: 70, autoAlpha: 0 },
        { yPercent: 0, autoAlpha: 1, duration: 0.5, stagger: 0.016, ease: 'power2.out' },
        '<0.2',
      )
      tl.add(s.mockTl.paused(false), ENTER * 0.55)
      holdTimes[i] = cursor + tl.duration()
      tl.to({}, { duration: HOLD })
      // La saliente retrocede en Z con desenfoque
      tl.to(s.el, {
        autoAlpha: 0,
        scale: 0.93,
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

  const goToScene = (i: number) => {
    if (!master || i === activeScene.value || transitioning) return
    // El usuario toma el mando: el autoplay no vuelve en toda la sesión
    isAutoplay.value = false
    master.pause()

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
    swap.to(from, { autoAlpha: 0, scale: 0.95, filter: 'blur(8px)', duration: 0.3, ease: 'power2.in' })
    swap.add(() => {
      // El seek deja la escena destino completa (mockup incluido) y el resto ocultas
      master!.seek(holdTimes[i]!)
      activeScene.value = i
    })
    swap.fromTo(
      to,
      { autoAlpha: 0, scale: 1.07, filter: 'blur(10px)' },
      { autoAlpha: 1, scale: 1, filter: 'blur(0px)', duration: 0.5, ease: 'power3.out' },
    )
  }

  const hoverPause = () => {
    if (isAutoplay.value) master?.pause()
  }

  const hoverResume = () => {
    if (isAutoplay.value) master?.play()
  }

  onUnmounted(() => {
    master?.kill()
    master = null
    splits.forEach((s) => s.revert())
    splits = []
  })

  return { activeScene, isAutoplay, init, goToScene, hoverPause, hoverResume }
}
