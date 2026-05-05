// src/stores/auth.js
import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { USERS_API } from '@/config/api.js'

const REQUEST_TIMEOUT_MS = 12000

const withTimeout = async (url, options = {}, timeoutMs = REQUEST_TIMEOUT_MS) => {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    return await fetch(url, { ...options, signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
}

const buildUserUrlCandidates = () => ([`${USERS_API}/me`])

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

  // Computed para verificar suscripción activa (monthly o yearly, no expirada)
  const isPro = computed(() => {
    const sub = user.value?.subscription
    if (!sub) return false
    if (sub.plan === 'free') return false
    const now = new Date()
    if (sub.endDate) {
      const end = new Date(sub.endDate)
      if (!Number.isNaN(end.getTime())) {
        return end > now
      }
    }
    if (!['active', 'canceled'].includes(sub.status)) return false
    return true
  })

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
    if (!token.value) return

    const userUrls = buildUserUrlCandidates()

    for (let i = 0; i < userUrls.length; i += 1) {
      const userUrl = userUrls[i]

      try {
        const response = await withTimeout(userUrl, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token.value}`,
          },
        })

        if (response.ok) {
          const jsonResponse = await response.json()
          user.value = jsonResponse.data || jsonResponse.user || jsonResponse
          return
        }

        if (response.status === 401) {
          // Token inválido o expirado: limpiar sesión local.
          logout()
          return
        }

        // Si falla por ruta (404/405), probamos la siguiente variante de URL.
        if ((response.status === 404 || response.status === 405) && i < userUrls.length - 1) {
          continue
        }

        // En otros errores HTTP, no tiene sentido seguir probando variantes.
        return
      } catch (_error) {
        if (i === userUrls.length - 1) {
          // Fallo silencioso: mantener sesión local y evitar ruido en consola de producción.
        }
      }
    }
  }

  return { token, user, isAuthenticated, isPro, login, logout, refreshUser }
})
