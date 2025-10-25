import { defineStore } from 'pinia';
import apiService from '@/services/apiService';
import router from '@/router'; // Importa el router para redirigir

// Define el "store" de autenticación
export const useAuthStore = defineStore('auth', {
  // 1. Estado (Datos que guardamos)
  state: () => ({
    // Intenta cargar el token y el usuario desde localStorage al iniciar
    token: localStorage.getItem('token') || null,
    userEmail: localStorage.getItem('userEmail') || null,
    userRoles: JSON.parse(localStorage.getItem('userRoles')) || [],
  }),

  // 2. Getters (Propiedades calculadas)
  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.userRoles.includes('Admin'), // Verifica si el usuario es Admin
  },

  // 3. Actions (Métodos para cambiar el estado)
  actions: {
    async login(credentials) {
      try {
        const response = await apiService.login(credentials);
        
        // Extraemos los datos del token (si tu API los devuelve)
        // O asumiendo que response.data.token es el JWT
        const token = response.data.token;
        const userEmail = credentials.email; // O decodifica el token para obtener el email/roles
        
        // TODO: Decodificar el token para obtener los roles
        // const decodedToken = ...
        // const roles = decodedToken.roles;
        // Por ahora, simulamos roles si el email es 'admin@admin.com'
        const roles = userEmail === 'admin@admin.com' ? ['Admin', 'Usuario'] : ['Usuario'];

        // Guardar en el estado de Pinia
        this.token = token;
        this.userEmail = userEmail;
        this.userRoles = roles;

        // Guardar en localStorage para persistir el login
        localStorage.setItem('token', token);
        localStorage.setItem('userEmail', userEmail);
        localStorage.setItem('userRoles', JSON.stringify(roles));

        // Redirigir al Punto de Venta (POS)
        router.push('/pos');

      } catch (error) {
        console.error('Error en login:', error.response?.data?.message || error.message);
        // Lanza el error para que el componente Login lo atrape
        throw new Error(error.response?.data?.message || 'Error al iniciar sesión');
      }
    },

    logout() {
      // Limpiar el estado de Pinia
      this.token = null;
      this.userEmail = null;
      this.userRoles = [];

      // Limpiar localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userRoles');

      // Redirigir al Login
      router.push('/login');
    },
  },
});