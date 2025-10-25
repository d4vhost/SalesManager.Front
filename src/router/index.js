import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

// Importa las vistas (componentes de página)
// (Aún no las hemos creado, pero las definimos aquí)
// import LoginView from '@/views/LoginView.vue';
// import PosView from '@/views/PosView.vue';
// import AdminDashboard from '@/views/AdminDashboard.vue';

// Por ahora, usamos componentes placeholder
const LoginView = { template: '<div>Página de Login</div>' };
const PosView = { template: '<div>Página de Punto de Venta (POS)</div>' };
const AdminDashboard = { template: '<div>Panel de Administración</div>' };

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
  },
  {
    path: '/pos',
    name: 'POS',
    component: PosView,
    meta: { requiresAuth: true } // Esta ruta requiere login
  },
  {
    path: '/admin',
    name: 'Admin',
    component: AdminDashboard,
    meta: { requiresAuth: true, requiresAdmin: true } // Requiere login Y ser Admin
  },
  // Redirigir cualquier ruta desconocida al login o al POS
  {
    path: '/:pathMatch(.*)*',
    redirect: '/pos'
  },
  // Redirigir la ruta raíz
  {
    path: '/',
    redirect: '/pos'
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// Guardia de Navegación (Navigation Guard)
// Se ejecuta ANTES de cargar cualquier página
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  // Si la ruta requiere admin y el usuario no es admin
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    _logger.LogWarn('Acceso denegado a ruta de admin');
    next('/pos'); // Redirigir a POS (o a una página de "No autorizado")
  
  // Si la ruta requiere autenticación y el usuario no está logueado
  } else if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login'); // Redirigir al Login
  
  // Si el usuario está logueado e intenta ir al Login
  } else if (to.path === '/login' && authStore.isAuthenticated) {
    next('/pos'); // Redirigir al POS
  } else {
    // En cualquier otro caso, permite la navegación
    next();
  }
});

export default router;