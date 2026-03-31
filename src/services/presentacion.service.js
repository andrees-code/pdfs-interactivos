import { PRESENTATIONS_API, UPLOAD_API } from '@/config/api.js'

const API_URL = PRESENTATIONS_API

// Helper recursivo simple para interceptar el JSON y transformar URLs de Vercel al proxy interno, o viceversa
const transformVercelUrls = (data, toProxy = true) => {
  if (!data) return data;
  let jsonString = JSON.stringify(data);
  
  if (toProxy) {
    // Convierte URLs de Vercel directamente en URLs hacia el Proxy interno del Backend
    const vercelRegex = /"https:\/\/[a-z0-9]+\.private\.blob\.vercel-storage\.com[^"]*"/g;
    jsonString = jsonString.replace(vercelRegex, (match) => {
      const originalUrl = match.slice(1, -1); // quita las comillas
      return `"${UPLOAD_API}/file?url=${encodeURIComponent(originalUrl)}"`;
    });
  } else {
    // Revierte URLs del Proxy de vuelta a sus URLs originales de Vercel Blob antes de guardar en BD
    // formato: "http://.../api/upload/file?url=https%3A%2F%2F...private.blob.vercel..."
    const proxyRegex = /"([^"]*\/upload\/file\?url=)(https%3A%2F%2F[a-z0-9]+\.private\.blob\.vercel-storage\.com[^"]*)"/g;
    jsonString = jsonString.replace(proxyRegex, (match, prefix, encodedUrl) => {
      return `"${decodeURIComponent(encodedUrl)}"`;
    });
  }
  
  return JSON.parse(jsonString);
}


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
    return transformVercelUrls(data, true)
  },

  /**
   * Guarda o actualiza una presentación.
   * Si se pasa un ID, hace una actualización (PUT). Si no, crea una nueva (POST).
   */
  async savePresentation(payload, id = null) {
    const method = id ? 'PUT' : 'POST'
    const url = id ? `${API_URL}/${id}` : API_URL

    const cleanPayload = transformVercelUrls(payload, false)

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cleanPayload),
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
    return transformVercelUrls(data, true)
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

    // COMO EL BACKEND NO DEVUELVE JSON, SIMPLEMENTE DEVOLVEMOS TRUE
    return true;
  }
}
