<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import EditorHeader from '@/components/EditorHeader.vue'
import { useAuthStore } from '@/stores/auth'
import JSZip from 'jszip'
// @ts-expect-error JS service module in mixed TS workspace
import { presentationService } from '@/services/presentacion.service.js'
import { setPendingProjectImport } from '@/services/pending-project-import'

interface ProjectItem {
  _id: string
  title?: string
  updatedAt?: string
  docType?: string
  coverImage?: string
  userId?: string
}

const router = useRouter()
const authStore = useAuthStore()
const presentations = ref<ProjectItem[]>([])
const isLoading = ref(true)
const errorMessage = ref('')
const showCreateModal = ref(false)
const createSource = ref<'blank' | 'upload'>('blank')
const pendingUploadFile = ref<File | null>(null)
const isDropZoneActive = ref(false)
const isUploadModalDragActive = ref(false)
const isDeletingProject = ref(false)
const deleteModal = ref({
  open: false,
  id: '',
  title: '',
})
const deleteErrorMessage = ref('')
const createConfigs = ref({
  preset: 'hd',
  width: 1280,
  height: 720,
  template: 'blank',
})
const detectedOriginalResolution = ref<{ width: number; height: number } | null>(null)

let pdfjsLibInstance: Awaited<ReturnType<() => Promise<typeof import('pdfjs-dist')>>> | null = null
const getPdfjsLib = async () => {
  if (pdfjsLibInstance) return pdfjsLibInstance
  const pdfLib = await import('pdfjs-dist')
  const { default: PdfWorker } = await import('pdfjs-dist/build/pdf.worker.min.js?worker')
  pdfLib.GlobalWorkerOptions.workerPort = new PdfWorker()
  pdfjsLibInstance = pdfLib
  return pdfLib
}

const getFileExtension = (name: string) => name.split('.').pop()?.toLowerCase() || ''

const getFileTypeFromExtension = (ext: string) => {
  if (ext === 'pdf') return 'pdf'
  if (['pptx', 'ppsx', 'potx'].includes(ext)) return 'pptx'
  if (ext === 'html') return 'html'
  return null
}

const detectResolutionFromPdf = async (file: File) => {
  const pdfjsLib = await getPdfjsLib()
  const bytes = new Uint8Array(await file.arrayBuffer())
  const doc = await pdfjsLib.getDocument({ data: bytes }).promise
  const page = await doc.getPage(1)
  const viewport = page.getViewport({ scale: 1 })
  return {
    width: Math.round(viewport.width),
    height: Math.round(viewport.height),
  }
}

const detectResolutionFromPptx = async (file: File) => {
  const zip = await JSZip.loadAsync(await file.arrayBuffer())
  const presentationXml = await zip.file('ppt/presentation.xml')?.async('text')
  if (!presentationXml) return null

  const doc = new DOMParser().parseFromString(presentationXml, 'application/xml')
  const sizeNode = doc.getElementsByTagName('p:sldSz')[0]
  const cx = Number(sizeNode?.getAttribute('cx') || 0)
  const cy = Number(sizeNode?.getAttribute('cy') || 0)
  if (!cx || !cy) return null

  const emuPerInch = 914400
  const pxPerInch = 96

  return {
    width: Math.round((cx / emuPerInch) * pxPerInch),
    height: Math.round((cy / emuPerInch) * pxPerInch),
  }
}

const detectResolutionFromHtml = async (file: File) => {
  const htmlText = await file.text()
  const parser = new DOMParser()
  const doc = parser.parseFromString(htmlText, 'text/html')

  const metaNode = doc.getElementById('app-meta-data')
  if (metaNode?.textContent) {
    try {
      const meta = JSON.parse(metaNode.textContent)
      const width = Number(meta?.baseWidth || 0)
      const height = Number(meta?.baseHeight || 0)
      if (width > 0 && height > 0) {
        return { width, height }
      }
    } catch {
      // Continue with fallback parsing.
    }
  }

  const widthMatch = htmlText.match(/baseWidth\s*=\s*ref\((\d+)\)/)
  const heightMatch = htmlText.match(/baseHeight\s*=\s*ref\((\d+)\)/)
  const width = Number(widthMatch?.[1] || 0)
  const height = Number(heightMatch?.[1] || 0)
  if (width > 0 && height > 0) {
    return { width, height }
  }

  return null
}

const detectOriginalResolution = async (file: File) => {
  const ext = getFileExtension(file.name)
  const fileType = getFileTypeFromExtension(ext)
  if (fileType === 'pdf') return await detectResolutionFromPdf(file)
  if (fileType === 'pptx') return await detectResolutionFromPptx(file)
  if (fileType === 'html') return await detectResolutionFromHtml(file)
  return null
}

const setCreateSource = (source: 'blank' | 'upload') => {
  createSource.value = source
  if (source === 'upload') {
    createConfigs.value.template = 'blank'
  }
}

const userId = computed(() => authStore.user?._id || authStore.user?.id || null)

const loadPresentations = async () => {
  if (!userId.value) return

  isLoading.value = true
  errorMessage.value = ''

  try {
    const allData = await presentationService.getUserPresentations(userId.value)
    const list = Array.isArray(allData) ? allData : []
    presentations.value = list.filter((project: ProjectItem) => String(project.userId) === String(userId.value))
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'No se pudieron cargar los proyectos.'
  } finally {
    isLoading.value = false
  }
}

const createNewProject = () => {
  setCreateSource('blank')
  pendingUploadFile.value = null
  detectedOriginalResolution.value = null
  showCreateModal.value = true
}

const closeCreateModal = () => {
  showCreateModal.value = false
  pendingUploadFile.value = null
  detectedOriginalResolution.value = null
}

const confirmCreateProject = () => {
  const originalResolution = detectedOriginalResolution.value
  const isOriginalResolution = createConfigs.value.preset === 'original' && !!originalResolution
  const finalTemplate = createSource.value === 'upload' ? 'blank' : createConfigs.value.template

  const query = new URLSearchParams({
    newProject: '1',
    preset: createConfigs.value.preset,
    template: finalTemplate,
    createSource: createSource.value,
  })

  if (createConfigs.value.preset === 'custom') {
    query.set('width', String(createConfigs.value.width || 1280))
    query.set('height', String(createConfigs.value.height || 720))
  } else if (isOriginalResolution && originalResolution) {
    query.set('width', String(originalResolution.width))
    query.set('height', String(originalResolution.height))
  }

  if (createSource.value === 'upload' && pendingUploadFile.value) {
    query.set('autoImport', '1')
    setPendingProjectImport({ file: pendingUploadFile.value, source: 'projects' })
  }

  showCreateModal.value = false
  pendingUploadFile.value = null
  detectedOriginalResolution.value = null
  router.push(`/editorpresentaciones?${query.toString()}`)
}

const handleIncomingUploadFile = async (file: File) => {
  const ext = getFileExtension(file.name)
  if (!getFileTypeFromExtension(ext)) {
    errorMessage.value = 'Solo se permiten archivos PDF, PPTX, PPSX, POTX o HTML.'
    return
  }

  pendingUploadFile.value = file
  setCreateSource('upload')
  showCreateModal.value = true

  detectedOriginalResolution.value = null
  try {
    const resolution = await detectOriginalResolution(file)
    detectedOriginalResolution.value = resolution
    if (resolution) {
      createConfigs.value.preset = 'original'
      createConfigs.value.width = resolution.width
      createConfigs.value.height = resolution.height
    }
  } catch {
    detectedOriginalResolution.value = null
    createConfigs.value.preset = 'hd'
  }
}

const handleDropZoneDrop = async (event: DragEvent) => {
  isDropZoneActive.value = false
  const file = event.dataTransfer?.files?.[0]
  if (!file) return
  await handleIncomingUploadFile(file)
}

const handleUploadModalDrop = async (event: DragEvent) => {
  isUploadModalDragActive.value = false
  if (createSource.value !== 'upload') return
  const file = event.dataTransfer?.files?.[0]
  if (!file) return
  await handleIncomingUploadFile(file)
}

const handleUploadModalDragEnter = () => {
  if (createSource.value !== 'upload') return
  isUploadModalDragActive.value = true
}

const handleUploadModalDragLeave = () => {
  isUploadModalDragActive.value = false
}

const handleDropZoneFilePick = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  await handleIncomingUploadFile(file)
  input.value = ''
}

const editProject = (id: string) => {
  router.push(`/editorpresentaciones/${id}`)
}

const deleteProject = async (id: string, title?: string) => {
  deleteErrorMessage.value = ''
  deleteModal.value = {
    open: true,
    id,
    title: title || 'esta presentacion',
  }
}

const forceCloseDeleteModal = () => {
  deleteModal.value.open = false
  deleteModal.value.id = ''
  deleteModal.value.title = ''
  deleteErrorMessage.value = ''
}

const closeDeleteModal = () => {
  if (isDeletingProject.value) return
  forceCloseDeleteModal()
}

const confirmDeleteProject = async () => {
  if (!deleteModal.value.id || isDeletingProject.value) return
  isDeletingProject.value = true
  try {
    await presentationService.deletePresentation(deleteModal.value.id)
    await loadPresentations()
    forceCloseDeleteModal()
  } catch {
    deleteErrorMessage.value = 'No se pudo eliminar el proyecto.'
  } finally {
    isDeletingProject.value = false
  }
}

const formatDate = (dateString?: string) => {
  if (!dateString) return 'Sin fecha'

  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString))
}

const getCardBackground = (project: ProjectItem) => {
  if (project.coverImage) {
    return {
      backgroundImage: `url(${project.coverImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }
  }

  if (project.docType === 'pdf') {
    return {
      backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(255, 97, 97, 0.45), transparent 42%), linear-gradient(135deg, #2c0e14, #4a1924)',
    }
  }

  return {
    backgroundImage: 'radial-gradient(circle at 75% 18%, rgba(120, 170, 255, 0.38), transparent 35%), linear-gradient(130deg, #0a1a2e, #1b355a)',
  }
}

onMounted(async () => {
  if (!authStore.isAuthenticated) {
    router.push('/devpresent/auth')
    return
  }

  await loadPresentations()
})
</script>

<template>
  <div class="min-h-screen bg-background text-on-background antialiased selection:bg-primary-700/40 selection:text-white">
    <EditorHeader
      mode="projects"
      active-view="projects"
      :is-converting="false"
      :has-doc="false"
      :zoom="1"
      :play-mode="false"
      :is-saving="false"
      @create-new-project="createNewProject"
    />

    <main class="mx-auto flex w-full max-w-7xl flex-col gap-stack-lg px-margin-safe pb-margin-safe pt-[calc(64px+40px)]">
      <header class="flex flex-col justify-between gap-stack-md md:flex-row md:items-end">
        <div>
          <h1 class="font-display-xl text-display-xl text-on-surface">Proyectos</h1>
          <p class="mt-unit text-body-lg text-on-surface-variant">Gestiona tus presentaciones y vuelve al editor con un clic.</p>
        </div>
        <button type="button" class="flex items-center gap-stack-sm rounded-lg bg-gradient-to-r from-primary-500 to-primary-700 px-6 py-4 text-label-caps text-white shadow-[0_12px_30px_rgba(194,65,12,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:from-primary-600 hover:to-primary-800 hover:shadow-[0_18px_42px_rgba(194,65,12,0.45)]" @click="createNewProject">
          <span class="material-symbols-outlined text-[18px]" style="font-variation-settings: 'FILL' 1;">add_circle</span>
          Crear nueva presentacion
        </button>
      </header>

      <section
        class="group relative w-full"
        @click="createNewProject"
        @dragenter.prevent="isDropZoneActive = true"
        @dragover.prevent="isDropZoneActive = true"
        @dragleave.prevent="isDropZoneActive = false"
        @drop.prevent="handleDropZoneDrop"
      >
        <div class="absolute inset-0 rounded-xl bg-primary/10 blur-xl transition-colors duration-500 group-hover:bg-primary/20"></div>
        <div class="relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-primary-700/60 bg-surface-container-lowest p-stack-lg text-center backdrop-blur-sm transition-colors hover:border-primary-700" :class="{ 'border-primary-700 bg-primary/15': isDropZoneActive }">
          <div class="mb-stack-md flex h-14 w-14 items-center justify-center rounded-full bg-surface-container transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/20">
            <span class="material-symbols-outlined text-3xl text-on-surface-variant transition-colors group-hover:text-primary">upload_file</span>
          </div>
          <h3 class="text-headline-md text-on-surface">Nuevo proyecto</h3>
          <p class="mt-unit max-w-md text-body-md text-on-surface-variant">Crea una presentacion nueva o arrastra aqui PDF, PPTX o HTML para importarlo directo.</p>
          <label class="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-md border border-primary-700/50 px-3 py-2 text-sm text-primary-900 transition-colors hover:bg-primary-100 hover:text-primary-900" @click.stop>
            <span class="material-symbols-outlined text-[18px]">upload</span>
            Seleccionar archivo
            <input type="file" accept=".pdf, .pptx, .ppsx, .potx, .html" hidden @change="handleDropZoneFilePick" />
          </label>
        </div>
      </section>

      <section>
        <div class="mb-stack-md flex items-center justify-between">
          <h2 class="text-[20px] text-on-surface">Trabajo reciente</h2>
          <div class="flex items-center gap-stack-sm text-label-caps text-on-surface">
            <button type="button" class="flex items-center gap-1 transition-colors hover:text-primary-700" @click="loadPresentations"><span class="material-symbols-outlined text-[16px]">refresh</span>Recargar</button>
            <div class="h-4 w-px bg-outline"></div>
            <button type="button" class="flex items-center gap-1 transition-colors hover:text-primary-700" @click="createNewProject"><span class="material-symbols-outlined text-[16px]">add</span>Nuevo</button>
          </div>
        </div>

        <div v-if="isLoading" class="rounded-xl border border-outline-variant bg-surface-container p-8 text-center text-on-surface-variant">
          Cargando proyectos...
        </div>

        <div v-else-if="errorMessage" class="rounded-xl border border-red-300 bg-red-50 p-6 text-sm text-red-700">
          {{ errorMessage }}
        </div>

        <div v-else-if="presentations.length === 0" class="rounded-xl border border-outline-variant bg-surface-container p-8 text-center text-on-surface-variant">
          Aun no tienes proyectos.
        </div>

        <div v-else class="grid grid-cols-1 gap-gutter md:grid-cols-2 lg:grid-cols-3">
          <article v-for="project in presentations" :key="project._id" class="group relative flex flex-col overflow-hidden rounded-xl border border-outline bg-surface-container shadow-lg transition-all duration-300 hover:-translate-y-[2px] hover:border-primary-700/70 hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)]">
            <div class="relative aspect-video overflow-hidden bg-surface-container-highest" :style="getCardBackground(project)">
              <div class="absolute inset-0 flex items-center justify-center" v-if="!project.coverImage">
                <span class="material-symbols-outlined text-[64px] text-surface-variant">{{ project.docType === 'pdf' ? 'picture_as_pdf' : 'slideshow' }}</span>
              </div>
              <div class="absolute inset-0 z-10 flex items-center justify-center bg-background/80 opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
                <button type="button" class="flex items-center gap-2 rounded-lg border border-primary-700/60 bg-primary-50 px-5 py-2.5 text-label-caps text-primary-900 transition-colors hover:border-primary-700 hover:bg-primary-700 hover:text-white" @click="editProject(project._id)">
                  <span class="material-symbols-outlined text-[16px]">edit</span>
                  Editar
                </button>
              </div>
            </div>
            <div class="flex flex-1 flex-col justify-between p-stack-md">
              <div>
                <h3 class="truncate text-[18px] text-on-surface">{{ project.title || 'Presentacion sin titulo' }}</h3>
                <p class="mt-1 line-clamp-2 text-[14px] text-on-surface-variant">Tipo: {{ project.docType || 'blank' }}</p>
              </div>
              <div class="mt-stack-md flex items-center justify-between border-t border-outline pt-stack-sm text-[13px] text-on-surface">
                <span>{{ formatDate(project.updatedAt) }}</span>
                <div class="flex items-center gap-2">
                  <button type="button" aria-label="Editar proyecto" class="rounded-full p-1 transition-colors hover:bg-primary-100 hover:text-primary-700" @click="editProject(project._id)"><span class="material-symbols-outlined text-[20px]">edit</span></button>
                  <button type="button" aria-label="Eliminar proyecto" class="rounded-full p-1 transition-colors hover:bg-red-200 hover:text-red-800" @click="deleteProject(project._id, project.title)"><span class="material-symbols-outlined text-[20px]">delete</span></button>
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>
    </main>

    <div
      v-if="showCreateModal"
      class="fixed inset-0 z-[1400] flex items-center justify-center bg-black/70 px-4"
      @click.self="closeCreateModal"
      @dragenter.prevent="handleUploadModalDragEnter"
      @dragover.prevent="createSource === 'upload' && (isUploadModalDragActive = true)"
      @dragleave.prevent="handleUploadModalDragLeave"
      @drop.prevent="handleUploadModalDrop"
    >
      <div class="w-full max-w-2xl rounded-xl border border-primary-700/60 bg-surface-container p-6 shadow-[0_30px_80px_rgba(0,0,0,0.45)]" :class="{ 'border-primary-700 bg-primary/10': createSource === 'upload' && isUploadModalDragActive }">
        <div class="mb-5 flex items-center justify-between">
          <div>
            <h3 class="text-headline-md text-on-surface">Crear nuevo proyecto</h3>
            <p class="mt-1 text-body-md text-on-surface-variant">Elige configuracion inicial antes de abrir el editor.</p>
          </div>
          <button type="button" class="rounded-full p-2 text-on-surface transition-colors hover:bg-primary-100 hover:text-primary-900" @click="closeCreateModal">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <div class="mb-5 grid grid-cols-2 gap-2 rounded-lg bg-surface-container-low p-1">
          <button
            type="button"
            class="rounded-md px-4 py-2 text-label-caps transition-all"
            :class="createSource === 'blank' ? 'bg-surface-bright text-on-surface' : 'text-on-surface-variant hover:text-on-surface'"
            @click="setCreateSource('blank')"
          >
            Proyecto base
          </button>
          <button
            type="button"
            class="rounded-md px-4 py-2 text-label-caps transition-all"
            :class="createSource === 'upload' ? 'bg-surface-bright text-on-surface' : 'text-on-surface-variant hover:text-on-surface'"
            @click="setCreateSource('upload')"
          >
            Subir archivo
          </button>
        </div>

        <div class="space-y-4">
          <div>
            <label class="mb-1 block text-label-caps text-on-surface-variant">Tamano del lienzo</label>
            <select v-model="createConfigs.preset" class="w-full rounded-md border border-outline bg-surface px-3 py-2 text-on-surface">
              <option v-if="detectedOriginalResolution" value="original">Original ({{ detectedOriginalResolution.width }}x{{ detectedOriginalResolution.height }})</option>
              <option value="hd">16:9 HD (1280x720)</option>
              <option value="fhd">16:9 Full HD (1920x1080)</option>
              <option value="sd">4:3 Estandar (1024x768)</option>
              <option value="square">Cuadrado (1080x1080)</option>
              <option value="custom">Personalizado</option>
            </select>
          </div>

          <div v-if="createConfigs.preset === 'custom'" class="grid grid-cols-2 gap-3">
            <div>
              <label class="mb-1 block text-label-caps text-on-surface-variant">Ancho (px)</label>
              <input v-model.number="createConfigs.width" type="number" min="320" class="w-full rounded-md border border-outline bg-surface px-3 py-2 text-on-surface" />
            </div>
            <div>
              <label class="mb-1 block text-label-caps text-on-surface-variant">Alto (px)</label>
              <input v-model.number="createConfigs.height" type="number" min="240" class="w-full rounded-md border border-outline bg-surface px-3 py-2 text-on-surface" />
            </div>
          </div>

          <div v-if="createSource === 'blank'">
            <label class="mb-1 block text-label-caps text-on-surface-variant">Plantilla base</label>
            <div class="grid grid-cols-2 gap-2 md:grid-cols-4">
              <button type="button" class="rounded-md border px-3 py-2 text-sm transition-colors"
                :class="createConfigs.template === 'blank' ? 'border-primary-700 bg-primary-100 text-primary-900' : 'border-outline text-on-surface hover:bg-primary-50 hover:text-primary-900'"
                @click="createConfigs.template = 'blank'">En blanco</button>
              <button type="button" class="rounded-md border px-3 py-2 text-sm transition-colors"
                :class="createConfigs.template === 'modern' ? 'border-primary-700 bg-primary-100 text-primary-900' : 'border-outline text-on-surface hover:bg-primary-50 hover:text-primary-900'"
                @click="createConfigs.template = 'modern'">Moderna</button>
              <button type="button" class="rounded-md border px-3 py-2 text-sm transition-colors"
                :class="createConfigs.template === 'dark' ? 'border-primary-700 bg-primary-100 text-primary-900' : 'border-outline text-on-surface hover:bg-primary-50 hover:text-primary-900'"
                @click="createConfigs.template = 'dark'">Oscura</button>
              <button type="button" class="rounded-md border px-3 py-2 text-sm transition-colors"
                :class="createConfigs.template === 'custom' ? 'border-primary-700 bg-primary-100 text-primary-900' : 'border-outline text-on-surface hover:bg-primary-50 hover:text-primary-900'"
                @click="createConfigs.template = 'custom'">Mi plantilla</button>
            </div>
          </div>

          <div v-if="createSource === 'upload'" class="rounded-md border border-primary-700/60 bg-primary-100 px-3 py-3 text-center">
            <label class="mx-auto inline-flex cursor-pointer items-center gap-2 rounded-md border border-primary-700/50 px-3 py-2 text-sm text-primary-900 transition-colors hover:bg-primary-200 hover:text-primary-900">
              <span class="material-symbols-outlined text-[18px]">upload</span>
              Subir archivo
              <input type="file" accept=".pdf, .pptx, .ppsx, .potx, .html" hidden @change="handleDropZoneFilePick" />
            </label>
            <p class="mt-2 text-sm text-on-surface-variant text-center">
              {{ pendingUploadFile ? `Archivo listo: ${pendingUploadFile.name}` : 'O arrastra un archivo a cualquier parte de este menu.' }}
            </p>
          </div>
        </div>

        <div class="mt-6 flex justify-end gap-3">
          <button type="button" class="rounded-md border border-primary-700/60 px-4 py-2 text-label-caps text-primary-900 transition-colors hover:bg-primary-100 hover:text-primary-900" @click="closeCreateModal">Cancelar</button>
          <button type="button" class="rounded-md bg-gradient-to-r from-primary-500 to-primary-700 px-5 py-2.5 text-label-caps text-white shadow-[0_10px_24px_rgba(194,65,12,0.32)]" @click="confirmCreateProject">
            Continuar al editor
          </button>
        </div>
      </div>
    </div>

    <div v-if="deleteModal.open" class="fixed inset-0 z-[1500] flex items-center justify-center bg-black/70 px-4" @click.self="closeDeleteModal">
      <div class="w-full max-w-md rounded-xl border border-red-300 bg-surface-container p-6 shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
        <div class="mb-4 flex items-start gap-3">
          <div class="mt-0.5 flex h-10 w-10 items-center justify-center rounded-full border border-red-300 bg-red-100 text-red-700">
            <span class="material-symbols-outlined">delete</span>
          </div>
          <div>
            <h3 class="text-headline-md text-on-surface">Eliminar proyecto</h3>
            <p class="mt-1 text-body-md text-on-surface-variant">Esta accion no se puede deshacer.</p>
          </div>
        </div>

        <div class="rounded-md border border-outline bg-surface-container-high px-3 py-2 text-sm text-on-surface">
          Proyecto: <span class="text-on-surface">{{ deleteModal.title }}</span>
        </div>

        <p v-if="deleteErrorMessage" class="mt-3 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {{ deleteErrorMessage }}
        </p>

        <div class="mt-6 flex justify-end gap-3">
          <button type="button" class="rounded-md border border-red-400 px-4 py-2 text-label-caps text-red-800 transition-colors hover:bg-red-100 hover:text-red-900" :disabled="isDeletingProject" @click="closeDeleteModal">Cancelar</button>
          <button type="button" class="rounded-md bg-gradient-to-r from-red-500 to-red-700 px-5 py-2.5 text-label-caps text-white shadow-[0_10px_24px_rgba(185,28,28,0.3)] disabled:opacity-60" :disabled="isDeletingProject" @click="confirmDeleteProject">
            {{ isDeletingProject ? 'Eliminando...' : 'Eliminar' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
