// src/stores/auth.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  // Inicializamos el token buscando en el localStorage por si recarga la página
  const token = ref(localStorage.getItem('userToken') || null)
  const user = ref(null)

  // Computed property para saber si está autenticado fácilmente
  const isAuthenticated = computed(() => !!token.value)

  // Acción para iniciar sesión
  const login = (newToken, userData) => {
    token.value = newToken
    user.value = userData
    localStorage.setItem('userToken', newToken)
  }

  // Acción para cerrar sesión
  const logout = () => {
    token.value = null
    user.value = null
    localStorage.removeItem('userToken')
  }

  return { token, user, isAuthenticated, login, logout }
})