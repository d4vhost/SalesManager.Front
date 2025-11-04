import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

// Importa los Layouts
import PublicLayout from '@/layouts/PublicLayout.vue'
import AppLayout from '@/layouts/AppLayout.vue'
import HomeView from '@/views/HomeView.vue'
import LoginView from '@/views/LoginView.vue'
import PosView from '@/views/PosView.vue'
// Vistas de Facturas
import InvoiceDetailView from '@/views/InvoiceDetail.vue'
import InvoicesView from '@/views/InvoicesView.vue'

// Vistas de Admin (MODIFICADO)
import AdminDashboard from '@/views/AdminDashboard.vue'
// Importa los componentes de gestión
// --- INICIO DE MODIFICACIÓN: Eliminar AdminUsers ---
// import AdminUsers from '@/components/admin/AdminUsers.vue' 
// --- FIN DE MODIFICACIÓN ---
import AdminEmployees from '@/components/admin/AdminEmployees.vue'
import AdminProducts from '@/components/admin/AdminProducts.vue'
import AdminCategories from '@/components/admin/AdminCategories.vue'
import AdminCustomers from '@/components/admin/AdminCustomers.vue'
import AdminSuppliers from '@/components/admin/AdminSuppliers.vue'


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
        component: AdminDashboard, 
        meta: { requiresAdmin: true },
        // --- INICIO DE MODIFICACIÓN: Cambiar redirect ---
        redirect: { name: 'AdminEmployees' }, 
        // --- FIN DE MODIFICACIÓN ---
        children: [
          // --- INICIO DE MODIFICACIÓN: Eliminar ruta 'users' ---
          /*
          {
            path: 'users',
            name: 'AdminUsers',
            component: AdminUsers
          },
          */
          // --- FIN DE MODIFICACIÓN ---
          {
            path: 'employees',
            name: 'AdminEmployees',
            component: AdminEmployees
          },
          {
            path: 'products',
            name: 'AdminProducts',
            component: AdminProducts
          },
          {
            path: 'categories',
            name: 'AdminCategories',
            component: AdminCategories
          },
          {
            path: 'customers',
            name: 'AdminCustomers',
            component: AdminCustomers
          },
          {
            path: 'suppliers',
            name: 'AdminSuppliers',
            component: AdminSuppliers
          }
        ]
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

  // --- LÓGICA DE REDIRECCIÓN DE ADMIN MEJORADA ---
  if (to.matched.some(record => record.meta.requiresAdmin) && !authStore.isAdmin) {
    console.warn('Acceso denegado: Se requiere rol de Admin.');
    next({ name: 'POS' }); 
  } else if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'Login' }); 
  } else if ((to.name === 'Login' || to.name === 'Home') && authStore.isAuthenticated) {
    // --- INICIO DE MODIFICACIÓN: Cambiar redirect de login ---
    next(authStore.isAdmin ? { name: 'AdminEmployees' } : { name: 'POS' });
    // --- FIN DE MODIFICACIÓN ---
  } else {
    next();
  }
});

export default router;