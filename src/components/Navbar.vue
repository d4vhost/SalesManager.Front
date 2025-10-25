<script setup>
import { RouterLink } from 'vue-router'
// Importa los estilos CSS para este componente
import '@/styles/navbar.css'
</script>

<template>
  <nav class="navbar">
    <RouterLink to="/" class="navbar-brand">SalesManager</RouterLink>
    <div class="navbar-nav">
      <RouterLink to="/login" class="btn btn-outline">Iniciar Sesión</RouterLink>
    </div>
  </nav>
</template>