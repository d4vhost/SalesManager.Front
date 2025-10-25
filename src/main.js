import { createApp } from 'vue'
import { createPinia } from 'pinia'

// --- 1. Importar Font Awesome ---
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
// --- Importa los iconos específicos que usaremos ---
import { 
    faStore, faFileInvoiceDollar, faUsers, faBoxOpen, 
    faArrowRight, faArrowLeft, faChartPie, faSignOutAlt
} from '@fortawesome/free-solid-svg-icons'

// --- 2. Importar Vistas y Router ---
import App from './App.vue'
import router from './router' // Asumimos que existe src/router/index.js

// --- 3. Importar TODOS los Estilos CSS ---
// El orden importa: de más general a más específico.
import './styles/base.css'    // Variables y reset
import './styles/layout.css'  // Estilos de los contenedores de layout
import './styles/header-footer.css' // Estilos para el header y footer públicos
import './styles/sidebar.css' // Estilos de la barra lateral (layout privado)
import './styles/home.css'    // Estilos para la página Home
import './styles/login.css'   // Estilos para la página Login

// --- 4. Configurar App ---
// Añade los iconos a la librería
library.add(
    faStore, faFileInvoiceDollar, faUsers, faBoxOpen, 
    faArrowRight, faArrowLeft, faChartPie, faSignOutAlt
)

const app = createApp(App)

app.use(createPinia())
app.use(router)

// Registra el componente de icono globalmente
app.component('font-awesome-icon', FontAwesomeIcon)

app.mount('#app')