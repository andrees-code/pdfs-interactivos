// src/config/api.js
// Cambia la URL del backend desde el entorno (Vite env vars) en lugar de IP estática.
// En local: .env -> VITE_BACKEND_URL=http://localhost:3000
// En producción (Vercel): añade VITE_BACKEND_URL=https://<tu-backend>.vercel.app

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || `http://${window.location.hostname}:3000`
const API_PREFIX = '/api'

export const BACKEND_BASE = `${BACKEND_URL}`
export const API_BASE = `${BACKEND_BASE}${API_PREFIX}`

// Si tu backend usa rutas con prefijo adicional, aquí las defines una vez
export const USERS_API = `${API_BASE}/api/v1/users` // backend actual tiene globalPrefix('api') + controller('api/v1/users')
export const PRESENTATIONS_API = `${API_BASE}/presentations`
export const CHAT_API = `${API_BASE}/chat`
export const UPLOAD_API = `${API_BASE}/upload`
