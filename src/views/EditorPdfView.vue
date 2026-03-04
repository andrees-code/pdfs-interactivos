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
            <input type="file" @change="handleFileUpload" accept="application/pdf" hidden />
            Archivo <span class="shortcut">Ctrl+O</span>
          </label>
          <button class="menu-item" :disabled="!hasDoc" @click="exportPresentation">
            Exportar Web <span class="shortcut">Ctrl+E</span>
          </button>
        </div>
      </div>
      
      <div class="header-center" v-if="hasDoc">
        <div class="zoom-controls">
          <button @click="changeZoom(-0.10)" class="tool-btn">➖</button>
          <span class="zoom-level">{{ Math.round(zoom * 100) }}%</span>
          <button @click="changeZoom(0.10)" class="tool-btn">➕</button>
          <button @click="fitToScreen" class="tool-btn" title="Ajustar a pantalla">🔲</button>
        </div>
      </div>

      <div class="header-right" v-if="hasDoc">
        <button class="btn-play" @click="togglePlayMode">
          ▶ Modo Presentación
        </button>
      </div>
    </header>

    <div class="pro-workspace">
      
      <aside class="pro-sidebar left-sidebar" v-if="hasDoc && !playMode">
        <div class="panel-header">Índice del Documento</div>
        <div class="tree-view">
          <div v-for="page in numPages" :key="page" class="tree-node">
            <div class="tree-node-title" :class="{ 'is-active': pageNum === page }" @click="changePageTo(page)">
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
          <button class="tool-btn large" :class="{ active: activeTool === 'select' }" @click="activeTool = 'select'" title="Seleccionar (V)">👆</button>
          <div class="tool-divider"></div>
          <button class="tool-btn large" :class="{ active: activeTool === 'text' }" @click="activeTool = 'text'" title="Añadir Texto (T)">T</button>
          <button class="tool-btn large" :class="{ active: activeTool === 'shape' }" @click="activeTool = 'shape'" title="Añadir Forma (F)">🟥</button>
          <button class="tool-btn large" :class="{ active: activeTool === 'image' }" @click="activeTool = 'image'" title="Añadir Imagen (I)">🖼️</button>
          <button class="tool-btn large" :class="{ active: activeTool === 'video' }" @click="activeTool = 'video'" title="Añadir Video (P)">🎥</button>
          <button class="tool-btn large" :class="{ active: activeTool === '3d' }" @click="activeTool = '3d'" title="Añadir Modelo 3D (M)">🧊</button>
          <div class="tool-divider"></div>
          <button class="tool-btn large" :class="{ active: activeTool === 'interactive' }" @click="activeTool = 'interactive'" title="Hotspot Interactivo (H)">⚡</button>
          <button class="tool-btn large" :class="{ active: activeTool === 'link' }" @click="activeTool = 'link'" title="Botón de Navegación (L)">🔗</button>
          <button class="tool-btn large" :class="{ active: activeTool === 'accordion' }" @click="activeTool = 'accordion'" title="Acordeón Desplegable (A)">📑</button>
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
            <p>Empieza desde cero o sube un PDF base para usarlo como fondo.</p>
            <div class="button-group mt-4">
              <button class="btn-secondary" @click="createBlankProject">✨ Crear en Blanco</button>
              <label class="btn-primary">
                <input type="file" @change="handleFileUpload" accept="application/pdf" hidden />
                📂 Cargar PDF Base
              </label>
            </div>
          </div>
        </div>

        <div v-show="hasDoc" class="canvas-wrapper" :class="{ 'play-mode-active': playMode }">
          <div 
            class="canvas-shadow-box layer-engine" 
            :style="{ transform: `scale(${zoom})`, width: `${baseWidth}px`, height: `${baseHeight}px` }"
            @click.self="handleCanvasClick"
          >
            <canvas ref="pdfCanvas" class="layer-pdf"></canvas>

            <div 
              v-for="el in currentPageElements" 
              :key="el.id"
              class="interactive-element"
              :class="{ 'is-selected': selectedElementId === el.id && !playMode, 'is-clickable': playMode && (el.type === 'link' || el.type === 'interactive') }"
              :style="{ left: `${el.x}px`, top: `${el.y}px`, width: `${el.width}px`, height: `${el.height}px`, zIndex: el.zIndex }"
              @mousedown.stop="startDrag($event, el)"
            >
              <div v-if="el.type === 'text'" class="el-text" :style="{ color: el.color, fontSize: `${el.fontSize}px`, fontWeight: el.fontWeight }">
                {{ el.content }}
              </div>

              <div v-else-if="el.type === 'shape'" class="el-shape" 
                   :style="{ backgroundColor: el.bgColor, borderRadius: `${el.borderRadius}px`, border: `${el.borderWidth}px solid ${el.borderColor}`, opacity: el.opacity }">
              </div>

              <div v-else-if="el.type === 'image'" class="el-image-container">
                <img v-if="el.src" :src="el.src" class="el-content-fitted" :style="{ objectFit: el.fit, opacity: el.opacity }" draggable="false" />
                <div v-else class="placeholder-box">🖼️ Sin Imagen</div>
              </div>

              <div v-else-if="el.type === 'video'" class="el-video-container">
                <template v-if="el.src">
                  <iframe v-if="isYouTube(el.src)" :src="getYouTubeEmbedUrl(el.src)" class="el-content-fitted" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen :style="{ pointerEvents: playMode ? 'auto' : 'none' }"></iframe>
                  <video v-else :src="el.src" :controls="playMode" :autoplay="playMode && el.autoplay" :loop="el.loop" class="el-content-fitted" :style="{ objectFit: el.fit }"></video>
                </template>
                <div v-else class="placeholder-box">🎥 Sin Vídeo / Pega enlace</div>
                <div v-if="!playMode" class="drag-protector"></div>
              </div>

              <div v-else-if="el.type === '3d'" class="el-3d">
                <model-viewer v-if="el.src" :src="el.src" auto-rotate camera-controls style="width: 100%; height: 100%;" :disable-zoom="!playMode"></model-viewer>
                <div v-else class="placeholder-box">🧊 Modelo 3D Vacío</div>
                <div v-if="!playMode" class="drag-protector"></div>
              </div>

              <div v-else-if="el.type === 'interactive'" class="el-interactive" @click.stop="triggerInteraction(el)">
                <div class="hotspot-pulse" :style="{ backgroundColor: el.color, boxShadow: `0 0 15px ${el.color}` }"></div>
                <div v-if="playMode && el.isOpen" class="interactive-modal" @click.stop>
                  <h4 class="modal-title">{{ el.modalTitle }}</h4>
                  <p v-html="el.contentHtml"></p>
                </div>
              </div>

              <div v-else-if="el.type === 'link'" class="el-link" 
                   :style="{ backgroundColor: el.bgColor, color: el.color, borderRadius: `${el.borderRadius}px` }"
                   @click.stop="playMode ? changePageTo(el.targetPage) : null">
                {{ el.text }}
              </div>

              <div v-else-if="el.type === 'accordion'" class="el-accordion" :style="{ backgroundColor: el.bgColor, color: el.color }">
                <div v-for="(item, idx) in el.items" :key="idx" class="accordion-item">
                  <div class="accordion-header" @click.stop="playMode ? (item.isOpen = !item.isOpen) : null">
                    <span>{{ item.title }}</span>
                    <span>{{ item.isOpen ? '▲' : '▼' }}</span>
                  </div>
                  <div v-show="!playMode || item.isOpen" class="accordion-content" :class="{'is-preview': !playMode}">
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
              <input type="range" v-model="selectedElement.opacity" min="0" max="1" step="0.1" class="w-100" />
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
              <input type="color" v-model="selectedElement.borderColor" class="pro-color-picker" />
            </div>
          </template>

          <template v-if="selectedElement.type === 'image' || selectedElement.type === 'video'">
            <div class="prop-group file-upload-group">
              <label>Cargar Archivo Local</label>
              <label class="btn-secondary w-100 text-center block">
                <input type="file" @change="handleLocalMediaUpload($event, selectedElement)" :accept="selectedElement.type === 'image' ? 'image/*' : 'video/mp4,video/webm'" hidden />
                📁 Seleccionar {{ selectedElement.type === 'image' ? 'Imagen' : 'Vídeo' }}
              </label>
            </div>
            <div class="prop-group">
              <label>O Enlace Externo (Soporta YouTube)</label>
              <input type="text" v-model="selectedElement.src" class="pro-input" placeholder="https://..." />
            </div>
            <div class="prop-group">
              <label>Ajuste de contenido</label>
              <select v-model="selectedElement.fit" class="pro-input">
                <option value="contain">Contener (Ver entero)</option>
                <option value="cover">Cubrir (Recortar)</option>
                <option value="fill">Rellenar (Deformar)</option>
              </select>
            </div>
            <div class="prop-group" v-if="selectedElement.type === 'video' && !isYouTube(selectedElement.src)">
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
                <input type="file" @change="handleLocalMediaUpload($event, selectedElement)" accept=".glb,.gltf" hidden />
                🧊 Subir Modelo 3D
              </label>
            </div>
            <div class="prop-group mt-4">
              <label>O Enlace Externo (URL)</label>
              <input type="text" v-model="selectedElement.src" class="pro-input" placeholder="https://..." />
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
              <textarea v-model="selectedElement.contentHtml" class="pro-input" rows="5"></textarea>
            </div>
          </template>

          <template v-if="selectedElement.type === 'link'">
            <div class="prop-group">
              <label>Texto del Botón</label>
              <input type="text" v-model="selectedElement.text" class="pro-input" />
            </div>
            <div class="prop-group">
              <label>Diapositiva Destino (1 - {{ numPages }})</label>
              <input type="number" v-model="selectedElement.targetPage" min="1" :max="numPages" class="pro-input" />
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
              <div v-for="(item, index) in selectedElement.items" :key="index" class="accordion-edit-item">
                <input type="text" v-model="item.title" class="pro-input mb-1" placeholder="Título..." />
                <textarea v-model="item.content" class="pro-input" rows="2" placeholder="Contenido profundo..."></textarea>
                <button class="btn-text-danger mt-1" @click="selectedElement.items.splice(index, 1)">Eliminar</button>
              </div>
              <button class="btn-secondary w-100 mt-2" @click="selectedElement.items.push({title: 'Nueva Sección', content: 'Detalles...', isOpen: false})">
                + Añadir Sección
              </button>
            </div>
          </template>

          <div class="tool-divider mt-4"></div>
          <button class="btn-danger w-100" @click="deleteSelected">🗑️ Eliminar Elemento</button>
        </div>
        <div class="panel-content empty-state" v-else>
          Selecciona un elemento en el lienzo para editar sus propiedades.
        </div>
      </aside>
    </div>
  </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, markRaw, onMounted, onUnmounted } from 'vue'
import * as pdfjsLib from 'pdfjs-dist'
// @ts-ignore
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.js?url'
import NavbarComponent from '@/components/navbarComponent.vue'


pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc

// Estado Core
let _RAW_PDF_DOC: any = null
let _PDF_BASE64_STORE: string = "" 

const pdfCanvas = ref<HTMLCanvasElement | null>(null)
const workspaceRef = ref<HTMLElement | null>(null)

// Interfaz
const hasDoc = ref(false)
const playMode = ref(false)
const pageNum = ref(1)
const numPages = ref(0)
const zoom = ref(1.0)
type ToolType = 'select' | 'text' | '3d' | 'interactive' | 'image' | 'video' | 'shape' | 'link' | 'accordion';
const activeTool = ref<ToolType>('select')
const baseWidth = ref(1280) 
const baseHeight = ref(720)

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

const isYouTube = (url: string) => {
  if (!url) return false;
  return url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
}

// FIX: Usamos youtube-nocookie para asegurar que no salte CORS en archivos locales 
// y quitamos autoplay automático para que el navegador no lo bloquee.
const getYouTubeEmbedUrl = (url: string) => {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (match && match[1]) {
    return `https://www.youtube-nocookie.com/embed/${match[1]}?rel=0`;
  }
  return '';
}

// --- MOTOR DE DATOS ---
const documentState = ref<Record<number, any[]>>({})
const selectedElementId = ref<string | null>(null)

const currentPageElements = computed(() => documentState.value[pageNum.value] || [])
const selectedElement = computed(() => {
  if (!selectedElementId.value) return null
  return currentPageElements.value.find(el => el.id === selectedElementId.value)
})

// --- GESTIÓN DE PROYECTOS Y DIAPOSITIVAS ---
const createBlankProject = () => {
  _RAW_PDF_DOC = null
  _PDF_BASE64_STORE = ""
  numPages.value = 1
  pageNum.value = 1
  baseWidth.value = 1280
  baseHeight.value = 720
  documentState.value = {}
  hasDoc.value = true
  renderPage(1)
  setTimeout(fitToScreen, 100)
}

const addNewSlide = () => {
  numPages.value += 1
  if (!documentState.value[numPages.value]) {
    documentState.value[numPages.value] = []
  }
  changePageTo(numPages.value)
}

// --- LÓGICA DE HERRAMIENTAS Y OVERLAYS ---
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
    x: rawX, y: rawY,
    zIndex: currentPageElements.value.length + 10,
    type: activeTool.value
  }

  if (activeTool.value === 'link') {
    newElement.name = 'Botón Navegación'; newElement.width = 180; newElement.height = 45; newElement.text = 'Ir a página...'
    newElement.targetPage = 1; newElement.bgColor = '#2ea043'; newElement.color = '#ffffff'; newElement.borderRadius = 8
  } else if (activeTool.value === 'accordion') {
    newElement.name = 'Acordeón'; newElement.width = 300; newElement.height = 'auto'; newElement.bgColor = '#21262d'
    newElement.color = '#c9d1d9'; newElement.items = [{ title: 'Sección 1', content: 'Detalle...', isOpen: false }]
  } else if (activeTool.value === 'text') {
    newElement.name = 'Texto'; newElement.width = 300; newElement.height = 50; newElement.content = 'Texto Nuevo'
    newElement.color = '#000000'; newElement.fontSize = 24; newElement.fontWeight = '600'
  } else if (activeTool.value === 'shape') {
    newElement.name = 'Forma'; newElement.width = 150; newElement.height = 150; newElement.bgColor = '#2f81f7'
    newElement.opacity = 1; newElement.borderRadius = 8; newElement.borderWidth = 0; newElement.borderColor = '#ffffff'
  } else if (activeTool.value === 'image') {
    newElement.name = 'Imagen'; newElement.width = 250; newElement.height = 250; newElement.src = ''; newElement.fit = 'contain'; newElement.opacity = 1
  } else if (activeTool.value === 'video') {
    newElement.name = 'Vídeo'; newElement.width = 400; newElement.height = 225; newElement.src = ''; newElement.fit = 'cover'; newElement.autoplay = false; newElement.loop = false
  } else if (activeTool.value === '3d') {
    newElement.name = 'Modelo 3D'; newElement.width = 300; newElement.height = 300; newElement.src = 'https://modelviewer.dev/shared-assets/models/Astronaut.glb'
  } else if (activeTool.value === 'interactive') {
    newElement.name = 'Hotspot'; newElement.width = 40; newElement.height = 40; newElement.color = '#2f81f7'
    newElement.modalTitle = 'Info'; newElement.contentHtml = '<p>Edita el HTML.</p>'; newElement.isOpen = false
  }

  if (!documentState.value[pageNum.value]) documentState.value[pageNum.value] = []
  documentState.value[pageNum.value].push(newElement)
  selectedElementId.value = newElement.id
  activeTool.value = 'select' 
}

const handleLocalMediaUpload = (event: Event, el: any) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  el.src = URL.createObjectURL(file)
  if (el.type === '3d') el.name = file.name
}

// --- ARRASTRE ---
let isDragging = false
let startX = 0, startY = 0
let initialElX = 0, initialElY = 0

const startDrag = (e: MouseEvent, el: any) => {
  if (playMode.value || activeTool.value !== 'select') return
  selectedElementId.value = el.id
  isDragging = true
  startX = e.clientX; startY = e.clientY
  initialElX = el.x; initialElY = el.y

  const onMouseMove = (moveEvent: MouseEvent) => {
    if (!isDragging) return
    const dx = (moveEvent.clientX - startX) / zoom.value
    const dy = (moveEvent.clientY - startY) / zoom.value
    el.x = initialElX + dx; el.y = initialElY + dy
  }

  const onMouseUp = () => {
    isDragging = false
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
  }

  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
}

// --- UTILIDADES ---
const triggerInteraction = (el: any) => {
  if (!playMode.value) return
  currentPageElements.value.forEach(item => { if(item.id !== el.id && item.type === 'interactive') item.isOpen = false })
  el.isOpen = !el.isOpen
}

const deleteSelected = () => {
  if (!selectedElementId.value) return
  documentState.value[pageNum.value] = documentState.value[pageNum.value].filter(el => el.id !== selectedElementId.value)
  selectedElementId.value = null
}

const selectElement = (id: string) => {
  selectedElementId.value = id
  activeTool.value = 'select'
}

const togglePlayMode = () => {
  playMode.value = !playMode.value
  selectedElementId.value = null
  Object.values(documentState.value).forEach(pageItems => {
    pageItems.forEach(el => {
      if(el.type === 'interactive') el.isOpen = false;
      if(el.type === 'accordion') el.items.forEach((item: any) => item.isOpen = false);
    })
  });
  fitToScreen()
}

const getIconForType = (type: string) => {
  const icons: any = { text: 'T', shape: '🟥', image: '🖼️', video: '🎥', '3d': '🧊', interactive: '⚡', link: '🔗', accordion: '📑' }
  return icons[type] || '📄'
}

// --- RENDERIZADO DEL FONDO ---
const handleFileUpload = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  
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
    await renderPage(1)
    setTimeout(fitToScreen, 100)
  }
  reader.readAsDataURL(file)
}

const renderPage = async (num: number) => {
  if (!pdfCanvas.value) return
  const canvas = pdfCanvas.value
  const context = canvas.getContext('2d')
  if (!context) return
  
  const dpr = window.devicePixelRatio || 2

  if (_RAW_PDF_DOC && num <= _RAW_PDF_DOC.numPages) {
    const page = await _RAW_PDF_DOC.getPage(num)
    const viewport = page.getViewport({ scale: 1.0 }) 
    baseWidth.value = viewport.width
    baseHeight.value = viewport.height

    canvas.width = viewport.width * dpr
    canvas.height = viewport.height * dpr
    canvas.style.width = `${viewport.width}px`
    canvas.style.height = `${viewport.height}px`
    
    context.scale(dpr, dpr)
    await page.render({ canvasContext: context, viewport }).promise
  } 
  else {
    canvas.width = baseWidth.value * dpr
    canvas.height = baseHeight.value * dpr
    canvas.style.width = `${baseWidth.value}px`
    canvas.style.height = `${baseHeight.value}px`
    
    context.scale(dpr, dpr)
    context.clearRect(0, 0, baseWidth.value, baseHeight.value)
  }
}

const changePageTo = (num: number) => {
  if(num < 1 || num > numPages.value) return;
  pageNum.value = num
  selectedElementId.value = null
  renderPage(num)
}

const changeZoom = (delta: number) => { zoom.value = Math.max(0.2, Math.min(zoom.value + delta, 4)) }

const fitToScreen = () => {
  if (!workspaceRef.value) return
  const availableHeight = workspaceRef.value.clientHeight - 80
  const idealZoom = availableHeight / baseHeight.value
  zoom.value = Math.max(0.2, idealZoom)
}


// --- EL COMPILADOR MÁGICO A HTML AUTÓNOMO ---
const exportPresentation = () => {
  if (Object.keys(documentState.value).length === 0 && !_RAW_PDF_DOC) {
    alert("El proyecto está vacío. Añade algo antes de exportar.");
    return;
  }

  const safeStateString = JSON.stringify(documentState.value).replace(/</g, '\\x3C');
  
  if (safeStateString.includes('blob:')) {
    alert("⚠️ AVISO IMPORTANTE:\n\nHas subido archivos locales desde tu PC. Al exportar este archivo, tú podrás verlo en este equipo, pero si se lo envías a otra persona, los archivos no cargarán.\n\nPara que sea universal, usa Enlaces Externos (URLs de internet) para tus fotos/vídeos.");
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
    .canvas-wrapper { position: relative; background: white; box-shadow: 0 0 50px rgba(0,0,0,0.8); transform-origin: center center; transition: transform 0.2s; }
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

    .nav-controls { position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); background: rgba(30,30,30,0.8); backdrop-filter: blur(5px); padding: 10px 20px; border-radius: 30px; display: flex; gap: 15px; align-items: center; z-index: 10000; color: white; }
    .nav-btn { background: #2f81f7; color: white; border: none; padding: 8px 16px; border-radius: 20px; cursor: pointer; font-weight: bold; transition: 0.2s; }
    .nav-btn:hover:not(:disabled) { background: #1f6feb; }
    .nav-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  </style>
</head>
<body>
  <div id="app">
    <div class="canvas-wrapper" :style="{ transform: 'scale(' + zoom + ')', width: baseWidth + 'px', height: baseHeight + 'px' }" @click="closeAll">
      <canvas ref="pdfCanvas" class="layer-pdf"></canvas>
      
      <div v-for="el in currentPageElements" :key="el.id" class="interactive-element"
           :style="{ left: el.x + 'px', top: el.y + 'px', width: el.width + (typeof el.width === 'number' ? 'px' : ''), height: el.height + (typeof el.height === 'number' ? 'px' : ''), zIndex: el.zIndex }">
        
        <div v-if="el.type === 'text'" class="el-text" :style="{ color: el.color, fontSize: el.fontSize + 'px', fontWeight: el.fontWeight }">{{ el.content }}</div>
        
        <div v-else-if="el.type === 'shape'" class="el-shape" :style="{ backgroundColor: el.bgColor, borderRadius: el.borderRadius + 'px', border: el.borderWidth + 'px solid ' + el.borderColor, opacity: el.opacity }"></div>
        
        <img v-else-if="el.type === 'image' && el.src" :src="el.src" class="el-content-fitted" :style="{ objectFit: el.fit, opacity: el.opacity }" />
        
        <template v-else-if="el.type === 'video' && el.src">
          <iframe v-if="isYouTube(el.src)" :src="getYouTubeEmbedUrl(el.src)" class="el-content-fitted" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
          <video v-else :src="el.src" controls :autoplay="el.autoplay" :loop="el.loop" class="el-content-fitted" :style="{ objectFit: el.fit }"></video>
        </template>
        
        <model-viewer v-else-if="el.type === '3d' && el.src" :src="el.src" auto-rotate camera-controls style="width: 100%; height: 100%;"></model-viewer>
        
        <div v-else-if="el.type === 'interactive'" class="el-interactive" @click.stop="triggerInteraction(el)">
          <div class="hotspot-pulse" :style="{ backgroundColor: el.color, boxShadow: '0 0 15px ' + el.color }"></div>
          <div v-if="el.isOpen" class="interactive-modal" @click.stop>
            <h4 class="modal-title">{{ el.modalTitle }}</h4>
            <p v-html="el.contentHtml"></p>
          </div>
        </div>
        
        <div v-else-if="el.type === 'link'" class="el-link" :style="{ backgroundColor: el.bgColor, color: el.color, borderRadius: el.borderRadius + 'px' }" @click.stop="changePageTo(el.targetPage)">
          {{ el.text }}
        </div>
        
        <div v-else-if="el.type === 'accordion'" class="el-accordion" :style="{ backgroundColor: el.bgColor, color: el.color }">
          <div v-for="(item, idx) in el.items" :key="idx" class="accordion-item">
            <div class="accordion-header" @click.stop="item.isOpen = !item.isOpen">
              <span>{{ item.title }}</span>
              <span>{{ item.isOpen ? '▲' : '▼' }}</span>
            </div>
            <div v-show="item.isOpen" class="accordion-content">{{ item.content }}</div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="nav-controls">
      <button class="nav-btn" :disabled="pageNum <= 1" @click="changePageTo(pageNum - 1)">◀ Anterior</button>
      <span>{{ pageNum }} / {{ numPages }}</span>
      <button class="nav-btn" :disabled="pageNum >= numPages" @click="changePageTo(pageNum + 1)">Siguiente ▶</button>
      <button class="nav-btn" style="background: #30363d;" @click="toggleFullscreen">🔲 Pantalla Completa</button>
    </div>
  </div>

  <script>
    const { createApp, ref, computed, onMounted, nextTick, reactive } = Vue;

    createApp({
      setup() {
        const documentState = reactive(${safeStateString});
        const pdfBase64 = "${_PDF_BASE64_STORE}";
        
        const pageNum = ref(1);
        const numPages = ref(${numPages.value});
        const zoom = ref(1);
        const baseWidth = ref(${baseWidth.value});
        const baseHeight = ref(${baseHeight.value});
        const pdfCanvas = ref(null);
        let pdfDoc = null;

        const currentPageElements = computed(() => documentState[pageNum.value] || []);

        const initPdf = async () => {
          if (!pdfBase64) return renderPage(1);
          pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
          
          const binaryString = window.atob(pdfBase64);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          pdfDoc = await pdfjsLib.getDocument({ data: bytes }).promise;
          renderPage(1);
        };

        const renderPage = async (num) => {
          if (!pdfCanvas.value) return;
          const canvas = pdfCanvas.value;
          const context = canvas.getContext('2d');
          const dpr = window.devicePixelRatio || 2;

          if (pdfDoc && num <= pdfDoc.numPages) {
            const page = await pdfDoc.getPage(num);
            const viewport = page.getViewport({ scale: 1.0 });
            canvas.width = viewport.width * dpr;
            canvas.height = viewport.height * dpr;
            canvas.style.width = viewport.width + 'px';
            canvas.style.height = viewport.height + 'px';
            context.scale(dpr, dpr);
            await page.render({ canvasContext: context, viewport }).promise;
          } else {
            canvas.width = baseWidth.value * dpr;
            canvas.height = baseHeight.value * dpr;
            canvas.style.width = baseWidth.value + 'px';
            canvas.style.height = baseHeight.value + 'px';
            context.scale(dpr, dpr);
            context.clearRect(0, 0, baseWidth.value, baseHeight.value);
          }
        };

        const fitToScreen = () => {
          const availableHeight = window.innerHeight - 100; 
          const idealZoom = availableHeight / baseHeight.value;
          zoom.value = Math.max(0.1, idealZoom);
        };

        const changePageTo = (num) => {
          if (num < 1 || num > numPages.value) return;
          pageNum.value = num;
          closeAll();
          nextTick(() => renderPage(num));
        };

        const triggerInteraction = (el) => {
          currentPageElements.value.forEach(item => { if(item.id !== el.id && item.type === 'interactive') item.isOpen = false });
          el.isOpen = !el.isOpen;
        };

        const closeAll = () => {
          currentPageElements.value.forEach(item => {
            if(item.type === 'interactive') item.isOpen = false;
            if(item.type === 'accordion' && item.items) item.items.forEach(i => i.isOpen = false);
          });
        };

        const isYouTube = (url) => url && url.match(/(?:youtu\\.be\\/|youtube\\.com\\/(?:embed\\/|v\\/|watch\\?v=|watch\\?.+&v=))([\\w-]{11})/);
        const getYouTubeEmbedUrl = (url) => {
          const match = url.match(/(?:youtu\\.be\\/|youtube\\.com\\/(?:embed\\/|v\\/|watch\\?v=|watch\\?.+&v=))([\\w-]{11})/);
          return match ? 'https://www.youtube-nocookie.com/embed/' + match[1] + '?rel=0' : '';
        };

        const toggleFullscreen = () => {
          if (!document.fullscreenElement) document.documentElement.requestFullscreen();
          else if (document.exitFullscreen) document.exitFullscreen();
        };

        window.addEventListener('keydown', (e) => {
           if(e.key === 'ArrowRight' || e.key === 'Space') changePageTo(pageNum.value + 1);
           if(e.key === 'ArrowLeft') changePageTo(pageNum.value - 1);
        });

        onMounted(() => {
          window.addEventListener('resize', fitToScreen);
          fitToScreen();
          initPdf();
        });

        return {
          pageNum, numPages, zoom, baseWidth, baseHeight, pdfCanvas, currentPageElements,
          changePageTo, triggerInteraction, closeAll, isYouTube, getYouTubeEmbedUrl, toggleFullscreen
        };
      }
    }).mount('#app');
  <\/script>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Mi_Presentacion_Interactiva.html';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
</script>

<style scoped>
/* Tema de Producción Oscuro */
.pro-editor-app {
  --bg-darker: #0d1117;
  --bg-dark: #161b22;
  --bg-panel: #21262d;
  --border-color: #30363d;
  --accent-color: #2f81f7;
  --accent-hover: #1f6feb;
  --text-main: #c9d1d9;
  --text-muted: #8b949e;
  
  display: flex; flex-direction: column; height: 100vh;
  background-color: var(--bg-darker); color: var(--text-main);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
  overflow: hidden;
}

/* Header */
.pro-header {
  height: 48px; background-color: var(--bg-dark);
  border-bottom: 1px solid var(--border-color);
  display: flex; justify-content: space-between; align-items: center;
  padding: 0 1rem; z-index: 100;
}
.header-left, .header-center, .header-right { display: flex; align-items: center; gap: 1.5rem; }
.pro-logo { display: flex; align-items: center; gap: 0.5rem; font-weight: bold; color: white; font-size: 1.1rem; }
.text-accent { color: var(--accent-color); }

.file-menu { display: flex; gap: 0.5rem; }
.menu-item {
  background: transparent; border: 1px solid transparent; color: var(--text-main);
  padding: 6px 12px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 8px; font-size: 0.85rem;
}
.menu-item:hover:not(:disabled) { background: var(--bg-panel); border-color: var(--border-color); }
.shortcut { color: var(--text-muted); font-size: 0.75rem; }

.zoom-controls { display: flex; align-items: center; background: var(--bg-darker); border: 1px solid var(--border-color); border-radius: 6px; }
.zoom-level { padding: 0 12px; font-variant-numeric: tabular-nums; font-size: 0.85rem; min-width: 60px; text-align: center; }

.btn-play { background: #238636; color: white; border: none; padding: 6px 16px; border-radius: 6px; font-weight: 600; cursor: pointer; transition: 0.2s; }
.btn-play:hover { background: #2ea043; }
.btn-exit-play {
  position: fixed; top: 20px; right: 20px; z-index: 10001;
  background: rgba(30, 30, 30, 0.8); backdrop-filter: blur(5px);
  color: white; border: 1px solid #444; padding: 10px 20px; border-radius: 20px;
  cursor: pointer; font-weight: bold; font-size: 0.9rem; transition: background 0.2s;
}
.btn-exit-play:hover { background: rgba(248, 81, 73, 0.8); }

/* Workspace Layout */
.pro-workspace { display: flex; flex: 1; overflow: hidden; position: relative; }

/* Sidebars */
.pro-sidebar {
  width: 280px; background-color: var(--bg-dark); border: 1px solid var(--border-color);
  display: flex; flex-direction: column; z-index: 10;
}
.left-sidebar { border-width: 0 1px 0 0; }
.right-sidebar { border-width: 0 0 0 1px; }

.panel-header {
  padding: 12px 16px; font-size: 0.75rem; text-transform: uppercase; font-weight: 600;
  border-bottom: 1px solid var(--border-color); color: var(--text-muted); background: var(--bg-darker);
}
.panel-content { padding: 16px; overflow-y: auto; }

/* Inspector Inputs */
.prop-row { display: flex; gap: 10px; }
.half { flex: 1; }
.prop-group { margin-bottom: 16px; }
.prop-group label { display: block; font-size: 0.8rem; color: var(--text-muted); margin-bottom: 6px; }
.pro-input {
  width: 100%; box-sizing: border-box; background: var(--bg-darker); color: var(--text-main);
  border: 1px solid var(--border-color); padding: 8px; border-radius: 6px; font-family: inherit; font-size: 0.85rem;
}
.pro-input:focus { outline: none; border-color: var(--accent-color); }
.pro-color-picker { width: 100%; height: 36px; padding: 0; border: none; border-radius: 6px; cursor: pointer; background: transparent; }
.badge-type { display: inline-block; background: var(--bg-panel); border: 1px solid var(--border-color); padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: bold;}
.btn-danger { background: transparent; color: #f85149; border: 1px solid #f85149; padding: 8px; border-radius: 6px; cursor: pointer; }
.btn-danger:hover { background: #f85149; color: white; }
.btn-text-danger { background: none; border: none; color: #f85149; cursor: pointer; font-size: 0.75rem; padding: 0; text-decoration: underline; }
.btn-secondary { background: var(--bg-panel); border: 1px solid var(--border-color); color: white; padding: 8px; border-radius: 6px; cursor: pointer; font-size: 0.85rem; transition: 0.2s;}
.btn-secondary:hover { background: #30363d; }
.w-100 { width: 100%; box-sizing: border-box; }
.mt-4 { margin-top: 1rem; }
.mt-2 { margin-top: 0.5rem; }
.mt-1 { margin-top: 0.25rem; }
.mb-1 { margin-bottom: 0.25rem; }
.block { display: block; }
.text-center { text-align: center; }
.file-upload-group { background: rgba(0,0,0,0.2); padding: 12px; border-radius: 8px; border: 1px dashed var(--border-color); }
.checkbox-label { display: flex; align-items: center; gap: 8px; font-size: 0.85rem; cursor: pointer;}
.accordion-edit-item { background: var(--bg-darker); border: 1px solid var(--border-color); padding: 10px; border-radius: 6px; margin-bottom: 10px; }

/* Tree View */
.tree-view { flex: 1; display: flex; flex-direction: column; overflow-y: auto; }
.tree-node-title { padding: 8px 16px; cursor: pointer; font-size: 0.9rem; font-weight: 500; }
.tree-node-title:hover { background: var(--bg-panel); }
.tree-node-title.is-active { background: rgba(47, 129, 247, 0.1); color: var(--accent-color); border-left: 3px solid var(--accent-color); }
.tree-children { padding-left: 16px; }
.tree-child { padding: 6px 16px; cursor: pointer; font-size: 0.85rem; color: var(--text-muted); display: flex; align-items: center; gap: 8px; }
.tree-child:hover { color: var(--text-main); }
.tree-child.is-selected { color: white; background: rgba(255,255,255,0.05); }
.sidebar-footer { padding: 16px; margin-top: auto; border-top: 1px solid var(--border-color); background: var(--bg-dark); }

/* Toolbar */
.pro-toolbar {
  width: 56px; background-color: var(--bg-panel); border-right: 1px solid var(--border-color);
  display: flex; flex-direction: column; align-items: center; padding: 12px 0; z-index: 10;
}
.tool-btn { background: transparent; border: none; color: var(--text-muted); cursor: pointer; border-radius: 6px; display: flex; align-items: center; justify-content: center; }
.tool-btn:hover { color: white; background: var(--bg-dark); }
.tool-btn.large { height: 40px; width: 40px; font-size: 1.2rem; margin-bottom: 8px; }
.tool-btn.active { background: var(--accent-color); color: white; }
.tool-divider { width: 60%; height: 1px; background: var(--border-color); margin: 8px 0; }

/* Canvas Area */
.pro-canvas-area {
  flex: 1; background-color: var(--bg-darker); overflow: auto; position: relative;
  display: flex; justify-content: center; align-items: flex-start; padding: 2rem;
  background-image: radial-gradient(var(--border-color) 1px, transparent 1px); background-size: 24px 24px;
}
.canvas-wrapper.play-mode-active { 
  padding: 3rem; display: flex; justify-content: center; align-items: flex-start;
  background: #000; position: fixed; inset: 0; z-index: 10000; overflow: auto;
}

/* Layer Engine */
.layer-engine { position: relative; background: white; box-shadow: 0 12px 32px rgba(0,0,0,0.6); transform-origin: top center; }
.layer-pdf { position: absolute; top: 0; left: 0; z-index: 0; pointer-events: none; }

/* Overlays */
.interactive-element { position: absolute; cursor: move; box-sizing: border-box; display: flex; }
.interactive-element.is-selected { outline: 2px dashed var(--accent-color); outline-offset: 2px; }
.interactive-element.is-clickable { cursor: pointer; }

/* Tool Classes */
.el-text { width: 100%; height: 100%; font-family: sans-serif; white-space: pre-wrap; line-height: 1.2; text-shadow: 1px 1px 2px rgba(255,255,255,0.8); }
.el-shape { width: 100%; height: 100%; }
.el-image-container, .el-video-container { width: 100%; height: 100%; position: relative; }
.el-content-fitted { width: 100%; height: 100%; display: block; }
.placeholder-box { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.1); border: 2px dashed #999; color: #555; font-weight: bold; font-size: 0.9rem; text-align: center;}
.el-3d { width: 100%; height: 100%; position: relative; }
.drag-protector { position: absolute; inset: 0; z-index: 10; background: rgba(0,0,0,0.01); }

/* Hotspots */
.el-interactive { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; cursor: pointer !important; }
.hotspot-pulse { width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; animation: pulse 2s infinite; }
@keyframes pulse { 0% { transform: scale(0.95); opacity: 0.8; } 70% { transform: scale(1.1); opacity: 0; } 100% { transform: scale(0.95); opacity: 0; } }
.interactive-modal {
  position: absolute; top: 100%; left: 50%; transform: translateX(-50%); margin-top: 15px;
  background: white; color: #333; padding: 20px; border-radius: 8px; width: 320px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.4); z-index: 9999; cursor: default;
}
.modal-title { margin: 0 0 10px 0; font-size: 1.1rem; color: #111; border-bottom: 1px solid #eee; padding-bottom: 5px; }

/* Botón Navegación */
.el-link { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-family: sans-serif; box-shadow: 0 4px 6px rgba(0,0,0,0.3); transition: transform 0.1s; }
.el-link:active { transform: scale(0.98); }

/* Acordeón */
.el-accordion { width: 100%; height: 100%; overflow-y: auto; border-radius: 8px; font-family: sans-serif; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
.accordion-item { border-bottom: 1px solid rgba(255,255,255,0.1); }
.accordion-header { padding: 12px 16px; font-weight: bold; display: flex; justify-content: space-between; cursor: pointer; background: rgba(0,0,0,0.2); transition: background 0.2s; }
.accordion-header:hover { background: rgba(0,0,0,0.4); }
.accordion-content { padding: 16px; font-size: 0.9rem; line-height: 1.5; background: rgba(0,0,0,0.05); }
.accordion-content.is-preview { opacity: 0.5; font-style: italic; }

/* Empty State */
.empty-workspace { margin-top: 10vh; text-align: center; color: var(--text-muted); }
.empty-box { background: var(--bg-panel); padding: 3rem; border-radius: 12px; border: 1px dashed var(--border-color); }
.empty-icon { font-size: 3.5rem; display: block; margin-bottom: 1rem; }
.button-group { display: flex; gap: 1rem; justify-content: center; align-items: center; }
.btn-primary { background: var(--accent-color); color: white; padding: 10px 20px; border-radius: 6px; cursor: pointer; display: inline-block; font-weight: 500; transition: 0.2s; }
.btn-primary:hover { background: var(--accent-hover); }
</style>