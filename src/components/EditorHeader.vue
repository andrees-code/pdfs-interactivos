<template>
  <header class="pro-header">
    <div class="header-left">
      <div class="pro-logo">
        <span class="logo-icon">🚀</span>
        <span class="logo-text">Present<span class="text-accent">Pro</span></span>
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

      <div class="user-menu-container" v-if="authStore.isAuthenticated">
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
          <button class="dropdown-item btn-logout" @click="handleLogout">
            <i class="ph ph-sign-out"></i> Cerrar Sesión
          </button>
        </div>
      </div>

    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth'; // Asegúrate de que la ruta es correcta

const authStore = useAuthStore();
const router = useRouter();

// Estado para el menú desplegable
const isUserMenuOpen = ref(false);

const toggleUserMenu = () => {
  isUserMenuOpen.value = !isUserMenuOpen.value;
};

// Calculamos la inicial del usuario para el avatar
const userInitial = computed(() => {
  const username = authStore.user?.username;
  return username ? username.charAt(0).toUpperCase() : 'U';
});

// Función para cerrar sesión
const handleLogout = () => {
  authStore.logout();
  isUserMenuOpen.value = false;
  router.push('/login'); // Redirigimos al login
};


// Definimos los datos que el componente padre nos enviará
defineProps<{
  isConverting: boolean;
  hasDoc: boolean;
  zoom: number;
  playMode: boolean;
}>();

// Definimos los eventos que enviaremos al componente padre
defineEmits<{
  (e: 'file-upload', event: Event): void;
  (e: 'export'): void;
  (e: 'change-zoom', delta: number): void;
  (e: 'fit-screen'): void;
  (e: 'toggle-play'): void;
}>();
</script>

<style scoped>
/* Estilos existentes... (los mantengo igual) */
.pro-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 55px;
  background-color: #161b22;
  border-bottom: 1px solid #30363d;
  padding: 0 20px;
  flex-shrink: 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  z-index: 10;
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
  color: #58a6ff;
}
.file-menu {
  display: flex;
  gap: 10px;
}
.menu-item {
  display: flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: 1px solid #30363d;
  color: #c9d1d9;
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}
.menu-item:hover:not(:disabled) {
  background: #30363d;
}
.menu-item:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.menu-item.is-loading {
  background: #58a6ff;
  color: #0d1117;
  font-weight: bold;
  border-color: #58a6ff;
}
.btn-export {
  background: #238636;
  border-color: #238636;
  color: white;
}
.btn-export:hover:not(:disabled) {
  background: #2ea043;
  border-color: #2ea043;
}
.zoom-controls {
  display: flex;
  align-items: center;
  gap: 5px;
  background: #0d1117;
  padding: 4px;
  border-radius: 8px;
  border: 1px solid #30363d;
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
  background: #30363d;
  margin: 0 5px;
}
.btn-play {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #2ea043;
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
  background: #f85149;
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
  color: #8b949e;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s;
}
.tool-btn:hover {
  background: #21262d;
  color: #c9d1d9;
}


/* --- NUEVOS ESTILOS PARA EL MENÚ DE USUARIO --- */
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
  background: linear-gradient(135deg, #58a6ff, #1f6feb);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.1rem;
  box-shadow: 0 2px 5px rgba(0,0,0,0.3);
  border: 2px solid #30363d;
}

.user-dropdown {
  position: absolute;
  top: 120%; /* Justo debajo del botón */
  right: 0;
  background-color: #161b22;
  border: 1px solid #30363d;
  border-radius: 8px;
  width: 200px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.4);
  z-index: 100;
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
  color: #c9d1d9;
  font-weight: 600;
  font-size: 0.95rem;
}

.user-email {
  color: #8b949e;
  font-size: 0.8rem;
  word-break: break-all;
}

.dropdown-divider {
  height: 1px;
  background-color: #30363d;
  width: 100%;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: transparent;
  border: none;
  color: #c9d1d9;
  text-align: left;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.2s;
}

.dropdown-item:hover {
  background-color: #21262d;
}

.btn-logout {
  color: #f85149;
}

.btn-logout:hover {
  background-color: rgba(248, 81, 73, 0.1);
}
</style>