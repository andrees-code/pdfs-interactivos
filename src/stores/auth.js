// src/stores/auth.js
import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  // 1. Recuperamos datos iniciales de forma segura
  const token = ref(localStorage.getItem('userToken') || null)
  const user = ref(null)

  try {
    const storedUser = localStorage.getItem('userData')
    if (storedUser && storedUser !== 'undefined') {
      user.value = JSON.parse(storedUser)
    }
  } catch (error) {
    console.error('Error leyendo userData del localStorage:', error)
  }

  // Computed para verificar sesión
  const isAuthenticated = computed(() => !!token.value)

  // 2. ✨ MAGIA: Observadores automáticos. 
  watch(user, (newUser) => {
    if (newUser) {
      localStorage.setItem('userData', JSON.stringify(newUser))
    } else {
      localStorage.removeItem('userData')
    }
  }, { deep: true })

  watch(token, (newToken) => {
    if (newToken) {
      localStorage.setItem('userToken', newToken)
    } else {
      localStorage.removeItem('userToken')
    }
  })

  // 3. Acciones clásicas
  const login = (newToken, userData) => {
    token.value = newToken
    // Extraemos el usuario correctamente dependiendo de cómo venga
    user.value = userData?.data || userData?.user || userData
  }

  const logout = () => {
    token.value = null
    user.value = null
  }

  // 4. Refresco en segundo plano
  const refreshUser = async () => {
    const userId = user.value?._id || user.value?.id;
    if (!token.value || !userId) return;

    try {
      const response = await fetch(`http://10.104.126.179:3000/api/api/v1/users/user/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token.value}`
        }
      })

      if (response.ok) {
        const jsonResponse = await response.json()
        console.log('♻️ Datos traídos al recargar (F5):', jsonResponse)

        // CORRECCIÓN CLAVE AQUÍ:
        // Si el backend devuelve { status: true, data: { username: "..." } }
        // debemos extraer jsonResponse.data
        user.value = jsonResponse.data || jsonResponse.user || jsonResponse;

      } else if (response.status === 401) {
        console.warn('El token ha expirado, cerrando sesión...')
        logout()
      }
    } catch (error) {
      console.error('Error de red al refrescar usuario:', error)
    }
  }

  return { token, user, isAuthenticated, login, logout, refreshUser }
})