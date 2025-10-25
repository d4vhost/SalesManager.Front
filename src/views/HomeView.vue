<script setup>
import { RouterLink } from 'vue-router'
// Importa los estilos CSS para este componente
import '@/styles/home.css'
</script>

<template>
  <div class="home-view">
    <section class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">Bienvenido a SalesManager</h1>
        <p class="hero-subtitle">
          La solución moderna y rápida para gestionar tu punto de venta.
          Facturación, inventario y clientes, todo en un solo lugar.
        </p>
        <RouterLink to="/login" class="btn btn-primary btn-lg">Comenzar</RouterLink>
      </div>
      <div class="hero-image">
        <div class="hero-image-placeholder">
          (Imagen de la aplicación)
        </div>
      </div>
    </section>

    <section class="features-section container">
      <h2 class="features-title">Características Principales</h2>
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-card-icon">⚡️</div>
          <h3>Facturación Rápida</h3>
          <p>Crea facturas en segundos. Busca productos y clientes al instante.</p>
        </div>
        <div class="feature-card">
          <div class="feature-card-icon">📦</div>
          <h3>Gestión de Stock</h3>
          <p>Tu inventario se actualiza automáticamente con cada venta.</p>
        </div>
        <div class="feature-card">
          <div class="feature-card-icon">👤</div>
          <h3>Panel de Admin</h3>
          <p>Administra usuarios, productos, clientes y proveedores desde un solo lugar.</p>
        </div>
      </div>
    </section>
  </div>
</template>