import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import EditorPdfView from '@/views/EditorPdfView.vue'
import EditorPresentaciones from '@/views/EditorPresentacionesView.vue'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'visor',
      component: HomeView
    },
    {
      path: '/visor',
      component: HomeView
    },
    {
      path: '/editorpdf',
      component: EditorPdfView
    },
    {
      path: '/editorpresentaciones',
      component: EditorPresentaciones
    }
  ],
})

export default router
