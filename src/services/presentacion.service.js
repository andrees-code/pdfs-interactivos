import { PRESENTATIONS_API } from '@/config/api.js'

const API_URL = PRESENTATIONS_API


export const presentationService = {
  /**
   * Obtiene una presentación por su ID
   */
  async getPresentation(id) {
    const response = await fetch(`${API_URL}/${id}`)

    if (!response.ok) {
      throw new Error(`Error al obtener la presentación: ${response.statusText}`)
    }

    const data = await response.json()
    return data
  },

  /**
   * Guarda o actualiza una presentación.
   * Si se pasa un ID, hace una actualización (PUT). Si no, crea una nueva (POST).
   */
  async savePresentation(payload, id = null) {
    const method = id ? 'PUT' : 'POST'
    const url = id ? `${API_URL}/${id}` : API_URL

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error(`Error al guardar la presentación: ${response.statusText}`)
    }

    return await response.json()
  },

  /**
   * Obtiene todas las presentaciones de un usuario específico
   */
  async getUserPresentations(userId) {
    // Dependiendo de tu backend, puedes mandar el userId por query params
    const response = await fetch(`${API_URL}?userId=${userId}`)

    if (!response.ok) {
      throw new Error(`Error al obtener la lista: ${response.statusText}`)
    }

    const data = await response.json()
    return data
  },

/**
   * Elimina una presentación por su ID
   */
  async deletePresentation(id) {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE'
    })

    if (!response.ok) {
      throw new Error(`Error al eliminar: ${response.statusText}`)
    }

    const data = await response.json().catch(() => null)
    if (!data || !data._id) {
      throw new Error('El servidor no confirmó el borrado de la presentación')
    }

    return data;
  },

  async publishPresentation(id) {
    const response = await fetch(`${API_URL}/${id}/publish`, {
      method: 'PATCH',
    })

    if (!response.ok) {
      throw new Error(`Error al publicar la presentación: ${response.statusText}`)
    }

    return await response.json()
  },

  async unpublishPresentation(id) {
    const response = await fetch(`${API_URL}/${id}/unpublish`, {
      method: 'PATCH',
    })

    if (!response.ok) {
      throw new Error(`Error al despublicar la presentación: ${response.statusText}`)
    }

    return await response.json()
  },

  async getPublicPresentationBySlug(slug) {
    const response = await fetch(`${API_URL}/public/${slug}`)

    if (!response.ok) {
      throw new Error(`Error al obtener presentación pública: ${response.statusText}`)
    }

    return await response.json()
  }
}
