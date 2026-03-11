// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import EditorPresentaciones from '@/views/EditorPresentacionesView.vue'
import LoginView from '@/views/LoginView.vue'
import BibliotecaView from '@/views/BibliotecaView.vue'
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
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { requiresGuest: true } // 🚫 Solo para usuarios NO logueados
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