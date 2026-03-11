<template>
  <div class="pro-library-app">
    <header class="pro-header">
      <div class="header-left">
        <div class="pro-logo">
          <i class="ph ph-rocket" style="color: #58a6ff; font-size: 1.4rem;"></i>
          <span class="logo-text">Present<span class="text-accent">Pro</span></span>
        </div>
        <div class="divider-vertical"></div>
        <h1 class="page-title">Mi Biblioteca</h1>
      </div>

      <div class="header-right" v-if="authStore.user">
        <div class="user-profile">
          <div class="avatar-circle">{{ userInitial }}</div>
          <span class="user-name">{{ authStore.user.username }}</span>
        </div>
      </div>
    </header>

    <main class="library-content">
      <div class="toolbar">
        <h2>Tus Proyectos</h2>
        <button class="btn-primary large-btn" @click="createNewProject">
          <i class="ph ph-plus"></i> Nuevo Proyecto
        </button>
      </div>

      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>Cargando tus presentaciones...</p>
      </div>

      <div v-else-if="presentations.length === 0" class="empty-workspace">
        <div class="empty-box">
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
          v-for="project in presentations" 
          :key="project._id" 
          class="project-card"
        >
          <div class="project-thumbnail" @click="editProject(project._id)">
            <i :class="project.docType === 'pdf' ? 'ph ph-file-pdf' : 'ph ph-presentation-chart'" class="thumb-icon"></i>
            <div class="thumb-actions">
              <button class="btn-primary" @click.stop="editProject(project._id)">
                <i class="ph ph-pencil-simple"></i> Editar Proyecto
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { presentationService } from '@/services/presentacion.service'

const router = useRouter()
const authStore = useAuthStore()

const presentations = ref<any[]>([])
const isLoading = ref(true)

const userInitial = computed(() => {
  return authStore.user?.username?.charAt(0).toUpperCase() || 'U'
})

// Cargar proyectos al montar la vista
onMounted(async () => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }
  await loadPresentations()
})

const loadPresentations = async () => {
  isLoading.value = true
  try {
    const userId = authStore.user?._id || authStore.user?.id
    const allData = await presentationService.getUserPresentations(userId)
    presentations.value = allData.filter((p: any) => p.userId === userId)
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

// Utilidad para formatear fechas
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
/* 1. LAYOUT PRINCIPAL (Basado en pro-editor-app) */
.pro-library-app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #0d1117;
  color: #c9d1d9;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
}

/* 2. CABECERA (Heredada de pro-header) */
.pro-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 48px;
  background-color: #161b22;
  border-bottom: 1px solid #30363d;
  padding: 0 20px;
  flex-shrink: 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  z-index: 10;
}

.header-left, .header-right {
  display: flex;
  align-items: center;
  gap: 15px;
}

.pro-logo {
  font-size: 1.1rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 8px;
  letter-spacing: -0.5px;
}

.text-accent {
  color: #58a6ff;
}

.divider-vertical {
  width: 1px;
  height: 20px;
  background: #30363d;
  margin: 0 5px;
}

.page-title {
  margin: 0;
  font-size: 0.95rem;
  color: #8b949e;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 8px;
  background: #0d1117;
  border: 1px solid #30363d;
  border-radius: 20px;
}

.avatar-circle {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(135deg, #58a6ff, #1f6feb);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.75rem;
}

.user-name {
  font-weight: 600;
  font-size: 0.8rem;
  padding-right: 4px;
}

/* 3. CONTENIDO Y TOOLBAR */
.library-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  width: 100%;
  box-sizing: border-box;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.toolbar h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #c9d1d9;
}

/* 4. BOTONES REUTILIZADOS */
.btn-primary {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  box-sizing: border-box;
  transition: all 0.2s;
  background: #238636;
  color: #fff;
  border: 1px solid rgba(240, 246, 252, 0.1);
}

.btn-primary:hover {
  background: #2ea043;
}

.large-btn {
  padding: 10px 20px;
  font-size: 0.9rem;
  border-radius: 6px;
}

.tool-btn {
  font-size: 1.1rem;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: #8b949e;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
}

.tool-btn:hover {
  background: #21262d;
  color: #c9d1d9;
}

.btn-icon-danger:hover {
  background: rgba(218, 54, 51, 0.1) !important;
  color: #ff7b72 !important;
}

/* 5. GRID Y TARJETAS (Inspirado en template-card / thumb-card) */
.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.project-card {
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
  display: flex;
  flex-direction: column;
}

.project-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.4);
  border-color: #58a6ff;
}

.project-thumbnail {
  width: 100%;
  aspect-ratio: 16 / 9;
  background: #0d1117;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: pointer;
  border-bottom: 1px solid #30363d;
  overflow: hidden;
}

.thumb-icon {
  font-size: 3.5rem;
  color: #30363d;
  transition: color 0.2s, transform 0.2s;
}

.project-card:hover .thumb-icon {
  color: #8b949e;
  transform: scale(1.1);
}

.thumb-actions {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.2s;
  backdrop-filter: blur(2px);
}

.project-thumbnail:hover .thumb-actions {
  opacity: 1;
}

.project-info {
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #161b22;
}

.info-content {
  flex: 1;
  overflow: hidden;
}

.project-title {
  margin: 0 0 4px 0;
  font-size: 1rem;
  font-weight: 600;
  color: #c9d1d9;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.project-date {
  margin: 0;
  font-size: 0.75rem;
  color: #8b949e;
}

.project-actions {
  display: flex;
  gap: 2px;
}

/* 6. ESTADOS DE CARGA Y VACÍOS (Identicos a pro-editor) */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
  color: #8b949e;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(88, 166, 255, 0.2);
  border-top-color: #58a6ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin { 
  to { transform: rotate(360deg); } 
}

.empty-workspace {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
}

.empty-box {
  background: #0d1117;
  border: 1px solid #30363d;
  padding: 50px;
  border-radius: 12px;
  text-align: center;
  max-width: 450px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
}

.empty-icon-wrapper {
  width: 60px;
  height: 60px;
  background: #21262d;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 15px auto;
  font-size: 1.8rem;
  color: #8b949e;
}

.empty-box h3 {
  margin: 0 0 10px 0;
  font-size: 1.2rem;
  font-weight: 800;
  color: #c9d1d9;
}

.empty-box p {
  color: #8b949e;
  font-size: 0.9rem;
  margin: 0;
  line-height: 1.5;
}

/* Utilidades */
.mt-4 { margin-top: 20px; }
.mx-auto { margin-left: auto; margin-right: auto; }
</style>