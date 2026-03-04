<template>
  <div>
    <navbar-component />
    <div class="pro-editor-app">
      <header class="pro-header">
        <div class="header-left">
          <div class="pro-logo">
            <span class="logo-icon">🚀</span>
            <span class="logo-text">Present<span class="text-accent">Pro</span></span>
          </div>
          <div class="file-menu">
            <label class="menu-item">
              <input
                type="file"
                @change="handleFileUpload"
                accept=".pdf, .pptx, .ppsx, .potx"
                hidden
              />
              Archivo <span class="shortcut">Ctrl+O</span>
            </label>
            <button class="menu-item" :disabled="!hasDoc" @click="exportPresentation">
              Exportar Web <span class="shortcut">Ctrl+E</span>
            </button>
          </div>
        </div>

        <div class="header-center" v-if="hasDoc">
          <div class="zoom-controls">
            <button @click="changeZoom(-0.1)" class="tool-btn">➖</button>
            <span class="zoom-level">{{ Math.round(zoom * 100) }}%</span>
            <button @click="changeZoom(0.1)" class="tool-btn">➕</button>
            <button @click="fitToScreen" class="tool-btn" title="Ajustar a pantalla">🔲</button>
          </div>
        </div>

        <div class="header-right" v-if="hasDoc">
          <button class="btn-play" @click="togglePlayMode">▶ Modo Presentación</button>
        </div>
      </header>

      <div class="pro-workspace">
        <aside class="pro-sidebar left-sidebar" v-if="hasDoc && !playMode">
          <div class="panel-header">Índice del Documento</div>
          <div class="tree-view">
            <div v-for="page in numPages" :key="page" class="tree-node">
              <div
                class="tree-node-title"
                :class="{ 'is-active': pageNum === page }"
                @click="changePageTo(page)"
              >
                📄 Diapositiva {{ page }}
              </div>
              <div class="tree-children" v-if="pageNum === page">
                <div
                  v-for="el in currentPageElements"
                  :key="el.id"
                  class="tree-child"
                  :class="{ 'is-selected': selectedElementId === el.id }"
                  @click="selectElement(el.id)"
                >
                  <span class="icon">{{ getIconForType(el.type) }}</span>
                  {{ el.name || el.type }}
                </div>
              </div>
            </div>
            <div class="sidebar-footer">
              <button class="btn-secondary w-100" @click="addNewSlide">+ Nueva Diapositiva</button>
            </div>
          </div>
        </aside>

        <aside class="pro-toolbar" v-if="hasDoc && !playMode">
          <div class="tool-group">
            <button
              class="tool-btn large"
              :class="{ active: activeTool === 'select' }"
              @click="activeTool = 'select'"
              title="Seleccionar (V)"
            >
              👆
            </button>
            <div class="tool-divider"></div>
            <button
              class="tool-btn large"
              :class="{ active: activeTool === 'text' }"
              @click="activeTool = 'text'"
              title="Añadir Texto (T)"
            >
              T
            </button>
            <button
              class="tool-btn large"
              :class="{ active: activeTool === 'shape' }"
              @click="activeTool = 'shape'"
              title="Añadir Forma (F)"
            >
              🟥
            </button>
            <button
              class="tool-btn large"
              :class="{ active: activeTool === 'image' }"
              @click="activeTool = 'image'"
              title="Añadir Imagen (I)"
            >
              🖼️
            </button>
            <button
              class="tool-btn large"
              :class="{ active: activeTool === 'video' }"
              @click="activeTool = 'video'"
              title="Añadir Video (P)"
            >
              🎥
            </button>
            <button
              class="tool-btn large"
              :class="{ active: activeTool === '3d' }"
              @click="activeTool = '3d'"
              title="Añadir Modelo 3D (M)"
            >
              🧊
            </button>
            <div class="tool-divider"></div>
            <button
              class="tool-btn large"
              :class="{ active: activeTool === 'interactive' }"
              @click="activeTool = 'interactive'"
              title="Hotspot Interactivo (H)"
            >
              ⚡
            </button>
            <button
              class="tool-btn large"
              :class="{ active: activeTool === 'link' }"
              @click="activeTool = 'link'"
              title="Botón de Navegación (L)"
            >
              🔗
            </button>
            <button
              class="tool-btn large"
              :class="{ active: activeTool === 'accordion' }"
              @click="activeTool = 'accordion'"
              title="Acordeón Desplegable (A)"
            >
              📑
            </button>
          </div>
        </aside>

        <main class="pro-canvas-area" ref="workspaceRef">
          <button v-if="playMode" class="btn-exit-play" @click="togglePlayMode">
            ✖ Salir de Presentación (Esc)
          </button>

          <div v-if="!hasDoc" class="empty-workspace">
            <div class="empty-box">
              <span class="empty-icon">🎬</span>
              <h3>Crea Experiencias Interactivas</h3>
              <p>Sube un PDF para máxima fidelidad, o un PPTX para extraer sus fondos.</p>
              <div class="button-group mt-4">
                <button class="btn-secondary" @click="createBlankProject">
                  ✨ Crear en Blanco
                </button>
                <label class="btn-primary">
                  <input
                    type="file"
                    @change="handleFileUpload"
                    accept=".pdf, .pptx, .ppsx, .potx"
                    hidden
                  />
                  📂 Cargar Base (PDF/PPTX)
                </label>
              </div>
            </div>
          </div>

          <div v-show="hasDoc" class="canvas-wrapper" :class="{ 'play-mode-active': playMode }">
            <div
              class="canvas-shadow-box layer-engine"
              :style="{
                transform: `scale(${zoom})`,
                width: `${baseWidth}px`,
                height: `${baseHeight}px`,
                backgroundColor: slideConfigs[pageNum]?.bgColor || '#ffffff',
                backgroundImage: slideConfigs[pageNum]?.bgImage
                  ? `url(${slideConfigs[pageNum].bgImage})`
                  : 'none',
                backgroundSize: 'cover',
              }"
              @click.self="handleCanvasClick"
            >
              <canvas ref="pdfCanvas" class="layer-pdf" v-show="docType === 'pdf'"></canvas>

              <div
                v-if="
                  docType === 'pptx' &&
                  !playMode &&
                  !slideConfigs[pageNum]?.bgImage &&
                  slideConfigs[pageNum]?.bgColor === '#ffffff'
                "
                class="pptx-placeholder"
              >
                <span style="font-size: 3rem">📊</span>
                <p>Estructura PPTX Cargada ({{ baseWidth }}x{{ baseHeight }})</p>
                <small
                  >No se detectó imagen de fondo en el XML. Usa el panel derecho para asignar
                  una.</small
                >
              </div>

              <div
                v-for="el in currentPageElements"
                :key="el.id"
                class="interactive-element"
                :class="{
                  'is-selected': selectedElementId === el.id && !playMode,
                  'is-clickable': playMode && (el.type === 'link' || el.type === 'interactive'),
                }"
                :style="{
                  left: `${el.x}px`,
                  top: `${el.y}px`,
                  width: `${el.width}px`,
                  height: `${el.height}px`,
                  zIndex: el.zIndex,
                }"
                @mousedown.stop="startDrag($event, el)"
              >
                <div
                  v-if="el.type === 'text'"
                  class="el-text"
                  :style="{
                    color: el.color,
                    fontSize: `${el.fontSize}px`,
                    fontWeight: el.fontWeight,
                  }"
                >
                  {{ el.content }}
                </div>

                <div
                  v-else-if="el.type === 'shape'"
                  class="el-shape"
                  :style="{
                    backgroundColor: el.bgColor,
                    borderRadius: `${el.borderRadius}px`,
                    border: `${el.borderWidth}px solid ${el.borderColor}`,
                    opacity: el.opacity,
                  }"
                ></div>

                <div v-else-if="el.type === 'image'" class="el-image-container">
                  <img
                    v-if="el.src"
                    :src="el.src"
                    class="el-content-fitted"
                    :style="{ objectFit: el.fit, opacity: el.opacity }"
                    draggable="false"
                  />
                  <div v-else class="placeholder-box">🖼️ Sin Imagen</div>
                </div>

                <div v-else-if="el.type === 'video'" class="el-video-container">
                  <template v-if="el.src">
                    <iframe
                      v-if="isYouTube(el.src)"
                      :src="getYouTubeEmbedUrl(el.src)"
                      class="el-content-fitted"
                      frameborder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowfullscreen
                      :style="{ pointerEvents: playMode ? 'auto' : 'none' }"
                    ></iframe>
                    <video
                      v-else
                      :src="el.src"
                      :controls="playMode"
                      :autoplay="playMode && el.autoplay"
                      :loop="el.loop"
                      class="el-content-fitted"
                      :style="{ objectFit: el.fit }"
                    ></video>
                  </template>
                  <div v-else class="placeholder-box">🎥 Sin Vídeo / Pega enlace</div>
                  <div v-if="!playMode" class="drag-protector"></div>
                </div>

                <div v-else-if="el.type === '3d'" class="el-3d">
                  <model-viewer
                    v-if="el.src"
                    :src="el.src"
                    auto-rotate
                    camera-controls
                    style="width: 100%; height: 100%"
                    :disable-zoom="!playMode"
                  ></model-viewer>
                  <div v-else class="placeholder-box">🧊 Modelo 3D Vacío</div>
                  <div v-if="!playMode" class="drag-protector"></div>
                </div>

                <div
                  v-else-if="el.type === 'interactive'"
                  class="el-interactive"
                  @click.stop="triggerInteraction(el)"
                >
                  <div
                    class="hotspot-pulse"
                    :style="{ backgroundColor: el.color, boxShadow: `0 0 15px ${el.color}` }"
                  ></div>
                  <div v-if="playMode && el.isOpen" class="interactive-modal" @click.stop>
                    <h4 class="modal-title">{{ el.modalTitle }}</h4>
                    <p v-html="el.contentHtml"></p>
                  </div>
                </div>

                <div
                  v-else-if="el.type === 'link'"
                  class="el-link"
                  :style="{
                    backgroundColor: el.bgColor,
                    color: el.color,
                    borderRadius: `${el.borderRadius}px`,
                  }"
                  @click.stop="playMode ? changePageTo(el.targetPage) : null"
                >
                  {{ el.text }}
                </div>

                <div
                  v-else-if="el.type === 'accordion'"
                  class="el-accordion"
                  :style="{ backgroundColor: el.bgColor, color: el.color }"
                >
                  <div v-for="(item, idx) in el.items" :key="idx" class="accordion-item">
                    <div
                      class="accordion-header"
                      @click.stop="playMode ? (item.isOpen = !item.isOpen) : null"
                    >
                      <span>{{ item.title }}</span>
                      <span>{{ item.isOpen ? '▲' : '▼' }}</span>
                    </div>
                    <div
                      v-show="!playMode || item.isOpen"
                      class="accordion-content"
                      :class="{ 'is-preview': !playMode }"
                    >
                      {{ item.content }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        <aside class="pro-sidebar right-sidebar" v-if="hasDoc && !playMode">
          <div class="panel-header">Inspector</div>

          <div class="panel-content" v-if="selectedElement">
            <div class="prop-group">
              <div class="badge-type">{{ selectedElement.type.toUpperCase() }}</div>
            </div>

            <div class="prop-row">
              <div class="prop-group half">
                <label>Ancho (W)</label>
                <input type="number" v-model="selectedElement.width" class="pro-input" />
              </div>
              <div class="prop-group half">
                <label>Alto (H)</label>
                <input type="number" v-model="selectedElement.height" class="pro-input" />
              </div>
            </div>

            <template v-if="selectedElement.type === 'text'">
              <div class="prop-group">
                <label>Contenido</label>
                <textarea v-model="selectedElement.content" class="pro-input" rows="3"></textarea>
              </div>
              <div class="prop-group">
                <label>Color</label>
                <input type="color" v-model="selectedElement.color" class="pro-color-picker" />
              </div>
              <div class="prop-row">
                <div class="prop-group half">
                  <label>Tamaño</label>
                  <input type="number" v-model="selectedElement.fontSize" class="pro-input" />
                </div>
                <div class="prop-group half">
                  <label>Grosor</label>
                  <select v-model="selectedElement.fontWeight" class="pro-input">
                    <option value="400">Normal</option>
                    <option value="600">Semibold</option>
                    <option value="800">Bold</option>
                  </select>
                </div>
              </div>
            </template>

            <template v-if="selectedElement.type === 'shape'">
              <div class="prop-group">
                <label>Color de Fondo</label>
                <input type="color" v-model="selectedElement.bgColor" class="pro-color-picker" />
              </div>
              <div class="prop-group">
                <label>Opacidad</label>
                <input
                  type="range"
                  v-model="selectedElement.opacity"
                  min="0"
                  max="1"
                  step="0.1"
                  class="w-100"
                />
              </div>
              <div class="prop-row">
                <div class="prop-group half">
                  <label>Borde (px)</label>
                  <input type="number" v-model="selectedElement.borderWidth" class="pro-input" />
                </div>
                <div class="prop-group half">
                  <label>Radio (px)</label>
                  <input type="number" v-model="selectedElement.borderRadius" class="pro-input" />
                </div>
              </div>
              <div class="prop-group" v-if="selectedElement.borderWidth > 0">
                <label>Color Borde</label>
                <input
                  type="color"
                  v-model="selectedElement.borderColor"
                  class="pro-color-picker"
                />
              </div>
            </template>

            <template v-if="selectedElement.type === 'image' || selectedElement.type === 'video'">
              <div class="prop-group file-upload-group">
                <label>Cargar Archivo Local</label>
                <label class="btn-secondary w-100 text-center block">
                  <input
                    type="file"
                    @change="handleLocalMediaUpload($event, selectedElement)"
                    :accept="selectedElement.type === 'image' ? 'image/*' : 'video/mp4,video/webm'"
                    hidden
                  />
                  📁 Seleccionar {{ selectedElement.type === 'image' ? 'Imagen' : 'Vídeo' }}
                </label>
              </div>
              <div class="prop-group">
                <label>O Enlace Externo (Soporta YouTube)</label>
                <input
                  type="text"
                  v-model="selectedElement.src"
                  class="pro-input"
                  placeholder="https://..."
                />
              </div>
              <div class="prop-group">
                <label>Ajuste de contenido</label>
                <select v-model="selectedElement.fit" class="pro-input">
                  <option value="contain">Contener (Ver entero)</option>
                  <option value="cover">Cubrir (Recortar)</option>
                  <option value="fill">Rellenar (Deformar)</option>
                </select>
              </div>
              <div
                class="prop-group"
                v-if="selectedElement.type === 'video' && !isYouTube(selectedElement.src)"
              >
                <label class="checkbox-label">
                  <input type="checkbox" v-model="selectedElement.autoplay" /> Auto-reproducir (MP4)
                </label>
                <label class="checkbox-label mt-2">
                  <input type="checkbox" v-model="selectedElement.loop" /> Bucle (MP4)
                </label>
              </div>
            </template>

            <template v-if="selectedElement.type === '3d'">
              <div class="prop-group file-upload-group">
                <label>Cargar Modelo Local (.glb, .gltf)</label>
                <label class="btn-secondary w-100 text-center block">
                  <input
                    type="file"
                    @change="handleLocalMediaUpload($event, selectedElement)"
                    accept=".glb,.gltf"
                    hidden
                  />
                  🧊 Subir Modelo 3D
                </label>
              </div>
              <div class="prop-group mt-4">
                <label>O Enlace Externo (URL)</label>
                <input
                  type="text"
                  v-model="selectedElement.src"
                  class="pro-input"
                  placeholder="https://..."
                />
              </div>
            </template>

            <template v-if="selectedElement.type === 'interactive'">
              <div class="prop-group">
                <label>Color del Hotspot</label>
                <input type="color" v-model="selectedElement.color" class="pro-color-picker" />
              </div>
              <div class="prop-group">
                <label>Título del Pop-up</label>
                <input type="text" v-model="selectedElement.modalTitle" class="pro-input" />
              </div>
              <div class="prop-group">
                <label>Contenido HTML</label>
                <textarea
                  v-model="selectedElement.contentHtml"
                  class="pro-input"
                  rows="5"
                ></textarea>
              </div>
            </template>

            <template v-if="selectedElement.type === 'link'">
              <div class="prop-group">
                <label>Texto del Botón</label>
                <input type="text" v-model="selectedElement.text" class="pro-input" />
              </div>
              <div class="prop-group">
                <label>Diapositiva Destino (1 - {{ numPages }})</label>
                <input
                  type="number"
                  v-model="selectedElement.targetPage"
                  min="1"
                  :max="numPages"
                  class="pro-input"
                />
              </div>
              <div class="prop-row">
                <div class="prop-group half">
                  <label>Color Fondo</label>
                  <input type="color" v-model="selectedElement.bgColor" class="pro-color-picker" />
                </div>
                <div class="prop-group half">
                  <label>Color Texto</label>
                  <input type="color" v-model="selectedElement.color" class="pro-color-picker" />
                </div>
              </div>
            </template>

            <template v-if="selectedElement.type === 'accordion'">
              <div class="prop-group">
                <label>Color Principal</label>
                <input type="color" v-model="selectedElement.bgColor" class="pro-color-picker" />
              </div>
              <div class="prop-group">
                <label>Elementos del Acordeón</label>
                <div
                  v-for="(item, index) in selectedElement.items"
                  :key="index"
                  class="accordion-edit-item"
                >
                  <input
                    type="text"
                    v-model="item.title"
                    class="pro-input mb-1"
                    placeholder="Título..."
                  />
                  <textarea
                    v-model="item.content"
                    class="pro-input"
                    rows="2"
                    placeholder="Contenido profundo..."
                  ></textarea>
                  <button
                    class="btn-text-danger mt-1"
                    @click="selectedElement.items.splice(index, 1)"
                  >
                    Eliminar
                  </button>
                </div>
                <button class="btn-secondary w-100 mt-2" @click="addAccordionSection">
                  + Añadir Sección
                </button>
              </div>
            </template>

            <div class="tool-divider mt-4"></div>
            <button class="btn-danger w-100" @click="deleteSelected">🗑️ Eliminar Elemento</button>
          </div>

          <div class="panel-content empty-state" v-else>
            <p class="section-subtitle">Fondo de la Diapositiva {{ pageNum }}</p>
            <div class="prop-group mt-4 text-left">
              <label>Color de Fondo</label>
              <input
                type="color"
                v-model="slideConfigs[pageNum].bgColor"
                @input="renderPage(pageNum)"
                class="pro-color-picker"
              />
            </div>
            <div class="prop-group text-left">
              <label>Imagen de Fondo</label>
              <label class="btn-secondary w-100 text-center block">
                <input type="file" @change="setSlideBackgroundImage" accept="image/*" hidden />
                🖼️ Reemplazar Manualmente
              </label>
              <button
                v-if="slideConfigs[pageNum] && slideConfigs[pageNum].bgImage"
                class="btn-text-danger w-100 mt-2"
                @click="removeBackgroundImage"
              >
                Quitar imagen
              </button>
            </div>
            <div class="info-box mt-4 text-left" v-if="docType === 'pptx'">
              <small
                >💡 Si el PPTX usó imágenes de fondo, las hemos extraído. Si usaste textos sueltos
                en PPTX, guarda tu archivo como PDF para verlos.</small
              >
            </div>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, markRaw, onMounted, onUnmounted, nextTick } from 'vue'
import * as pdfjsLib from 'pdfjs-dist'
import JSZip from 'jszip'
import NavbarComponent from '@/components/navbarComponent.vue'

// Configuración estable del Worker de PDF.js para Vite
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url,
).toString()

const pdfCanvas = ref<HTMLCanvasElement | null>(null)
const workspaceRef = ref<HTMLElement | null>(null)

let _RAW_PDF_DOC: any = null
let _PDF_BASE64_STORE: string = ''

const docType = ref<'pdf' | 'pptx' | 'blank'>('blank')
const hasDoc = ref(false)
const playMode = ref(false)
const pageNum = ref(1)
const numPages = ref(0)
const zoom = ref(1.0)
type ToolType =
  | 'select'
  | 'text'
  | '3d'
  | 'interactive'
  | 'image'
  | 'video'
  | 'shape'
  | 'link'
  | 'accordion'
const activeTool = ref<ToolType>('select')
const baseWidth = ref(1280)
const baseHeight = ref(720)

// Estado del documento y configuración visual de las diapositivas
const documentState = ref<Record<number, any[]>>({})
const slideConfigs = ref<Record<number, { bgColor: string; bgImage: string | null }>>({})
const selectedElementId = ref<string | null>(null)

const currentPageElements = computed(() => documentState.value[pageNum.value] || [])
const selectedElement = computed(() =>
  selectedElementId.value
    ? currentPageElements.value.find((el) => el.id === selectedElementId.value)
    : null,
)

// Propiedades computadas para manejar fondos visuales limpiamente
const currentBgColor = computed(() => slideConfigs.value[pageNum.value]?.bgColor || '#ffffff')
const currentBgImage = computed(() =>
  slideConfigs.value[pageNum.value]?.bgImage
    ? `url(${slideConfigs.value[pageNum.value].bgImage})`
    : 'none',
)

onMounted(() => {
  if (!customElements.get('model-viewer')) {
    const script = document.createElement('script')
    script.type = 'module'
    script.src = 'https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js'
    document.head.appendChild(script)
  }
  document.addEventListener('keydown', handleGlobalKeydown)
})

onUnmounted(() => document.removeEventListener('keydown', handleGlobalKeydown))

const handleGlobalKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && playMode.value) togglePlayMode()
}

const isYouTube = (url: string) =>
  url &&
  url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/)
const getYouTubeEmbedUrl = (url: string) => {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/,
  )
  return match && match[1] ? `https://www.youtube-nocookie.com/embed/${match[1]}?rel=0` : ''
}

const initializeConfigs = () => {
  for (let i = 1; i <= numPages.value; i++) {
    if (!documentState.value[i]) documentState.value[i] = []
    if (!slideConfigs.value[i]) slideConfigs.value[i] = { bgColor: '#ffffff', bgImage: null }
  }
}

const createBlankProject = () => {
  _RAW_PDF_DOC = null
  _PDF_BASE64_STORE = ''
  docType.value = 'blank'
  numPages.value = 1
  pageNum.value = 1
  baseWidth.value = 1280
  baseHeight.value = 720
  documentState.value = {}
  slideConfigs.value = {}
  initializeConfigs()
  hasDoc.value = true
  renderPage(1)
  setTimeout(fitToScreen, 100)
}

const addNewSlide = () => {
  numPages.value += 1
  if (!documentState.value[numPages.value]) documentState.value[numPages.value] = []
  if (!slideConfigs.value[numPages.value])
    slideConfigs.value[numPages.value] = { bgColor: '#ffffff', bgImage: null }
  changePageTo(numPages.value)
}

const handleCanvasClick = (e: MouseEvent) => {
  if (playMode.value || activeTool.value === 'select') {
    selectedElementId.value = null
    return
  }

  const rect = (e.target as HTMLElement).getBoundingClientRect()
  const rawX = (e.clientX - rect.left) / zoom.value
  const rawY = (e.clientY - rect.top) / zoom.value

  const newElement: any = {
    id: `el_${Date.now()}`,
    x: rawX,
    y: rawY,
    zIndex: currentPageElements.value.length + 10,
    type: activeTool.value,
  }

  if (activeTool.value === 'link') {
    newElement.name = 'Botón Navegación'
    newElement.width = 180
    newElement.height = 45
    newElement.text = 'Ir a página...'
    newElement.targetPage = 1
    newElement.bgColor = '#2ea043'
    newElement.color = '#ffffff'
    newElement.borderRadius = 8
  } else if (activeTool.value === 'accordion') {
    newElement.name = 'Acordeón'
    newElement.width = 300
    newElement.height = 'auto'
    newElement.bgColor = '#21262d'
    newElement.color = '#c9d1d9'
    newElement.items = [{ title: 'Sección 1', content: 'Detalle...', isOpen: false }]
  } else if (activeTool.value === 'text') {
    newElement.name = 'Texto'
    newElement.width = 300
    newElement.height = 50
    newElement.content = 'Texto Nuevo'
    newElement.color = '#000000'
    newElement.fontSize = 24
    newElement.fontWeight = '600'
  } else if (activeTool.value === 'shape') {
    newElement.name = 'Forma'
    newElement.width = 150
    newElement.height = 150
    newElement.bgColor = '#2f81f7'
    newElement.opacity = 1
    newElement.borderRadius = 8
    newElement.borderWidth = 0
    newElement.borderColor = '#ffffff'
  } else if (activeTool.value === 'image') {
    newElement.name = 'Imagen'
    newElement.width = 250
    newElement.height = 250
    newElement.src = ''
    newElement.fit = 'contain'
    newElement.opacity = 1
  } else if (activeTool.value === 'video') {
    newElement.name = 'Vídeo'
    newElement.width = 400
    newElement.height = 225
    newElement.src = ''
    newElement.fit = 'cover'
    newElement.autoplay = false
    newElement.loop = false
  } else if (activeTool.value === '3d') {
    newElement.name = 'Modelo 3D'
    newElement.width = 300
    newElement.height = 300
    newElement.src = 'https://modelviewer.dev/shared-assets/models/Astronaut.glb'
  } else if (activeTool.value === 'interactive') {
    newElement.name = 'Hotspot'
    newElement.width = 40
    newElement.height = 40
    newElement.color = '#2f81f7'
    newElement.modalTitle = 'Info'
    newElement.contentHtml = '<p>Edita el HTML.</p>'
    newElement.isOpen = false
  }

  if (!documentState.value[pageNum.value]) documentState.value[pageNum.value] = []
  documentState.value[pageNum.value].push(newElement)
  selectedElementId.value = newElement.id
  activeTool.value = 'select'
}

// === FUNCIONES SEPARADAS PARA EVITAR ERRORES DE COMPILACIÓN VUE ===

const addAccordionSection = () => {
  if (selectedElement.value && selectedElement.value.type === 'accordion') {
    selectedElement.value.items.push({
      title: 'Nueva Sección',
      content: 'Detalles...',
      isOpen: false,
    })
  }
}

const removeBackgroundImage = () => {
  if (slideConfigs.value[pageNum.value]) {
    slideConfigs.value[pageNum.value].bgImage = null
    renderPage(pageNum.value)
  }
}

// ====================================================================

const handleLocalMediaUpload = (event: Event, el: any) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  el.src = URL.createObjectURL(file)
  if (el.type === '3d') el.name = file.name
}

const setSlideBackgroundImage = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (ev) => {
    slideConfigs.value[pageNum.value].bgImage = ev.target?.result as string
    renderPage(pageNum.value)
  }
  reader.readAsDataURL(file)
}

let isDragging = false
let startX = 0,
  startY = 0
let initialElX = 0,
  initialElY = 0

const startDrag = (e: MouseEvent, el: any) => {
  if (playMode.value || activeTool.value !== 'select') return
  selectedElementId.value = el.id
  isDragging = true
  startX = e.clientX
  startY = e.clientY
  initialElX = el.x
  initialElY = el.y

  const onMouseMove = (moveEvent: MouseEvent) => {
    if (!isDragging) return
    const dx = (moveEvent.clientX - startX) / zoom.value
    const dy = (moveEvent.clientY - startY) / zoom.value
    el.x = initialElX + dx
    el.y = initialElY + dy
  }

  const onMouseUp = () => {
    isDragging = false
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
  }

  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
}

const triggerInteraction = (el: any) => {
  if (!playMode.value) return
  currentPageElements.value.forEach((item) => {
    if (item.id !== el.id && item.type === 'interactive') item.isOpen = false
  })
  el.isOpen = !el.isOpen
}

const deleteSelected = () => {
  if (!selectedElementId.value) return
  documentState.value[pageNum.value] = documentState.value[pageNum.value].filter(
    (el) => el.id !== selectedElementId.value,
  )
  selectedElementId.value = null
}

const selectElement = (id: string) => {
  selectedElementId.value = id
  activeTool.value = 'select'
}

const togglePlayMode = () => {
  playMode.value = !playMode.value
  selectedElementId.value = null
  Object.values(documentState.value).forEach((pageItems) => {
    pageItems.forEach((el) => {
      if (el.type === 'interactive') el.isOpen = false
      if (el.type === 'accordion') el.items.forEach((item: any) => (item.isOpen = false))
    })
  })
  fitToScreen()
}

const getIconForType = (type: string) => {
  const icons: any = {
    text: 'T',
    shape: '🟥',
    image: '🖼️',
    video: '🎥',
    '3d': '🧊',
    interactive: '⚡',
    link: '🔗',
    accordion: '📑',
  }
  return icons[type] || '📄'
}

const handleFileUpload = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  const fileExtension = file.name.split('.').pop()?.toLowerCase()

  if (fileExtension === 'pdf') {
    docType.value = 'pdf'
    const reader = new FileReader()
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string
      _PDF_BASE64_STORE = dataUrl.split(',')[1]

      const bytes = new Uint8Array(await file.arrayBuffer())
      const loadingTask = pdfjsLib.getDocument({ data: bytes })
      _RAW_PDF_DOC = markRaw(await loadingTask.promise)
      numPages.value = _RAW_PDF_DOC.numPages
      hasDoc.value = true
      documentState.value = {}
      slideConfigs.value = {}
      initializeConfigs()
      await renderPage(1)
      setTimeout(fitToScreen, 100)
    }
    reader.readAsDataURL(file)
  } else if (['pptx', 'ppsx', 'potx'].includes(fileExtension || '')) {
    docType.value = 'pptx'
    _RAW_PDF_DOC = null
    _PDF_BASE64_STORE = ''

    try {
      const zip = await JSZip.loadAsync(file)

      // Get slide count
      const appXml = await zip.file('docProps/app.xml')?.async('string')
      const slidesMatch = appXml?.match(/<Slides>(\d+)<\/Slides>/)
      numPages.value = slidesMatch ? parseInt(slidesMatch[1]) : 1

      // Get dimensions
      const presXml = await zip.file('ppt/presentation.xml')?.async('string')
      const sizeMatch = presXml?.match(/<p:sldSz cx="(\d+)" cy="(\d+)"/i)
      if (sizeMatch) {
        baseWidth.value = Math.round((parseInt(sizeMatch[1]) / 914400) * 96)
        baseHeight.value = Math.round((parseInt(sizeMatch[2]) / 914400) * 96)
      } else {
        baseWidth.value = 1280
        baseHeight.value = 720
      }

      hasDoc.value = true
      documentState.value = {}
      slideConfigs.value = {}
      initializeConfigs()

      // --- MOTOR DE EXTRACCIÓN DE FONDOS DEL PPTX ---
      for (let i = 1; i <= numPages.value; i++) {
        try {
          const slideXml = await zip.file(`ppt/slides/slide${i}.xml`)?.async('string')
          if (!slideXml) continue

          // 1. Color de Fondo Sólido
          const colorMatch = slideXml.match(/<p:bg>.*?<a:srgbClr val="([0-9A-Fa-f]{6})"/)
          if (colorMatch) slideConfigs.value[i].bgColor = `#${colorMatch[1]}`

          // 2. Imagen de Fondo
          const bgImageMatch = slideXml.match(/<p:bg>.*?<a:blip r:embed="([^"]+)"/)
          if (bgImageMatch) {
            const rId = bgImageMatch[1]
            const relsXml = await zip.file(`ppt/slides/_rels/slide${i}.xml.rels`)?.async('string')
            if (relsXml) {
              const relRegex = new RegExp(`<Relationship Id="${rId}".*?Target="([^"]+)"`)
              const relMatch = relsXml.match(relRegex)
              if (relMatch) {
                let targetPath = relMatch[1]
                targetPath = targetPath.replace('../', 'ppt/')

                const imageFile = zip.file(targetPath)
                if (imageFile) {
                  const base64 = await imageFile.async('base64')
                  const ext = targetPath.split('.').pop()?.toLowerCase()
                  const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg'
                  slideConfigs.value[i].bgImage = `data:${mimeType};base64,${base64}`
                }
              }
            }
          }
        } catch (e) {
          console.warn(`Error extrayendo fondo de slide ${i}`, e)
        }
      }
      // ----------------------------------------------

      pageNum.value = 1
      renderPage(1)
      setTimeout(fitToScreen, 100)
    } catch (err) {
      alert('Error al leer el archivo PPTX. Asegúrate de que no esté corrupto.')
      console.error(err)
    }
  }
}

const renderPage = async (num: number) => {
  await nextTick()
  if (!pdfCanvas.value) return
  const canvas = pdfCanvas.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const dpr = window.devicePixelRatio || 2

  if (docType.value === 'pdf' && _RAW_PDF_DOC && num <= _RAW_PDF_DOC.numPages) {
    const page = await _RAW_PDF_DOC.getPage(num)
    const viewport = page.getViewport({ scale: 1.0 })
    baseWidth.value = viewport.width
    baseHeight.value = viewport.height

    canvas.width = viewport.width * dpr
    canvas.height = viewport.height * dpr
    canvas.style.width = `${viewport.width}px`
    canvas.style.height = `${viewport.height}px`
    ctx.scale(dpr, dpr)

    // Clear canvas as HTML handles the solid bgColor for other docs
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    await page.render({ canvasContext: ctx, viewport }).promise
  } else {
    // For PPTX or Blank, clear the canvas as it is not used for rendering PDF layers
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }
}

const changePageTo = (num: number) => {
  if (num < 1 || num > numPages.value) return
  pageNum.value = num
  selectedElementId.value = null
  renderPage(num)
}

const changeZoom = (delta: number) => {
  zoom.value = Math.max(0.2, Math.min(zoom.value + delta, 4))
}

const fitToScreen = () => {
  if (!workspaceRef.value) return
  const availableHeight = workspaceRef.value.clientHeight - 80
  const idealZoom = availableHeight / baseHeight.value
  zoom.value = Math.max(0.2, idealZoom)
}

const exportPresentation = () => {
  if (Object.keys(documentState.value).length === 0 && !_RAW_PDF_DOC && docType.value === 'blank') {
    alert('El proyecto está vacío. Añade algo antes de exportar.')
    return
  }

  const safeStateString = JSON.stringify(documentState.value).replace(/</g, '\\x3C')
  const safeConfigString = JSON.stringify(slideConfigs.value).replace(/</g, '\\x3C')

  if (safeStateString.includes('blob:')) {
    alert(
      '⚠️ AVISO IMPORTANTE:\n\nHas subido archivos locales desde tu PC. Al exportar este archivo, tú podrás verlo en este equipo, pero si se lo envías a otra persona, los archivos no cargarán.\n\nPara que sea universal, usa Enlaces Externos (URLs de internet) para tus fotos/vídeos.',
    )
  }

  const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Presentación Pro Interactiva</title>
  
  <script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"><\/script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js"><\/script>
  <script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js"><\/script>
  
  <style>
    body { margin: 0; background: #000; overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    #app { display: flex; justify-content: center; align-items: center; width: 100vw; height: 100vh; position: relative; }
    .canvas-wrapper { position: relative; box-shadow: 0 0 50px rgba(0,0,0,0.8); transform-origin: center center; transition: transform 0.2s; background-size: cover; background-position: center; }
    .layer-pdf { position: absolute; top: 0; left: 0; z-index: 0; pointer-events: none; }
    .interactive-element { position: absolute; box-sizing: border-box; display: flex; }
    
    .el-text { width: 100%; height: 100%; white-space: pre-wrap; line-height: 1.2; text-shadow: 1px 1px 2px rgba(255,255,255,0.8); }
    .el-shape { width: 100%; height: 100%; }
    .el-content-fitted { width: 100%; height: 100%; display: block; }
    .el-link { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-weight: bold; cursor: pointer; transition: transform 0.1s; box-shadow: 0 4px 6px rgba(0,0,0,0.3); }
    .el-link:active { transform: scale(0.95); }
    .el-interactive { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; cursor: pointer; }
    .hotspot-pulse { width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; animation: pulse 2s infinite; }
    @keyframes pulse { 0% { transform: scale(0.95); opacity: 0.8; } 70% { transform: scale(1.1); opacity: 0; } 100% { transform: scale(0.95); opacity: 0; } }
    .interactive-modal { position: absolute; top: 100%; left: 50%; transform: translateX(-50%); margin-top: 15px; background: white; color: #333; padding: 20px; border-radius: 8px; width: 320px; box-shadow: 0 20px 40px rgba(0,0,0,0.4); z-index: 9999; cursor: default; }
    .modal-title { margin: 0 0 10px 0; font-size: 1.1rem; border-bottom: 1px solid #eee; padding-bottom: 5px; }
    
    .el-accordion { width: 100%; height: 100%; overflow-y: auto; border-radius: 8px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
    .accordion-item { border-bottom: 1px solid rgba(255,255,255,0.1); }
    .accordion-header { padding: 12px 16px; font-weight: bold; display: flex; justify-content: space-between; cursor: pointer; background: rgba(0,0,0,0.2); }
    .accordion-content { padding: 16px; font-size: 0.9rem; line-height: 1.5; background: rgba(0,0,0,0.05); }

    .nav-controls { position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); background: rgba(30,30,30,0.8); backdrop-filter: blur(5px); padding: 10px 20px; border-radius: 30px; display: flex; gap: 10px; z-index: 10000; }
    .nav-btn { background: #444; color: white; border: none; padding: 8px 16px; border-radius: 20px; cursor: pointer; font-weight: bold; }
    .nav-btn:hover { background: #666; }
    .nav-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  </style>
</head>
<body>
  <div id="app">
    <div class="canvas-wrapper" :style="{ width: baseWidth + 'px', height: baseHeight + 'px', transform: 'scale(' + zoom + ')', backgroundColor: currentBgColor, backgroundImage: currentBgImage }">
      <canvas ref="pdfCanvas" class="layer-pdf" v-show="docType === 'pdf'"></canvas>
      
      <div v-for="el in currentPageElements" :key="el.id" class="interactive-element is-clickable"
           :style="{ left: el.x + 'px', top: el.y + 'px', width: el.width + 'px', height: (el.height === 'auto' ? 'auto' : el.height + 'px'), zIndex: el.zIndex }">
        
        <div v-if="el.type === 'text'" class="el-text" :style="{ color: el.color, fontSize: el.fontSize + 'px', fontWeight: el.fontWeight }">{{ el.content }}</div>
        
        <div v-else-if="el.type === 'shape'" class="el-shape" 
             :style="{ backgroundColor: el.bgColor, borderRadius: el.borderRadius + 'px', border: el.borderWidth + 'px solid ' + el.borderColor, opacity: el.opacity }"></div>
        
        <div v-else-if="el.type === 'image'" class="el-image-container" style="width: 100%; height: 100%;">
          <img v-if="el.src" :src="el.src" class="el-content-fitted" :style="{ objectFit: el.fit, opacity: el.opacity }" />
        </div>
        
        <div v-else-if="el.type === 'video'" class="el-video-container" style="width: 100%; height: 100%;">
          <iframe v-if="isYouTube(el.src)" :src="getYouTubeEmbedUrl(el.src)" class="el-content-fitted" frameborder="0" allowfullscreen></iframe>
          <video v-else :src="el.src" controls :autoplay="el.autoplay" :loop="el.loop" class="el-content-fitted" :style="{ objectFit: el.fit }"></video>
        </div>
        
        <div v-else-if="el.type === '3d'" class="el-3d" style="width: 100%; height: 100%;">
          <model-viewer v-if="el.src" :src="el.src" auto-rotate camera-controls style="width: 100%; height: 100%;"></model-viewer>
        </div>
        
        <div v-else-if="el.type === 'interactive'" class="el-interactive" @click.stop="triggerInteraction(el)">
          <div class="hotspot-pulse" :style="{ backgroundColor: el.color, boxShadow: '0 0 15px ' + el.color }"></div>
          <div v-if="el.isOpen" class="interactive-modal" @click.stop>
            <h4 class="modal-title">{{ el.modalTitle }}</h4>
            <p v-html="el.contentHtml"></p>
          </div>
        </div>

        <div v-else-if="el.type === 'link'" class="el-link" 
             :style="{ backgroundColor: el.bgColor, color: el.color, borderRadius: el.borderRadius + 'px' }"
             @click.stop="changePageTo(el.targetPage)">
          {{ el.text }}
        </div>

        <div v-else-if="el.type === 'accordion'" class="el-accordion" :style="{ backgroundColor: el.bgColor, color: el.color }">
          <div v-for="(item, idx) in el.items" :key="idx" class="accordion-item">
            <div class="accordion-header" @click.stop="item.isOpen = !item.isOpen">
              <span>{{ item.title }}</span>
              <span>{{ item.isOpen ? '▲' : '▼' }}</span>
            </div>
            <div v-show="item.isOpen" class="accordion-content">
              {{ item.content }}
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="nav-controls">
      <button class="nav-btn" @click="changePageTo(pageNum - 1)" :disabled="pageNum <= 1">Anterior</button>
      <span style="color: white; align-self: center;">{{ pageNum }} / {{ numPages }}</span>
      <button class="nav-btn" @click="changePageTo(pageNum + 1)" :disabled="pageNum >= numPages">Siguiente</button>
    </div>
  </div>

  <script>
    window.__APP_STATE = ${safeStateString};
    window.__APP_CONFIGS = ${safeConfigString};
    window.__BASE_WIDTH = ${baseWidth.value};
    window.__BASE_HEIGHT = ${baseHeight.value};
    window.__DOC_TYPE = '${docType.value}';
    
    const { createApp, ref, computed, onMounted } = Vue;

    createApp({
      setup() {
        const documentState = ref(window.__APP_STATE);
        const slideConfigs = ref(window.__APP_CONFIGS);
        const baseWidth = ref(window.__BASE_WIDTH);
        const baseHeight = ref(window.__BASE_HEIGHT);
        const docType = ref(window.__DOC_TYPE);
        
        const pageNum = ref(1);
        const numPages = ref(Math.max(...Object.keys(documentState.value).map(Number), 1));
        const zoom = ref(1.0);
        
        const currentPageElements = computed(() => documentState.value[pageNum.value] || []);
        
        const currentBgColor = computed(() => slideConfigs.value[pageNum.value]?.bgColor || '#ffffff');
        const currentBgImage = computed(() => slideConfigs.value[pageNum.value]?.bgImage ? 'url(' + slideConfigs.value[pageNum.value].bgImage + ')' : 'none');

        const isYouTube = (url) => url && url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
        const getYouTubeEmbedUrl = (url) => {
          const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
          return match && match[1] ? 'https://www.youtube-nocookie.com/embed/' + match[1] + '?rel=0' : '';
        };

        const fitToScreen = () => {
          const wZoom = window.innerWidth / baseWidth.value;
          const hZoom = window.innerHeight / baseHeight.value;
          zoom.value = Math.min(wZoom, hZoom) * 0.95;
        };

        const changePageTo = (num) => {
          if(num >= 1 && num <= numPages.value) {
            pageNum.value = num;
            closeAllInteractives();
          }
        };

        const triggerInteraction = (el) => {
          currentPageElements.value.forEach(item => { if(item.id !== el.id && item.type === 'interactive') item.isOpen = false });
          el.isOpen = !el.isOpen;
        };

        const closeAllInteractives = () => {
          Object.values(documentState.value).forEach(pageItems => {
            pageItems.forEach(el => {
              if(el.type === 'interactive') el.isOpen = false;
              if(el.type === 'accordion') el.items.forEach(item => item.isOpen = false);
            });
          });
        };

        onMounted(() => {
          fitToScreen();
          window.addEventListener('resize', fitToScreen);
          document.addEventListener('keydown', (e) => {
            if(e.key === 'ArrowRight') changePageTo(pageNum.value + 1);
            if(e.key === 'ArrowLeft') changePageTo(pageNum.value - 1);
          });
        });

        return { 
          baseWidth, baseHeight, docType, zoom, pageNum, numPages, currentPageElements,
          currentBgColor, currentBgImage,
          changePageTo, triggerInteraction, isYouTube, getYouTubeEmbedUrl
        };
      }
    }).mount('#app');
  <\/script>
</body>
</html>`

  const blob = new Blob([htmlContent], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'presentacion_interactiva.html'
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
/* =========================================
   DISEÑO PROFESIONAL OSCURO (TIPO EDITOR)
   ========================================= */

.pro-editor-app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #0d1117;
  color: #c9d1d9;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  overflow: hidden;
}

/* HEADER */
.pro-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 50px;
  background-color: #161b22;
  border-bottom: 1px solid #30363d;
  padding: 0 20px;
  flex-shrink: 0;
}
.header-left,
.header-center,
.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}
.pro-logo {
  font-size: 1.2rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 8px;
}
.text-accent {
  color: #58a6ff;
}
.file-menu {
  display: flex;
  gap: 10px;
}
.menu-item {
  background: transparent;
  border: 1px solid #30363d;
  color: #c9d1d9;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background 0.2s;
}
.menu-item:hover:not(:disabled) {
  background: #30363d;
}
.menu-item:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.shortcut {
  font-size: 0.7rem;
  color: #8b949e;
  margin-left: 6px;
}

.zoom-controls {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #0d1117;
  padding: 4px 12px;
  border-radius: 20px;
  border: 1px solid #30363d;
}
.zoom-level {
  font-size: 0.85rem;
  min-width: 45px;
  text-align: center;
}
.tool-btn {
  background: transparent;
  border: none;
  color: #c9d1d9;
  cursor: pointer;
  border-radius: 4px;
  padding: 4px;
}
.tool-btn:hover {
  background: #30363d;
}
.tool-btn.active {
  background: #58a6ff;
  color: #fff;
}

.btn-play {
  background: #2ea043;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-play:hover {
  background: #3fb950;
}
.btn-exit-play {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  background: #da3633;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 20px;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
}

/* WORKSPACE LAYOUT */
.pro-workspace {
  display: flex;
  flex: 1;
  overflow: hidden;
}
.pro-sidebar {
  width: 260px;
  background-color: #161b22;
  border-right: 1px solid #30363d;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  overflow-y: auto;
}
.right-sidebar {
  border-right: none;
  border-left: 1px solid #30363d;
  width: 280px;
}

.panel-header {
  padding: 12px 16px;
  font-weight: 600;
  font-size: 0.9rem;
  border-bottom: 1px solid #30363d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #8b949e;
}
.pro-toolbar {
  width: 60px;
  background-color: #0d1117;
  border-right: 1px solid #30363d;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 15px;
  gap: 10px;
}
.tool-btn.large {
  font-size: 1.2rem;
  padding: 10px;
  border-radius: 8px;
  width: 45px;
  height: 45px;
}
.tool-divider {
  width: 30px;
  height: 1px;
  background: #30363d;
  margin: 5px 0;
}

.pro-canvas-area {
  flex: 1;
  background-color: #010409;
  position: relative;
  overflow: auto;
  display: flex;
  justify-content: center;
  align-items: center;
  background-image: radial-gradient(#30363d 1px, transparent 1px);
  background-size: 20px 20px;
}

/* TREE VIEW (LEFT SIDEBAR) */
.tree-view {
  padding: 10px 0;
  flex: 1;
  overflow-y: auto;
}
.tree-node-title {
  padding: 8px 16px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.2s;
}
.tree-node-title:hover {
  background: #30363d;
}
.tree-node-title.is-active {
  background: #1f2428;
  border-left: 3px solid #58a6ff;
  font-weight: bold;
  color: white;
}
.tree-children {
  padding-left: 10px;
  background: #0d1117;
}
.tree-child {
  padding: 6px 16px;
  font-size: 0.85rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #8b949e;
}
.tree-child:hover {
  background: #30363d;
  color: #c9d1d9;
}
.tree-child.is-selected {
  background: rgba(88, 166, 255, 0.15);
  color: #58a6ff;
}
.sidebar-footer {
  padding: 16px;
  border-top: 1px solid #30363d;
}

/* INSPECTOR Y CONFIG (RIGHT SIDEBAR) */
.panel-content {
  padding: 16px;
}
.empty-state {
  text-align: center;
  color: #8b949e;
  padding-top: 40px;
  font-size: 0.9rem;
}
.badge-type {
  background: #30363d;
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: bold;
  margin-bottom: 10px;
}
.prop-group {
  margin-bottom: 15px;
}
.prop-group label {
  display: block;
  font-size: 0.8rem;
  color: #8b949e;
  margin-bottom: 5px;
}
.prop-row {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}
.prop-row .half {
  width: 50%;
  margin-bottom: 0;
}
.pro-input {
  width: 100%;
  background: #0d1117;
  border: 1px solid #30363d;
  color: #c9d1d9;
  padding: 8px;
  border-radius: 6px;
  box-sizing: border-box;
  font-family: inherit;
  font-size: 0.85rem;
}
.pro-input:focus {
  outline: none;
  border-color: #58a6ff;
}
.pro-color-picker {
  width: 100%;
  height: 36px;
  padding: 0;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  background: transparent;
}

.section-subtitle {
  color: #c9d1d9;
  font-weight: bold;
  border-bottom: 1px solid #30363d;
  padding-bottom: 8px;
  margin-top: 0;
}
.info-box {
  background: rgba(88, 166, 255, 0.1);
  border-left: 3px solid #58a6ff;
  padding: 10px;
  border-radius: 4px;
  color: #c9d1d9;
  line-height: 1.4;
}

.btn-primary,
.btn-secondary,
.btn-danger,
.btn-text-danger {
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  box-sizing: border-box;
}
.btn-primary {
  background: #58a6ff;
  color: #0d1117;
}
.btn-primary:hover {
  background: #79c0ff;
}
.btn-secondary {
  background: #21262d;
  color: #c9d1d9;
  border: 1px solid #30363d;
}
.btn-secondary:hover {
  background: #30363d;
}
.btn-danger {
  background: rgba(218, 54, 51, 0.1);
  color: #ff7b72;
  border: 1px solid rgba(218, 54, 51, 0.4);
}
.btn-danger:hover {
  background: rgba(218, 54, 51, 0.2);
}
.btn-text-danger {
  background: transparent;
  color: #ff7b72;
  padding: 4px 8px;
  font-size: 0.8rem;
}
.w-100 {
  width: 100%;
}
.mt-1 {
  margin-top: 5px;
}
.mt-2 {
  margin-top: 10px;
}
.mt-4 {
  margin-top: 20px;
}
.mb-1 {
  margin-bottom: 5px;
}
.text-center {
  text-align: center;
}
.text-left {
  text-align: left;
}
.block {
  display: block;
}

/* CANVAS Y ELEMENTOS INTERACTIVOS */
.canvas-wrapper {
  position: relative;
  transform-origin: center center;
  transition: transform 0.1s ease-out;
  box-shadow: 0 0 40px rgba(0, 0, 0, 0.5);
}
.canvas-wrapper.play-mode-active {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.layer-engine {
  position: relative;
  overflow: hidden;
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
}
.layer-pdf {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 0;
  pointer-events: none;
}
.pptx-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  color: #8b949e;
  pointer-events: none;
  z-index: 0;
  background: rgba(0, 0, 0, 0.05);
}

.interactive-element {
  position: absolute;
  box-sizing: border-box;
  display: flex;
}
.interactive-element.is-selected {
  outline: 2px dashed #58a6ff;
  outline-offset: 2px;
}
.interactive-element.is-selected::after {
  content: '';
  position: absolute;
  bottom: -6px;
  right: -6px;
  width: 12px;
  height: 12px;
  background: #58a6ff;
  border-radius: 50%;
  cursor: nwse-resize;
}
.interactive-element.is-clickable {
  cursor: pointer;
}

/* Contenidos de Elementos */
.el-text {
  width: 100%;
  height: 100%;
  white-space: pre-wrap;
  line-height: 1.2;
  word-break: break-word;
}
.el-shape {
  width: 100%;
  height: 100%;
}
.el-image-container,
.el-video-container {
  width: 100%;
  height: 100%;
  position: relative;
}
.el-content-fitted {
  width: 100%;
  height: 100%;
  display: block;
  border: none;
}
.placeholder-box {
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.1);
  border: 1px dashed rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  color: #8b949e;
  text-align: center;
  padding: 10px;
}
.drag-protector {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10;
  cursor: move;
}
.el-3d {
  width: 100%;
  height: 100%;
  position: relative;
}

/* Hotspot */
.el-interactive {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.hotspot-pulse {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 3px solid white;
  animation: pulse 2s infinite;
}
@keyframes pulse {
  0% {
    transform: scale(0.95);
    opacity: 0.8;
  }
  70% {
    transform: scale(1.1);
    opacity: 0;
  }
  100% {
    transform: scale(0.95);
    opacity: 0;
  }
}
.interactive-modal {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 15px;
  background: white;
  color: #333;
  padding: 20px;
  border-radius: 8px;
  width: 320px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
  z-index: 9999;
  cursor: default;
}
.modal-title {
  margin: 0 0 10px 0;
  font-size: 1.1rem;
  border-bottom: 1px solid #eee;
  padding-bottom: 5px;
}

/* Links y Acordeones */
.el-link {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  text-align: center;
  padding: 0 10px;
}
.el-accordion {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}
.accordion-item {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
.accordion-header {
  padding: 12px 16px;
  font-weight: bold;
  display: flex;
  justify-content: space-between;
  background: rgba(0, 0, 0, 0.2);
}
.accordion-content {
  padding: 16px;
  font-size: 0.9rem;
  line-height: 1.5;
  background: rgba(0, 0, 0, 0.05);
}
.accordion-content.is-preview {
  opacity: 0.5;
}
.accordion-edit-item {
  background: rgba(255, 255, 255, 0.05);
  padding: 10px;
  border-radius: 6px;
  margin-bottom: 10px;
  border: 1px solid #30363d;
}

/* PANTALLA VACÍA */
.empty-workspace {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.empty-box {
  background: #161b22;
  border: 1px dashed #30363d;
  padding: 40px;
  border-radius: 12px;
  text-align: center;
  max-width: 400px;
}
.empty-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 15px;
}
.empty-box h3 {
  margin: 0 0 10px 0;
  font-size: 1.2rem;
}
.empty-box p {
  color: #8b949e;
  font-size: 0.9rem;
  margin: 0;
  line-height: 1.5;
}
.button-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>
