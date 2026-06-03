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

const win = typeof window !== 'undefined' ? window : null
if (win && 'requestIdleCallback' in win) {
  ;(win as Window & { requestIdleCallback: (cb: () => void) => number }).requestIdleCallback(
    loadPhosphorIcons,
  )
} else {
  globalThis.setTimeout(loadPhosphorIcons, 1)
}

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
