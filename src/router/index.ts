import { createRouter, createWebHistory } from 'vue-router'
import EditorPresentaciones from '@/views/EditorPresentacionesView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'visor',
      component: EditorPresentaciones,
    },
    {
      path: '/editorpresentaciones',
      component: EditorPresentaciones,
    },
  ],
})

export default router
