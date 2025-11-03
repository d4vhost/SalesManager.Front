<script setup>
import { ref, reactive, watch } from 'vue';
import { RouterLink } from 'vue-router';
import apiService from '@/services/apiService';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

const selectedCustomer = ref(null);
const isLoadingInvoices = ref(false);
const errorMessage = ref('');

// --- Lógica para el modal de Cliente (copiada de PosView) ---
const showCustomerModal = ref(false);
const customerSearchTerm = ref('');
const customerResults = reactive({
  items: [],
  pageNumber: 1,
  pageSize: 5,
  totalCount: 0,
  totalPages: 0,
  loading: false,
});

// --- Lógica para la lista de Facturas ---
const invoicesResult = reactive({
  items: [],
  pageNumber: 1,
  pageSize: 10,
  totalCount: 0,
  totalPages: 0,
});

/**
 * BUSCADOR DE CLIENTES (Copiado de PosView)
 */
async function searchCustomers() {
  customerResults.loading = true;
  try {
    const response = await apiService.getCustomers(
      customerSearchTerm.value,
      customerResults.pageNumber,
      customerResults.pageSize
    );
    customerResults.items = response.data.items;
    customerResults.totalCount = response.data.totalCount;
    customerResults.totalPages = response.data.totalPages;
  } catch (error) {
    console.error("Error al buscar clientes:", error);
  } finally {
    customerResults.loading = false;
  }
}

function selectCustomer(customer) {
  selectedCustomer.value = customer;
  showCustomerModal.value = false;
  invoicesResult.pageNumber = 1; // Resetea la paginación de facturas
  loadInvoices(); // Carga las facturas para el nuevo cliente
}

function changeCustomerPage(newPage) {
  if (newPage >= 1 && newPage <= customerResults.totalPages && !customerResults.loading) {
    customerResults.pageNumber = newPage;
    searchCustomers();
  }
}

watch(showCustomerModal, (newValue) => {
  if (newValue) {
    customerSearchTerm.value = '';
    customerResults.pageNumber = 1;
    searchCustomers();
  }
});

watch(customerSearchTerm, (newValue, oldValue) => {
   if (newValue !== oldValue && showCustomerModal.value) {
        customerResults.pageNumber = 1;
        searchCustomers();
   }
});

/**
 * LÓGICA DE CARGA DE FACTURAS (Nueva)
 */
async function loadInvoices() {
  if (!selectedCustomer.value) {
    invoicesResult.items = [];
    invoicesResult.totalCount = 0;
    invoicesResult.totalPages = 0;
    return;
  }

  isLoadingInvoices.value = true;
  errorMessage.value = '';
  try {
    const params = {
      customerId: selectedCustomer.value.customerID,
      pageNumber: invoicesResult.pageNumber,
      pageSize: invoicesResult.pageSize
    };
    const response = await apiService.getOrders(params);
    
    invoicesResult.items = response.data.items;
    invoicesResult.totalCount = response.data.totalCount;
    invoicesResult.totalPages = response.data.totalPages;

  } catch (error) {
    console.error("Error al cargar facturas:", error);
    errorMessage.value = "Error al cargar las facturas.";
  } finally {
    isLoadingInvoices.value = false;
  }
}

function changeInvoicePage(newPage) {
  if (newPage >= 1 && newPage <= invoicesResult.totalPages && !isLoadingInvoices.value) {
    invoicesResult.pageNumber = newPage;
    loadInvoices();
  }
}

/**
 * Funciones de formato (Copiadas)
 */
function formatCurrency(value) {
  return Number(value).toLocaleString('es-EC', { style: 'currency', currency: 'USD' });
}

function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('es-ES', options);
}
</script>

<template>
  <div class="invoices-view">
    <div class="pos-header">
      <h1>Visor de Facturas</h1>
    </div>

    <section class="pos-section">
      <h2>Filtro por Cliente</h2>
      <div class="customer-selection">
        <button @click="showCustomerModal = true" class="btn btn-primary">
          {{ selectedCustomer ? 'Cambiar Cliente' : 'Buscar Cliente' }}
        </button>
        <div v-if="selectedCustomer" class="customer-info">
          <span>Cliente:</span> {{ selectedCustomer.companyName }} ({{ selectedCustomer.contactName }})
        </div>
        <div v-else class="customer-info">
          <span>Ningún cliente seleccionado</span>
        </div>
      </div>
    </section>

    <section class="pos-section">
      <h2>Facturas</h2>
      <div v-if="isLoadingInvoices" class="loading-indicator">Cargando...</div>
      <div v-else-if="errorMessage" class="alert-error">{{ errorMessage }}</div>
      
      <div v-else-if="!selectedCustomer" class="loading-indicator">
        Por favor, seleccione un cliente para ver sus facturas.
      </div>
      <div v-else-if="invoicesResult.items.length === 0" class="loading-indicator">
        No se encontraron facturas para este cliente.
      </div>

      <table v-else class="order-items-table">
        <thead>
          <tr>
            <th>Factura #</th>
            <th>Cliente</th>
            <th>Fecha</th>
            <th class="text-right">Total</th>
            <th class="text-center">Acción</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="invoice in invoicesResult.items" :key="invoice.orderID">
            <td>{{ invoice.orderID }}</td>
            <td>{{ invoice.customerName }}</td>
            <td>{{ formatDate(invoice.orderDate) }}</td>
            <td class="text-right">{{ formatCurrency(invoice.totalAmount) }}</td>
            <td class="text-center">
              <RouterLink 
                :to="{ name: 'InvoiceDetail', params: { id: invoice.orderID } }" 
                class="btn btn-primary"
                style="padding: 0.4rem 0.8rem; font-size: 0.9rem;">
                Ver
              </RouterLink>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="modal-footer" v-if="!isLoadingInvoices && invoicesResult.totalPages > 0">
        <div class="modal-pagination">
          <span class="pagination-info">
            Página {{ invoicesResult.pageNumber }} de {{ invoicesResult.totalPages }} ({{ invoicesResult.totalCount }} facturas)
          </span>
          <div class="pagination-controls">
            <button
                class="btn"
                :disabled="invoicesResult.pageNumber <= 1"
                @click="changeInvoicePage(invoicesResult.pageNumber - 1)">
                Anterior
            </button>
            <button
                class="btn"
                :disabled="invoicesResult.pageNumber >= invoicesResult.totalPages"
                @click="changeInvoicePage(invoicesResult.pageNumber + 1)">
                Siguiente
            </button>
          </div>
        </div>
      </div>
    </section>

    <div v-if="showCustomerModal" class="modal-overlay" @mousedown.self="showCustomerModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Buscar Cliente</h3>
          <button @click="showCustomerModal = false" class="modal-close-button" title="Cerrar">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <input
              type="text"
              v-model="customerSearchTerm"
              placeholder="Buscar por Nombre, Contacto, Dirección, Ciudad, País..."
              class="form-control"
              :disabled="customerResults.loading"
            />
          </div>

          <div v-if="customerResults.loading" class="loading-indicator">Buscando...</div>
          <p v-else-if="!customerResults.loading && customerResults.items.length === 0" class="loading-indicator">
              No se encontraron clientes.
          </p>

          <table v-else class="search-results-table">
            <thead>
              <tr>
                <th>Nombre Contacto</th>
                <th>Compañía</th>
                <th>Dirección</th>
                <th>Ciudad</th>
                <th>País</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="customer in customerResults.items" :key="customer.customerID" @click="selectCustomer(customer)">
                 <td>{{ customer.contactName || '-' }}</td>
                 <td>{{ customer.companyName }}</td>
                 <td>{{ customer.address || '-' }}</td>
                 <td>{{ customer.city || '-' }}</td>
                 <td>{{ customer.country || '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="modal-footer" v-if="!customerResults.loading && customerResults.totalPages > 0">
             <div class="modal-pagination">
                 <span class="pagination-info">
                     Página {{ customerResults.pageNumber }} de {{ customerResults.totalPages }} ({{ customerResults.totalCount }} resultados)
                 </span>
                 <div class="pagination-controls">
                    <button
                        class="btn"
                        :disabled="customerResults.pageNumber <= 1"
                        @click="changeCustomerPage(customerResults.pageNumber - 1)">
                        Anterior
                    </button>
                     <button
                        class="btn"
                        :disabled="customerResults.pageNumber >= customerResults.totalPages"
                        @click="changeCustomerPage(customerResults.pageNumber + 1)">
                        Siguiente
                    </button>
                 </div>
              </div>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
/* Estilos específicos si los necesitas */
.invoices-view {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.btn-primary {
    /* Ajuste para que el botón "Ver" no sea tan grande */
    text-transform: none;
    letter-spacing: 0;
}
</style>