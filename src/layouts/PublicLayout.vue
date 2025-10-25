<script setup>
import { RouterView } from 'vue-router'
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'
</script>

<template>
  <div class="public-layout">
    <Navbar />
    <main class="public-content">
      <RouterView />
    </main>
    <Footer />
  </div>
</template>