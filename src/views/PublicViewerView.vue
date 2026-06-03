<template>
  <div class="public-viewer-root">
    <div v-if="isLoading" class="viewer-state">Cargando presentación pública...</div>
    <div v-else-if="errorMsg" class="viewer-state viewer-error">{{ errorMsg }}</div>

    <template v-else>
      <header class="viewer-header">
        <h1 class="viewer-title">{{ title }}</h1>
        <div class="viewer-controls">
          <button class="control-btn" :disabled="currentPage <= 1" @click="goToPage(currentPage - 1)">
            Anterior
          </button>
          <span>{{ currentPage }} / {{ numPages }}</span>
          <button class="control-btn" :disabled="currentPage >= numPages" @click="goToPage(currentPage + 1)">
            Siguiente
          </button>
        </div>
      </header>

      <main ref="stageWrapRef" class="viewer-stage-wrap">
        <div class="stage-scale" :style="{ transform: `scale(${stageScale})` }">
          <div
            class="viewer-stage"
            :style="{
              width: `${baseWidth}px`,
              height: `${baseHeight}px`,
              backgroundColor: currentSlideConfig?.bgColor || '#ffffff',
              backgroundImage: currentSlideConfig?.bgImage ? `url(${currentSlideConfig.bgImage})` : 'none',
            }"
          >
            <div
              v-for="el in currentElements"
              :key="el.id"
              class="element"
              :style="getElementStyle(el)"
            >
              <div v-if="el.type === 'shape'" class="shape-fill" :style="{ background: el.bgColor || '#94a3b8' }"></div>

              <img
                v-else-if="el.type === 'image' || el.type === 'magnifier'"
                :src="el.src"
                class="media-fit"
                :alt="el.name || 'Imagen'"
              />

              <video
                v-else-if="el.type === 'video'"
                :src="el.src"
                class="media-fit"
                controls
                playsinline
              ></video>

              <audio
                v-else-if="el.type === 'audio'"
                :src="el.src"
                controls
                class="audio-fit"
              ></audio>

              <button
                v-else-if="el.type === 'link'"
                class="link-btn"
                @click="handleLinkElement(el)"
              >
                {{ el.buttonText || el.content || 'Abrir enlace' }}
              </button>

              <i
                v-else-if="el.type === 'icon'"
                class="ph"
                :class="`ph-${el.icon || 'star'}`"
                :style="{ fontSize: `${Math.max(18, Number(el.iconSize) || 36)}px`, color: el.color || '#0f172a' }"
              ></i>

              <ul v-else-if="el.type === 'list' && Array.isArray(el.items)" class="list-content">
                <li v-for="(item, idx) in el.items" :key="idx">{{ item?.text || item }}</li>
              </ul>

              <div v-else-if="el.type === 'checkbox' && Array.isArray(el.items)" class="checkbox-content">
                <label v-for="(item, idx) in el.items" :key="idx" class="checkbox-item">
                  <input type="checkbox" :checked="!!item?.checked" disabled />
                  <span>{{ item?.text || item }}</span>
                </label>
              </div>

              <pre v-else-if="el.type === 'codeblock'" class="code-content">{{ el.code || el.content || '' }}</pre>

              <div v-else class="text-content" :style="getTextStyle(el)">
                {{ el.content || el.name || el.type }}
              </div>
            </div>
          </div>
        </div>
      </main>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import pako from 'pako'
import { presentationService } from '@/services/presentacion.service'

const route = useRoute()
const stageWrapRef = ref<HTMLElement | null>(null)
const isLoading = ref(true)
const errorMsg = ref('')

const title = ref('Presentación pública')
const baseWidth = ref(1280)
const baseHeight = ref(720)
const currentPage = ref(1)
const numPages = ref(1)
const stageScale = ref(1)

const documentState = ref<Record<number, any[]>>({ 1: [] })
const slideConfigs = ref<Record<number, any>>({ 1: { bgColor: '#ffffff', bgImage: null } })

const currentElements = computed(() => documentState.value[currentPage.value] || [])
const currentSlideConfig = computed(() => slideConfigs.value[currentPage.value] || { bgColor: '#ffffff', bgImage: null })

const loadedImageUrls = new Set<string>()
const pendingImageLoads = new Map<string, Promise<void>>()
const previousDocumentTitle = typeof document !== 'undefined' ? document.title : ''

const ensureMetaDescriptionTag = () => {
  let tag = document.querySelector('meta[name="description"]') as HTMLMetaElement | null
  if (!tag) {
    tag = document.createElement('meta')
    tag.name = 'description'
    document.head.appendChild(tag)
  }
  return tag
}

const updateSeo = (nextTitle: string) => {
  if (typeof document === 'undefined') return
  const safeTitle = nextTitle?.trim() || 'Presentacion publica'
  document.title = `${safeTitle} | DocFlow`
  const description = ensureMetaDescriptionTag()
  description.content = `Visualizando la presentacion publica ${safeTitle} en DocFlow.`
}

const normalizeUrl = (url?: string | null) => {
  if (!url || typeof url !== 'string') return ''
  return url.trim()
}

const preloadImage = (url?: string | null): Promise<void> => {
  const cleanUrl = normalizeUrl(url)
  if (!cleanUrl || cleanUrl === 'none') return Promise.resolve()
  if (loadedImageUrls.has(cleanUrl)) return Promise.resolve()

  const existing = pendingImageLoads.get(cleanUrl)
  if (existing) return existing

  const task = new Promise<void>((resolve) => {
    const img = new Image()
    img.loading = 'eager'
    img.decoding = 'async'
    let done = false

    const complete = () => {
      if (done) return
      done = true
      loadedImageUrls.add(cleanUrl)
      pendingImageLoads.delete(cleanUrl)
      resolve()
    }

    img.onload = () => {
      if (typeof img.decode === 'function') {
        img.decode().catch(() => null).finally(complete)
        return
      }
      complete()
    }
    img.onerror = () => {
      pendingImageLoads.delete(cleanUrl)
      resolve()
    }

    img.src = cleanUrl
    if (img.complete && img.naturalWidth > 0) {
      if (typeof img.decode === 'function') {
        img.decode().catch(() => null).finally(complete)
      } else {
        complete()
      }
    }
  })

  pendingImageLoads.set(cleanUrl, task)
  return task
}

const getSlideAssetUrls = (page: number): string[] => {
  const urls = new Set<string>()
  const cfg = slideConfigs.value[page]
  const bg = normalizeUrl(cfg?.bgImage)
  if (bg && bg !== 'none') urls.add(bg)

  const elements = documentState.value[page] || []
  elements.forEach((el: any) => {
    if ((el?.type === 'image' || el?.type === 'magnifier') && el?.src) {
      const src = normalizeUrl(el.src)
      if (src) urls.add(src)
    }

    if (el?.type === 'imagecomparator') {
      const before = normalizeUrl(el.imageBefore)
      const after = normalizeUrl(el.imageAfter)
      if (before) urls.add(before)
      if (after) urls.add(after)
    }
  })

  return [...urls]
}

const preloadSlideAssets = async (page: number) => {
  const urls = getSlideAssetUrls(page)
  if (!urls.length) return
  await Promise.all(urls.map((url) => preloadImage(url)))
}

const preloadAdjacentSlides = (page: number) => {
  const candidates = [page - 1, page + 1]
  candidates.forEach((candidate) => {
    if (candidate < 1 || candidate > numPages.value) return
    void preloadSlideAssets(candidate)
  })
}

const decodeCompressedState = (compressedState: string) => {
  const binary = atob(compressedState)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  const inflated = pako.ungzip(bytes, { to: 'string' })
  return JSON.parse(inflated)
}

const recalcScale = () => {
  const host = stageWrapRef.value
  if (!host) return
  const availableW = host.clientWidth - 24
  const availableH = host.clientHeight - 24
  const ratio = Math.min(availableW / baseWidth.value, availableH / baseHeight.value)
  stageScale.value = Math.max(0.2, Math.min(1.2, ratio || 1))
}

const goToPage = async (page: number) => {
  if (page < 1 || page > numPages.value) return
  await preloadSlideAssets(page)
  currentPage.value = page
  preloadAdjacentSlides(page)
}

const handleLinkElement = (el: any) => {
  const targetPage = Number(el.targetPage || el.goToPage)
  if (targetPage && targetPage >= 1 && targetPage <= numPages.value) {
    goToPage(targetPage)
    return
  }
  if (el.url && typeof el.url === 'string') {
    try {
      const candidate = el.url.trim()
      const parsed = new URL(candidate.startsWith('http') ? candidate : `https://${candidate}`)
      if (!['http:', 'https:'].includes(parsed.protocol)) return
      window.open(parsed.toString(), '_blank', 'noopener,noreferrer')
    } catch (_error) {
      // URL invalida: no abrir nada
    }
  }
}

const getElementStyle = (el: any) => ({
  left: `${Number(el.x) || 0}px`,
  top: `${Number(el.y) || 0}px`,
  width: `${Number(el.width) || 120}px`,
  height: `${el.height === 'auto' ? 'auto' : `${Number(el.height) || 40}px`}`,
  opacity: String(el.opacity ?? 1),
  transform: `rotate(${Number(el.rotation) || 0}deg)`,
  zIndex: String(el.zIndex || 1),
  display: el.isHidden ? 'none' : 'flex',
  borderRadius: `${Number(el.borderRadius) || 0}px`,
  border: `${Number(el.borderWidth) || 0}px ${el.borderStyle || 'solid'} ${el.borderColor || 'transparent'}`,
  boxShadow: el.boxShadow || 'none',
  background: el.type === 'sticky' ? (el.bgColor || '#fef08a') : 'transparent',
})

const getTextStyle = (el: any) => ({
  color: el.color || '#0f172a',
  fontSize: `${Math.max(10, Number(el.fontSize) || 20)}px`,
  fontWeight: String(el.fontWeight || 400),
  textAlign: el.textAlign || 'left',
  lineHeight: String(el.lineHeight || 1.3),
  width: '100%',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
})

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'ArrowRight' || event.key === 'PageDown') void goToPage(currentPage.value + 1)
  if (event.key === 'ArrowLeft' || event.key === 'PageUp') void goToPage(currentPage.value - 1)
}

onMounted(async () => {
  window.addEventListener('resize', recalcScale)
  window.addEventListener('keydown', handleKeydown)

  try {
    const slug = String(route.params.slug || '')
    if (!slug) throw new Error('Slug no válido')

    const data = await presentationService.getPublicPresentationBySlug(slug)
    title.value = data.title || 'Presentación pública'
    updateSeo(title.value)
    baseWidth.value = Number(data.baseWidth) || 1280
    baseHeight.value = Number(data.baseHeight) || 720

    const state = data.compressedState ? decodeCompressedState(data.compressedState) : {
      documentState: data.documentState || {},
      slideConfigs: data.slideConfigs || {},
    }

    documentState.value = state.documentState || { 1: [] }
    slideConfigs.value = state.slideConfigs || { 1: { bgColor: '#ffffff', bgImage: null } }

    const pageKeys = Object.keys(documentState.value).map((v) => Number(v)).filter((v) => !Number.isNaN(v))
    numPages.value = pageKeys.length ? Math.max(...pageKeys) : 1
    currentPage.value = 1

    await preloadSlideAssets(1)
    preloadAdjacentSlides(1)

    recalcScale()
  } catch (error: any) {
    console.error('Error cargando presentación pública:', error)
    errorMsg.value = 'No se pudo cargar esta presentación pública.'
  } finally {
    isLoading.value = false
    setTimeout(recalcScale, 0)
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', recalcScale)
  window.removeEventListener('keydown', handleKeydown)
  if (typeof document !== 'undefined') {
    document.title = previousDocumentTitle
  }
})
</script>

<style scoped>
.public-viewer-root {
  min-height: 100vh;
  background: radial-gradient(circle at top, #0f172a 0%, #020617 55%, #000 100%);
  color: #e2e8f0;
  display: flex;
  flex-direction: column;
}

.viewer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  gap: 16px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.25);
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(6px);
}

.viewer-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.viewer-controls {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 0.9rem;
}

.control-btn {
  background: #2563eb;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 12px;
  font-weight: 600;
  cursor: pointer;
}

.control-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.viewer-stage-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  overflow: hidden;
}

.stage-scale {
  transform-origin: center center;
}

.viewer-stage {
  position: relative;
  background-size: cover;
  background-position: center;
  box-shadow: 0 24px 55px rgba(0, 0, 0, 0.45);
  overflow: hidden;
}

.element {
  position: absolute;
  box-sizing: border-box;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.shape-fill,
.media-fit {
  width: 100%;
  height: 100%;
}

.media-fit {
  object-fit: cover;
}

.audio-fit {
  width: 100%;
}

.text-content {
  padding: 4px;
}

.list-content,
.checkbox-content {
  width: 100%;
  margin: 0;
  padding: 8px 10px;
  color: #0f172a;
  background: rgba(255, 255, 255, 0.86);
  border-radius: 6px;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.code-content {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 8px;
  border-radius: 6px;
  background: #0f172a;
  color: #e2e8f0;
  font-size: 12px;
  overflow: auto;
}

.link-btn {
  border: none;
  border-radius: 10px;
  padding: 10px 14px;
  background: #2563eb;
  color: white;
  font-weight: 700;
  cursor: pointer;
}

.viewer-state {
  min-height: 100vh;
  display: grid;
  place-items: center;
  font-size: 1rem;
  padding: 24px;
}

.viewer-error {
  color: #fecaca;
}

@media (max-width: 760px) {
  .viewer-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
