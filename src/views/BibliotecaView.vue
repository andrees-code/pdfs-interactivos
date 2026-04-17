<template>
  <div class="pro-library-app anim-fade-in">
    <header class="pro-header glass-header">
      <div class="header-left">
        <div class="pro-logo">
          <span class="logo-icon text-gradient">🚀</span>
          <span class="logo-text">Doc<span class="text-accent">Flow</span></span>
        </div>
        <div class="divider-vertical"></div>
        <h1 class="page-title">Mi Biblioteca</h1>
      </div>

      <div class="header-right" v-if="authStore.user">
        <div class="user-menu-container" ref="userMenuRef">
          <button class="avatar-btn" @click="toggleUserMenu">
            <div class="avatar-circle">
              {{ userInitial }}
            </div>
          </button>

          <div class="user-dropdown glass-panel anim-slide-up" v-show="isUserMenuOpen">
            <div class="user-info">
              <span class="user-name">{{ authStore.user?.username || 'Usuario' }}</span>
              <span class="user-email">{{ authStore.user?.email || 'email@ejemplo.com' }}</span>
            </div>
            <div class="dropdown-divider"></div>

            <button class="dropdown-item" @click="navigate('/')">
              <i class="ph ph-house"></i> Inicio
            </button>
            <button class="dropdown-item is-active" @click="toggleUserMenu">
              <i class="ph ph-books"></i> Biblioteca
            </button>

            <div class="dropdown-divider"></div>
            <button class="dropdown-item btn-logout" @click="handleLogout">
              <i class="ph ph-sign-out"></i> Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </header>

    <main class="library-content">
      <div class="toolbar anim-slide-up" style="animation-delay: 0.1s;">
        <h2 class="text-gradient">Tus Proyectos</h2>
        <button class="btn-primary large-btn" @click="createNewProject">
          <i class="ph ph-plus"></i> Nuevo Proyecto
        </button>
      </div>

      <div v-if="isLoading" class="loading-state anim-fade-in">
        <div class="spinner"></div>
        <p>Cargando tus presentaciones...</p>
      </div>

      <div v-else-if="presentations.length === 0" class="empty-workspace anim-pop-in">
        <div class="empty-box glass-panel">
          <div class="empty-icon-wrapper">
            <i class="ph ph-folder-open"></i>
          </div>
          <h3>Aún no tienes proyectos</h3>
          <p>Crea tu primera presentación interactiva para empezar.</p>
          <button class="btn-primary large-btn mt-4 mx-auto" @click="createNewProject">
            <i class="ph ph-plus"></i> Crear Proyecto
          </button>
        </div>
      </div>

      <div v-else class="projects-grid">
        <div
          v-for="(project, idx) in presentations"
          :key="project._id"
          class="project-card glass-panel anim-slide-up"
          :style="{ animationDelay: `${0.1 + (idx * 0.05)}s` }"
        >
          <div
            class="project-thumbnail"
            @click="editProject(project._id)"
            :style="{
              backgroundImage: projectThumbnails[project._id] && projectThumbnails[project._id].startsWith('data:image') || projectThumbnails[project._id]?.startsWith('blob:') || projectThumbnails[project._id]?.startsWith('http') ? 'url(' + projectThumbnails[project._id] + ')' : 'none',
              backgroundColor: projectThumbnails[project._id] && projectThumbnails[project._id].startsWith('#') ? projectThumbnails[project._id] : 'transparent',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }"
          >
            <i v-if="!projectThumbnails[project._id]" :class="project.docType === 'pdf' ? 'ph ph-file-pdf' : 'ph ph-presentation-chart'" class="thumb-icon"></i>

            <!-- Capa Miniatura Nativa para "las herramientas" -->
            <div
              class="mini-canvas-layer"
              v-if="!project.coverImage && project.documentState && project.documentState[1]"
              style="position: absolute; top:0; left:0; width:100%; height:100%; pointer-events:none; z-index: 5;"
            >
              <div
                v-for="el in project.documentState[1]"
                :key="'mini-'+el.id"
                :style="getMiniElementStyle(el, project)"
              >
                <!-- Solo renderizamos texto si es sticky, text o mindmap -->
                <span v-if="el.type === 'text' || el.type === 'sticky'" style="line-height:1.1; display:block; width:100%;">
                  {{ el.content }}
                </span>
              </div>
            </div>

            <div class="thumb-actions">
              <button class="btn-primary" @click.stop="editProject(project._id)">
                <i class="ph ph-pencil-simple"></i> Editar
              </button>
            </div>
          </div>

          <div class="project-info">
            <div class="info-content">
              <h3 class="project-title">{{ project.title || 'Presentación sin título' }}</h3>
              <p class="project-date">Modificado: {{ formatDate(project.updatedAt) }}</p>
            </div>

            <div class="project-actions">
              <button class="tool-btn" title="Editar" @click="editProject(project._id)">
                <i class="ph ph-pencil-simple"></i>
              </button>
              <button class="tool-btn btn-icon-danger" title="Eliminar" @click="deleteProject(project._id, project.title)">
                <i class="ph ph-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
let pdfjsLibInstance: any = null;
const getPdfjsLib = async () => {
  if (pdfjsLibInstance) return pdfjsLibInstance;
  const pdfLib = await import('pdfjs-dist');
  // @ts-ignore
  const { default: PdfWorker } = await import('pdfjs-dist/build/pdf.worker.min.js?worker');
  pdfLib.GlobalWorkerOptions.workerPort = new PdfWorker();
  pdfjsLibInstance = pdfLib;
  return pdfLib;
};
import { useAuthStore } from '@/stores/auth'
import { presentationService } from '@/services/presentacion.service'

const router = useRouter()
const projectThumbnails = ref<Record<string, string>>({});
const authStore = useAuthStore()

const presentations = ref<any[]>([])
const isLoading = ref(true)

// --- LÓGICA DEL MENÚ DE USUARIO ---
const isUserMenuOpen = ref(false)
const userMenuRef = ref<HTMLElement | null>(null)

const userInitial = computed(() => {
  return authStore.user?.username?.charAt(0).toUpperCase() || 'U'
})

const toggleUserMenu = () => {
  isUserMenuOpen.value = !isUserMenuOpen.value
}

const handleClickOutside = (event: MouseEvent) => {
  if (isUserMenuOpen.value && userMenuRef.value && !userMenuRef.value.contains(event.target as Node)) {
    isUserMenuOpen.value = false
  }
}

const navigate = (path: string) => {
  isUserMenuOpen.value = false
  router.push(path)
}

const handleLogout = () => {
  authStore.logout()
  isUserMenuOpen.value = false
  router.push('/login')
}

// --- LÓGICA DE PROYECTOS ---
onMounted(async () => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }
  document.addEventListener('click', handleClickOutside)
  await loadPresentations()
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})


const generatePdfPreview = async (base64Data: string) => {
  try {
    const binaryString = window.atob(base64Data);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const pdfjsLib = await getPdfjsLib();
    const loadingTask = pdfjsLib.getDocument({ data: bytes });
    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 0.5 });

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({ canvasContext: ctx, viewport }).promise;
    return canvas.toDataURL('image/jpeg', 0.8);
  } catch (error) {
    console.error("Error generating PDF preview in library:", error);
    return null;
  }
};

const generateThumbnailsForLibrary = async (projectsArray: any[]) => {
  for (const project of projectsArray) {
    if (project.coverImage) {
      projectThumbnails.value[project._id] = project.coverImage;
    } else if (project.docType === 'pdf' && project.pdfBase64) {
      const url = await generatePdfPreview(project.pdfBase64);
      if (url) projectThumbnails.value[project._id] = url;
    } else if (project.docType === 'blank') {
      // Extrae la config de la página 1 guardada
      const page1 = project.slideConfigs?.[1];
      if (page1) {
        if (page1.bgImage) {
           projectThumbnails.value[project._id] = page1.bgImage;
        } else if (page1.bgColor) {
           // Fake a tiny 1x1 colored pixel or just save color
           projectThumbnails.value[project._id] = page1.bgColor;
        }
      }
    }
  }
};



const loadPresentations = async () => {
  isLoading.value = true
  try {
    const userId = authStore.user?._id || authStore.user?.id
    const allData = await presentationService.getUserPresentations(userId)
    presentations.value = allData.filter((p: any) => p.userId === userId)

    // Generar vistas previas nativas extrayendo Base64 u Objetos de las bases de datos de la presentacion
    if (typeof generateThumbnailsForLibrary === 'function') {
      generateThumbnailsForLibrary(presentations.value)
    }
  } catch (error) {
    console.error('Error cargando proyectos:', error)
  } finally {
    isLoading.value = false
  }
}

const createNewProject = () => {
  router.push('/editorpresentaciones')
}

const editProject = (id: string) => {
  router.push(`/editorpresentaciones/${id}`)
}

const deleteProject = async (id: string, title: string) => {
  const displayTitle = title || 'esta presentación'
  if (!confirm(`¿Estás seguro de que deseas eliminar permanentemente "${displayTitle}"?`)) return

  try {
    await presentationService.deletePresentation(id)
    presentations.value = presentations.value.filter(p => p._id !== id)
  } catch (error) {
    alert('No se pudo eliminar el proyecto.')
    console.error(error)
  }
}


const getMiniElementStyle = (el: any, p: any): any => {
   const bw = p.baseWidth || 1280;
   const bh = p.baseHeight || 720;
   const scaleX = 100 / bw;
   const scaleY = 100 / bh;
   const fakeThumbnailWidth = 300;
   const fontScale = fakeThumbnailWidth / bw;

   let br = (el.borderRadius ? el.borderRadius * fontScale : 0) + 'px';
   if (el.type === 'ellipse') br = '50%';
   else if (el.type === 'sticky') br = '0 0 4px 1px';

   // Parse shadows safely
   const shadow = el.boxShadow || 'none';
   if (shadow !== 'none' && shadow.includes('px')) {
      // Intentar escalar box-shadow pero es complejo, lo dejamos nativo o sutil:
      // Solo tomamos el string crudo, en preview se verá bien
   }

   return {
      position: 'absolute',
      left: (el.x * scaleX) + '%',
      top: (el.y * scaleY) + '%',
      width: el.width === 'auto' ? 'auto' : (el.width * scaleX) + '%',
      height: el.height === 'auto' ? 'auto' : (el.height * scaleY) + '%',
      backgroundColor: el.type === 'text' || el.type === 'sticky' ? (el.textBgColor || 'transparent') : (el.bgColor || 'transparent'),
      color: el.textColor || el.color || '#fff',
      opacity: el.opacity !== undefined ? Number(el.opacity) : 1,
      backdropFilter: el.isGlass ? 'blur(10px)' : 'none',
      WebkitBackdropFilter: el.isGlass ? 'blur(10px)' : 'none',
      transform: 'rotate(' + (el.rotation || 0) + 'deg)',
      mixBlendMode: el.mixBlendMode || 'normal',
      backgroundImage: el.type === 'image' && el.src ? 'url(' + el.src + ')' : 'none',
      backgroundSize: '100% 100%',
      fontSize: ((el.fontSize || 16) * fontScale) + 'px',
      borderRadius: br,
      boxShadow: shadow,
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: el.textAlign === 'center' ? 'center' : (el.textAlign === 'right' ? 'flex-end' : 'flex-start'),
      padding: el.type === 'sticky' || (el.type === 'text' && el.textBgColor !== 'transparent') ? '2px' : '0',
      border: el.borderWidth ? (el.borderWidth * fontScale) + 'px solid ' + el.borderColor : 'none',
   };
};
const formatDate = (dateString: string) => {
  if (!dateString) return 'Desconocido'
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}
</script>

<style scoped>
/* 1. LAYOUT PRINCIPAL */
.pro-library-app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: var(--bg-base);
  background-image:
    radial-gradient(circle at 0% 0%, rgba(99, 102, 241, 0.03) 0%, transparent 50%),
    radial-gradient(circle at 100% 100%, rgba(139, 92, 246, 0.03) 0%, transparent 50%);
  color: var(--text-primary);
  font-family: var(--font-main);
}

/* 2. CABECERA GLASS */
.glass-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
  background: rgba(17, 17, 19, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border-subtle);
  padding: 0 24px;
  flex-shrink: 0;
  box-shadow: var(--shadow-sm);
  z-index: 9999;
  position: sticky;
  top: 0;
}

.header-left, .header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.pro-logo {
  font-size: 1.3rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 10px;
  letter-spacing: -0.5px;
}

.logo-icon {
  font-size: 1.4rem;
}

.text-accent {
  background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.divider-vertical {
  width: 1px;
  height: 24px;
  background: var(--border-strong);
  margin: 0 6px;
}

.page-title {
  margin: 0;
  font-size: 1rem;
  color: var(--text-secondary);
  font-weight: 600;
}

/* --- ESTILOS DEL MENÚ DE USUARIO --- */
.user-menu-container {
  position: relative;
}

.avatar-btn {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  border-radius: 50%;
  transition: transform var(--transition-bounce);
}

.avatar-btn:hover {
  transform: scale(1.08);
}

.avatar-circle {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.1rem;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.4);
  border: 2px solid var(--border-subtle);
}

.user-dropdown {
  position: absolute;
  top: calc(100% + 12px);
  right: 0;
  width: 220px;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 4px 0;
}

.user-info {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.user-name {
  color: var(--text-primary);
  font-weight: 600;
  font-size: 0.95rem;
}

.user-email {
  color: var(--text-tertiary);
  font-size: 0.8rem;
  word-break: break-all;
}

.dropdown-divider {
  height: 1px;
  background-color: var(--border-subtle);
  width: 100%;
  margin: 4px 0;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  background: transparent;
  border: none;
  color: var(--text-secondary);
  text-align: left;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all var(--transition-fast);
  font-weight: 500;
}

.dropdown-item i {
  font-size: 1.1rem;
}

.dropdown-item:hover {
  background-color: var(--bg-surface-hover);
  color: var(--text-primary);
}

.dropdown-item.is-active {
  color: var(--accent-primary);
  background-color: rgba(99, 102, 241, 0.1);
}

.btn-logout {
  color: var(--danger);
}

.btn-logout:hover {
  background-color: rgba(239, 68, 68, 0.1);
  color: var(--danger-hover);
}

/* 3. CONTENIDO Y TOOLBAR */
.library-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: clamp(20px, 4vw, 40px) 24px;
  width: 100%;
  box-sizing: border-box;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 35px;
}

.toolbar h2 {
  margin: 0;
  font-size: clamp(1.4rem, 2.5vw, 1.8rem);
  font-weight: 800;
  letter-spacing: -0.5px;
}

/* 4. BOTONES REUTILIZADOS */
.btn-primary {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  box-sizing: border-box;
  transition: all var(--transition-normal);
  background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: var(--shadow-sm);
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
}

.large-btn {
  padding: 12px 24px;
  font-size: 0.95rem;
  border-radius: var(--radius-md);
}

.tool-btn {
  font-size: 1.2rem;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: var(--text-tertiary);
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
}

.tool-btn:hover {
  background: var(--bg-surface-active);
  color: var(--text-primary);
}

.btn-icon-danger:hover {
  background: rgba(239, 68, 68, 0.1) !important;
  color: var(--danger) !important;
}

/* 5. GRID Y TARJETAS */
.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}

.project-card {
  padding: 0;
  overflow: hidden;
  transition: all var(--transition-bounce);
  display: flex;
  flex-direction: column;
  cursor: pointer;
}

.project-card:hover {
  transform: translateY(-6px);
  box-shadow: var(--shadow-lg), 0 0 0 1px var(--accent-primary);
}

.project-thumbnail {
  width: 100%;
  aspect-ratio: 16 / 9;
  background: var(--bg-surface-active);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  border-bottom: 1px solid var(--border-subtle);
  overflow: hidden;
}

.thumb-icon {
  font-size: 4rem;
  color: var(--bg-base);
  transition: all var(--transition-bounce);
}

.project-card:hover .thumb-icon {
  color: var(--text-tertiary);
  transform: scale(1.15);
}

.thumb-actions {
  z-index: 20; /* Elevado sobre el mini-canvas */
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(9, 9, 11, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: all var(--transition-normal);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.project-thumbnail:hover .thumb-actions {
  opacity: 1;
}

.project-info {
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: transparent;
}

.info-content {
  flex: 1;
  overflow: hidden;
}

.project-title {
  margin: 0 0 6px 0;
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.project-date {
  margin: 0;
  font-size: 0.8rem;
  color: var(--text-tertiary);
}

.project-actions {
  display: flex;
  gap: 4px;
}

/* 6. ESTADOS DE CARGA Y VACÍOS */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px 0;
  color: var(--text-tertiary);
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(99, 102, 241, 0.1);
  border-top-color: var(--accent-primary);
  border-radius: 50%;
  animation: spin 1s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-workspace {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
}

.empty-box {
  padding: 60px 40px;
  text-align: center;
  max-width: 480px;
}

.empty-icon-wrapper {
  width: 80px;
  height: 80px;
  background: rgba(99, 102, 241, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px auto;
  font-size: 2.2rem;
  color: var(--accent-primary);
  box-shadow: inset 0 0 20px rgba(99, 102, 241, 0.1);
}

.empty-box h3 {
  margin: 0 0 12px 0;
  font-size: 1.3rem;
  font-weight: 800;
  color: var(--text-primary);
}

.empty-box p {
  color: var(--text-secondary);
  font-size: 0.95rem;
  margin: 0;
  line-height: 1.6;
}

/* Utilidades */
.mt-4 { margin-top: 24px; }
.mx-auto { margin-left: auto; margin-right: auto; }
</style>
