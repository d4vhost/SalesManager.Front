// src/stores/authStore.js
import { defineStore } from 'pinia';
import apiService from '@/services/apiService';
import router from '@/router';
import { jwtDecode } from 'jwt-decode'; //

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    userEmail: localStorage.getItem('userEmail') || null,
    userRoles: JSON.parse(localStorage.getItem('userRoles') || '[]'),
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    // Verifica si 'Admin' está en la lista de roles
    isAdmin: (state) => Array.isArray(state.userRoles) && state.userRoles.includes('Admin'),
  },

  actions: {
    async login(credentials) {
      try {
        const response = await apiService.login(credentials); //
        const token = response.data.token; //

        let roles = [];
        let userEmail = '';

        if (token) {
          try {
            const decodedToken = jwtDecode(token);

            // --- Lógica de extracción de roles MÁS ROBUSTA ---
            const roleClaim = decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

            if (Array.isArray(roleClaim)) {
              // Si ya es un array (múltiples roles)
              roles = roleClaim;
            } else if (typeof roleClaim === 'string') {
              // Si es un string (un solo rol)
              roles = [roleClaim];
            } else {
              // Fallback: Si no se encuentra el claim o no es string/array
              console.warn("No se encontró el claim de roles estándar en el token. Asignando rol 'Usuario'.");
              roles = ['Usuario'];
            }
            // --- Fin lógica de roles ---

            // Obtiene el email (sin cambios)
            userEmail = decodedToken.email || decodedToken.sub || credentials.email; //

          } catch (decodeError) {
            console.error("Error decodificando el token:", decodeError);
            roles = ['Usuario']; // Fallback en caso de error de decodificación
            userEmail = credentials.email;
          }
        } else {
          throw new Error("No se recibió token del servidor.");
        }

        // Guardar en el estado y localStorage (sin cambios)
        this.token = token;
        this.userEmail = userEmail;
        this.userRoles = roles;
        localStorage.setItem('token', token);
        localStorage.setItem('userEmail', userEmail);
        localStorage.setItem('userRoles', JSON.stringify(roles));

        // Redirección basada en rol (ahora debería usar los roles correctos)
        if (this.isAdmin) {
          router.push('/app/admin'); //
        } else {
          router.push('/app/pos'); //
        }

      } catch (error) {
        console.error('Error en login:', error.response?.data?.message || error.message);
        this.logoutCleanup();
        throw new Error(error.response?.data?.message || 'Error al iniciar sesión. Verifique sus credenciales.');
      }
    },

    logout() {
      this.logoutCleanup();
      router.push('/login'); //
    },

    logoutCleanup() {
      this.token = null;
      this.userEmail = null;
      this.userRoles = [];
      localStorage.removeItem('token');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userRoles');
    }
  },
});