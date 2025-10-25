import axios from 'axios';
import { useAuthStore } from '@/stores/authStore'; // Importa el store de auth (que crearemos)

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
// Esto "intercepta" cada petición ANTES de que se envíe
// y le adjunta el token JWT si estamos logueados.
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
    return api.post('/Auth/login', credentials); // Llama a POST /api/Auth/login
  },
  register(userInfo) {
    return api.post('/Auth/register', userInfo); // Llama a POST /api/Auth/register
  },
  // (Puedes añadir aquí los endpoints de /api/Auth/users, /api/Auth/roles, etc.)

  // --- Products Endpoints ---
  getProducts(searchTerm = '', page = 1, pageSize = 10) {
    return api.get(`/Products`, {
      params: { searchTerm, pageNumber: page, pageSize }
    }); // Llama a GET /api/Products con query params
  },
  getSellableProducts() {
    return api.get('/Products/sellable'); // Llama a GET /api/Products/sellable
  },

  // --- Customers Endpoints ---
  getCustomers(searchTerm = '', page = 1, pageSize = 10) {
    return api.get(`/Customers`, {
      params: { searchTerm, pageNumber: page, pageSize }
    }); // Llama a GET /api/Customers
  },

  // --- Orders Endpoints ---
  createOrder(orderData) {
    return api.post('/Orders', orderData); // Llama a POST /api/Orders
  },
  getOrderDetails(orderId) {
    return api.get(`/Orders/${orderId}`); // Llama a GET /api/Orders/{id}
  },
  getOrderPdf(orderId) {
    return api.get(`/Orders/${orderId}/pdf`, {
      responseType: 'blob', // Importante para recibir un archivo/PDF
    });
  },
};