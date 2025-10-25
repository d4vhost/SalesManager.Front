<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <nav class="navbar">
    <div class="container navbar-content">
      <RouterLink to="/" class="navbar-brand">
        <font-awesome-icon :icon="['fas', 'fa-chart-line']" />
        SalesManager
      </RouterLink>
      <div class="navbar-nav">
        <RouterLink to="/login" class="btn btn-primary">
          <font-awesome-icon :icon="['fas', 'fa-sign-in-alt']" />
          Iniciar Sesión
        </RouterLink>
      </div>
    </div>
  </nav>
</template>