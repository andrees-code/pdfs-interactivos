<template>
  <div class="pdf-viewer-container">
    <canvas ref="pdfCanvas" class="layer-pdf" v-show="true"></canvas>
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

const loadDocument = async () => {
  try {
    let loadingTask;
    const pdfStr = props.pdfBase64.trim();
    if (pdfStr.startsWith('http') || pdfStr.startsWith('/')) {
      loadingTask = pdfjsLib.getDocument(pdfStr);
    } else {
      let rawBase64 = pdfStr.replace(/\s+/g, '');
      if (rawBase64.includes('base64,')) {
        rawBase64 = rawBase64.split('base64,')[1];
      }
      const pdfData = atob(rawBase64);
      const uint8Array = new Uint8Array(pdfData.length);
      for (let i = 0; i < pdfData.length; i++) {
        uint8Array[i] = pdfData.charCodeAt(i);
      }
      loadingTask = pdfjsLib.getDocument({ data: uint8Array });
    }

    rawDoc = markRaw(await loadingTask.promise);
    emit('document-loaded', rawDoc);
    renderPage(props.pageNum);
  } catch (err) {
    emit('document-error', err);
    console.error('Error loading PDF in PdfViewer:', err);
  }
};

const renderPage = async (num: number) => {
  if (!rawDoc || !pdfCanvas.value) return;
  const canvas = pdfCanvas.value;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  if (num > 0 && num <= rawDoc.numPages) {
    const page = await rawDoc.getPage(num);
    const viewport = page.getViewport({ scale: 1.0 });

    const qualityMultiplier = 2.0;

    canvas.width = viewport.width * qualityMultiplier;
    canvas.height = viewport.height * qualityMultiplier;
    canvas.style.width = `${viewport.width}px`;
    canvas.style.height = `${viewport.height}px`;

    ctx.scale(qualityMultiplier, qualityMultiplier);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const originalFillText = ctx.fillText;
    const originalStrokeText = ctx.strokeText;
    ctx.fillText = function () {};
    ctx.strokeText = function () {};

    try {
      await page.render({ canvasContext: ctx, viewport }).promise;
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
