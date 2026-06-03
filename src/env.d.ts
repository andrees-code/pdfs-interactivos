// src/env.d.ts
/// <reference types="vite/client" />

declare module '*?url' {
  const content: string
  export default content
}

declare module 'pdfjs-dist/build/pdf.worker.mjs' {
  const content: unknown
  export default content
}

declare module '@phosphor-icons/web/regular'

declare module '@/stores/auth' {
  interface AuthStore {
    token: string | null
    user: any
    isAuthenticated: boolean
    isPro: boolean
    login: (newToken: string, userData: unknown) => void
    logout: () => void
    refreshUser: () => Promise<void>
  }

  export const useAuthStore: () => AuthStore
}

declare module '@/services/presentacion.service' {
  interface PresentationService {
    getPresentation: (id: string) => Promise<any>
    savePresentation: (payload: unknown, id?: string | null) => Promise<any>
    getUserPresentations: () => Promise<any>
    deletePresentation: (id: string) => Promise<any>
    publishPresentation: (id: string) => Promise<any>
    unpublishPresentation: (id: string) => Promise<any>
    getPublicPresentationBySlug: (slug: string) => Promise<any>
  }

  export const presentationService: PresentationService
}

declare module '@/config/api.js' {
  export const PRESENTATIONS_API: string
  export const SUBSCRIPTIONS_API: string
  export const CHAT_API: string
  export const UPLOAD_API: string
  export const USERS_API: string
  export const API_BASE: string
}
