<template>
  <div class="pdf-viewer-container">
    <canvas v-show="true" ref="pdfCanvas" class="layer-pdf"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, markRaw } from 'vue';
import * as pdfjsLib from 'pdfjs-dist';
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
let rawDoc: any = null;
let renderToken = 0;

const pdfDocumentCache = new Map<string, any>();
const pdfDocumentPending = new Map<string, Promise<any>>();

const normalizePdfSource = (pdfBase64: string) => {
  const pdfStr = pdfBase64.trim();
  if (pdfStr.startsWith('http') || pdfStr.startsWith('/')) return pdfStr;

  let rawBase64 = pdfStr.replace(/\s+/g, '');
  if (rawBase64.includes('base64,')) {
    rawBase64 = rawBase64.split('base64,')[1];
  }
  return `base64:${rawBase64}`;
};

const getOrLoadPdfDocument = async (pdfBase64: string) => {
  const sourceKey = normalizePdfSource(pdfBase64);
  if (pdfDocumentCache.has(sourceKey)) return pdfDocumentCache.get(sourceKey);

  const existing = pdfDocumentPending.get(sourceKey);
  if (existing) return existing;

  const task = (async () => {
    if (sourceKey.startsWith('http') || sourceKey.startsWith('/')) {
      const loadingTask = pdfjsLib.getDocument(sourceKey);
      const doc = markRaw(await loadingTask.promise);
      pdfDocumentCache.set(sourceKey, doc);
      pdfDocumentPending.delete(sourceKey);
      return doc;
    }

    const rawBase64 = sourceKey.slice('base64:'.length);
    const pdfData = atob(rawBase64);
    const uint8Array = new Uint8Array(pdfData.length);
    for (let i = 0; i < pdfData.length; i++) {
      uint8Array[i] = pdfData.charCodeAt(i);
    }

    const loadingTask = pdfjsLib.getDocument({ data: uint8Array });
    const doc = markRaw(await loadingTask.promise);
    pdfDocumentCache.set(sourceKey, doc);
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
  try {
    rawDoc = await getOrLoadPdfDocument(props.pdfBase64);
    emit('document-loaded', rawDoc);
    await renderPage(props.pageNum);
  } catch (err) {
    emit('document-error', err);
    console.error('Error loading PDF in PdfViewer:', err);
  }
};

const renderPage = async (num: number) => {
  if (!rawDoc || !pdfCanvas.value) return;
  renderToken += 1;
  const token = renderToken;

  const canvas = pdfCanvas.value;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  if (num > 0 && num <= rawDoc.numPages) {
    const page = await rawDoc.getPage(num);
    if (token !== renderToken) return;

    const viewport = page.getViewport({ scale: 1.0 });

    const qualityMultiplier = 2.0;

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
      await page.render({ canvasContext: ctx, viewport }).promise;
      if (token !== renderToken) return;
      emit('page-rendered', { width: viewport.width, height: viewport.height, page });
    } finally {
      ctx.fillText = originalFillText;
      ctx.strokeText = originalStrokeText;
    }
  } else {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
};

watch(() => props.pdfBase64, (newVal) => {
  if (newVal) loadDocument();
});

watch(() => props.pageNum, (newVal) => {
  if (rawDoc) renderPage(newVal);
});

onMounted(() => {
  if (props.pdfBase64) loadDocument();
});
</script>

<style scoped>
.pdf-viewer-container {
  width: 100%;
  height: 100%;
}
.layer-pdf {
  pointer-events: none;
  display: block;
}
</style>
