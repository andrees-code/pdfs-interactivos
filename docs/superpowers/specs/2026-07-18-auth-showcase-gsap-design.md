# Rediseño de la pantalla de autenticación con GSAP

**Fecha**: 2026-07-18
**Vista afectada**: `src/views/DevPresentAuthView.vue`
**Estado**: diseño aprobado, pendiente de plan de implementación

## Problema

La pantalla de acceso (`/devpresent/auth`) no funciona en ninguno de sus frentes:
decoración, estética, animación y textos. El panel izquierdo muestra tres mockups
en un contenedor con `scroll-snap` y un `IntersectionObserver` que solo dispara un
fade-up. El movimiento es pobre, exige que el usuario descubra que hay que hacer
scroll, y las escenas elegidas (Proyectos, Crear proyecto, Editor) enseñan
pantallas administrativas en vez de las capacidades diferenciales del producto.

Además la vista usa un azul suelto (`#7ab4e8`) que no pertenece a ninguna paleta
del proyecto.

## Decisión de paleta

Existen tres paletas en conflicto en el repositorio:

| Fuente | Paleta | Veredicto |
|---|---|---|
| `src/assets/variables.css` | Naranja cálido sobre claro (`--accent-primary: #ea580c`) | **Manda.** Es la del producto real |
| `BRANDING.md` | Indigo/violeta sobre oscuro (`#6366F1`, `#09090b`) | Obsoleta respecto al producto |
| `DevPresentAuthView.vue` | Azul `#7ab4e8` hardcodeado | Se elimina |

Las capturas del editor confirman el naranja cálido. Toda la vista pasa a usar
exclusivamente tokens de `variables.css`. No queda ningún hex suelto.

`BRANDING.md` queda desalineado con el código. Actualizarlo está **fuera del
alcance** de este trabajo, pero merece una tarea aparte.

## Dirección elegida

**Estética**: claro cálido editorial. Fondo crema (`--surface-panel`), acento
naranja, sombras suaves y largas (`--shadow-float`), tipografía grande con aire.
Continuidad visual con el editor al que se entra justo después: cero salto.

**Reproducción**: autoplay cinemático que cede el control al usuario. Sin scroll.

**Contenido**: tres escenas construidas como mockups HTML/CSS nuevos (no capturas
de imagen), animados pieza a pieza.

**Textos**: un titular corto por escena, sin párrafo de apoyo. El mockup explica,
el texto remata.

## Arquitectura

`DevPresentAuthView.vue` mezcla hoy autenticación, mockups y estilos en 972
líneas. Se divide:

```
src/views/DevPresentAuthView.vue              # solo auth: formulario, estado, OAuth
src/components/auth/AuthShowcase.vue          # panel deco: 3 escenas + control
src/components/auth/mocks/MockCanvas.vue      # escena 1: lienzo 3D + web embebida
src/components/auth/mocks/MockProperties.vue  # escena 2: panel de propiedades
src/components/auth/mocks/MockSlides.vue      # escena 3: panel de diapositivas
src/composables/useShowcaseTimeline.ts        # GSAP: timeline maestra y control
```

### Contrato entre piezas

Cada mock expone `defineExpose({ buildTimeline(): gsap.core.Timeline })`. Devuelve
su propia timeline pausada, construida sobre sus refs internas. El mock **no sabe**
que existe autoplay, hover ni navegación manual.

`useShowcaseTimeline` recibe las tres timelines hijas, las anida en una maestra y
expone `{ activeScene, isAutoplay, goToScene(i), pause(), resume() }`.

`AuthShowcase.vue` monta los mocks, llama al composable y pinta los puntos de
progreso. `DevPresentAuthView.vue` solo lo coloca en el layout.

Se puede entender y cambiar cada mock sin leer los otros dos ni el composable.

## Dependencia

`gsap` (^3.13). Desde que Webflow liberó los plugins de club, `SplitText`,
`CustomEase` y `Flip` están disponibles sin licencia de pago.

Plugins usados: core, `SplitText` (titulares letra a letra), `CustomEase` (curva
propia de transición entre escenas), `Flip` (reordenación de miniaturas en la
escena 3). **No se usa `ScrollTrigger`**: el diseño elegido no tiene scroll.

El registro de plugins (`gsap.registerPlugin`) se hace una sola vez, en el
composable, nunca en los componentes.

## Máquina de reproducción

- Timeline maestra con tres timelines hijas anidadas, `paused: true` al crearse.
- Autoplay: `.play()` al montar. Cada escena dura ~5 s (entrada 1,2 s · sostén
  2,8 s · salida 1 s). Ciclo completo ~15 s, `repeat: -1`.
- **Control manual**: click en un punto de progreso o arrastre horizontal sobre el
  panel pausa el autoplay y hace `tweenTo(label)` de la escena elegida. Una vez el
  usuario toma el mando, el autoplay **no se reanuda** en toda la sesión.
- Hover sobre el panel pausa; al salir reanuda, pero solo si sigue en modo
  autoplay.
- `prefers-reduced-motion: reduce`: la timeline se posiciona en el frame final de
  la escena 1 y se queda estática. Los puntos de progreso siguen navegando entre
  escenas, sin animación de transición.
- Teclado: los puntos de progreso son `<button>` reales, navegables con Tab y
  activables con Enter/Espacio. `aria-label` por escena.
- `onUnmounted`: `masterTl.kill()` y `revert()` de cada instancia de `SplitText`.
  Sin fugas de memoria ni nodos DOM partidos.

## Coreografía

**Escena 1 — Lienzo vivo.** El marco de la diapositiva se dibuja: la línea naranja
superior barre de izquierda a derecha. El modelo 3D entra desde abajo con
`back.out` y arranca una rotación continua en Y. La tarjeta de web embebida hace
flip desde 15° con la sombra creciendo. Un cursor fantasma arrastra la esquina del
3D y el badge de tamaño cuenta `300 → 340`.
Titular: *"3D y web dentro de tu diapositiva"*.

**Escena 2 — Propiedades.** El panel entra desde la derecha. Los campos aparecen
en cascada (`stagger: 0.06`). El slider de rotación se desliza de `0°` a `24°` y
el elemento del lienzo rota en sincronía: causa y efecto visibles en la misma
toma. Los checkboxes se marcan con trazo SVG.
Titular: *"Control exacto, sin tocar código"*.

**Escena 3 — Diapositivas.** El contador anima de `1` a `16`. Las miniaturas caen
en cascada desde arriba con rebote y un desenfoque que se resuelve. Una miniatura
se arrastra sola a otra posición y el resto se reacomoda con `Flip`.
Titular: *"Presentaciones completas, no diapositivas sueltas"*.

**Transición entre escenas**: la saliente retrocede en Z con desenfoque, la
entrante llega desde delante. No es un crossfade.

## Panel del formulario

El formulario conserva íntegra su lógica actual: login, registro, recuperación de
contraseña, OAuth de Google y el manejo de `oauthSuccess`/`token`/`user` en la
query. **Nada de eso cambia de comportamiento.** Solo cambia su presentación:

- Tokens de `variables.css` en lugar del azul suelto; el logo móvil pierde el
  `style` en línea.
- Entrada al montar: la tarjeta sube 24 px con opacidad, y sus bloques (cabecera,
  tabs, botón de Google, separador, campos) entran en cascada con `stagger: 0.05`.
  Duración total < 600 ms — nunca retrasa a quien viene a escribir su contraseña.
- Cambio entre login y registro: el campo de usuario no aparece de golpe. Se anima
  su altura y opacidad, y la tarjeta se reajusta sin salto.
- Estado de envío: el botón principal pasa a un spinner con transición de ancho,
  no a un cambio de texto seco.
- Errores: entrada con desplazamiento lateral corto, sin vibración agresiva.
- Bajo `prefers-reduced-motion` todas estas animaciones se reducen a cambios de
  opacidad instantáneos.

## Responsive

- **≥ 1024 px**: dos columnas. Showcase a la izquierda, formulario a la derecha.
- **< 1024 px**: el showcase se oculta por completo (`v-if`, no `display: none`),
  de modo que GSAP ni siquiera construye las timelines y no se paga su coste en
  móvil. El formulario ocupa el ancho, con el logo móvil arriba.

El punto de corte reutiliza el `1024px` que ya usa la vista. Se detecta con
`matchMedia` en el propio componente de la vista para poder desmontar el showcase,
con listener de cambio de tamaño para el caso de rotación o redimensionado.

## Verificación

No hay infraestructura de tests en el proyecto (no hay Vitest ni Playwright
configurados). Montar un arnés de testing queda fuera de alcance. La verificación
es manual y explícita:

1. `npm run dev` y comprobar el ciclo completo de autoplay (~15 s) sin saltos.
2. Click en cada punto de progreso: salta a la escena y el autoplay queda parado.
3. Hover pausa, salir reanuda.
4. Con `prefers-reduced-motion` activado en el sistema: sin movimiento, escena 1
   legible, puntos navegables.
5. Login, registro, recuperación y OAuth de Google siguen funcionando.
6. Por debajo de 1024 px el showcase no se monta y el formulario es usable.
7. Navegar fuera de la vista y volver varias veces: sin fugas (comprobar en el
   panel de rendimiento que no crecen los nodos ni las instancias de GSAP).
8. `npm run build` compila y `npm run lint` no añade errores nuevos sobre la
   línea base conocida.

## Fuera de alcance

- Actualizar `BRANDING.md` a la paleta naranja.
- Tocar `ResetPasswordView.vue` u otras vistas.
- Cambiar la lógica de autenticación o el backend.
- Montar infraestructura de tests automatizados.
