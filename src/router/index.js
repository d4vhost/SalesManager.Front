import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

// Importa los Layouts
import PublicLayout from '@/layouts/PublicLayout.vue'
import AppLayout from '@/layouts/AppLayout.vue'
import HomeView from '@/views/HomeView.vue'
import LoginView from '@/views/LoginView.vue'
import PosView from '@/views/PosView.vue'
import AdminDashboard from '@/views/AdminDashboard.vue'
import InvoiceDetailView from '@/views/InvoiceDetail.vue'
import InvoicesView from '@/views/InvoicesView.vue'


const routes = [
  {
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
    path: '/login',
    name: 'Login',
    component: LoginView,
  },
  {
    path: '/app', 
    component: AppLayout, 
    meta: { requiresAuth: true }, 
    children: [
      {
        path: '',
        redirect: '/app/pos' 
      },
      {
        path: 'pos',
        name: 'POS',
        component: PosView,
      },
      {
        path: 'invoice/:id', 
        name: 'InvoiceDetail',
        component: InvoiceDetailView,
        meta: { requiresAuth: true } 
      },
      {
        path: 'invoices', 
        name: 'Invoices',
        component: InvoicesView,
        meta: { requiresAuth: true }
      },
      {
        path: 'admin',
        name: 'Admin',
        component: AdminDashboard,
        meta: { requiresAdmin: true } 
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  linkActiveClass: 'router-link-active',
  linkExactActiveClass: 'router-link-exact-active',
});

// --- Guardia de Navegación (Seguridad de Rutas) ---
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    console.warn('Acceso denegado: Se requiere rol de Admin.');
    next({ name: 'POS' }); 
  } else if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'Login' }); 
  } else if ((to.name === 'Login' || to.name === 'Home') && authStore.isAuthenticated) {
    next({ path: '/app/pos' });
  
  } else {
    next();
  }
});

export default router;