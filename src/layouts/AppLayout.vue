<script setup>
import { RouterView, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()

const handleLogout = () => {
  authStore.logout()
}
</script>

<template>
  <div class="app-layout">
    <nav class="sidebar">
      
      <div class="sidebar-header">
        <RouterLink to="/app" class="sidebar-brand">
          <font-awesome-icon :icon="['fas', 'fa-chart-pie']" />
          SalesManager
        </RouterLink>
      </div>
      <ul class="nav-links">
        <li v-if="!authStore.isAdmin">
          <RouterLink to="/app/pos">
            <font-awesome-icon :icon="['fas', 'fa-shopping-cart']" />
            Punto de Venta
          </RouterLink>
        </li>
        
        <li>
          <RouterLink to="/app/invoices">
            <font-awesome-icon :icon="['fas', 'fa-file-invoice']" />
            Facturas
          </RouterLink>
        </li>

        <li v-if="authStore.isAdmin">
          <RouterLink to="/app/admin">
            <font-awesome-icon :icon="['fas', 'fa-shield-alt']" />
            Administración
          </RouterLink>
        </li>
      </ul>

      <div class="sidebar-footer">
        <span class="user-email">{{ authStore.userEmail }}</span>
        <button @click="handleLogout" class="btn-logout">
          <font-awesome-icon :icon="['fas', 'fa-sign-out-alt']" />
          Cerrar Sesión
        </button>
      </div>
      </nav>

    <main class="main-content">
      <RouterView />
    </main>
  </div>
</template>