import './assets/main.css' // Estilos base

import { createApp } from 'vue'
import { createPinia } from 'pinia' // Importa Pinia

import App from './App.vue'
import router from './router' // Importa el Router que crearemos

const app = createApp(App)

app.use(createPinia()) // 1. Usa Pinia (para manejo de estado)
app.use(router) // 2. Usa el Router (para manejo de páginas)

app.mount('#app') // Monta la aplicación