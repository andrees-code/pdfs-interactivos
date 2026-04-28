<template>
  <header class="pro-header">
    <div class="header-left">
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

      <div class="file-menu">
        <label class="menu-item menu-item-ghost" :class="{ 'is-loading': isConverting }">
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
          type="button"
          class="menu-item menu-item-ghost"
          :disabled="!hasDoc || isConverting || isSaving"
          @click="$emit('save')"
        >
          <i class="ph" :class="isSaving ? 'ph-spinner icon-spin' : 'ph-floppy-disk'"></i>
          {{ isSaving ? 'Guardando...' : 'Guardar' }}
        </button>

        <div class="cloud-status" v-if="hasDoc" :class="{ 'is-syncing': isAutosaving || isSaving }" aria-live="polite">
          <i class="ph" :class="isAutosaving || isSaving ? 'ph-arrows-clockwise icon-spin text-sync' : 'ph-cloud-check text-success'"></i>
          <span class="cloud-tooltip">{{ isAutosaving || isSaving ? 'Guardando cambios...' : 'Todos los cambios guardados' }}</span>
        </div>

        <button
          type="button"
          class="menu-item menu-item-ghost"
          :disabled="!hasDoc || isConverting"
          @click="$emit('export')"
        >
          <i class="ph ph-export"></i> Exportar Web
        </button>

        <button
          type="button"
          class="menu-item menu-item-ghost"
          :disabled="!hasDoc || isConverting || isSaving"
          @click="$emit('share')"
        >
          <i class="ph ph-share-network"></i> Compartir
        </button>

        <button
          type="button"
          class="menu-item menu-item-ghost"
          :disabled="!hasDoc || isConverting"
          @click="$emit('publish-as-template')"
        >
          <i class="ph ph-upload-simple"></i> Guardar como Plantilla
        </button>
      </div>
    </div>

    <div class="header-center" v-if="hasDoc">
      <div class="zoom-controls">
        <button type="button" @click="$emit('change-zoom', -0.1)" class="tool-btn" title="Alejar">
          <i class="ph ph-minus"></i>
        </button>
        <span class="zoom-level">{{ Math.round(zoom * 100) }}%</span>
        <button type="button" @click="$emit('change-zoom', 0.1)" class="tool-btn" title="Acercar">
          <i class="ph ph-plus"></i>
        </button>
        <div class="divider-vertical"></div>
        <button type="button" @click="$emit('fit-screen')" class="tool-btn" title="Ajustar a pantalla">
          <i class="ph ph-corners-out"></i>
        </button>
      </div>
    </div>

    <div class="header-right">
      <button type="button" class="btn-play" v-if="hasDoc" :class="{ 'is-active': playMode }" @click="$emit('toggle-play')">
        <i class="ph" :class="playMode ? 'ph-stop' : 'ph-play'"></i>
        {{ playMode ? 'Detener Presentación' : 'Iniciar Presentación' }}
      </button>

      <div class="user-menu-container" v-if="authStore.isAuthenticated" ref="userMenuRef">
        <button type="button" class="avatar-btn" ref="avatarBtnRef" @click="toggleUserMenu">
          <div class="avatar-circle">
            {{ userInitial }}
          </div>
        </button>
      </div>

      <Teleport to="body">
        <div
          ref="userDropdownRef"
          class="user-dropdown user-dropdown-portal"
          v-show="isUserMenuOpen"
          :style="userDropdownStyle"
        >
          <div class="user-info">
            <span class="user-name">{{ authStore.user?.username || 'Usuario' }}</span>
            <span class="user-email">{{ authStore.user?.email || 'email@ejemplo.com' }}</span>
          </div>
          <div class="dropdown-divider"></div>

          <button type="button" class="dropdown-item" @click="navigate('/biblioteca')">
            <i class="ph ph-books"></i> Biblioteca
          </button>
          <button type="button" class="dropdown-item" @click="navigate('/editorpresentaciones')">
            <i class="ph ph-presentation-chart"></i> Editor
          </button>
          <button type="button" class="dropdown-item" @click="navigate('/biblioteca-plantillas')">
            <i class="ph ph-storefront"></i> Plantillas
          </button>

          <div class="dropdown-divider"></div>
          <button type="button" class="dropdown-item btn-logout" @click="handleLogout">
            <i class="ph ph-sign-out"></i> Cerrar Sesión
          </button>
        </div>
      </Teleport>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const router = useRouter();

const isUserMenuOpen = ref(false);
const userMenuRef = ref<HTMLElement | null>(null);
const avatarBtnRef = ref<HTMLElement | null>(null);
const userDropdownRef = ref<HTMLElement | null>(null);
const userDropdownStyle = ref<Record<string, string>>({
  top: '60px',
  left: 'calc(100vw - 240px)',
});

const updateUserDropdownPosition = () => {
  if (!avatarBtnRef.value) return;

  const rect = avatarBtnRef.value.getBoundingClientRect();
  const dropdownWidth = 220;
  const margin = 12;
  const top = rect.bottom + 8;
  const left = Math.min(
    window.innerWidth - dropdownWidth - margin,
    Math.max(margin, rect.right - dropdownWidth),
  );

  userDropdownStyle.value = {
    top: `${top}px`,
    left: `${left}px`,
  };
};

const toggleUserMenu = async () => {
  isUserMenuOpen.value = !isUserMenuOpen.value;
  if (isUserMenuOpen.value) {
    await nextTick();
    updateUserDropdownPosition();
  }
};

const handleClickOutside = (event: MouseEvent) => {
  const targetNode = event.target as Node;
  const clickInsideTrigger = !!(userMenuRef.value && userMenuRef.value.contains(targetNode));
  const clickInsideDropdown = !!(userDropdownRef.value && userDropdownRef.value.contains(targetNode));

  if (isUserMenuOpen.value && !clickInsideTrigger && !clickInsideDropdown) {
    isUserMenuOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  window.addEventListener('resize', updateUserDropdownPosition);
  window.addEventListener('scroll', updateUserDropdownPosition, true);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
  window.removeEventListener('resize', updateUserDropdownPosition);
  window.removeEventListener('scroll', updateUserDropdownPosition, true);
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
  (e: 'share'): void;
  (e: 'change-zoom', delta: number): void;
  (e: 'fit-screen'): void;
  (e: 'toggle-play'): void;
  (e: 'save'): void;
  (e: 'publish-as-template'): void;
}>();
</script>

<style scoped>
.pro-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  height: 52px;
  background-color: var(--bg-panel);
  border-bottom: 1px solid var(--border-strong);
  padding: 0 20px;
  z-index: 1200;
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
  cursor: pointer;
}
.text-accent {
  color: var(--accent-primary);
}
.file-menu {
  display: flex;
  gap: 10px;
  align-items: center;
}
.menu-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  border: none;
  color: var(--text-secondary);
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.menu-item-ghost:hover:not(:disabled) {
  background: var(--bg-surface-active);
  color: var(--text-primary);
}
.menu-item:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.menu-item.is-loading {
  background: var(--bg-surface-active);
  color: var(--text-primary);
  font-weight: bold;
  border-color: var(--border-subtle);
}

.cloud-status {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 999px;
  color: var(--text-secondary);
  cursor: help;
  user-select: none;
  transition: all 0.2s ease;
}
.cloud-status i {
  font-size: 1rem;
}
.cloud-status:hover {
  color: var(--text-primary);
  background: var(--bg-surface-active);
}
.cloud-tooltip {
  position: absolute;
  bottom: calc(100% + 8px);
  right: 0;
  white-space: nowrap;
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  color: var(--text-primary);
  font-size: 0.75rem;
  padding: 6px 8px;
  border-radius: 6px;
  box-shadow: var(--shadow-md);
  opacity: 0;
  pointer-events: none;
  transform: translateY(4px);
  transition: opacity 0.2s ease, transform 0.2s ease;
  z-index: 5;
}
.cloud-status:hover .cloud-tooltip {
  opacity: 1;
  transform: translateY(0);
}
.text-success {
  color: var(--accent-primary);
}
.text-sync {
  color: var(--accent-primary);
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
.zoom-controls {
  display: flex;
  align-items: center;
  gap: 5px;
  background: var(--bg-surface);
  padding: 4px;
  border-radius: 100px;
  border: 1px solid var(--border-strong);
}
.zoom-level {
  font-size: 0.85rem;
  font-weight: 600;
  min-width: 50px;
  text-align: center;
  color: var(--text-primary);
}
.divider-vertical {
  width: 1px;
  height: 16px;
  background: var(--border-subtle);
  margin: 0 2px;
}
.btn-play {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--text-primary);
  color: var(--bg-base);
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}
.btn-play:hover {
  transform: translateY(-1px);
}
.btn-play.is-active {
  background: var(--surface-elevated);
  color: var(--text-primary);
  border-color: var(--border-subtle);
}
.btn-play.is-active:hover {
  background: var(--surface-soft-contrast);
  box-shadow: var(--shadow-md);
}
.tool-btn {
  font-size: 1.2rem;
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: 999px;
  transition: all 0.2s;
}
.tool-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: var(--text-primary);
}

.user-menu-container {
  position: relative;
  z-index: 1300;
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
  border: 2px solid var(--border-strong);
}
.user-dropdown {
  position: fixed;
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  width: 220px;
  box-shadow: var(--shadow-lg);
  z-index: 2147483000;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transform-origin: top right;
  animation: scaleIn 0.2s ease;
}
.user-dropdown-portal {
  pointer-events: auto;
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
  height: 0;
  border-top: 1px solid var(--border-subtle);
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
  color: var(--text-primary);
}
.btn-logout:hover {
  background-color: var(--bg-surface-active);
  color: var(--accent-primary);
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.96) translateY(-4px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
</style>
