<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="home-view">
    <section class="hero-section">
      <div class="container hero-container">
        <div class="hero-content">
          <h1 class="hero-title">Gestión de Ventas, Simplificada.</h1>
          <p class="hero-subtitle">
            Bienvenido a SalesManager. La solución moderna y rápida para gestionar tu punto de venta.
            Facturación, inventario y clientes, todo en un solo lugar.
          </p>
          <RouterLink to="/login" class="btn btn-primary btn-lg">Comenzar Ahora</RouterLink>
        </div>
        <div class="hero-image">
          <img src="https://source.unsplash.com/random/600x400/?analytics,business" alt="Dashboard Analytics">
        </div>
      </div>
    </section>

    <section class="features-section">
      <div class="container">
        <h2 class="section-title">Todo lo que necesitas</h2>
        <p class="section-subtitle">Un sistema completo para llevar tu negocio al siguiente nivel.</p>
        
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">
              <font-awesome-icon :icon="['fas', 'fa-rocket']" />
            </div>
            <h3>Facturación Rápida</h3>
            <p>Crea facturas en segundos. Busca productos y clientes al instante.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">
              <font-awesome-icon :icon="['fas', 'fa-boxes-stacked']" />
            </div>
            <h3>Gestión de Stock</h3>
            <p>Tu inventario se actualiza automáticamente con cada venta realizada.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">
              <font-awesome-icon :icon="['fas', 'fa-users']" />
            </div>
            <h3>Panel de Admin</h3>
            <p>Administra usuarios, productos, y proveedores desde un solo lugar.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="cta-section">
      <div class="container cta-content">
        <h2>¿Listo para empezar?</h2>
        <p>Inicia sesión para acceder a tu panel de punto de venta.</p>
        <RouterLink to="/login" class="btn btn-primary btn-lg">Acceder al Sistema</RouterLink>
      </div>
    </section>

  </div>
</template>