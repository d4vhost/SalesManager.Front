<script setup>
import { RouterView } from 'vue-router'
// Opcional: Puedes importar un componente de Navbar aquí si quieres
// import Navbar from '@/components/Navbar.vue' 
</script>

<template>
  <main>
    <RouterView />
  </main>
</template>

<style scoped>
/* Puedes añadir estilos globales para 'main' aquí */
main {
  padding: 20px;
}
</style>