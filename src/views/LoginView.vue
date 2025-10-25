<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { RouterLink } from 'vue-router'

const authStore = useAuthStore()
const credentials = ref({
  email: '',
  password: '',
})
const error = ref(null)

const handleLogin = async () => {
  error.value = null
  try {
    // Llama a la acción 'login' del store
    await authStore.login(credentials.value)
    // El router guard (en index.js) redirigirá a /app/pos
  } catch (err) {
    // Atrapa el error lanzado por el store
    error.value = err.message || 'Error desconocido. Intente de nuevo.'
  }
}
</script>

<template>
  <div class="login-layout">
    
    <div class="login-form-wrapper">
      <div class="login-box">
        <h1 class="login-title">Acceso al Sistema</h1>
        <p class="login-subtitle">Ingresa tus credenciales para continuar.</p>

        <form @submit.prevent="handleLogin" class="login-form">
          
          <div v-if="error" class="alert-error">
            {{ error }}
          </div>

          <div class="form-group">
            <label for="email" class="form-label">Correo Electrónico</label>
            <input 
              type="email" 
              id="email" 
              class="form-control" 
              v-model="credentials.email" 
              required
              placeholder="ej: admin@salesmanager.com"
            />
          </div>
          
          <div class="form-group">
            <label for="password" class="form-label">Contraseña</label>
            <input 
              type="password" 
              id="password" 
              class="form-control" 
              v-model="credentials.password" 
              required
              placeholder="••••••••"
            />
          </div>

          <button type="submit" class="btn btn-primary btn-block btn-lg">
            Ingresar
          </button>
        </form>

        <div class="login-footer">
          <RouterLink to="/" class="back-link">
            <font-awesome-icon :icon="['fas', 'fa-arrow-left']" />
            Volver a la página de inicio
          </RouterLink>
        </div>
      </div>
    </div>

    <div class="login-image-wrapper">
      <div class="login-image"></div> <div class="image-overlay">
        <h2 class="overlay-title">SalesManager</h2>
        <p class="overlay-text">Facturación simple. Gestión poderosa.</p>
      </div>
    </div>

  </div>
</template>