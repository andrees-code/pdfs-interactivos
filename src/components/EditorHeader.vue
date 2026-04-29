<template>
  <header class="pro-header">
    <div class="header-left">
      <div
        class="pro-logo"
        role="button"
        tabindex="0"
        title="Ir al inicio"
        @click="navigate('/devpresent/projects')"
        @keydown.enter.prevent="navigate('/devpresent/projects')"
        @keydown.space.prevent="navigate('/devpresent/projects')"
      >
        <span class="logo-icon">🚀</span>
        <span class="logo-text">Doc<span class="text-accent">Flow</span></span>
      </div>

      <div class="file-menu" v-if="isEditorMode">
        <label class="menu-item menu-item-ghost" :class="{ 'is-loading': isConverting }">
          <input
            type="file"
            @change="emit('file-upload', $event)"
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
          @click="emit('save')"
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
          @click="emit('export')"
        >
          <i class="ph ph-export"></i> Exportar Web
        </button>

        <button
          type="button"
          class="menu-item menu-item-ghost"
          :disabled="!hasDoc || isConverting || isSaving"
          @click="emit('share')"
        >
          <i class="ph ph-share-network"></i> Compartir
        </button>

      </div>

      <div class="file-menu" v-else>
        <button
          type="button"
          class="menu-item menu-item-ghost"
          :class="{ 'menu-item-active': activeView === 'projects' }"
          @click="navigate('/devpresent/projects')"
        >
          <i class="ph ph-books"></i>
          Proyectos
        </button>
        <button
          type="button"
          class="menu-item menu-item-ghost"
          :class="{ 'menu-item-active': activeView === 'templates' }"
          @click="navigate('/devpresent/templates')"
        >
          <i class="ph ph-storefront"></i>
          Plantillas
        </button>
        <button v-if="mode === 'projects'" type="button" class="menu-item menu-item-ghost" @click="emit('create-new-project')">
          <i class="ph ph-plus-circle"></i>
          Nuevo proyecto
        </button>
        <button v-if="mode === 'templates'" type="button" class="menu-item menu-item-ghost" @click="emit('create-template')">
          <i class="ph ph-layout"></i>
          Crear plantilla
        </button>
      </div>
    </div>

    <div class="header-center" v-if="hasDoc && isEditorMode">
      <div class="zoom-controls">
        <button type="button" @click="emit('change-zoom', -0.1)" class="tool-btn" title="Alejar">
          <i class="ph ph-minus"></i>
        </button>
        <span class="zoom-level">{{ Math.round(zoom * 100) }}%</span>
        <button type="button" @click="emit('change-zoom', 0.1)" class="tool-btn" title="Acercar">
          <i class="ph ph-plus"></i>
        </button>
        <div class="divider-vertical"></div>
        <button type="button" @click="emit('fit-screen')" class="tool-btn" title="Ajustar a pantalla">
          <i class="ph ph-corners-out"></i>
        </button>
      </div>
    </div>

    <div class="header-right">
      <button type="button" class="btn-play" v-if="hasDoc && isEditorMode" :class="{ 'is-active': playMode }" @click="emit('toggle-play')">
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

          <button type="button" class="dropdown-item" @click="navigate('/devpresent/projects')">
            <i class="ph ph-books"></i> Proyectos
          </button>
          <button type="button" class="dropdown-item" @click="navigate('/editorpresentaciones')">
            <i class="ph ph-presentation-chart"></i> Editor
          </button>
          <button type="button" class="dropdown-item" @click="navigate('/devpresent/templates')">
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

const props = withDefaults(defineProps<{
  mode?: 'editor' | 'projects' | 'templates' | 'landing' | 'auth';
  activeView?: 'projects' | 'templates' | 'editor' | 'none';
  isConverting: boolean;
  hasDoc: boolean;
  zoom: number;
  playMode: boolean;
  isSaving: boolean;
  isAutosaving?: boolean;
}>(), {
  mode: 'editor',
  activeView: 'none',
});

const isEditorMode = computed(() => props.mode === 'editor');

const handleLogout = () => {
  authStore.logout();
  isUserMenuOpen.value = false;
  router.push('/devpresent/auth');
};

const emit = defineEmits<{
  (e: 'file-upload', event: Event): void;
  (e: 'export'): void;
  (e: 'share'): void;
  (e: 'change-zoom', delta: number): void;
  (e: 'fit-screen'): void;
  (e: 'toggle-play'): void;
  (e: 'save'): void;
  (e: 'create-new-project'): void;
  (e: 'create-template'): void;
}>();
</script>

<style scoped>
.pro-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
  position: relative;
  min-height: 72px;
  padding: 12px 18px 10px;
  background: linear-gradient(180deg, rgba(7, 10, 16, 0.86), rgba(7, 10, 16, 0.12));
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(var(--blur-md));
  -webkit-backdrop-filter: blur(var(--blur-md));
  z-index: 1200;
}

.header-left,
.header-center,
.header-right {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
}

.pro-logo {
  min-width: 0;
  padding: 10px 14px;
  border-radius: var(--radius-pill);
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: var(--shadow-xs);
  font-size: 1rem;
  font-weight: 650;
  display: flex;
  align-items: center;
  gap: 10px;
  letter-spacing: -0.03em;
  cursor: pointer;
  transition: transform var(--transition-bounce), background-color var(--transition-normal), border-color var(--transition-normal);
}

.pro-logo:hover {
  transform: translateY(-1px);
  background: rgba(255, 255, 255, 0.055);
  border-color: rgba(var(--accent-rgb), 0.18);
}

.logo-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 999px;
  background: rgba(var(--accent-rgb), 0.14);
  font-size: 0.95rem;
}

.logo-text {
  white-space: nowrap;
}

.text-accent {
  color: var(--accent-primary);
}

.file-menu {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
  padding: 6px;
  border-radius: var(--radius-pill);
  background: rgba(255, 255, 255, 0.032);
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: var(--shadow-xs);
}

.menu-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 38px;
  background: transparent;
  border: 1px solid transparent;
  color: var(--text-secondary);
  padding: 0 14px;
  border-radius: var(--radius-pill);
  font-size: 0.82rem;
  font-weight: 560;
  cursor: pointer;
  transition:
    transform var(--transition-bounce),
    background-color var(--transition-normal),
    color var(--transition-normal),
    border-color var(--transition-normal),
    box-shadow var(--transition-normal);
}

.menu-item-ghost:hover:not(:disabled) {
  transform: translateY(-1px);
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.08);
  color: var(--text-primary);
}

.menu-item-active {
  background: rgba(var(--accent-rgb), 0.16);
  border-color: rgba(var(--accent-rgb), 0.22);
  color: var(--text-primary);
}

.menu-item:active:not(:disabled) {
  transform: scale(0.985);
}

.menu-item:focus-visible,
.tool-btn:focus-visible,
.btn-play:focus-visible,
.avatar-btn:focus-visible,
.dropdown-item:focus-visible {
  outline: none;
  box-shadow: var(--ring-accent);
}

.menu-item:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.menu-item.is-loading {
  background: rgba(var(--accent-rgb), 0.16);
  color: var(--text-primary);
  border-color: rgba(var(--accent-rgb), 0.18);
}

.cloud-status {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 999px;
  color: var(--text-secondary);
  cursor: help;
  user-select: none;
  border: 1px solid transparent;
  transition: all var(--transition-normal);
}

.cloud-status i {
  font-size: 1rem;
}

.cloud-status:hover {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.08);
}

.cloud-tooltip {
  position: absolute;
  bottom: calc(100% + 8px);
  right: 0;
  white-space: nowrap;
  background: var(--glass-bg-strong);
  border: 1px solid var(--glass-border);
  color: var(--text-primary);
  font-size: 0.75rem;
  padding: 8px 10px;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
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

.text-success,
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
  gap: 6px;
  padding: 6px;
  border-radius: var(--radius-pill);
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: var(--shadow-xs);
}

.zoom-level {
  font-size: 0.8rem;
  font-weight: 640;
  min-width: 58px;
  text-align: center;
  color: var(--text-primary);
  font-variant-numeric: tabular-nums;
}

.divider-vertical {
  width: 1px;
  height: 16px;
  background: rgba(255, 255, 255, 0.08);
  margin: 0 3px;
}

.btn-play {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 42px;
  background: linear-gradient(135deg, rgba(var(--accent-rgb), 0.92), rgba(109, 211, 255, 0.84));
  color: #06111b;
  border: 1px solid rgba(var(--accent-rgb), 0.32);
  padding: 0 18px;
  border-radius: var(--radius-pill);
  font-weight: 650;
  cursor: pointer;
  box-shadow: 0 16px 32px rgba(var(--accent-rgb), 0.2);
  transition: transform var(--transition-bounce), box-shadow var(--transition-normal), background-color var(--transition-normal), color var(--transition-normal);
}

.btn-play:hover {
  transform: translateY(-1px);
  box-shadow: 0 22px 40px rgba(var(--accent-rgb), 0.24);
}

.btn-play.is-active {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
  border-color: rgba(255, 255, 255, 0.08);
  box-shadow: none;
}

.btn-play.is-active:hover {
  background: rgba(255, 255, 255, 0.09);
  box-shadow: var(--shadow-xs);
}

.tool-btn {
  font-size: 1rem;
  width: 34px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid transparent;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: 999px;
  transition: all var(--transition-bounce);
}

.tool-btn:hover {
  transform: translateY(-1px);
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.08);
  color: var(--text-primary);
}

.user-menu-container {
  position: relative;
  z-index: 1300;
}

.avatar-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  padding: 0;
  cursor: pointer;
  border-radius: 50%;
  box-shadow: var(--shadow-xs);
  transition: transform var(--transition-bounce), background-color var(--transition-normal), border-color var(--transition-normal);
}

.avatar-btn:hover {
  transform: translateY(-1px);
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(var(--accent-rgb), 0.16);
}

.avatar-circle {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(var(--accent-rgb), 0.9), rgba(73, 158, 255, 0.72));
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.95rem;
  box-shadow: 0 10px 18px rgba(var(--accent-rgb), 0.18);
  border: 1px solid rgba(255, 255, 255, 0.18);
}

.user-dropdown {
  position: fixed;
  background: var(--glass-bg-strong);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  width: 220px;
  box-shadow: var(--shadow-float);
  backdrop-filter: blur(var(--blur-md));
  -webkit-backdrop-filter: blur(var(--blur-md));
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
  padding: 14px 16px;
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
  border-top: 1px solid rgba(255, 255, 255, 0.06);
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
  transition: background-color var(--transition-normal), color var(--transition-normal), transform var(--transition-bounce);
}

.dropdown-item:hover {
  background-color: rgba(255, 255, 255, 0.06);
  transform: translateX(2px);
}

.btn-logout {
  color: var(--text-primary);
}

.btn-logout:hover {
  background-color: rgba(255, 107, 124, 0.1);
  color: #ffd7dd;
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

@media (max-width: 1180px) {
  .pro-header {
    flex-wrap: wrap;
    justify-content: center;
  }

  .header-left,
  .header-center,
  .header-right {
    justify-content: center;
    width: 100%;
  }
}
</style>
