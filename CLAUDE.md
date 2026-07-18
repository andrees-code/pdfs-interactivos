# CLAUDE.md — Frontend (DocFlow / pdfs-interactivos)

Editor web de presentaciones y PDFs interactivos. Vue 3 + Vite + TypeScript.

Este fichero es para agentes de IA que trabajen en el repo. Backend aparte:
`../pdfs-bakend` (repo git independiente, con su propio CLAUDE.md).

## Comandos

```bash
npm run dev          # servidor de desarrollo (localhost:5173)
npm run build        # build de produccion -> dist/
npm run type-check   # vue-tsc. OJO: falla, ver "Estado conocido"
npm run lint         # eslint --fix
npm run format       # prettier sobre src/
```

## Estado conocido (no son regresiones tuyas)

- **`npm run type-check` falla con ~17 errores preexistentes.** Casi todos son
  `any` implicitos y `strictNullChecks` en el editor y en PublicViewerView.
  El build de Vite **no** hace type-check, por eso compila igual. Si tocas una
  linea que ya sale en la lista, arreglala; no abras un frente para arreglarlas
  todas salvo que te lo pidan.
- **`npm run lint` reporta ~27 errores `no-explicit-any`,** tambien
  preexistentes. Antes habia cuatro ficheros de config de eslint compitiendo y
  el que ganaba estaba mal escrito (hacia spread de una funcion en vez de
  llamarla), asi que las reglas de TypeScript no se aplicaban de verdad. Ahora
  manda `eslint.config.ts`, que es el correcto, y esos `any` han salido a la
  luz. Misma politica: limpia lo que toques, no barras el fichero entero.
- `npm audit` reporta vulnerabilidades en dependencias transitivas. Arreglarlas
  requiere subidas de version con cambios rompientes; no lo hagas de oficio.

## Arquitectura

```
src/
├── main.ts                  # arranque: Pinia + router + CSS global
├── router/index.ts          # TODAS las rutas viven aqui, con guardias de auth
├── views/                   # una por ruta
│   ├── EditorPresentacionesView.vue   # ~18.400 lineas. El nucleo. Ver abajo.
│   ├── PublicViewerView.vue           # visor publico /v/:slug (solo lectura)
│   ├── DevPresent*.vue                # landing, auth, proyectos, plantillas, planes
│   └── Legal*.vue                     # paginas legales estaticas
├── components/              # componentes compartidos (todos en uso)
├── composables/editor/      # usePptxFullImport.ts
├── services/                # llamadas HTTP, una por dominio
├── stores/auth.js           # unico store de Pinia
├── config/api.js            # construccion de URLs del backend
└── utils/auth-storage.ts    # lectura/escritura del token
```

### Rutas y autenticacion

`src/router/index.ts` es la fuente de verdad. Meta-flags:
- `requiresAuth: true` — redirige a `/devpresent/auth` si no hay sesion.
- `requiresGuest: true` — redirige a `/devpresent/projects` si YA hay sesion.

El guardia global lee `useAuthStore()` **dentro** de `beforeEach`, no fuera:
inicializarlo antes rompe el orden de carga de Pinia. No lo muevas.

### URLs del backend (`src/config/api.js`)

En local apunta a `http://localhost:3000` (o `VITE_BACKEND_URL`). En produccion
usa `/api-proxy`, un rewrite same-origin de `vercel.json`, para esquivar CORS y
mixed content. Por eso `USERS_API` acaba con doble prefijo (`/api/api/v1/users`):
el backend tiene `setGlobalPrefix('api')` y ademas controladores en `api/v1/...`.
No es un error tipografico.

## EditorPresentacionesView.vue — el monolito

~18.400 lineas en un solo SFC. Es un fichero incremental, no diseñado de golpe.
Antes de tocarlo, ubicate:

| Bloque | Lineas aprox |
|---|---|
| `<template>` | 1 – 5.107 |
| `<script setup>` | 5.108 – ~15.350 |
| `<style scoped>` | ~15.350 – final |

### Trampa importante: hay DOS `<style>` y DOS apps Vue

Dentro del `<script setup>`, la funcion de exportar a HTML construye una cadena
de texto (`const htmlContent = \`<!DOCTYPE html>…\``) de ~1.200 lineas que
contiene **su propio `<style>` y su propio `<script>` con un segundo
`createApp()`**. Ese bloque empieza en columna 0, asi que:

- Un `grep "^<style"` encuentra PRIMERO el `<style>` del string, no el del SFC.
- Editar CSS ahi dentro NO afecta al editor, solo al HTML exportado, y viceversa.
- Antes de cualquier busca-y-reemplaza global, comprueba en que bloque caes.

### Clusters funcionales (candidatos a extraer a composables)

Motor de animaciones · miniaturas · acciones de IA · catalogos de elementos
(formas, flechas, tablas, QR, mapas mentales, graficos) · capas · fabrica de
elementos · historial undo/redo · autoguardado · importacion PPTX/PDF ·
extraccion de texto de PDF · gestion de paginas · pan/zoom · drag/resize/rotate
con imanes · modo presentacion · exportacion HTML.

Los mas gordos son exportacion HTML e importacion PPTX.

**Si extraes un cluster a un composable:** los `onMounted`/`onUnmounted` estan
repartidos (5 registros en sitios distintos) y el teardown NO esta junto al
setup. Traza que `onUnmounted` limpia que antes de mover nada.

### Convenciones dentro del fichero

- Prefijo `_` en un simbolo = estaba muerto. Se han eliminado todos los que
  habia; si ves uno nuevo, es codigo sin usar, no una convencion de "privado".
- Clases CSS construidas dinamicamente (`'anim-' + tipo`, `'slide-trans-' + x`,
  `` `toast-${tipo}` ``, `` `category-${cat}` ``): **un grep del nombre literal
  no las encuentra.** No borres reglas CSS `anim-*`, `slide-trans-*`, `toast-*`
  ni `category-*` por "no usadas".
- `.pro-header` se define aqui pero pertenece a `<EditorHeader>`: los estilos
  scoped alcanzan la raiz del hijo, pero no sus nodos internos.
- `.drag-protector`, `.layer-pdf`, `.thumb-item` y `.btn-icon-danger` estan
  definidas dos veces a proposito aparente: la segunda sobrescribe propiedades
  concretas de la primera via cascada. Borrar cualquiera cambia el render.
- `fullEditMode` (modo de edicion completa de PPTX) esta permanentemente en
  `false`: su unico control esta comentado en el template ("fix rendimiento
  pendiente"). Toda la rama `importPptxFull`/`convertPptxFullEdit` es por tanto
  inalcanzable en runtime. Esta aparcado, no abandonado — no lo borres.

## Estado del proyecto: como se guarda

El estado del editor se serializa a JSON, se comprime con **gzip via `pako`** y
se manda al backend. `PublicViewerView.vue` hace el camino inverso
(`pako.ungzip`). Si cambias el formato de `documentState`/`slideConfigs`, tienes
que tocar los dos lados a la vez o los proyectos existentes dejan de abrirse.

Las imagenes NO se guardan en el JSON: van a Cloudinary y se guarda la URL.
Existe una migracion (`autoOptimizeProjectImages`) que barre proyectos antiguos
con base64 incrustado y los sube.

## Estilos

Cuatro hojas globales, cargadas en este orden desde `main.ts`:
`fonts.css` → `tailwind.css` → `variables.css` → `global.css`.

`variables.css` define los tokens (`--accent-primary`, `--surface-*`,
`--text-*`, `--border-*`). **Usa siempre los tokens, no hex sueltos**, o el tema
se descuadra. Tailwind convive con CSS scoped; el editor es casi todo CSS
scoped, las vistas nuevas tiran mas de Tailwind.

Las fuentes vienen del CDN de Google en `index.html`, no hay `@font-face` local.

## Al añadir una vista nueva

1. Crea el `.vue` en `src/views/`.
2. Registra la ruta en `src/router/index.ts` con carga perezosa
   (`() => import(...)`) y el meta de auth que toque.
3. Si llama al backend, añade el servicio en `src/services/` y la URL en
   `src/config/api.js` — no pongas URLs a pelo en los componentes.

## Que NO hacer

- No metas URLs del backend directamente en componentes: van en `config/api.js`.
- No añadas dependencias sin comprobar que no hay ya una que sirva
  (`html-to-image` para capturas, `pako` para compresion, `jszip` para PPTX,
  `pdfjs-dist` para PDF, `dompurify` antes de cualquier `v-html`).
- No uses `v-html` sin pasar por `dompurify`.
- No toques `three` ni `@google/model-viewer` a la ligera: `three` se quito como
  dependencia directa porque nadie lo importaba y su version chocaba con el peer
  de `model-viewer`. Volver a añadirlo rompe `npm install`.
