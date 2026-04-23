<template>
  <div class="template-library-page">
    <header class="library-header">
      <div class="library-header-top">
        <div class="library-header-left">
          <button class="btn-back" @click="router.back()">
            <i class="ph ph-arrow-left"></i> Volver
          </button>
          <div
            class="pro-logo"
            role="button"
            tabindex="0"
            title="Ir al inicio"
            @click="navigate('/')"
            @keydown.enter.prevent="navigate('/')"
            @keydown.space.prevent="navigate('/')"
          >
            <span class="logo-icon">🚀</span>
            <span class="logo-text">Doc<span class="text-accent">Flow</span></span>
          </div>
          <h2><i class="ph ph-storefront"></i> Tienda de Plantillas</h2>
        </div>
        <div class="user-menu-container" v-if="authStore.user" ref="userMenuRef">
          <button class="avatar-btn" @click="toggleUserMenu">
            <div class="avatar-circle">
              {{ userInitial }}
            </div>
          </button>

          <div class="user-dropdown" v-show="isUserMenuOpen">
            <div class="user-info">
              <span class="user-name">{{ authStore.user?.username || 'Usuario' }}</span>
              <span class="user-email">{{ authStore.user?.email || 'email@ejemplo.com' }}</span>
            </div>
            <div class="dropdown-divider"></div>

            <button class="dropdown-item" @click="navigate('/biblioteca')">
              <i class="ph ph-books"></i> Biblioteca
            </button>
            <button class="dropdown-item" @click="navigate('/editorpresentaciones')">
              <i class="ph ph-presentation-chart"></i> Editor
            </button>
            <button class="dropdown-item" @click="navigate('/biblioteca-plantillas')">
              <i class="ph ph-storefront"></i> Plantillas
            </button>

            <div class="dropdown-divider"></div>
            <button class="dropdown-item btn-logout" @click="handleLogout">
              <i class="ph ph-sign-out"></i> Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
      <div class="library-actions">
        <button class="btn-create-template" @click="openTemplateEngine">
          <i class="ph ph-sparkle"></i> Crear Plantilla Privada
        </button>
      </div>
      <div class="tabs">
        <button :class="{ active: activeTab === 'store' }" @click="activeTab = 'store'">
          <i class="ph ph-compass"></i> Explorar Tienda
        </button>
        <button :class="{ active: activeTab === 'mine' }" @click="activeTab = 'mine'">
          <i class="ph ph-bookmark-simple"></i> Mis Plantillas Guardadas
        </button>
      </div>
    </header>

    <main v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Cargando plantillas...</p>
    </main>

    <main v-else-if="activeTab === 'store'" class="template-grid">
      <p v-if="publicTemplates.length === 0" class="empty-state">
        No hay plantillas públicas todavía.
      </p>
      <div v-for="tpl in publicTemplates" :key="tpl._id" class="template-card">
        <div class="tpl-preview-wrapper">
          <img v-if="tpl.coverImage" :src="tpl.coverImage" alt="Preview" class="tpl-preview" />
          <div v-else class="tpl-preview-placeholder"><i class="ph ph-image"></i></div>
        </div>
        <div class="tpl-info">
          <h3>{{ tpl.title }}</h3>
          <p class="tpl-author">Por: {{ tpl.authorName }}</p>
          <button class="btn-ghost" @click="openTemplatePreview(tpl)">
            <i class="ph ph-eye"></i> Vista previa
          </button>
          <button
            class="btn-primary"
            @click="saveToMyGallery(tpl._id)"
            :disabled="savingId === tpl._id || isTemplateSaved(tpl)"
          >
            <i
              class="ph"
              :class="
                savingId === tpl._id
                  ? 'ph-spinner icon-spin'
                  : isTemplateSaved(tpl)
                    ? 'ph-check'
                    : 'ph-download-simple'
              "
            ></i>
            {{
              savingId === tpl._id
                ? 'Guardando...'
                : isTemplateSaved(tpl)
                  ? 'Ya guardado'
                  : 'Guardar en mi Galería'
            }}
          </button>
        </div>
      </div>
    </main>

    <main v-else-if="activeTab === 'mine'" class="template-grid">
      <p v-if="myTemplates.length === 0" class="empty-state">
        Aún no tienes plantillas guardadas. ¡Explora la tienda o crea una desde el editor!
      </p>
      <div v-for="tpl in myTemplates" :key="tpl._id" class="template-card">
        <div class="tpl-preview-wrapper">
          <img v-if="tpl.coverImage" :src="tpl.coverImage" alt="Preview" class="tpl-preview" />
          <div v-else class="tpl-preview-placeholder"><i class="ph ph-image"></i></div>
        </div>
        <div class="tpl-info">
          <h3>{{ tpl.title }}</h3>
          <span class="badge" v-if="tpl.isPrivate">Privada</span>
          <span class="badge public" v-else>Pública</span>
          <div class="actions">
            <button class="btn-ghost" @click="openTemplatePreview(tpl)">
              <i class="ph ph-eye"></i> Vista previa
            </button>
            <button class="btn-primary" @click="useTemplate(tpl)">
              <i class="ph ph-pencil-simple"></i> Usar
            </button>
            <button class="btn-danger" @click="deleteTemplateFromCard(tpl)">
              <i class="ph ph-trash"></i>
              {{ isNativeTemplate(tpl) ? 'Eliminar' : 'Descartar' }}
            </button>
          </div>
        </div>
      </div>
    </main>

    <div v-if="showPreviewModal" class="preview-overlay" @click.self="closeTemplatePreview">
      <div class="preview-modal">
        <div class="preview-header">
          <div>
            <h3>{{ selectedTemplate?.title || 'Vista de Plantilla' }}</h3>
            <p>
              Por: {{ selectedTemplate?.authorName || 'Desconocido' }}
              <span class="badge" v-if="selectedTemplate?.isPrivate">Privada</span>
              <span class="badge public" v-else>Pública</span>
            </p>
          </div>
          <button class="btn-icon-close" @click="closeTemplatePreview">
            <i class="ph ph-x"></i>
          </button>
        </div>

        <div class="preview-stage">
          <img v-if="selectedTemplate?.coverImage" :src="selectedTemplate.coverImage" class="preview-image" alt="Preview de plantilla" />
          <div v-else class="preview-placeholder">
            <i class="ph ph-image"></i>
            <p>No hay portada disponible para esta plantilla.</p>
          </div>
        </div>

        <div class="preview-meta" v-if="selectedTemplate">
          <span>{{ selectedTemplate.baseWidth || 1280 }}x{{ selectedTemplate.baseHeight || 720 }}</span>
          <span>{{ selectedSlidesCount }} diapositivas</span>
        </div>

        <div class="preview-actions">
          <button
            v-if="canPublishSelected"
            class="btn-primary"
            :disabled="isActionLoading"
            @click="publishSelectedTemplate"
          >
            <i class="ph ph-rocket-launch"></i> Publicar
          </button>

          <button class="btn-primary" :disabled="isActionLoading" @click="useTemplate(selectedTemplate)">
            <i class="ph ph-pencil-simple"></i> Usar
          </button>

          <button class="btn-danger" :disabled="isActionLoading" @click="deleteSelectedTemplate">
            <i class="ph ph-trash"></i> Eliminar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { templateService } from '@/services/template.service';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const activeTab = ref('store');
const isLoading = ref(false);
const savingId = ref<string | null>(null);
const isActionLoading = ref(false);
const publicTemplates = ref<any[]>([]);
const myTemplates = ref<any[]>([]);
const showPreviewModal = ref(false);
const selectedTemplate = ref<any | null>(null);
const isUserMenuOpen = ref(false);
const userMenuRef = ref<HTMLElement | null>(null);

const currentUserId = computed(() => authStore.user?._id || authStore.user?.id || null);

const isSelectedNativeTemplate = computed(() => {
  if (!selectedTemplate.value || !currentUserId.value) return false;
  return String(selectedTemplate.value.userId) === String(currentUserId.value);
});

const canPublishSelected = computed(() => {
  return Boolean(isSelectedNativeTemplate.value && selectedTemplate.value?.isPrivate);
});

const savedTemplateIds = computed(() => {
  const ids = new Set<string>();
  for (const tpl of myTemplates.value) {
    if (tpl?._id) ids.add(String(tpl._id));
  }
  return ids;
});

const selectedSlidesCount = computed(() => {
  const state = selectedTemplate.value?.documentState;
  if (!state || typeof state !== 'object') return 0;
  return Object.keys(state).length;
});

const userInitial = computed(() => {
  return authStore.user?.username?.charAt(0).toUpperCase() || 'U';
});

const toggleUserMenu = () => {
  isUserMenuOpen.value = !isUserMenuOpen.value;
};

const handleClickOutside = (event: MouseEvent) => {
  if (isUserMenuOpen.value && userMenuRef.value && !userMenuRef.value.contains(event.target as Node)) {
    isUserMenuOpen.value = false;
  }
};

const navigate = (path: string) => {
  isUserMenuOpen.value = false;
  router.push(path);
};

const handleLogout = () => {
  authStore.logout();
  isUserMenuOpen.value = false;
  router.push('/login');
};

const loadData = async () => {
  isLoading.value = true;
  try {
    const userId = authStore.user?._id;
    const [pub, mine] = await Promise.all([
      templateService.getPublicTemplates(),
      userId ? templateService.getUserTemplates(userId) : Promise.resolve([]),
    ]);
    publicTemplates.value = Array.isArray(pub) ? pub : [];
    myTemplates.value = Array.isArray(mine) ? mine : [];
  } finally {
    isLoading.value = false;
  }
};

const saveToMyGallery = async (id: string) => {
  const userId = authStore.user?._id;
  if (!userId) return;
  if (savedTemplateIds.value.has(String(id))) return;

  savingId.value = id;
  try {
    await templateService.saveToGallery(id, userId);
    await loadData();
  } finally {
    savingId.value = null;
  }
};

const isTemplateSaved = (tpl: any) => {
  if (!tpl?._id) return false;
  if (isNativeTemplate(tpl)) return true;
  return savedTemplateIds.value.has(String(tpl._id));
};

const discardTemplate = async (id: string) => {
  const userId = currentUserId.value;
  if (!userId) return;
  await templateService.removeFromGallery(id, userId);
  await loadData();
};

const useTemplate = (tpl: any) => {
  closeTemplatePreview();

  if (isNativeTemplate(tpl)) {
    const visibility = tpl.isPrivate ? 'private' : 'public';
    router.push(`/editorpresentaciones/${tpl._id}?mode=template&visibility=${visibility}`);
    return;
  }

  router.push(`/editorpresentaciones?templateId=${tpl._id}`);
};

const isNativeTemplate = (tpl: any) => {
  if (!tpl || !currentUserId.value) return false;
  return String(tpl.userId) === String(currentUserId.value);
};

const deleteTemplateFromCard = async (tpl: any) => {
  const userId = currentUserId.value;
  if (!tpl?._id || !userId) return;

  isActionLoading.value = true;
  try {
    if (isNativeTemplate(tpl)) {
      await templateService.deleteTemplate(tpl._id, userId);
    } else {
      await templateService.removeFromGallery(tpl._id, userId);
    }
    await loadData();
  } finally {
    isActionLoading.value = false;
  }
};

const openTemplatePreview = async (tpl: any) => {
  showPreviewModal.value = true;
  selectedTemplate.value = tpl;
  try {
    const fullTemplate = await templateService.getTemplateById(tpl._id);
    selectedTemplate.value = fullTemplate;
  } catch {
    // Si falla el detalle, mostramos al menos la metadata de la tarjeta.
  }
};

const closeTemplatePreview = () => {
  showPreviewModal.value = false;
  selectedTemplate.value = null;
};

const publishSelectedTemplate = async () => {
  const userId = currentUserId.value;
  if (!selectedTemplate.value?._id || !userId) return;

  isActionLoading.value = true;
  try {
    await templateService.publishTemplate(selectedTemplate.value._id, userId);
    await loadData();
    const updated = await templateService.getTemplateById(selectedTemplate.value._id);
    selectedTemplate.value = updated;
  } finally {
    isActionLoading.value = false;
  }
};

const deleteSelectedTemplate = async () => {
  const userId = currentUserId.value;
  if (!selectedTemplate.value?._id || !userId) return;

  isActionLoading.value = true;
  try {
    if (isSelectedNativeTemplate.value) {
      await templateService.deleteTemplate(selectedTemplate.value._id, userId);
    } else {
      await templateService.removeFromGallery(selectedTemplate.value._id, userId);
    }
    closeTemplatePreview();
    await loadData();
  } finally {
    isActionLoading.value = false;
  }
};

const openTemplateEngine = () => {
  router.push('/editorpresentaciones?mode=template&visibility=private');
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  loadData();
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.template-library-page {
  min-height: 100vh;
  background: var(--bg-base, #0f0f10);
  color: var(--text-primary, #e8e8e8);
  padding: 40px;
}

.library-header {
  margin-bottom: 32px;
}

.library-actions {
  margin-bottom: 14px;
}

.library-header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.library-header-left {
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
  cursor: pointer;
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

.library-header-top h2 {
  font-size: 1.6rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
}

.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: transparent;
  border: 1px solid var(--border-subtle, rgba(255,255,255,0.1));
  color: var(--text-secondary, #aaa);
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s;
}

.btn-back:hover {
  background: var(--bg-surface-active, rgba(255,255,255,0.06));
  color: var(--text-primary, #e8e8e8);
}

.btn-create-template {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 10px 16px;
  border: 1px solid transparent;
  border-radius: 10px;
  background: var(--accent-primary, #7c6aff);
  color: #fff;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, filter 0.2s ease;
}

.btn-create-template:hover {
  filter: brightness(1.08);
  transform: translateY(-1px);
}

.user-menu-container {
  position: relative;
}

.avatar-btn {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  border-radius: 50%;
  transition: transform 0.2s;
}

.avatar-btn:hover {
  transform: scale(1.05);
}

.avatar-circle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent-primary), rgba(var(--accent-rgb), 0.62));
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.1rem;
  box-shadow: 0 2px 5px rgba(0,0,0,0.3);
  border: 2px solid var(--border-subtle, rgba(255,255,255,0.1));
}

.user-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: var(--bg-panel, #1a1a1c);
  border: 1px solid var(--border-subtle, rgba(255,255,255,0.1));
  border-radius: 10px;
  width: 240px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
  z-index: 50;
  overflow: hidden;
}

.user-info {
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.user-name {
  color: var(--text-primary, #fff);
  font-weight: 600;
  font-size: 0.95rem;
}

.user-email {
  color: var(--text-secondary, #aaa);
  font-size: 0.8rem;
  word-break: break-all;
}

.dropdown-divider {
  border-top: 1px solid var(--border-subtle, rgba(255,255,255,0.1));
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 10px 14px;
  background: transparent;
  border: none;
  color: var(--text-primary, #fff);
  text-align: left;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.2s;
}

.dropdown-item:hover {
  background: var(--bg-surface-active, rgba(255,255,255,0.06));
}

.btn-logout:hover {
  color: var(--accent-primary, #7c6aff);
}

.tabs {
  display: flex;
  gap: 8px;
}

.tabs button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  background: var(--bg-panel, #1a1a1c);
  border: 1px solid var(--border-subtle, rgba(255,255,255,0.08));
  color: var(--text-secondary, #aaa);
  cursor: pointer;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.tabs button.active {
  background: var(--accent-primary, #7c6aff);
  border-color: transparent;
  color: white;
  font-weight: 600;
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
}

.template-card {
  border: 1px solid var(--border-subtle, rgba(255,255,255,0.08));
  border-radius: 12px;
  overflow: hidden;
  background: var(--bg-panel, #1a1a1c);
  transition: transform 0.2s, box-shadow 0.2s;
}

.template-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.4);
}

.tpl-preview-wrapper {
  width: 100%;
  aspect-ratio: 16/9;
  overflow: hidden;
  background: var(--bg-base, #0f0f10);
}

.tpl-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.tpl-preview-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  color: var(--text-secondary, #aaa);
}

.tpl-info {
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tpl-info h3 {
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
}

.tpl-author {
  font-size: 0.8rem;
  color: var(--text-secondary, #aaa);
  margin: 0;
}

.badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  background: var(--bg-surface-active, rgba(255,255,255,0.06));
  color: var(--text-secondary, #aaa);
  border: 1px solid var(--border-subtle, rgba(255,255,255,0.1));
  width: fit-content;
}

.badge.public {
  background: rgba(var(--accent-rgb, 124, 106, 255), 0.15);
  color: var(--accent-primary, #7c6aff);
  border-color: rgba(var(--accent-rgb, 124, 106, 255), 0.3);
}

.actions {
  display: flex;
  gap: 8px;
  margin-top: 4px;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: var(--accent-primary, #7c6aff);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 600;
  transition: filter 0.2s;
  flex: 1;
  justify-content: center;
}

.btn-primary:hover:not(:disabled) {
  filter: brightness(1.1);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-ghost {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 14px;
  background: transparent;
  color: var(--text-secondary, #aaa);
  border: 1px solid var(--border-subtle, rgba(255,255,255,0.2));
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 600;
  transition: all 0.2s;
  flex: 1;
}

.btn-ghost:hover {
  background: var(--bg-surface-active, rgba(255,255,255,0.06));
  color: var(--text-primary, #fff);
}

.btn-danger {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: transparent;
  color: #ff6b6b;
  border: 1px solid rgba(255, 107, 107, 0.4);
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 600;
  transition: all 0.2s;
  flex: 1;
  justify-content: center;
}

.btn-danger:hover {
  background: rgba(255, 107, 107, 0.1);
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 60px 0;
  color: var(--text-secondary, #aaa);
}

.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid rgba(255,255,255,0.1);
  border-top-color: var(--accent-primary, #7c6aff);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  color: var(--text-secondary, #aaa);
  padding: 60px 0;
  font-size: 0.95rem;
}

.icon-spin {
  animation: spin 1s linear infinite;
}

.preview-overlay {
  position: fixed;
  inset: 0;
  z-index: 70;
  background: rgba(0, 0, 0, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.preview-modal {
  width: min(900px, 100%);
  background: var(--bg-panel, #1a1a1c);
  border: 1px solid var(--border-subtle, rgba(255,255,255,0.15));
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 20px 50px rgba(0,0,0,0.45);
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  padding: 18px 20px;
  border-bottom: 1px solid var(--border-subtle, rgba(255,255,255,0.1));
}

.preview-header h3 {
  margin: 0 0 6px;
}

.preview-header p {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-secondary, #aaa);
}

.btn-icon-close {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  border: 1px solid var(--border-subtle, rgba(255,255,255,0.2));
  background: transparent;
  color: var(--text-secondary, #aaa);
  cursor: pointer;
}

.preview-stage {
  padding: 16px;
}

.preview-image,
.preview-placeholder {
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 10px;
  border: 1px solid var(--border-subtle, rgba(255,255,255,0.12));
  background: #111;
}

.preview-image {
  object-fit: contain;
}

.preview-placeholder {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 10px;
  color: var(--text-secondary, #aaa);
}

.preview-meta {
  padding: 0 20px 16px;
  color: var(--text-secondary, #aaa);
  display: flex;
  gap: 12px;
}

.preview-actions {
  display: flex;
  gap: 10px;
  padding: 16px 20px 20px;
  border-top: 1px solid var(--border-subtle, rgba(255,255,255,0.1));
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
