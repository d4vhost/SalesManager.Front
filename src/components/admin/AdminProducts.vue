<script setup>
import { ref, reactive, onMounted } from 'vue';
import apiService from '@/services/apiService';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
// Importa las funciones de validación
import { formatDecimal, formatOnlyInteger } from '@/composables/useValidation.js';

// Estado de la lista
const products = ref([]);
const isLoading = ref(true);
const errorMessage = ref('');
const searchTerm = ref('');
const pagination = reactive({
  pageNumber: 1,
  pageSize: 10,
  totalCount: 0,
  totalPages: 0,
});

// Estado del Modal
const showModal = ref(false);
const isEditMode = ref(false);
const selectedProduct = ref(null);
const productFormData = reactive({
  productID: 0,
  productName: '',
  supplierID: null,
  categoryID: null,
  quantityPerUnit: '',
  unitPrice: 0,
  unitsInStock: 0,
  unitsOnOrder: 0,
  reorderLevel: 0,
  discontinued: false,
});

// Listas para Dropdowns
const categories = ref([]);
const suppliers = ref([]);

async function loadDependencies() {
  try {
    // Carga todas las categorías y proveedores para los dropdowns del modal
    const [catResponse, supResponse] = await Promise.all([
      apiService.getCategories('', 1, 500), // Asume 500 como "todos"
      apiService.getSuppliers('', 1, 500)  // Asume 500 como "todos"
    ]);
    categories.value = catResponse.data.items;
    suppliers.value = supResponse.data.items;
  } catch (error) {
    errorMessage.value = "Error al cargar dependencias (categorías/proveedores).";
  }
}

async function loadProducts() {
  isLoading.value = true;
  errorMessage.value = '';
  try {
    // NOTA: Esta API (como está en tu backend) solo trae productos "vendibles".
    // Idealmente, el backend debería tener un endpoint admin que traiga todos.
    const response = await apiService.getProducts(
      searchTerm.value, 
      pagination.pageNumber, 
      pagination.pageSize
    );
    products.value = response.data.items;
    pagination.totalCount = response.data.totalCount;
    pagination.totalPages = response.data.totalPages;
  } catch (error) {
    console.error("Error al cargar productos:", error);
    errorMessage.value = 'No se pudo cargar la lista de productos.';
  } finally {
    isLoading.value = false;
  }
}

function handleSearch() {
  pagination.pageNumber = 1;
  loadProducts();
}

function changePage(newPage) {
  if (newPage >= 1 && newPage <= pagination.totalPages) {
    pagination.pageNumber = newPage;
    loadProducts();
  }
}

function resetForm() {
  Object.assign(productFormData, {
    productID: 0, productName: '', supplierID: null, categoryID: null,
    quantityPerUnit: '', unitPrice: 0, unitsInStock: 0,
    unitsOnOrder: 0, reorderLevel: 0, discontinued: false,
  });
}

function openCreateModal() {
  isEditMode.value = false;
  selectedProduct.value = null;
  resetForm();
  showModal.value = true;
}

async function openEditModal(product) {
  isEditMode.value = true;
  selectedProduct.value = product;
  
  // El DTO de la lista (ProductDto) no tiene todos los campos.
  // Necesitamos cargar la entidad completa desde la API.
  try {
    const response = await apiService.getProduct(product.productID);
    Object.assign(productFormData, response.data);
    showModal.value = true;
  } catch(error) {
    alert("Error al cargar los detalles del producto.");
  }
}

async function handleSubmit() {
  errorMessage.value = '';
  const payload = { ...productFormData };

  // Convertir nulos/vacíos a null
  payload.supplierID = payload.supplierID || null;
  payload.categoryID = payload.categoryID || null;
  // Asegurar que los valores numéricos sean números
  payload.unitPrice = Number(payload.unitPrice) || 0;
  payload.unitsInStock = Number(payload.unitsInStock) || 0;
  payload.unitsOnOrder = Number(payload.unitsOnOrder) || 0;
  payload.reorderLevel = Number(payload.reorderLevel) || 0;

  try {
    if (isEditMode.value) {
      await apiService.updateProduct(payload.productID, payload);
    } else {
      await apiService.createProduct(payload);
    }
    showModal.value = false;
    await loadProducts(); // Recargar la lista
  } catch (error) {
     errorMessage.value = error.response?.data?.message || 'Error al guardar el producto.';
     console.error(error.response?.data);
  }
}

async function handleDelete(id) {
  if (!confirm(`¿Está seguro de que desea ELIMINAR el producto ID ${id}?`)) return;

  try {
    await apiService.deleteProduct(id);
    await loadProducts();
  } catch (error) {
    alert('Error al eliminar el producto.');
  }
}

// --- Handlers de Input para formato ---
function onPriceInput(event) {
  productFormData.unitPrice = formatDecimal(event);
}
function onStockInput(event) {
  productFormData.unitsInStock = formatOnlyInteger(event, 6);
}
function onOrderInput(event) {
  productFormData.unitsOnOrder = formatOnlyInteger(event, 6);
}
function onReorderInput(event) {
  productFormData.reorderLevel = formatOnlyInteger(event, 6);
}


onMounted(async () => {
  await loadDependencies();
  await loadProducts();
});
</script>

<template>
  <div class="admin-crud-container">
    <div class="admin-crud-header">
      <h2>Gestión de Productos</h2>
      <input 
        type="text" 
        v-model="searchTerm" 
        @keyup.enter="handleSearch"
        placeholder="Buscar por nombre..." 
        class="form-control" />
      <button @click="openCreateModal" class="btn btn-primary">
        <font-awesome-icon :icon="['fas', 'fa-plus']" />
        Crear Producto
      </button>
    </div>

    <div v-if="isLoading" class="loading-indicator">Cargando productos...</div>
    <div v-else-if="errorMessage && !showModal" class="alert-error">{{ errorMessage }}</div>
    
    <table v-else class="order-items-table">
      <thead>
        <tr>
          <!-- ID Oculto -->
          <!-- <th>ID</th> -->
          <th>Nombre del Producto</th>
          <th>Presentación</th>
          <th class="text-right">Precio</th>
          <th class="text-center">Stock</th>
          <th class="text-center">Estado</th>
          <th class="text-center">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="product in products" :key="product.productID">
          <!-- ID Oculto -->
          <!-- <td>{{ product.productID }}</td> -->
          <td>{{ product.productName }}</td>
          <td>{{ product.quantityPerUnit }}</td>
          <td class="text-right">{{ product.unitPrice?.toFixed(2) }}</td>
          <td class="text-center">{{ product.unitsInStock }}</td>
          <td class="text-center">
            <span v-if="product.discontinued" class="badge badge-danger">Descontinuado</span>
            <span v-else class="badge badge-success">Activo</span>
          </td>
          <td class="text-center">
            <div class="action-button-group">
              <button @click="openEditModal(product)" class="btn" title="Editar">
                <font-awesome-icon :icon="['fas', 'fa-pencil-alt']" />
              </button>
              <button @click="handleDelete(product.productID)" class="btn btn-danger" title="Eliminar">
                <font-awesome-icon :icon="['fas', 'fa-trash-alt']" />
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Paginación -->
    <div class="modal-footer" v-if="!isLoading && pagination.totalPages > 0">
      <div class="modal-pagination">
        <span class="pagination-info">
          Página {{ pagination.pageNumber }} de {{ pagination.totalPages }} ({{ pagination.totalCount }} resultados)
        </span>
        <div class="pagination-controls">
          <button class="btn" :disabled="pagination.pageNumber <= 1" @click="changePage(pagination.pageNumber - 1)">
            Anterior
          </button>
          <button class="btn" :disabled="pagination.pageNumber >= pagination.totalPages" @click="changePage(pagination.pageNumber + 1)">
            Siguiente
          </button>
        </div>
      </div>
    </div>

    <!-- Modal para Crear/Editar Producto -->
    <div v-if="showModal" class="modal-overlay" @mousedown.self="showModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ isEditMode ? 'Editar Producto' : 'Crear Producto' }}</h3>
          <button @click="showModal = false" class="modal-close-button" title="Cerrar">&times;</button>
        </div>
        
        <form @submit.prevent="handleSubmit">
          <div class="modal-body">
            <div v-if="errorMessage" class="alert-error">{{ errorMessage }}</div>
            
            <div class="modal-form">
              <div class="form-group form-group-full">
                <label for="productName" class="form-label">Nombre del Producto</label>
                <input type="text" id="productName" class="form-control" v-model="productFormData.productName" maxlength="50" required />
              </div>

              <div class="form-group">
                <label for="category" class="form-label">Categoría</label>
                <select id="category" class="form-control" v-model.number="productFormData.categoryID">
                  <option :value="null">-- Ninguna --</option>
                  <option v-for="cat in categories" :key="cat.categoryID" :value="cat.categoryID">{{ cat.categoryName }}</option>
                </select>
              </div>

              <div class="form-group">
                <label for="supplier" class="form-label">Proveedor</label>
                <select id="supplier" class="form-control" v-model.number="productFormData.supplierID">
                  <option :value="null">-- Ninguno --</option>
                  <option v-for="sup in suppliers" :key="sup.supplierID" :value="sup.supplierID">{{ sup.companyName }}</option>
                </select>
              </div>

              <div class="form-group form-group-full">
                <label for="quantityPerUnit" class="form-label">Presentación (Ej: 24 latas x 330ml)</label>
                <input type="text" id="quantityPerUnit" class="form-control" v-model="productFormData.quantityPerUnit" maxlength="50" />
              </div>

              <div class="form-group">
                <label for="unitPrice" class="form-label">Precio Unitario</label>
                <input 
                  type="text" 
                  id="unitPrice" 
                  class="form-control" 
                  :value="productFormData.unitPrice"
                  @input="onPriceInput" />
              </div>

              <div class="form-group">
                <label for="unitsInStock" class="form-label">Stock Actual</label>
                <input 
                  type="text" 
                  id="unitsInStock" 
                  class="form-control" 
                  :value="productFormData.unitsInStock"
                  @input="onStockInput" />
              </div>

              <div class="form-group">
                <label for="unitsOnOrder" class="form-label">Unidades en Pedido</label>
                <input 
                  type="text" 
                  id="unitsOnOrder" 
                  class="form-control" 
                  :value="productFormData.unitsOnOrder"
                  @input="onOrderInput" />
              </div>

              <div class="form-group">
                <label for="reorderLevel" class="form-label">Nivel de Reorden</label>
                <input 
                  type="text" 
                  id="reorderLevel" 
                  class="form-control" 
                  :value="productFormData.reorderLevel"
                  @input="onReorderInput" />
              </div>

              <div class="form-group-full checkbox-group">
                <input type="checkbox" id="discontinued" class="form-control" v-model="productFormData.discontinued" />
                <label for="discontinued" class="form-label">Producto Descontinuado</label>
              </div>

            </div>
          </div>

          <div class="modal-footer">
            <div class="modal-pagination">
              <span class="pagination-info"></span>
              <div class="pagination-controls">
                <button type="button" class="btn" @click="showModal = false">Cancelar</button>
                <button type="submit" class="btn btn-primary">
                  <font-awesome-icon :icon="['fas', 'fa-save']" />
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
