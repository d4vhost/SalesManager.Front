import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

// --- IMPORTACIÓN DE CSS ---
import './styles/base.css'    
import './styles/layout.css' 
// --------------------------

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')