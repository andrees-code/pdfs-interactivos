<script setup lang="ts">
import { onMounted } from 'vue'
import { Analytics } from '@vercel/analytics/vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

onMounted(() => {
  // Si hay un token activo al cargar la aplicación,
  // buscamos los datos más recientes del usuario en el backend
  if (authStore.isAuthenticated) {
    authStore.refreshUser()
  }
})
</script>

<template>
  <RouterView />
  <Analytics />
</template>

<style scoped></style>
