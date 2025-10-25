<script setup>
import { RouterView, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
// Importa los estilos CSS para este componente
import '@/styles/sidebar.css'

const authStore = useAuthStore()

const handleLogout = () => {
  authStore.logout()
}
</script>

<template>
  <div class="app-layout">
    <nav class="sidebar">
      <div class="sidebar-header">
        <h3>SalesManager</h3>
      </div>
      <ul class="nav-links">
        <li><RouterLink to="/app/pos">Punto de Venta</RouterLink></li>
        
        <li v-if="authStore.isAdmin">
          <RouterLink to="/app/admin">Admin Dashboard</RouterLink>
        </li>
      </ul>
      <div class="sidebar-footer">
        <span class="user-email">{{ authStore.userEmail }}</span>
        <button @click="handleLogout" class="btn btn-logout">Cerrar Sesión</button>
      </div>
    </nav>

    <main class="main-content">
      <RouterView />
    </main>
  </div>
</template>