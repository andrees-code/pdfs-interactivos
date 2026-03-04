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