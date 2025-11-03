import { createApp } from 'vue'
import { createPinia } from 'pinia'

// --- 1. Importar Font Awesome ---
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons'

import {
    faStore, faFileInvoiceDollar, faUsers, faBoxOpen,
    faArrowRight, faArrowLeft, faChartPie, faSignOutAlt,
    faBolt,
    faShoppingCart, 
    faShieldAlt,
    // --- ICONOS AÑADIDOS ---
    faFilePdf,     // Para el botón de PDF
    faPlusCircle   // Para el botón de "Nueva Venta"
} from '@fortawesome/free-solid-svg-icons'

// --- 2. Importar Vistas y Router ---
import App from './App.vue'
import router from './router'

// --- 3. Importar TODOS los Estilos CSS ---
import './styles/base.css'
import './styles/layout.css'
import './styles/header-footer.css'
import './styles/sidebar.css'
import './styles/home.css'
import './styles/login.css'
import './styles/pos.css'
// --- CSS AÑADIDO ---
import './styles/invoice.css' // Importa los nuevos estilos de factura

// --- 4. Configurar App ---
library.add(
    faStore, faFileInvoiceDollar, faUsers, faBoxOpen,
    faArrowRight, faArrowLeft, faChartPie, faSignOutAlt,
    faBolt,
    faShoppingCart, 
    faShieldAlt,
    faTrashAlt,
    // --- ICONOS AÑADIDOS A LA LIBRERÍA ---
    faFilePdf,
    faPlusCircle     
)

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.component('font-awesome-icon', FontAwesomeIcon)
app.mount('#app')