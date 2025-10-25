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
    await authStore.login(credentials.value)
  } catch (err) {
    error.value = err.message || 'Error desconocido. Intente de nuevo.'
  }
}
</script>

<template>
  <div class="login-layout">
    <div class="login-image-wrapper">
      <img src="https://source.unsplash.com/random/800x1200/?store,minimal" alt="Tienda" class="login-image">
      <div class="image-overlay">
        <h2 class="overlay-title">SalesManager</h2>
        <p class="overlay-text">Tu punto de venta inteligente.</p>
      </div>
    </div>

    <div class="login-form-wrapper">
      <div class="login-box">
        <h1 class="login-title">Bienvenido de Nuevo</h1>
        <p class="login-subtitle">Ingresa tus credenciales para acceder al sistema.</p>

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
              placeholder="ej: correo@empresa.com"
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

          <button type="submit" class="btn btn-primary btn-block">
            Ingresar
          </button>
        </form>

        <div class="login-footer">
          <p>¿Aún no tienes cuenta? <RouterLink to="/">Contacta al administrador</RouterLink></p>
        </div>
      </div>
    </div>
  </div>
</template>