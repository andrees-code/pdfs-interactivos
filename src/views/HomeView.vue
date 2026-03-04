<template>
    <div>
  <navbar-component />
  <div class="pdf-app-shell">
    <nav class="pdf-navbar">
      <div class="nav-left">
        <div class="logo">
          <span class="logo-icon">📄</span>
          <span class="logo-text">PDF<span class="text-blue">Pro</span></span>
        </div>
        <label class="upload-btn">
          <input type="file" @change="handleFileUpload" accept="application/pdf" hidden />
          <span class="icon">📂</span> Abrir archivo
        </label>
      </div>

      <div class="nav-center" v-if="hasDoc">
        <div class="pagination-ctrl">
          <button @click="changePage(-1)" :disabled="pageNum <= 1" class="nav-icon-btn">◀</button>
          <div class="page-indicator">
            <input type="number" v-model.number="pageNum" @change="renderPage(pageNum)" min="1" :max="numPages" />
            <span>/ {{ numPages }}</span>
          </div>
          <button @click="changePage(1)" :disabled="pageNum >= numPages" class="nav-icon-btn">▶</button>
        </div>
      </div>

      <div class="nav-right" v-if="hasDoc">
        <button 
          class="action-btn edit-btn" 
          @click="textMode = !textMode" 
          :class="{ 'is-active': textMode }"
        >
          <span class="icon">{{ textMode ? '✍️' : '➕' }}</span> 
          {{ textMode ? 'Editando...' : 'Añadir Texto' }}
        </button>
        <button class="action-btn save-btn" @click="downloadPDF">
          <span class="icon">💾</span> Guardar
        </button>
      </div>
    </nav>

    <main class="viewer-main">
      <div v-if="!hasDoc" class="empty-state">
        <div class="empty-icon">📂</div>
        <h2>No hay ningún documento abierto</h2>
        <p>Selecciona un archivo PDF para empezar a visualizar y editar.</p>
      </div>

      <div v-show="hasDoc" class="pdf-canvas-container">
        <div class="canvas-shadow-box">
          <canvas
            ref="pdfCanvas"
            :class="{ 'is-editable': textMode }"
            @click="handleCanvasClick"
          ></canvas>
        </div>
      </div>
    </main>

    <footer class="pdf-footer" v-if="hasDoc">
      <span>Zoom: 150%</span>
      <span>|</span>
      <span>Resolución optimizada (DPI)</span>
    </footer>
  </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted, markRaw } from 'vue'
import * as pdfjsLib from 'pdfjs-dist'
// @ts-ignore
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.js?url'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import NavbarComponent from '@/components/navbarComponent.vue'

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc

let _RAW_PDF_DOC: any = null
let _RAW_PDF_BYTES: Uint8Array | null = null

const pdfCanvas = ref<HTMLCanvasElement | null>(null)
const hasDoc = ref(false)
const pageNum = ref(1)
const numPages = ref(0)
const textMode = ref(false)
const textElements = ref<any[]>([])
const scale = 1.5

const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  _RAW_PDF_BYTES = new Uint8Array(await file.arrayBuffer())

  try {
    const loadingTask = pdfjsLib.getDocument({ data: _RAW_PDF_BYTES })
    _RAW_PDF_DOC = markRaw(await loadingTask.promise)
    numPages.value = _RAW_PDF_DOC.numPages
    hasDoc.value = true
    pageNum.value = 1
    await renderPage(1)
  } catch (e) {
    console.error('Error al cargar PDF:', e)
  }
}

const renderPage = async (num: number) => {
  if (!_RAW_PDF_DOC || !pdfCanvas.value) return
  if (num < 1 || num > numPages.value) return

  const page = await _RAW_PDF_DOC.getPage(num)
  const viewport = page.getViewport({ scale })
  const canvas = pdfCanvas.value
  const context = canvas.getContext('2d')
  if (!context) return

  const dpr = window.devicePixelRatio || 1
  canvas.height = viewport.height * dpr
  canvas.width = viewport.width * dpr
  canvas.style.width = `${viewport.width}px`
  canvas.style.height = `${viewport.height}px`

  context.setTransform(1, 0, 0, 1, 0, 0)
  context.scale(dpr, dpr)

  await page.render({ canvasContext: context, viewport }).promise
  drawStoredText()
}

const handleCanvasClick = (e: MouseEvent) => {
  if (!textMode.value || !pdfCanvas.value) return
  const rect = pdfCanvas.value.getBoundingClientRect()
  const text = prompt('Escribe el texto que quieres añadir:')

  if (text) {
    textElements.value.push({
      text,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      page: pageNum.value
    })
    renderPage(pageNum.value)
  }
}

const drawStoredText = () => {
  const ctx = pdfCanvas.value?.getContext('2d')
  if (!ctx) return
  textElements.value.filter(el => el.page === pageNum.value).forEach(el => {
    ctx.fillStyle = '#2563eb'
    ctx.font = '600 16px Inter, system-ui, sans-serif'
    ctx.fillText(el.text, el.x, el.y)
  });
}

const changePage = (offset: number) => {
  pageNum.value += offset
  renderPage(pageNum.value)
}

const downloadPDF = async () => {
  if (!_RAW_PDF_BYTES || !pdfCanvas.value) return
  const pdfDoc = await PDFDocument.load(_RAW_PDF_BYTES)
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const pages = pdfDoc.getPages()

  textElements.value.forEach(el => {
    const target = pages[el.page - 1]
    const { height } = target.getSize()
    const sX = target.getWidth() / pdfCanvas.value!.clientWidth
    const sY = target.getHeight() / pdfCanvas.value!.clientHeight

    target.drawText(el.text, {
      x: el.x * sX,
      y: height - el.y * sY,
      size: 14,
      font,
      color: rgb(0.14, 0.38, 0.92)
    })
  })

  const blob = new Blob([await pdfDoc.save()], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'pdf_pro_editado.pdf'
  a.click()
  URL.revokeObjectURL(url)
}

onUnmounted(() => { _RAW_PDF_DOC = null; _RAW_PDF_BYTES = null })
</script>

<style>
/* Estructura Base */
.pdf-app-shell {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #1e293b; /* Slate 800 */
  color: #f1f5f9;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}

/* Navbar Estilizada */
.pdf-navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 1.5rem;
  height: 64px;
  background: rgba(30, 41, 59, 0.8);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 100;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-right: 2rem;
}
.logo-icon { font-size: 1.5rem; }
.logo-text { font-weight: 800; font-size: 1.25rem; letter-spacing: -0.5px; }
.text-blue { color: #3b82f6; }

.nav-left, .nav-right { display: flex; align-items: center; gap: 1rem; }

/* Botones */
.upload-btn {
  background: rgba(255,255,255,0.05);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;
  border: 1px solid rgba(255,255,255,0.1);
}
.upload-btn:hover { background: rgba(255,255,255,0.1); }

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.85rem;
  border: none;
  cursor: pointer;
  transition: transform 0.1s, background 0.2s;
}

.edit-btn { background: #334155; color: white; }
.edit-btn.is-active { background: #2563eb; box-shadow: 0 0 15px rgba(37, 99, 235, 0.4); }
.save-btn { background: #10b981; color: white; }
.action-btn:active { transform: scale(0.96); }

/* Paginación */
.pagination-ctrl {
  display: flex;
  align-items: center;
  background: #334155;
  padding: 0.25rem;
  border-radius: 10px;
  gap: 0.5rem;
}
.nav-icon-btn {
  background: transparent;
  border: none;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  cursor: pointer;
}
.nav-icon-btn:hover:not(:disabled) { background: rgba(255,255,255,0.1); }
.nav-icon-btn:disabled { opacity: 0.3; }

.page-indicator { display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; }
.page-indicator input {
  width: 40px;
  background: #1e293b;
  border: 1px solid rgba(255,255,255,0.1);
  color: white;
  text-align: center;
  border-radius: 4px;
  padding: 2px;
}

/* Viewer */
.viewer-main {
  flex: 1;
  overflow: auto;
  padding: 3rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #0f172a; /* Slate 900 */
}

.empty-state {
  margin-top: 10vh;
  text-align: center;
  color: #64748b;
}
.empty-icon { font-size: 4rem; margin-bottom: 1rem; opacity: 0.5; }

.pdf-canvas-container {
  max-width: 100%;
}

.canvas-shadow-box {
  background: white;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  border-radius: 4px;
  overflow: hidden;
}

canvas {
  display: block;
  cursor: default;
}
canvas.is-editable {
  cursor: crosshair;
}

.pdf-footer {
  height: 32px;
  background: #1e293b;
  border-top: 1px solid rgba(255,255,255,0.05);
  display: flex;
  align-items: center;
  padding: 0 1rem;
  gap: 1rem;
  font-size: 0.75rem;
  color: #64748b;
}
</style>