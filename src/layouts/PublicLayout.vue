<script setup>
import { RouterView } from 'vue-router'
import PublicFooter from '@/components/PublicFooter.vue'
</script>

<template>
  <div class="public-layout">
    <main class="public-content">
      <RouterView />
    </main>
    <PublicFooter />
  </div>
</template>