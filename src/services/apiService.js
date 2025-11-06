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
  register(userInfo) {
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
  // --- START OF MODIFICATION ---
  // (assignRole deprecated, we use setUserRoles now)
  getRoles() {
    return api.get('/Auth/roles');
  },
  createRole(roleName) {
    // El backend espera un string plano
    return api.post('/Auth/roles', JSON.stringify(roleName), {
      headers: { 'Content-Type': 'application/json' }
    });
  },
  setUserRoles(email, rolesDto) {
    return api.put(`/Auth/users/${email}/set-roles`, rolesDto);
  },
  adminChangePassword(email, passwordDto) {
    return api.put(`/Auth/users/${email}/admin-change-password`, passwordDto);
  },
  adminChangeEmail(email, emailDto) {
    return api.put(`/Auth/users/${email}/admin-change-email`, emailDto);
  },
  // --- END OF MODIFICATION ---

  // --- Products Endpoints ---
  getProducts(searchTerm = '', page = 1, pageSize = 10, categoryId = null) {
    const params = { searchTerm, pageNumber: page, pageSize };
    if (categoryId && categoryId > 0) {
         params.categoryId = categoryId;
    }
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

  // --- Categories Endpoint ---
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

  // --- Suppliers Endpoints ---
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
  
  // --- INICIO DE MODIFICACIÓN: Endpoints de Empleados ---
  getEmployees(searchTerm = '', page = 1, pageSize = 10) {
    return api.get('/Employees', {
      params: { searchTerm, pageNumber: page, pageSize }
    });
  },
  getEmployee(id) {
    return api.get(`/Employees/${id}`);
  },
  createEmployee(employeeData) {
    return api.post('/Employees', employeeData);
  },
  updateEmployee(id, employeeData) {
    return api.put(`/Employees/${id}`, employeeData);
  },
  deleteEmployee(id) {
    return api.delete(`/Employees/${id}`);
  },
  // --- FIN DE MODIFICACIÓN ---

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
};