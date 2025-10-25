<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/authStore'
// Importa los estilos CSS para este componente
import '@/styles/login.css' // Importa los nuevos estilos de login

const authStore = useAuthStore()
const credentials = ref({
  email: '',
  password: '',
})
const error = ref(null)

const handleLogin = async () => {
  error.value = null
  try {
    await authStore.login(credentials.value)
    // El store redirige
  } catch (err) {
    error.value = err.message || 'Error desconocido. Intente de nuevo.'
  }
}
</script>

<template>
  <div class="login-container">
    <div class="login-box">
      <h1 class="login-title">Iniciar Sesión</h1>
      <p class="login-subtitle">Ingresa a tu cuenta de SalesManager</p>

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
          />
        </div>

        <button type="submit" class="btn btn-primary btn-block">
          Ingresar
        </button>
      </form>
    </div>
  </div>
</template>