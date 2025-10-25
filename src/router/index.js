import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

// Importa los Layouts
import PublicLayout from '@/layouts/PublicLayout.vue'
import AppLayout from '@/layouts/AppLayout.vue'

// Importa las Vistas (Páginas)
import HomeView from '@/views/HomeView.vue'
import LoginView from '@/views/LoginView.vue'
import PosView from '@/views/PosView.vue'
import AdminDashboard from '@/views/AdminDashboard.vue'


const routes = [
  {
    // --- Ruta Pública (Home) ---
    // Esta usa el PublicLayout (con Header y Footer)
    path: '/',
    component: PublicLayout,
    children: [
      { 
        path: '', 
        name: 'Home', 
        component: HomeView 
      }
    ]
  },
  {
    // --- Ruta de Login (Sin Layout) ---
    // Esta es una ruta de nivel superior, por eso no tiene header/footer
    path: '/login',
    name: 'Login',
    component: LoginView,
  },
  {
    // --- Rutas Privadas (App, POS, Admin) ---
    path: '/app', // Prefijo para todas las rutas autenticadas
    component: AppLayout, // Usa el layout con la barra lateral
    meta: { requiresAuth: true }, // Requiere login para todo este grupo
    children: [
      {
        path: '',
        redirect: '/app/pos' // Redirige /app a /app/pos
      },
      {
        path: 'pos',
        name: 'POS',
        component: PosView,
      },
      {
        path: 'admin',
        name: 'Admin',
        component: AdminDashboard,
        meta: { requiresAdmin: true } // Esta ruta específica requiere rol de Admin
      }
    ]
  },
  // Redirigir cualquier ruta 404 a la página de Home
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  // Clases CSS para los links activos en la navegación
  linkActiveClass: 'router-link-active',
  linkExactActiveClass: 'router-link-exact-active',
});

// --- Guardia de Navegación (Seguridad de Rutas) ---
router.beforeEach((to, from, next) => {
  // Asegúrate de que el store de Pinia esté listo
  const authStore = useAuthStore();

  // 1. Si la ruta requiere ser Admin y el usuario no lo es
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    console.warn('Acceso denegado: Se requiere rol de Admin.');
    next({ name: 'POS' }); // Redirige al POS
  
  // 2. Si la ruta requiere login (ej. /app/...) y el usuario no está logueado
  } else if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'Login' }); // Redirige al Login
  
  // 3. Si el usuario está logueado e intenta ir al Login o al Home
  } else if ((to.name === 'Login' || to.name === 'Home') && authStore.isAuthenticated) {
    next({ path: '/app/pos' }); // Redirige al POS
  
  } else {
    // Todo bien
    next();
  }
});

export default router;