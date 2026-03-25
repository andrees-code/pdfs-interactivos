<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import AIChatBot from '@/components/AIChatBot.vue'

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
  <AIChatBot />
</template>

<style scoped></style>