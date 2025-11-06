import { createApp } from 'vue'
import { createPinia } from 'pinia'

// --- 1. Importar Font Awesome ---
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

// Iconos existentes
import {
    faStore, faFileInvoiceDollar, faUsers, faBoxOpen,
    faArrowRight, faArrowLeft, faChartPie, faSignOutAlt,
    faBolt,
    faShoppingCart, 
    faShieldAlt,
    faTrashAlt,
    faFilePdf,     
    faPlusCircle,   
    faFileInvoice,
    faPencilAlt,
    faPlus,
    faKey,
    faUserShield,
    faTags,
    faTruck,
    faSave
} from '@fortawesome/free-solid-svg-icons'

// --- AÑADIR ESTE ÍCONO ---
import { faBriefcase } from '@fortawesome/free-solid-svg-icons'

// --- START OF MODIFICATION ---
// Add new icons for user management
import { 
    faUserTag, 
    faEnvelope 
} from '@fortawesome/free-solid-svg-icons'
// --- END OF MODIFICATION ---


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
import './styles/invoice.css' 
import './styles/admin.css' 

// --- 4. Configurar App ---
library.add(
    // Existentes
    faStore, faFileInvoiceDollar, faUsers, faBoxOpen,
    faArrowRight, faArrowLeft, faChartPie, faSignOutAlt,
    faBolt,
    faShoppingCart, 
    faShieldAlt,
    faTrashAlt,
    faFilePdf,
    faPlusCircle,
    faFileInvoice,
    faPencilAlt,
    faPlus,
    faKey,
    faUserShield,
    faTags,
    faTruck,
    faSave,
    faBriefcase,
    
    // --- START OF MODIFICATION ---
    faUserTag, // New
    faEnvelope // New
    // --- END OF MODIFICATION ---
)

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.component('font-awesome-icon', FontAwesomeIcon)
app.mount('#app')