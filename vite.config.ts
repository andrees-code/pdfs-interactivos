import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
const hostEnv = process.env.VITE_HOST || process.env.HOST

export default defineConfig({
  server: {
    // por defecto usar 0.0.0.0 para que funcione en localhost y en IP de red
    host: hostEnv || '0.0.0.0',
    // si se pasa --host desde npm run dev -- --host, Vite lo respetará
    strictPort: false,
  },
  plugins: [
    vue({
      template: {
        compilerOptions: {
          // Ignorar la etiqueta de 3D para que Vue no se queje
          isCustomElement: (tag) => tag === 'model-viewer' || tag.startsWith('model-'),
        },
      },
    }),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined

          if (id.includes('pdfjs-dist')) return 'vendor-pdfjs'
          if (id.includes('jszip')) return 'vendor-jszip'
          if (id.includes('pako')) return 'vendor-pako'
          if (id.includes('cropperjs')) return 'vendor-cropper'
          if (id.includes('leaflet')) return 'vendor-leaflet'
          if (id.includes('@phosphor-icons')) return 'vendor-icons'

          if (
            id.includes('vue-router') ||
            id.includes('pinia') ||
            id.includes('/vue/') ||
            id.includes('@vue/')
          ) {
            return 'vendor-vue'
          }

          return 'vendor-misc'
        },
      },
    },
  },
})
