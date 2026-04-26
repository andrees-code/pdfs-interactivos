// src/env.d.ts
/// <reference types="vite/client" />

declare module '*?url' {
  const content: string;
  export default content;
}

declare module 'pdfjs-dist/build/pdf.worker.mjs' {
  const content: any;
  export default content;
}

declare module '@/stores/auth' {
  export const useAuthStore: any;
}

declare module '@/services/presentacion.service' {
  export const presentationService: any;
}

declare module '@/config/api.js' {
  export const PRESENTATIONS_API: any;
  export const API_BASE: string;
}
