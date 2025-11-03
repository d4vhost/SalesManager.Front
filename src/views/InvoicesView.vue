<script setup>
import { ref, onMounted } from 'vue';
// import apiService from '@/services/apiService'; // (Descomentar cuando lo necesites)

const invoices = ref([]);
const employees = ref([]);
const selectedEmployeeId = ref(null);
const isLoading = ref(false);
const errorMessage = ref('');

// (Aquí iría la lógica para cargar empleados y luego facturas por empleado)
// async function loadEmployees() { ... }
// async function loadInvoices() { ... }

onMounted(() => {
  // loadEmployees();
  console.log("Página de facturas cargada. (Lógica pendiente)");
});
</script>

<template>
  <div class="invoices-view">
    <div class="pos-header">
      <h1>Visor de Facturas</h1>
    </div>

    <section class="pos-section">
      <h2>Filtro por Empleado</h2>
      <p>
        (Funcionalidad pendiente: Aquí se mostrará un selector de empleados
        para filtrar las facturas que ha realizado).
      </p>
      </section>

    <section class="pos-section">
      <h2>Facturas</h2>
      <div v-if="isLoading" class="loading-indicator">Cargando...</div>
      <div v-else-if="errorMessage" class="alert-error">{{ errorMessage }}</div>
      <div v-else-if="invoices.length === 0" class="loading-indicator">
        No se encontraron facturas para el filtro seleccionado.
      </div>
      </section>

  </div>
</template>

<style scoped>
/* Puedes añadir estilos específicos si lo deseas */
.invoices-view {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
</style>