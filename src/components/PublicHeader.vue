<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <header class="public-header">
    <div class="container header-content">
      <RouterLink to="/" class="header-brand">
        <font-awesome-icon :icon="['fas', 'fa-chart-pie']" />
        SalesManager
      </RouterLink>
      </div>
  </header>
</template>