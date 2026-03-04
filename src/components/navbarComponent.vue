<template>
  <nav class="pro-header">
    <div class="header-left">
      <div class="pro-logo" @click="$emit('navigate', 'home')">
        <span class="logo-icon">🚀</span>
        <span class="logo-text">Present<span class="text-accent">Pro</span></span>
      </div>

      <div class="nav-group">
        <router-link to="/visor" class="nav-link">
          Visor
        </router-link>

        <router-link to="/editorpdf" class="nav-link">
          Editor PDF
        </router-link>

        <router-link to="/editorpresentaciones" class="nav-link">
          Editor Presentaciones
        </router-link>
      </div>
    </div>

    <div class="header-right">
      <button class="btn-icon-secondary" title="Notificaciones">
        🔔
      </button>
      <div class="user-profile">
        <div class="user-avatar">JS</div>
        <span class="user-name">Juan Segura</span>
        <span class="dropdown-arrow">▾</span>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
defineEmits(['navigate']);
</script>

<style scoped lang="scss">
/* Colores aplicados directamente para evitar fallos de herencia */
.pro-header {
  height: 60px;
  background-color: #0d1117 !important; /* Forzamos el fondo oscuro */
  border-bottom: 1px solid #30363d;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  color: #c9d1d9;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  position: sticky;
  top: 0;
  z-index: 1000;
}

/* --- SECCIÓN IZQUIERDA --- */
.header-left {
  display: flex;
  align-items: center;
  gap: 30px;
}

.pro-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-weight: 700;
  font-size: 1.2rem;
  color: #f0f6fc;
}

.text-accent {
  color: #2f81f7;
}

.nav-group {
  display: flex;
  align-items: center;
  gap: 20px;
}

/* Estilo para los enlaces de router */
.nav-link {
  color: #8b949e;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  transition: color 0.2s ease;
  cursor: pointer;
}

.nav-link:hover {
  color: #f0f6fc;
}

/* Clase activa automática de Vue Router */
.router-link-active {
  color: #f0f6fc !important;
  font-weight: 600;
}

/* --- SECCIÓN DERECHA --- */
.header-right {
  display: flex;
  align-items: center;
  gap: 15px;
}

.btn-icon-secondary {
  background: transparent;
  border: none;
  color: #8b949e;
  font-size: 1.1rem;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.btn-icon-secondary:hover {
  background: #21262d;
  color: #f0f6fc;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 5px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}

.user-profile:hover {
  background: #21262d;
}

.user-avatar {
  width: 30px;
  height: 30px;
  background: #2f81f7;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: bold;
}

.user-name {
  font-size: 0.85rem;
  font-weight: 500;
  color: #c9d1d9;
}

.dropdown-arrow {
  font-size: 0.7rem;
  color: #8b949e;
}

/* Responsivo */
@media (max-width: 850px) {
  .nav-group, .user-name {
    display: none;
  }
}
</style>