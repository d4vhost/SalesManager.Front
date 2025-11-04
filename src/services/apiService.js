import axios from 'axios';
import { useAuthStore } from '@/stores/authStore'; // Importa el store de auth

// 1. Obtiene la URL base de tu backend desde el archivo .env
const baseURL = import.meta.env.VITE_API_BASE_URL;

// 2. Crea una instancia de Axios
const api = axios.create({
  baseURL: `${baseURL}/api`, // Apunta a /api (ej: https://localhost:7020/api)
  headers: {
    'Content-Type': 'application/json',
  },
});

// 3. Interceptor (¡MUY IMPORTANTE!)
api.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore(); // Accede al store de Pinia
    const token = authStore.token;

    if (token) {
      // Si tenemos token, lo añadimos a la cabecera
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 4. Exporta las funciones para llamar a los endpoints
export default {
  // --- Auth Endpoints ---
  login(credentials) {
    return api.post('/Auth/login', credentials);
  },
  // --- INICIO DE MODIFICACIÓN ---
  // (El registro desde el admin es diferente al registro público)
  // Usamos el endpoint de registro existente, asumiendo que el rol se asignará después
  // o que el backend lo maneja.
  register(userInfo) {
    // Nota: El backend /register asigna "Usuario". Para crear Admins,
    // necesitarías un endpoint dedicado o usar assignRole después.
    return api.post('/Auth/register', userInfo);
  },

  // --- Endpoints de Gestión de Usuarios (NUEVOS) ---
  getUsers() {
    return api.get('/Auth/users');
  },
  updateUser(email, updateDto) {
    return api.put(`/Auth/users/${email}`, updateDto);
  },
  deleteUser(email) {
    return api.delete(`/Auth/users/${email}`);
  },
  unlockUser(email) {
    return api.put(`/Auth/unlock/${email}`);
  },
  // (Opcional: endpoints de roles si los implementas)
  assignRole(assignRoleDto) {
    return api.post('/Auth/assignrole', assignRoleDto);
  },
  createRole(roleName) {
    // El backend espera un string plano, por eso el { data: roleName }
    return api.post('/Auth/roles', JSON.stringify(roleName), {
      headers: { 'Content-Type': 'application/json' }
    });
  },

  // --- Products Endpoints ---
  getProducts(searchTerm = '', page = 1, pageSize = 10, categoryId = null) {
    const params = { searchTerm, pageNumber: page, pageSize };
    if (categoryId && categoryId > 0) {
         params.categoryId = categoryId;
    }
    // NOTA: Para el Admin, idealmente tendrías un param "includeAll: true"
    // que tu backend debería manejar para saltar el filtro de stock/discontinued.
    // Por ahora, usará el mismo endpoint que el POS.
    return api.get(`/Products`, { params });
  },
  getProduct(id) {
    return api.get(`/Products/${id}`);
  },
  createProduct(product) {
    return api.post('/Products', product);
  },
  updateProduct(id, product) {
    return api.put(`/Products/${id}`, product);
  },
  deleteProduct(id) {
    return api.delete(`/Products/${id}`);
  },
  // --- FIN Products ---

  getSellableProducts() {
    return api.get('/Products/sellable');
  },

  // --- Customers Endpoints ---
  getCustomers(searchTerm = '', page = 1, pageSize = 10) {
    return api.get(`/Customers`, {
      params: { searchTerm, pageNumber: page, pageSize }
    });
  },
  getCustomer(id) {
    return api.get(`/Customers/${id}`);
  },
  createCustomer(customer) {
    return api.post('/Customers', customer);
  },
  updateCustomer(id, customer) {
    return api.put(`/Customers/${id}`, customer);
  },
  deleteCustomer(id) {
    return api.delete(`/Customers/${id}`);
  },
  // --- FIN Customers ---


  // --- Categories Endpoints ---
   getCategories(searchTerm = '', page = 1, pageSize = 100) { 
       return api.get(`/Categories`, {
         params: { searchTerm, pageNumber: page, pageSize }
       });
   },
  getCategory(id) {
    return api.get(`/Categories/${id}`);
  },
  createCategory(category) {
    return api.post('/Categories', category);
  },
  updateCategory(id, category) {
    return api.put(`/Categories/${id}`, category);
  },
  deleteCategory(id) {
    return api.delete(`/Categories/${id}`);
  },
  // --- FIN Categories ---

  // --- Suppliers Endpoints (NUEVOS) ---
  getSuppliers(searchTerm = '', page = 1, pageSize = 10) {
    return api.get(`/Suppliers`, {
      params: { searchTerm, pageNumber: page, pageSize }
    });
  },
  getSupplier(id) {
    return api.get(`/Suppliers/${id}`);
  },
  createSupplier(supplier) {
    return api.post('/Suppliers', supplier);
  },
  updateSupplier(id, supplier) {
    return api.put(`/Suppliers/${id}`, supplier);
  },
  deleteSupplier(id) {
    return api.delete(`/Suppliers/${id}`);
  },
  // --- FIN Suppliers ---

  // --- Orders Endpoints ---
  createOrder(orderData) {
    return api.post('/Orders', orderData);
  },
  getOrderDetails(orderId) {
    return api.get(`/Orders/${orderId}`);
  },
  getOrders(params) {
    return api.get('/Orders', { params });
  },
  getOrderPdf(orderId) {
    return api.get(`/Orders/${orderId}/pdf`, {
      responseType: 'blob', // Importante para recibir un archivo/PDF
    });
  },
  // --- FIN DE MODIFICACIÓN ---
};