<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import EditorHeader from '@/components/EditorHeader.vue'
import { useAuthStore } from '@/stores/auth'
import { templateService } from '@/services/template.service'

interface TemplateItem {
  _id: string
  title?: string
  authorName?: string
  style?: string
  category?: string
  coverImage?: string
  userId?: string
  isPrivate?: boolean
  documentState?: Record<string, unknown>
}

const router = useRouter()
const authStore = useAuthStore()

const activeTab = ref<'store' | 'mine'>('store')
const selectedCategory = ref('Todas')
const searchQuery = ref('')
const isLoading = ref(false)
const isActionLoading = ref(false)
const savingId = ref<string | null>(null)
const errorMessage = ref('')

const publicTemplates = ref<TemplateItem[]>([])
const myTemplates = ref<TemplateItem[]>([])
const showPreviewModal = ref(false)
const selectedTemplate = ref<TemplateItem | null>(null)

const currentUserId = computed(() => authStore.user?._id || authStore.user?.id || null)

const categories = computed(() => {
  const values = new Set<string>(['Todas'])
  for (const tpl of publicTemplates.value) {
    const cat = tpl.category || tpl.style
    if (cat) values.add(cat)
  }
  return Array.from(values)
})

const savedTemplateIds = computed(() => {
  const ids = new Set<string>()
  for (const tpl of myTemplates.value) {
    if (tpl?._id) ids.add(String(tpl._id))
  }
  return ids
})

const selectedSlidesCount = computed(() => {
  const state = selectedTemplate.value?.documentState
  if (!state || typeof state !== 'object') return 0
  return Object.keys(state).length
})

const filteredPublicTemplates = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()

  return publicTemplates.value.filter((tpl) => {
    const cat = (tpl.category || tpl.style || '').toLowerCase()
    const categoryMatch = selectedCategory.value === 'Todas' || cat === selectedCategory.value.toLowerCase()

    if (!q) return categoryMatch

    const title = (tpl.title || '').toLowerCase()
    const author = (tpl.authorName || '').toLowerCase()
    return categoryMatch && (title.includes(q) || author.includes(q) || cat.includes(q))
  })
})

const featuredTemplate = computed(() => {
  if (filteredPublicTemplates.value.length === 0) return null
  return filteredPublicTemplates.value[0]
})

const filteredMyTemplates = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return myTemplates.value

  return myTemplates.value.filter((tpl) => {
    const title = (tpl.title || '').toLowerCase()
    const author = (tpl.authorName || '').toLowerCase()
    return title.includes(q) || author.includes(q)
  })
})

const isNativeTemplate = (tpl: TemplateItem) => {
  if (!tpl || !currentUserId.value) return false
  return String(tpl.userId) === String(currentUserId.value)
}

const canPublishSelected = computed(() => {
  return Boolean(selectedTemplate.value && isNativeTemplate(selectedTemplate.value) && selectedTemplate.value.isPrivate)
})

const loadData = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const userId = currentUserId.value
    const [pub, mine] = await Promise.all([
      templateService.getPublicTemplates(),
      userId ? templateService.getUserTemplates(String(userId)) : Promise.resolve([]),
    ])

    publicTemplates.value = Array.isArray(pub) ? pub : []
    myTemplates.value = Array.isArray(mine) ? mine : []
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'No se pudieron cargar las plantillas.'
  } finally {
    isLoading.value = false
  }
}

const saveToMyGallery = async (id: string) => {
  if (!currentUserId.value || savedTemplateIds.value.has(String(id))) return

  savingId.value = id
  try {
    await templateService.saveToGallery(id, String(currentUserId.value))
    await loadData()
  } finally {
    savingId.value = null
  }
}

const isTemplateSaved = (tpl: TemplateItem) => {
  if (!tpl?._id) return false
  if (isNativeTemplate(tpl)) return true
  return savedTemplateIds.value.has(String(tpl._id))
}

const useTemplate = (tpl?: TemplateItem | null) => {
  if (!tpl?._id) return

  closeTemplatePreview()

  if (isNativeTemplate(tpl)) {
    const visibility = tpl.isPrivate ? 'private' : 'public'
    router.push(`/editorpresentaciones/${tpl._id}?mode=template&visibility=${visibility}`)
    return
  }

  router.push(`/editorpresentaciones?templateId=${tpl._id}`)
}

const deleteTemplateFromCard = async (tpl: TemplateItem) => {
  if (!tpl?._id || !currentUserId.value) return

  isActionLoading.value = true
  try {
    if (isNativeTemplate(tpl)) {
      await templateService.deleteTemplate(tpl._id, String(currentUserId.value))
    } else {
      await templateService.removeFromGallery(tpl._id, String(currentUserId.value))
    }
    await loadData()
  } finally {
    isActionLoading.value = false
  }
}

const openTemplatePreview = async (tpl: TemplateItem) => {
  showPreviewModal.value = true
  selectedTemplate.value = tpl
  try {
    const fullTemplate = await templateService.getTemplateById(tpl._id)
    selectedTemplate.value = fullTemplate
  } catch {
    // fallback con metadata actual
  }
}

const closeTemplatePreview = () => {
  showPreviewModal.value = false
  selectedTemplate.value = null
}

const publishSelectedTemplate = async () => {
  if (!selectedTemplate.value?._id || !currentUserId.value) return

  isActionLoading.value = true
  try {
    await templateService.publishTemplate(selectedTemplate.value._id, String(currentUserId.value))
    const updated = await templateService.getTemplateById(selectedTemplate.value._id)
    selectedTemplate.value = updated
    await loadData()
  } finally {
    isActionLoading.value = false
  }
}

const deleteSelectedTemplate = async () => {
  if (!selectedTemplate.value?._id || !currentUserId.value) return

  isActionLoading.value = true
  try {
    if (isNativeTemplate(selectedTemplate.value)) {
      await templateService.deleteTemplate(selectedTemplate.value._id, String(currentUserId.value))
    } else {
      await templateService.removeFromGallery(selectedTemplate.value._id, String(currentUserId.value))
    }
    closeTemplatePreview()
    await loadData()
  } finally {
    isActionLoading.value = false
  }
}

const openTemplateEngine = () => {
  router.push('/editorpresentaciones?mode=template&visibility=private')
}

onMounted(async () => {
  if (!authStore.isAuthenticated) {
    router.push('/devpresent/auth')
    return
  }

  await loadData()
})
</script>

<template>
  <div class="h-screen overflow-hidden bg-background text-on-background">
    <EditorHeader
      mode="templates"
      active-view="templates"
      :is-converting="false"
      :has-doc="false"
      :zoom="1"
      :play-mode="false"
      :is-saving="false"
      @create-template="openTemplateEngine"
    />

    <main class="h-[calc(100vh-64px)] overflow-y-auto bg-background p-margin-safe">
        <header class="mx-auto mb-stack-lg flex max-w-7xl flex-col justify-between gap-stack-md md:flex-row md:items-end">
          <div>
            <h1 class="font-display-xl text-display-xl text-on-background">Biblioteca de plantillas</h1>
            <p class="mt-stack-sm max-w-2xl text-body-lg text-on-surface-variant">Explora, guarda y reutiliza plantillas en tu flujo de trabajo.</p>
          </div>
          <div class="flex items-center gap-stack-sm">
            <div class="group relative">
              <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface text-sm transition-colors group-focus-within:text-primary-700">search</span>
              <input v-model="searchQuery" aria-label="Buscar plantillas" placeholder="Buscar por nombre o estilo..." class="w-full rounded-lg border border-outline bg-surface-container py-2 pl-9 pr-4 text-body-md text-on-surface shadow-inner transition-all placeholder:text-on-surface-variant focus:border-primary-700 focus:outline-none focus:ring-1 focus:ring-primary-700 md:w-64" />
            </div>
            <button type="button" class="flex items-center justify-center rounded-lg border border-primary-700/60 bg-primary-50 p-2 text-primary-900 transition-colors hover:bg-primary-100" @click="openTemplateEngine" title="Crear plantilla privada">
              <span class="material-symbols-outlined">add</span>
            </button>
          </div>
        </header>

        <div class="mx-auto mb-stack-lg flex max-w-7xl items-center gap-stack-sm overflow-x-auto border-b border-outline pb-2">
          <button
            type="button"
            class="whitespace-nowrap rounded-t-lg border-b-2 px-4 py-2 text-label-caps"
            :class="activeTab === 'store' ? 'border-primary-700 text-primary-800 bg-primary-100/70' : 'border-transparent text-on-surface hover:bg-primary-50 hover:text-primary-800'"
            @click="activeTab = 'store'"
          >
            Tienda
          </button>
          <button
            type="button"
            class="whitespace-nowrap rounded-t-lg border-b-2 px-4 py-2 text-label-caps"
            :class="activeTab === 'mine' ? 'border-primary-700 text-primary-800 bg-primary-100/70' : 'border-transparent text-on-surface hover:bg-primary-50 hover:text-primary-800'"
            @click="activeTab = 'mine'"
          >
            Mis plantillas
          </button>

          <div class="mx-2 h-4 w-px shrink-0 bg-outline"></div>

          <button
            type="button"
            v-for="category in categories"
            :key="category"
            class="whitespace-nowrap rounded-t-lg border-b-2 px-4 py-2 text-label-caps"
            :class="selectedCategory === category ? 'border-primary-700 text-primary-800 bg-primary-100/70' : 'border-transparent text-on-surface hover:bg-primary-50 hover:text-primary-800'"
            @click="selectedCategory = category"
          >
            {{ category }}
          </button>
        </div>

        <div v-if="isLoading" class="mx-auto mb-stack-md max-w-7xl rounded-xl border border-outline bg-surface-container p-6 text-center text-on-surface-variant">
          Cargando plantillas...
        </div>

        <div v-else-if="errorMessage" class="mx-auto mb-stack-md max-w-7xl rounded-xl border border-red-300 bg-red-50 p-6 text-sm text-red-700">
          {{ errorMessage }}
        </div>

        <section v-if="activeTab === 'store'" class="mx-auto grid max-w-7xl grid-cols-1 gap-gutter pb-stack-lg md:grid-cols-2 xl:grid-cols-3">
          <article v-if="featuredTemplate" class="group relative col-span-1 overflow-hidden rounded-xl border border-outline bg-surface-container shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-primary-700/70 hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] md:col-span-2">
            <div class="relative aspect-[21/9] overflow-hidden bg-surface-dim">
              <div
                class="absolute inset-0 transition-all duration-500 group-hover:scale-105"
                :style="featuredTemplate.coverImage
                  ? { backgroundImage: `url(${featuredTemplate.coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                  : { backgroundImage: 'radial-gradient(circle_at_20%_20%,rgba(140,176,255,0.55),transparent_36%),linear-gradient(120deg,#0c1630,#111827_48%,#1f2f56)' }"
              ></div>
              <div class="absolute inset-0 flex items-center justify-center bg-background/60 opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
                <button type="button" class="flex translate-y-4 items-center gap-2 rounded-full bg-gradient-to-r from-primary-500 to-primary-700 px-6 py-3 text-label-caps text-white shadow-lg transition-all duration-300 group-hover:translate-y-0" @click="openTemplatePreview(featuredTemplate)">
                  <span class="material-symbols-outlined text-sm">visibility</span>
                  Vista previa
                </button>
              </div>
              <div class="absolute left-4 top-4 flex gap-2">
                <span class="rounded border border-primary-700/50 bg-primary-100 px-2.5 py-1 text-label-caps text-primary-900">Destacada</span>
                <span class="rounded border border-outline bg-surface-container px-2.5 py-1 text-label-caps text-on-surface">{{ featuredTemplate.category || featuredTemplate.style || 'General' }}</span>
              </div>
            </div>
            <div class="flex items-start justify-between bg-gradient-to-b from-surface-container to-surface-container-low p-stack-md">
              <div>
                <h3 class="mb-1 text-headline-md text-on-surface">{{ featuredTemplate.title || 'Plantilla' }}</h3>
                <p class="line-clamp-1 text-body-md text-on-surface-variant">Por {{ featuredTemplate.authorName || 'Desconocido' }}</p>
              </div>
              <div class="flex items-center gap-2 pl-4 text-code-sm text-on-surface">
                <span>{{ Object.keys(featuredTemplate.documentState || {}).length || 0 }} diapositivas</span>
                <button type="button" class="text-on-surface transition-colors hover:text-primary-700" @click="saveToMyGallery(featuredTemplate._id)"><span class="material-symbols-outlined">bookmark_border</span></button>
              </div>
            </div>
          </article>

          <article v-for="tpl in filteredPublicTemplates.slice(1)" :key="tpl._id" class="group relative flex flex-col overflow-hidden rounded-xl border border-outline bg-surface-container shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-primary-700/70 hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)]">
            <div
              class="relative aspect-video"
              :style="tpl.coverImage
                ? { backgroundImage: `url(${tpl.coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                : { backgroundImage: 'radial-gradient(circle_at_70%_30%,rgba(34,211,238,0.45),transparent_35%),linear-gradient(130deg,#071929,#0b2a43)' }"
            >
              <div class="absolute inset-0 flex items-center justify-center bg-background/60 opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
                <button type="button" class="flex translate-y-4 items-center gap-2 rounded-full bg-gradient-to-r from-primary-500 to-primary-700 px-6 py-3 text-label-caps text-white shadow-lg transition-all duration-300 group-hover:translate-y-0" @click="openTemplatePreview(tpl)">
                  <span class="material-symbols-outlined text-sm">visibility</span>
                  Vista previa
                </button>
              </div>
              <div class="absolute left-4 top-4">
                <span class="rounded border border-outline bg-surface-container px-2.5 py-1 text-label-caps text-on-surface">{{ tpl.category || tpl.style || 'General' }}</span>
              </div>
            </div>
            <div class="flex flex-1 flex-col justify-between bg-surface-container p-stack-md">
              <div>
                <h3 class="mb-1 text-[20px] text-on-surface">{{ tpl.title || 'Plantilla' }}</h3>
                <p class="text-code-sm text-on-surface-variant">Creada por {{ tpl.authorName || 'Desconocido' }}</p>
              </div>
              <div class="mt-stack-md flex items-center justify-between border-t border-outline pt-stack-sm">
                <div class="flex items-center gap-2">
                  <div class="flex h-6 w-6 items-center justify-center rounded-full bg-secondary-container text-[10px] text-on-secondary-container">{{ (tpl.authorName || 'U').charAt(0).toUpperCase() }}</div>
                  <span class="text-[13px] text-on-surface">{{ tpl.authorName || 'Desconocido' }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <button type="button" class="text-code-sm text-on-surface hover:text-primary-700" @click="saveToMyGallery(tpl._id)">
                    {{ savingId === tpl._id ? 'Guardando...' : (isTemplateSaved(tpl) ? 'Guardada' : 'Guardar') }}
                  </button>
                  <button type="button" class="text-code-sm text-on-surface hover:text-primary-700" @click="useTemplate(tpl)">Usar</button>
                </div>
              </div>
            </div>
          </article>

          <div v-if="filteredPublicTemplates.length === 0" class="col-span-full rounded-xl border border-outline bg-surface-container p-8 text-center text-on-surface-variant">
            Aun no hay plantillas publicadas.
          </div>
        </section>

        <section v-else class="mx-auto grid max-w-7xl grid-cols-1 gap-gutter pb-stack-lg md:grid-cols-2 xl:grid-cols-3">
          <article v-for="tpl in filteredMyTemplates" :key="tpl._id" class="group relative flex flex-col overflow-hidden rounded-xl border border-outline bg-surface-container shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-primary-700/70 hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)]">
            <div class="relative aspect-video" :style="tpl.coverImage ? { backgroundImage: `url(${tpl.coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : { backgroundImage: 'radial-gradient(circle_at_30%_20%,rgba(168,85,247,0.4),transparent_35%),linear-gradient(130deg,#120a26,#2d1d52)' }">
              <div class="absolute inset-0 flex items-center justify-center bg-background/60 opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
                <button type="button" class="flex translate-y-4 items-center gap-2 rounded-full bg-gradient-to-r from-primary-500 to-primary-700 px-6 py-3 text-label-caps text-white shadow-lg transition-all duration-300 group-hover:translate-y-0" @click="openTemplatePreview(tpl)">
                  <span class="material-symbols-outlined text-sm">visibility</span>
                  Vista previa
                </button>
              </div>
            </div>

            <div class="flex flex-1 flex-col justify-between bg-surface-container p-stack-md">
              <div>
                <h3 class="mb-1 text-[20px] text-on-surface">{{ tpl.title || 'Plantilla' }}</h3>
                <p class="text-code-sm text-on-surface-variant">{{ tpl.isPrivate ? 'Privada' : 'Publica' }}</p>
              </div>

              <div class="mt-stack-md flex items-center justify-between border-t border-outline pt-stack-sm">
                <button type="button" class="text-code-sm text-on-surface hover:text-primary-700" @click="useTemplate(tpl)">Usar</button>
                <button type="button" class="text-code-sm text-on-surface hover:text-red-700" @click="deleteTemplateFromCard(tpl)">Eliminar</button>
              </div>
            </div>
          </article>

          <div v-if="filteredMyTemplates.length === 0" class="col-span-full rounded-xl border border-outline bg-surface-container p-8 text-center text-on-surface-variant">
            Aun no tienes plantillas guardadas.
          </div>
        </section>

        <div v-if="showPreviewModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6" @click.self="closeTemplatePreview">
          <div class="w-full max-w-3xl rounded-xl border border-outline bg-surface-container p-5">
            <div class="mb-4 flex items-start justify-between gap-4">
              <div>
                <h3 class="text-headline-md text-on-surface">{{ selectedTemplate?.title || 'Vista previa' }}</h3>
                <p class="text-body-md text-on-surface-variant">Por {{ selectedTemplate?.authorName || 'Desconocido' }}</p>
              </div>
              <button type="button" class="rounded-full p-2 text-on-surface hover:bg-primary-100" @click="closeTemplatePreview">
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>

            <div class="mb-4 aspect-video rounded-lg bg-surface-dim" :style="selectedTemplate?.coverImage ? { backgroundImage: `url(${selectedTemplate.coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : { backgroundImage: 'linear-gradient(130deg,#0b1b31,#203b64)' }"></div>

            <div class="mb-4 text-sm text-on-surface-variant">
              {{ selectedSlidesCount }} diapositivas
            </div>

            <div class="flex flex-wrap items-center gap-3">
              <button type="button" class="rounded-lg bg-gradient-to-r from-primary-500 to-primary-700 px-4 py-2 text-white shadow-[0_10px_24px_rgba(194,65,12,0.32)]" @click="useTemplate(selectedTemplate)">Usar plantilla</button>
              <button v-if="canPublishSelected" type="button" class="rounded-lg border border-primary-700/60 px-4 py-2 text-primary-900 hover:bg-primary-100" :disabled="isActionLoading" @click="publishSelectedTemplate">Publicar</button>
              <button type="button" class="rounded-lg border border-red-400 px-4 py-2 text-red-800 hover:bg-red-100" :disabled="isActionLoading" @click="deleteSelectedTemplate">Eliminar</button>
            </div>
          </div>
        </div>
    </main>
  </div>
</template>
