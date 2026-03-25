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
          isCustomElement: (tag) => tag === 'model-viewer' || tag.startsWith('model-')
        }
      }
    }),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
