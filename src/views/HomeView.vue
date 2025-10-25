<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="home-view">
    <section class="hero-main">
      <div class="hero-background"></div>
      <div class="hero-content container">
        <h1 class="hero-title">El Punto de Venta Definitivo</h1>
        <p class="hero-subtitle">
          Facturación, inventario y gestión de clientes en una plataforma web
          rápida, segura y fácil de usar.
        </p>
        <div class="hero-cta">
          <RouterLink to="/login" class="btn btn-primary">
            Acceder al Sistema
            <font-awesome-icon :icon="['fas', 'fa-arrow-right']" />
          </RouterLink>
        </div>
      </div>
    </section>

    <ScrollFadeIn>
      <section class="split-section container">
        <div class="split-content">
          <h2>Potencia y Simplicidad</h2>
          <p>
            SalesManager te permite gestionar tu negocio de forma eficiente.
            Obtén reportes en tiempo real, genera PDFs de facturas
            y maneja tu inventario sin complicaciones.
          </p>
          <p>
            Es la solución ideal para pequeños y medianos negocios que 
            buscan modernizar su proceso de ventas.
          </p>
        </div>
        <div class="split-image"></div>
      </section>
    </ScrollFadeIn>
    
    <section class="features-section">
      <div class="container">
        <h2 class="section-title">Todo Incluido</h2>
        <p class="section-subtitle">Las herramientas que necesitas para una gestión exitosa.</p>
        <div class="features-grid">
          <ScrollFadeIn>
            <div class="feature-card">
              <div class="feature-icon">
                <font-awesome-icon :icon="['fas', 'fa-bolt']" />
              </div>
              <h3>Facturación Rápida</h3>
              <p>Genera ventas y facturas en segundos, sin demoras.</p>
            </div>
          </ScrollFadeIn>
          <ScrollFadeIn>
            <div class="feature-card">
              <div class="feature-icon">
                <font-awesome-icon :icon="['fas', 'fa-box-open']" />
              </div>
              <h3>Stock Automatizado</h3>
              <p>El inventario se descuenta automáticamente con cada venta.</p>
            </div>
          </ScrollFadeIn>
          <ScrollFadeIn>
            <div class="feature-card">
              <div class="feature-icon">
                <font-awesome-icon :icon="['fas', 'fa-users']" />
              </div>
              <h3>Gestión de Clientes</h3>
              <p>Administra tu base de datos de clientes y proveedores.</p>
            </div>
          </ScrollFadeIn>
        </div>
      </div>
    </section>

  </div>
</template>