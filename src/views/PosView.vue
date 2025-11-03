<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue';
import apiService from '@/services/apiService';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
// --- IMPORTACIÓN AÑADIDA ---
import { useRouter } from 'vue-router';

// --- INICIALIZACIÓN AÑADIDA ---
const router = useRouter();

const selectedCustomer = ref(null);
const orderItems = ref([]);
const isLoading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

const showCustomerModal = ref(false);
const showProductModal = ref(false);

const customerSearchTerm = ref('');
const customerResults = reactive({
  items: [],
  pageNumber: 1,
  pageSize: 5,
  totalCount: 0,
  totalPages: 0,
  loading: false,
});

const productSearchTerm = ref('');
const selectedCategoryId = ref(0);
const availableCategories = ref([]);
const productResults = reactive({
  items: [],
  pageNumber: 1,
  pageSize: 5,
  totalCount: 0,
  totalPages: 0,
  loading: false,
});

const IVA_RATE = 0.12;

const subtotal = computed(() => {
  return orderItems.value.reduce((sum, item) => {
    const price = Number(item.unitPrice) || 0;
    const qty = Number(item.quantity) || 0;
    return sum + (price * qty);
  }, 0);
});

const ivaAmount = computed(() => {
  return subtotal.value * IVA_RATE;
});

const totalAmount = computed(() => {
  return subtotal.value + ivaAmount.value;
});

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
    customerResults.items = [];
  } finally {
    customerResults.loading = false;
  }
}

function selectCustomer(customer) {
  selectedCustomer.value = customer;
  showCustomerModal.value = false;
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

async function loadCategories() {
    try {
        const response = await apiService.getCategories('', 1, 100);
        availableCategories.value = response.data.items;
    } catch (error) {
        console.error("Error al cargar categorías:", error);
    }
}

async function searchProducts() {
  productResults.loading = true;
  try {
    const response = await apiService.getProducts(
      productSearchTerm.value,
      productResults.pageNumber,
      productResults.pageSize,
      selectedCategoryId.value
    );
    productResults.items = response.data.items;
    productResults.totalCount = response.data.totalCount;
    productResults.totalPages = response.data.totalPages;

  } catch (error) {
    console.error("Error al buscar productos:", error);
    productResults.items = [];
  } finally {
    productResults.loading = false;
  }
}

function addProductToOrder(product) {
    if (product.discontinued) {
        alert(`El producto "${product.productName}" está descontinuado y no puede ser vendido.`);
        return;
    }
     if (!product.unitsInStock || product.unitsInStock <= 0) {
        alert(`El producto "${product.productName}" no tiene stock disponible.`);
        return;
    }

  const existingItem = orderItems.value.find(item => item.productID === product.productID);
  if (existingItem) {
    alert(`El producto "${product.productName}" ya está en la orden.`);
    return;
  }

  orderItems.value.push({
    productID: product.productID,
    productName: product.productName,
    unitPrice: product.unitPrice || 0,
    quantity: 1,
    unitsInStock: product.unitsInStock,
  });
  showProductModal.value = false;
}

function changeProductPage(newPage) {
  if (newPage >= 1 && newPage <= productResults.totalPages && !productResults.loading) {
    productResults.pageNumber = newPage;
    searchProducts();
  }
}

watch(showProductModal, (newValue) => {
    if(newValue) {
        productSearchTerm.value = '';
        selectedCategoryId.value = 0;
        productResults.pageNumber = 1;
        searchProducts();
    }
});

watch([productSearchTerm, selectedCategoryId], ([newTerm, newCat], [oldTerm, oldCat]) => {
    if ((newTerm !== oldTerm || newCat !== oldCat) && showProductModal.value) {
        productResults.pageNumber = 1;
        searchProducts();
    }
});

function updateQuantity(item, event) {
  const newQuantity = parseInt(event.target.value, 10);
  if (isNaN(newQuantity) || newQuantity < 1) {
    item.quantity = 1;
    event.target.value = 1;
  } else if (newQuantity > item.unitsInStock) {
    item.quantity = item.unitsInStock;
     alert(`Stock máximo para "${item.productName}" es ${item.unitsInStock}.`);
    event.target.value = item.unitsInStock;
  } else {
    item.quantity = newQuantity;
  }
}

function removeItem(productId) {
  orderItems.value = orderItems.value.filter(item => item.productID !== productId);
}

// --- FUNCIÓN saveOrder MODIFICADA ---
async function saveOrder() {
  errorMessage.value = '';
  successMessage.value = ''; // Limpia mensajes

  // Validaciones existentes (perfectas)
  if (!selectedCustomer.value) {
    errorMessage.value = 'Debe seleccionar un cliente.';
    return;
  }
  if (orderItems.value.length === 0) {
    errorMessage.value = 'Debe añadir al menos un producto a la orden.';
    return;
  }

  for (const item of orderItems.value) {
      if (!item.quantity || item.quantity <= 0 || item.quantity > item.unitsInStock) {
          errorMessage.value = `Cantidad inválida o stock insuficiente para "${item.productName}".`;
          return;
      }
  }

  isLoading.value = true;
  const orderData = {
    customerID: selectedCustomer.value.customerID,
    items: orderItems.value.map(item => ({
      productID: item.productID,
      quantity: item.quantity,
    })),
  };

  try {
    // Llama a la API para crear la orden
    const response = await apiService.createOrder(orderData);
    
    // Obtenemos el ID de la nueva orden
    const newOrderId = response.data.orderId;

    // Limpia el formulario actual (buena práctica antes de navegar)
    selectedCustomer.value = null;
    orderItems.value = [];
    
    // Redirige a la nueva vista de factura
    // (Esto reemplaza la línea de successMessage.value = ...)
    router.push({ name: 'InvoiceDetail', params: { id: newOrderId } });

  } catch (error) {
    // Si falla, nos quedamos en la pantalla y mostramos el error
    errorMessage.value = error.response?.data?.message || 'Error al guardar la orden.';
    console.error(error);
  } finally {
    isLoading.value = false;
  }
}
// --- FIN DE LA MODIFICACIÓN ---

function formatCurrency(value) {
  const numberValue = Number(value);
  if (isNaN(numberValue)) {
      return '$0.00';
  }
  return numberValue.toLocaleString('es-EC', { style: 'currency', currency: 'USD' });
}

onMounted(() => {
    loadCategories();
});

</script>

<template>
  <div class="pos-view">
    <div class="pos-header">
      <h1>Punto de Venta</h1>
    </div>

    <div v-if="successMessage" class="success-message">{{ successMessage }}</div>
    <div v-if="errorMessage && !showCustomerModal && !showProductModal" class="alert-error">{{ errorMessage }}</div>

    <section class="pos-section customer-section">
      <h2>Cliente</h2>
      <div class="customer-selection">
        <button @click="showCustomerModal = true" class="btn btn-primary">Buscar Cliente</button>
        
        <div v-if="selectedCustomer" class="customer-info">
          <span>Nombre:</span> {{ selectedCustomer.companyName }}
           ({{ selectedCustomer.contactName }})
        </div>
        <div v-else class="customer-info">
             <span>Ningún cliente seleccionado</span>
         </div>
      </div>
    </section>

    <section class="pos-section product-section">
        <h2>Productos en la Orden</h2>
        <div class="product-addition">
            <button @click="showProductModal = true" class="btn btn-primary">Añadir Producto</button>
        </div>

      <table v-if="orderItems.length > 0" class="order-items-table">
        <thead>
          <tr>
            <th>Producto</th>
            <th class="text-right">P. Unit.</th>
            <th class="text-center">Cantidad</th>
            <th class="text-right">Subtotal</th>
            <th class="text-center">Acción</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in orderItems" :key="item.productID">
            <td>{{ item.productName }}</td>
            <td class="text-right">{{ formatCurrency(item.unitPrice) }}</td>
            <td class="text-center">
              <input
                type="number"
                :value="item.quantity"
                @input="updateQuantity(item, $event)"
                min="1"
                :max="item.unitsInStock"
                class="form-control quantity-input"
                :disabled="isLoading"
              />
               <small>(Stock: {{ item.unitsInStock }})</small>
            </td>
            <td class="text-right">{{ formatCurrency(item.unitPrice * item.quantity) }}</td>
            <td class="text-center">
              <button @click="removeItem(item.productID)" class="action-button" title="Eliminar" :disabled="isLoading">
                 <font-awesome-icon :icon="['fas', 'trash-alt']" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
       <p v-else class="loading-indicator">Añada productos a la orden.</p>
    </section>

    <section class="pos-section totals-actions-section">
        <div class="totals-section">
            <div class="totals-box">
                <div class="totals-row">
                    <span>Subtotal:</span>
                    <span>{{ formatCurrency(subtotal) }}</span>
                </div>
                 <div class="totals-row">
                    <span>IVA ({{ (IVA_RATE * 100).toFixed(0) }}%):</span>
                    <span>{{ formatCurrency(ivaAmount) }}</span>
                </div>
                 <div class="totals-row grand-total">
                    <span>Total:</span>
                    <span>{{ formatCurrency(totalAmount) }}</span>
                </div>
            </div>
        </div>

         <div class="pos-actions">
             <button @click="saveOrder" class="btn btn-primary" :disabled="isLoading || orderItems.length === 0 || !selectedCustomer">
                 {{ isLoading ? 'Guardando...' : 'Finalizar Venta' }}
             </button>
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
              {{ customerSearchTerm ? 'No se encontraron clientes.' : 'No hay clientes para mostrar.' }}
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

    <div v-if="showProductModal" class="modal-overlay" @mousedown.self="showProductModal = false">
        <div class="modal-content">
            <div class="modal-header">
              <h3>Buscar Producto</h3>
              <button @click="showProductModal = false" class="modal-close-button" title="Cerrar">&times;</button>
            </div>
             <div class="modal-body">
                <div class="modal-filters">
                    <div class="form-group">
                        <label for="productSearch" class="form-label">Buscar por Nombre:</label>
                        <input
                          id="productSearch"
                          type="text"
                          v-model="productSearchTerm"
                          placeholder="Nombre producto..."
                          class="form-control"
                          :disabled="productResults.loading"
                        />
                    </div>
                    <div class="form-group">
                        <label for="categoryFilter" class="form-label">Categoría:</label>
                        <select id="categoryFilter" v-model="selectedCategoryId" class="form-control" :disabled="productResults.loading">
                            <option :value="0">-- Todas --</option>
                            <option v-for="cat in availableCategories" :key="cat.categoryID" :value="cat.categoryID">
                                {{ cat.categoryName }}
                            </option>
                        </select>
                    </div>
                </div>

                <div v-if="productResults.loading" class="loading-indicator">Buscando...</div>
                <p v-else-if="!productResults.loading && productResults.items.length === 0" class="loading-indicator">
                    {{ (productSearchTerm || selectedCategoryId > 0) ? 'No se encontraron productos.' : 'No hay productos disponibles.' }}
                </p>

                 <table v-else class="search-results-table">
                     <thead>
                         <tr>
                             <th>Nombre Producto</th>
                             <th class="text-right">Precio</th>
                             <th class="text-center">Stock</th>
                         </tr>
                     </thead>
                     <tbody>
                       <template v-for="product in productResults.items" :key="product.productID">
                            <tr v-if="!product.discontinued" @click="addProductToOrder(product)">
                                <td>{{ product.productName }}</td>
                                <td class="text-right">{{ formatCurrency(product.unitPrice || 0) }}</td>
                                <td class="text-center">{{ product.unitsInStock }}</td>
                            </tr>
                       </template>
                     </tbody>
                 </table>
             </div>

             <div class="modal-footer" v-if="!productResults.loading && productResults.totalPages > 0">
                 <div class="modal-pagination">
                     <span class="pagination-info">
                          Página {{ productResults.pageNumber }} de {{ productResults.totalPages }} ({{ productResults.totalCount }} resultados)
                     </span>
                     <div class="pagination-controls">
                        <button
                            class="btn"
                            :disabled="productResults.pageNumber <= 1"
                            @click="changeProductPage(productResults.pageNumber - 1)">
                            Anterior
                        </button>
                         <button
                            class="btn"
                            :disabled="productResults.pageNumber >= productResults.totalPages"
                            @click="changeProductPage(productResults.pageNumber + 1)">
                            Siguiente
                        </button>
                     </div>
                 </div>
             </div>
        </div>
    </div>
  </div>
</template>