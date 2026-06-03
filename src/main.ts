import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import './assets/fonts.css'
import './assets/tailwind.css'
import './assets/variables.css'
import './assets/global.css'

const loadPhosphorIcons = () => {
  void import('@phosphor-icons/web/regular')
}

if ('requestIdleCallback' in window) {
  window.requestIdleCallback(loadPhosphorIcons)
} else {
  window.setTimeout(loadPhosphorIcons, 1)
}

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
