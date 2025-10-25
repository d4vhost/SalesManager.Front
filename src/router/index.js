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
// (Puedes añadir más imports aquí, ej: import AdminProducts from '@/views/admin/AdminProducts.vue')


const routes = [
  {
    // --- Rutas Públicas (Home, Login) ---
    path: '/',
    component: PublicLayout, // Usan el layout con Navbar y Footer
    children: [
      { 
        path: '', 
        name: 'Home', 
        component: HomeView 
      },
      { 
        path: 'login', 
        name: 'Login', 
        component: LoginView 
      }
    ]
  },
  {
    // --- Rutas Privadas (App, POS, Admin) ---
    path: '/app', // Prefijo para todas las rutas autenticadas
    component: AppLayout, // Usan el layout con la barra lateral
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
      // Ejemplo de más rutas de admin:
      // { path: 'admin/products', name: 'AdminProducts', component: AdminProducts, meta: { requiresAdmin: true } },
      // { path: 'admin/users', name: 'AdminUsers', component: AdminUsers, meta: { requiresAdmin: true } },
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
  const authStore = useAuthStore();

  // 1. Si la ruta requiere ser Admin y el usuario no lo es
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    console.warn('Acceso denegado: Se requiere rol de Admin.');
    next({ name: 'POS' }); // Redirige al POS
  
  // 2. Si la ruta requiere login (ej. /app/...) y el usuario no está logueado
  } else if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'Login' }); // Redirige al Login
  
  // 3. Si el usuario está logueado e intenta ir al Login o al Home
  } else if ((to.path === '/login' || to.path === '/') && authStore.isAuthenticated) {
    next({ name: 'POS' }); // Redirige al POS (su página de inicio logueado)
  
  } else {
    // Todo bien, permite la navegación
    next();
  }
});

export default router;