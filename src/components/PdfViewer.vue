<template>
  <div class="pdf-viewer-container">
    <canvas
      ref="pdfCanvas"
      class="layer-pdf"
      role="img"
      aria-label="Contenido visual de la pagina del PDF"
    >
      Su navegador no soporta visualizacion de canvas.
    </canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, markRaw } from 'vue';
import * as pdfjsLib from 'pdfjs-dist';
import type { PDFDocumentProxy, RenderTask } from 'pdfjs-dist';
// @ts-ignore
import PdfWorker from 'pdfjs-dist/build/pdf.worker.min.js?worker';

pdfjsLib.GlobalWorkerOptions.workerPort = new PdfWorker();

const props = defineProps({
  pdfBase64: {
    type: String,
    required: true
  },
  pageNum: {
    type: Number,
    required: true
  }
});

const emit = defineEmits(['document-loaded', 'page-rendered', 'document-error']);

const pdfCanvas = ref<HTMLCanvasElement | null>(null);
let rawDoc: PDFDocumentProxy | null = null;
let renderToken = 0;
let loadToken = 0;
let currentRenderTask: RenderTask | null = null;
let unmounted = false;

const pdfDocumentCache = new Map<string, PDFDocumentProxy>();
const pdfDocumentPending = new Map<string, Promise<PDFDocumentProxy>>();
const PDF_CACHE_LIMIT = 6;

const normalizePdfSource = (pdfBase64: string) => {
  const pdfStr = pdfBase64.trim();
  if (pdfStr.startsWith('http') || pdfStr.startsWith('/')) return pdfStr;

  let rawBase64 = pdfStr.replace(/\s+/g, '');
  if (rawBase64.includes('base64,')) {
    rawBase64 = rawBase64.split('base64,')[1] || '';
  }
  return `base64:${rawBase64}`;
};

const getOrLoadPdfDocument = async (pdfBase64: string) => {
  const sourceKey = normalizePdfSource(pdfBase64);
  if (pdfDocumentCache.has(sourceKey)) return pdfDocumentCache.get(sourceKey);

  const existing = pdfDocumentPending.get(sourceKey);
  if (existing) return existing;

  const touchCacheEntry = (cacheKey: string, doc: PDFDocumentProxy) => {
    if (pdfDocumentCache.has(cacheKey)) {
      pdfDocumentCache.delete(cacheKey);
    }
    pdfDocumentCache.set(cacheKey, doc);

    if (pdfDocumentCache.size <= PDF_CACHE_LIMIT) return;

    const oldestKey = pdfDocumentCache.keys().next().value;
    if (!oldestKey || oldestKey === cacheKey) return;

    const oldestDoc = pdfDocumentCache.get(oldestKey);
    pdfDocumentCache.delete(oldestKey);
    if (oldestDoc?.destroy) {
      oldestDoc.destroy().catch(() => null);
    }
  };

  const task = (async () => {
    if (sourceKey.startsWith('http') || sourceKey.startsWith('/')) {
      const loadingTask = pdfjsLib.getDocument(sourceKey);
      const doc = markRaw(await loadingTask.promise);
      touchCacheEntry(sourceKey, doc);
      pdfDocumentPending.delete(sourceKey);
      return doc;
    }

    const rawBase64 = sourceKey.slice('base64:'.length);
    let uint8Array: Uint8Array;

    try {
      const response = await fetch(`data:application/pdf;base64,${rawBase64}`);
      const arrayBuffer = await response.arrayBuffer();
      uint8Array = new Uint8Array(arrayBuffer);
    } catch (error) {
      throw new Error(`Invalid PDF base64 source: ${(error as Error).message}`);
    }

    const loadingTask = pdfjsLib.getDocument({ data: uint8Array });
    const doc = markRaw(await loadingTask.promise);
    touchCacheEntry(sourceKey, doc);
    pdfDocumentPending.delete(sourceKey);
    return doc;
  })().catch((error) => {
    pdfDocumentPending.delete(sourceKey);
    throw error;
  });

  pdfDocumentPending.set(sourceKey, task);
  return task;
};

const loadDocument = async () => {
  loadToken += 1;
  const token = loadToken;

  try {
    const document = await getOrLoadPdfDocument(props.pdfBase64);
    if (token !== loadToken || unmounted) return;

    rawDoc = document;
    emit('document-loaded', rawDoc);
    await renderPage(props.pageNum);
  } catch (err) {
    if (token !== loadToken || unmounted) return;
    emit('document-error', err);
    console.error('Error loading PDF in PdfViewer:', err);
  }
};

const renderPage = async (num: number) => {
  if (!rawDoc || !pdfCanvas.value) return;
  renderToken += 1;
  const token = renderToken;

  if (currentRenderTask) {
    currentRenderTask.cancel();
    currentRenderTask = null;
  }

  const canvas = pdfCanvas.value;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Evita mostrar la pagina anterior mientras se renderiza la nueva.
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (num > 0 && num <= rawDoc.numPages) {
    const page = await rawDoc.getPage(num);
    if (token !== renderToken || unmounted || !pdfCanvas.value) return;

    const viewport = page.getViewport({ scale: 1.0 });

    const qualityMultiplier = window.devicePixelRatio || 1;

    canvas.width = viewport.width * qualityMultiplier;
    canvas.height = viewport.height * qualityMultiplier;
    canvas.style.width = `${viewport.width}px`;
    canvas.style.height = `${viewport.height}px`;

    ctx.setTransform(qualityMultiplier, 0, 0, qualityMultiplier, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const originalFillText = ctx.fillText;
    const originalStrokeText = ctx.strokeText;
    ctx.fillText = function () {};
    ctx.strokeText = function () {};

    try {
      currentRenderTask = page.render({ canvasContext: ctx, viewport });
      await currentRenderTask.promise;
      if (token !== renderToken || unmounted) return;
      emit('page-rendered', { width: viewport.width, height: viewport.height, page });
    } catch (error) {
      const renderError = error as { name?: string };
      if (renderError?.name !== 'RenderingCancelledException') {
        throw error;
      }
    } finally {
      ctx.fillText = originalFillText;
      ctx.strokeText = originalStrokeText;
      currentRenderTask = null;
    }
  } else {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
};

watch(
  () => props.pdfBase64,
  (newVal, oldVal) => {
    if (!newVal || newVal === oldVal) return;
    loadDocument();
  }
);

watch(
  () => props.pageNum,
  (newVal, oldVal) => {
    if (!rawDoc || newVal === oldVal) return;
    renderPage(newVal);
  }
);

onMounted(() => {
  if (props.pdfBase64) loadDocument();
});

onUnmounted(() => {
  unmounted = true;
  loadToken += 1;
  renderToken += 1;

  if (currentRenderTask) {
    currentRenderTask.cancel();
    currentRenderTask = null;
  }

  if (rawDoc) {
    rawDoc.destroy().catch(() => null);
  }

  rawDoc = null;
});
</script>

<style scoped>
.pdf-viewer-container {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
}
.layer-pdf {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  display: block;
}
</style>
