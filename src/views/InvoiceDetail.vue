<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import apiService from '@/services/apiService';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

const route = useRoute();
const router = useRouter();
const order = ref(null);
const isLoading = ref(true);
const errorMessage = ref('');

// Obtenemos el ID de la orden desde la URL (ej: /app/invoice/123)
const orderId = route.params.id;

/**
 * Carga los detalles completos de la orden desde la API.
 */
async function loadOrderDetails() {
  isLoading.value = true;
  errorMessage.value = '';
  try {
    const response = await apiService.getOrderDetails(orderId);
    order.value = response.data;
  } catch (error) {
    console.error("Error al cargar detalles de la orden:", error);
    errorMessage.value = 'No se pudo encontrar la orden. Verifique el ID e intente de nuevo.';
  } finally {
    isLoading.value = false;
  }
}

/**
 * Llama a la API para descargar el PDF de la factura.
 */
async function handleDownloadPdf() {
  try {
    const response = await apiService.getOrderPdf(orderId);
    
    // Crear un Blob (archivo binario en memoria) con la respuesta de la API
    const file = new Blob([response.data], { type: 'application/pdf' });
    
    // Crear una URL temporal en el navegador para ese Blob
    const fileURL = URL.createObjectURL(file);
    
    // Crear un elemento <a> invisible para iniciar la descarga
    const link = document.createElement('a');
    link.href = fileURL;
    link.setAttribute('download', `Factura-${orderId}.pdf`); // Nombre del archivo
    document.body.appendChild(link);
    
    // Simular el clic en el enlace y luego removerlo
    link.click();
    link.parentNode.removeChild(link);
    URL.revokeObjectURL(fileURL); // Limpiar la URL temporal de la memoria

  } catch (error) {
    console.error("Error al descargar PDF:", error);
    errorMessage.value = 'No se pudo generar el PDF de la factura.';
  }
}

/**
 * Navega de vuelta a la pantalla de Punto de Venta.
 */
function goToPos() {
  router.push({ name: 'POS' });
}

/**
 * Formatea un número a moneda (ej: $1,234.56).
 */
function formatCurrency(value) {
  const numberValue = Number(value);
  if (isNaN(numberValue)) {
      return '$0.00';
  }
  return numberValue.toLocaleString('es-EC', { style: 'currency', currency: 'USD' });
}

/**
 * Formatea una fecha (ej: "25 de octubre de 2025, 14:30").
 */
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
}

// Hook del ciclo de vida: Carga los detalles de la orden cuando el componente se monta.
onMounted(() => {
  loadOrderDetails();
});
</script>

<template>
  <div class="invoice-view">
    <div v-if="isLoading" class="loading-indicator">Cargando factura...</div>
    
    <div v-if="errorMessage" class="alert-error">{{ errorMessage }}</div>

    <template v-if="order">
      
      <div class="invoice-header">
        <h1>Factura #{{ order.orderID }}</h1>
        <div class="invoice-actions">
          <button @click="goToPos" class="btn">
            <font-awesome-icon :icon="['fas', 'fa-plus-circle']" />
            Nueva Venta
          </button>
          <button @click="handleDownloadPdf" class="btn btn-primary">
            <font-awesome-icon :icon="['fas', 'fa-file-pdf']" />
            Descargar PDF
          </button>
        </div>
      </div>

      <section class="pos-section invoice-details">
        <div class="customer-info">
          <h3>Cliente</h3>
          <p>
            <strong>Nombre:</strong> {{ order.customerName || 'N/A' }} <br>
            <strong>ID Cliente:</strong> {{ order.customerID }} <br>
            <strong>Fecha de Orden:</strong> {{ formatDate(order.orderDate) }}
          </p>
        </div>
        <div class="shipping-info">
          <h3>Enviar A</h3>
          <p>
            <strong>Dirección:</strong> {{ order.shipAddress || 'N/A' }} <br>
            <strong>Ciudad:</strong> {{ order.shipCity || 'N/A' }} <br>
            <strong>País:</strong> {{ order.shipCountry || 'N/A' }}
          </p>
        </div>
      </section>

      <section class="pos-section">
        <h2>Detalles de la Orden</h2>
        <table class="order-items-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Producto</th>
              <th class="text-right">P. Unit.</th>
              <th class="text-center">Cantidad</th>
              <th class="text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in order.items" :key="item.productID">
              <td>{{ item.productID }}</td>
              <td>{{ item.productName }}</td>
              <td class="text-right">{{ formatCurrency(item.unitPrice) }}</td>
              <td class="text-center">{{ item.quantity }}</td>
              <td class="text-right">{{ formatCurrency(item.subtotal) }}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section class="pos-section totals-actions-section">
        <div class="totals-section">
          <div class="totals-box">
            <div class="totals-row">
              <span>Subtotal:</span>
              <span>{{ formatCurrency(order.subtotal) }}</span>
            </div>
            <div class="totals-row">
              <span>Flete (Shipping):</span>
              <span>{{ formatCurrency(order.freight) }}</span>
            </div>
            <div class="totals-row">
              <span>IVA ({{ (order.subtotal > 0 ? (order.vatAmount / order.subtotal * 100) : 12).toFixed(0) }}%):</span>
              <span>{{ formatCurrency(order.vatAmount) }}</span>
            </div>
            <div class="totals-row grand-total">
              <span>Total:</span>
              <span>{{ formatCurrency(order.totalAmount) }}</span>
            </div>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>