<script setup>
import { RouterView, RouterLink } from 'vue-router';
</script>

<template>
  <div class="admin-dashboard-view">
    <div class="pos-header">
      <h1>Panel de Administración</h1>
    </div>

    <nav class="admin-nav">
      <RouterLink :to="{ name: 'AdminEmployees' }" class="admin-nav-link">
        <font-awesome-icon :icon="['fas', 'fa-briefcase']" />
        Empleados (Ventas)
      </RouterLink>
      <RouterLink :to="{ name: 'AdminProducts' }" class="admin-nav-link">
        <font-awesome-icon :icon="['fas', 'fa-box-open']" />
        Productos
      </RouterLink>
      <RouterLink :to="{ name: 'AdminCategories' }" class="admin-nav-link">
        <font-awesome-icon :icon="['fas', 'fa-tags']" />
        Categorías
      </RouterLink>
      <RouterLink :to="{ name: 'AdminCustomers' }" class="admin-nav-link">
        <font-awesome-icon :icon="['fas', 'fa-users']" />
        Clientes
      </RouterLink>
      <RouterLink :to="{ name: 'AdminSuppliers' }" class="admin-nav-link">
        <font-awesome-icon :icon="['fas', 'fa-truck']" />
        Proveedores
      </RouterLink>
      <RouterLink :to="{ name: 'AdminRoles' }" class="admin-nav-link">
        <font-awesome-icon :icon="['fas', 'fa-user-shield']" />
        Roles
      </RouterLink>
      </nav>

    <section class="admin-content">
      <RouterView />
    </section>
  </div>
</template>