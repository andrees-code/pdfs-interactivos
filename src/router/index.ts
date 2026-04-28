// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import EditorPresentaciones from '@/views/EditorPresentacionesView.vue'
import LoginView from '@/views/LoginView.vue'
import BibliotecaView from '@/views/BibliotecaView.vue'
import DevPresentLandingView from '@/views/DevPresentLandingView.vue'
import DevPresentAuthView from '@/views/DevPresentAuthView.vue'
import DevPresentProjectsView from '@/views/DevPresentProjectsView.vue'
import DevPresentTemplatesView from '@/views/DevPresentTemplatesView.vue'
import DevPresentEditorView from '@/views/DevPresentEditorView.vue'
import DevPresentMarketplaceView from '@/views/DevPresentMarketplaceView.vue'
import { useAuthStore } from '@/stores/auth' // Importamos el store

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'visor',
      component: EditorPresentaciones,
      meta: { requiresAuth: true } // 🔒 Requiere estar logueado
    },
    {
      // ✨ AQUÍ ESTÁ EL CAMBIO CLAVE: agregamos /:id?
      // El "?" significa que el ID es opcional (puede haberlo o no)
      path: '/editorpresentaciones/:id?',
      name: 'editor',
      component: EditorPresentaciones,
      meta: { requiresAuth: true } // 🔒 Requiere estar logueado
    },
    {
      path: '/biblioteca',
      name: 'biblioteca',
      component: BibliotecaView,
      meta: { requiresAuth: true }
    },
    {
      path: '/biblioteca-plantillas',
      name: 'TemplateLibrary',
      component: () => import('@/views/TemplateLibrary.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { requiresGuest: true } // 🚫 Solo para usuarios NO logueados
    },
    {
      path: '/v/:slug',
      name: 'public-viewer',
      component: () => import('@/views/PublicViewerView.vue')
    },
    {
      path: '/devpresent',
      name: 'devpresent-landing',
      component: DevPresentLandingView
    },
    {
      path: '/devpresent/auth',
      name: 'devpresent-auth',
      component: DevPresentAuthView
    },
    {
      path: '/devpresent/projects',
      name: 'devpresent-projects',
      component: DevPresentProjectsView
    },
    {
      path: '/devpresent/templates',
      name: 'devpresent-templates',
      component: DevPresentTemplatesView
    },
    {
      path: '/devpresent/editor/:id?',
      name: 'devpresent-editor',
      component: DevPresentEditorView
    },
    {
      path: '/devpresent/marketplace',
      name: 'devpresent-marketplace',
      component: DevPresentMarketplaceView
    }
  ],
})

// Guardia de navegación global
router.beforeEach((to, from, next) => {
  // Inicializamos el store DENTRO del guardia para evitar errores de carga de Pinia
  const authStore = useAuthStore()

  // 1. Si intenta ir al Login pero YA está logueado -> Lo mandamos al Home (/)
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next({ path: '/' })
  }
  // 2. Si intenta ir a una ruta protegida (Home/Editor) pero NO está logueado -> Lo mandamos al Login
  else if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ path: '/login' })
  }
  // 3. En cualquier otro caso, dejamos que la navegación continúe
  else {
    next()
  }
})

export default router
