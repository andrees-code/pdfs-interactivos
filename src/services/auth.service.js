// src/services/auth.service.js
import { USERS_API } from '@/config/api.js'

const API_URL = USERS_API

const extractApiError = async (response, fallback) => {
  try {
    const payload = await response.json()
    return payload?.message || fallback
  } catch {
    return fallback
  }
}

export const authService = {
  async register(userData) {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    })

    if (!response.ok) {
      throw new Error(await extractApiError(response, 'Error en el registro'))
    }

    return await response.json()
  },

  async login(credentials) {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    })

    if (!response.ok) {
      throw new Error(await extractApiError(response, 'Credenciales invalidas'))
    }

    const data = await response.json()

    if (data.token) {
      localStorage.setItem('userToken', data.token)
    }

    return data
  },

  async forgotPassword(email) {
    const response = await fetch(`${API_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })

    if (!response.ok) {
      throw new Error(await extractApiError(response, 'No se pudo enviar la solicitud de recuperacion'))
    }

    return await response.json()
  },

  async resetPassword(token, newPassword) {
    const response = await fetch(`${API_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword }),
    })

    if (!response.ok) {
      throw new Error(await extractApiError(response, 'No se pudo restablecer la contraseña'))
    }

    return await response.json()
  },

  getGoogleOAuthUrl(redirectUrl) {
    const url = new URL(`${API_URL}/auth/google`)
    if (redirectUrl) url.searchParams.set('redirect', redirectUrl)
    return url.toString()
  },

  logout() {
    localStorage.removeItem('userToken')
    localStorage.removeItem('userData')
  }
}
