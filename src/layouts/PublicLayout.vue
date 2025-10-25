<script setup>
import { RouterView } from 'vue-router'
import PublicHeader from '@/components/PublicHeader.vue' // <-- CAMBIO
import PublicFooter from '@/components/PublicFooter.vue' // <-- CAMBIO
</script>

<template>
  <div class="public-layout">
    <PublicHeader />
    <main class="public-content">
      <RouterView />
    </main>
    <PublicFooter />
  </div>
</template>