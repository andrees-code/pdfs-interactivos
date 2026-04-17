<template>
  <header class="pro-header">
    <div class="header-left">
      <div class="pro-logo">
        <span class="logo-icon">🚀</span>
        <span class="logo-text">Doc<span class="text-accent">Flow</span></span>
      </div>

      <div class="file-menu">
        <label class="menu-item" :class="{ 'is-loading': isConverting }">
          <input
            type="file"
            @change="$emit('file-upload', $event)"
            accept=".pdf, .pptx, .ppsx, .potx, .html"
            hidden
            :disabled="isConverting"
          />
          <i class="ph ph-upload-simple"></i>
          {{ isConverting ? 'Convirtiendo...' : 'Importar Archivo' }}
        </label>

        <button
          class="menu-item btn-save"
          :disabled="!hasDoc || isConverting || isSaving"
          @click="$emit('save')"
        >
          <i class="ph" :class="isSaving ? 'ph-spinner icon-spin' : 'ph-floppy-disk'"></i>
          {{ isSaving ? 'Guardando...' : 'Guardar' }}
        </button>

        <div class="cloud-status" v-if="hasDoc" :title="isAutosaving || isSaving ? 'Guardando cambios...' : 'Todos los cambios se han guardado en la nube'">
          <i class="ph" :class="isAutosaving || isSaving ? 'ph-arrows-clockwise icon-spin text-sync' : 'ph-cloud-check text-success'"></i>
          <span class="status-text">{{ isAutosaving || isSaving ? 'Guardando...' : 'Guardado en la nube' }}</span>
        </div>

        <button
          class="menu-item btn-export"
          :disabled="!hasDoc || isConverting"
          @click="$emit('export')"
        >
          <i class="ph ph-export"></i> Exportar Web
        </button>
      </div>
    </div>

    <div class="header-center" v-if="hasDoc">
      <div class="zoom-controls">
        <button @click="$emit('change-zoom', -0.1)" class="tool-btn" title="Alejar">
          <i class="ph ph-minus"></i>
        </button>
        <span class="zoom-level">{{ Math.round(zoom * 100) }}%</span>
        <button @click="$emit('change-zoom', 0.1)" class="tool-btn" title="Acercar">
          <i class="ph ph-plus"></i>
        </button>
        <div class="divider-vertical"></div>
        <button @click="$emit('fit-screen')" class="tool-btn" title="Ajustar a pantalla">
          <i class="ph ph-corners-out"></i>
        </button>
      </div>
    </div>

    <div class="header-right">
      <button class="btn-play" v-if="hasDoc" :class="{ 'is-active': playMode }" @click="$emit('toggle-play')">
        <i class="ph" :class="playMode ? 'ph-stop' : 'ph-play'"></i>
        {{ playMode ? 'Detener Presentación' : 'Iniciar Presentación' }}
      </button>

      <div class="user-menu-container" v-if="authStore.isAuthenticated" ref="userMenuRef">
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

          <button class="dropdown-item" @click="navigate('/')">
            <i class="ph ph-house"></i> Inicio
          </button>
          <button class="dropdown-item" @click="navigate('/biblioteca')">
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
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const router = useRouter();

const isUserMenuOpen = ref(false);
const userMenuRef = ref<HTMLElement | null>(null);

const toggleUserMenu = () => {
  isUserMenuOpen.value = !isUserMenuOpen.value;
};

const handleClickOutside = (event: MouseEvent) => {
  if (isUserMenuOpen.value && userMenuRef.value && !userMenuRef.value.contains(event.target as Node)) {
    isUserMenuOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});

const navigate = (path: string) => {
  isUserMenuOpen.value = false;
  router.push(path);
};

const userInitial = computed(() => {
  const username = authStore.user?.username;
  return username ? username.charAt(0).toUpperCase() : 'U';
});

const handleLogout = () => {
  authStore.logout();
  isUserMenuOpen.value = false;
  router.push('/login');
};

// NUEVO: Añadida la prop isAutosaving
defineProps<{
  isConverting: boolean;
  hasDoc: boolean;
  zoom: number;
  playMode: boolean;
  isSaving: boolean;
  isAutosaving?: boolean;
}>();

defineEmits<{
  (e: 'file-upload', event: Event): void;
  (e: 'export'): void;
  (e: 'change-zoom', delta: number): void;
  (e: 'fit-screen'): void;
  (e: 'toggle-play'): void;
  (e: 'save'): void;
}>();
</script>

<style scoped>
.pro-header {
  position: relative;
  z-index: 99999 !important;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  background: rgba(17, 17, 19, 0.8) !important;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 55px;
  background-color: rgba(17, 17, 19, 0.7);
  border-bottom: 1px solid var(--border-strong);
  padding: 0 20px;
  flex-shrink: 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}
.header-left,
.header-center,
.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}
.pro-logo {
  font-size: 1.3rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 8px;
  letter-spacing: -0.5px;
}
.text-accent {
  color: var(--accent-primary);
}
.file-menu {
  display: flex;
  gap: 10px;
  align-items: center; /* Asegura que todos los elementos se alineen verticalmente */
}
.menu-item {
  display: flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: 1px solid var(--border-strong);
  color: var(--text-primary);
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}
.menu-item:hover:not(:disabled) {
  background: var(--border-strong);
}
.menu-item:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.menu-item.is-loading {
  background: var(--accent-primary);
  color: var(--bg-base);
  font-weight: bold;
  border-color: var(--accent-primary);
}

/* NUEVO: Estilos para el estado de la nube */
.cloud-status {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 10px;
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--text-secondary);
  cursor: default;
  user-select: none;
  transition: color 0.3s ease;
}
.cloud-status i {
  font-size: 1.1rem;
}
.text-success {
  color: var(--success); /* Verde para el check de éxito */
}
.text-sync {
  color: var(--text-secondary); /* Gris para el proceso de guardado */
}

.btn-save {
  background: var(--accent-primary-hover);
  border-color: rgba(240, 246, 252, 0.1);
  color: white;
}
.btn-save:hover:not(:disabled) {
  background: #388bfd;
  border-color: #388bfd;
}
.icon-spin {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.btn-export {
  background: var(--success);
  border-color: var(--success);
  color: white;
}
.btn-export:hover:not(:disabled) {
  background: var(--success);
  border-color: var(--success);
}
.zoom-controls {
  display: flex;
  align-items: center;
  gap: 5px;
  background: var(--bg-base);
  padding: 4px;
  border-radius: 8px;
  border: 1px solid var(--border-strong);
}
.zoom-level {
  font-size: 0.85rem;
  font-weight: 600;
  min-width: 50px;
  text-align: center;
}
.divider-vertical {
  width: 1px;
  height: 20px;
  background: var(--border-strong);
  margin: 0 5px;
}
.btn-play {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--success);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-play:hover {
  background: #3fb950;
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(46, 160, 67, 0.4);
}
.btn-play.is-active {
  background: #da3633;
}
.btn-play.is-active:hover {
  background: var(--danger-hover);
  box-shadow: 0 4px 10px rgba(218, 54, 51, 0.4);
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
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s;
}
.tool-btn:hover {
  background: var(--bg-surface-active);
  color: var(--text-primary);
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
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-primary-hover));
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.1rem;
  box-shadow: 0 2px 5px rgba(0,0,0,0.3);
  border: 2px solid var(--border-strong);
}
.user-dropdown {
  position: absolute;
  top: 120%;
  right: 0;
  background-color: #111113 !important;
  background: #111113 !important;
  border: 1px solid var(--border-strong);
  border-radius: 8px;
  width: 200px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.4);
  z-index: 100000 !important;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.user-info {
  padding: 12px 16px;
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
  color: var(--text-secondary);
  font-size: 0.8rem;
  word-break: break-all;
}
.dropdown-divider {
  height: 1px;
  background-color: var(--border-strong);
  width: 100%;
}
.dropdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: transparent;
  border: none;
  color: var(--text-primary);
  text-align: left;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.2s;
}
.dropdown-item:hover {
  background-color: var(--bg-surface-active);
}
.btn-logout {
  color: var(--danger-hover);
}
.btn-logout:hover {
  background-color: rgba(248, 81, 73, 0.1);
}
</style>
