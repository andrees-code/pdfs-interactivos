import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import './assets/fonts.css'
import './assets/tailwind.css'
import './assets/variables.css'
import './assets/global.css'
import 'leaflet/dist/leaflet.css'
import '@phosphor-icons/web/regular'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
