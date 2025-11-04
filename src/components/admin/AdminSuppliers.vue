<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue';
import apiService from '@/services/apiService';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { 
  formatOnlyLetters, 
  formatPostalCode,
  isValidPhone,
  isValidUrl
} from '@/composables/useValidation.js';

// Estado de la lista
const suppliers = ref([]);
const isLoading = ref(true);
const generalErrorMessage = ref('');
const modalErrorMessage = ref('');
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
const selectedSupplier = ref(null);
const supplierFormData = reactive({
  supplierID: 0,
  companyName: '',
  contactName: '',
  contactTitle: '',
  address: '',
  city: '',
  region: '',
  postalCode: '',
  country: '',
  phone: '',
  fax: '',
  homePage: '',
});

// --- Validación ---
const validationErrors = reactive({
  companyName: '',
  postalCode: '',
  phone: '',
  homePage: ''
});

watch(supplierFormData, () => {
  Object.keys(validationErrors).forEach(key => validationErrors[key] = '');
  modalErrorMessage.value = '';
}, { deep: true });

function validateForm() {
  let isValid = true;
  
  if (!supplierFormData.companyName) {
    validationErrors.companyName = 'El nombre de compañía es obligatorio.';
    isValid = false;
  }
  
  const postalCode = supplierFormData.postalCode || '';
  if (postalCode && (postalCode.length < 3 || postalCode.length > 10)) {
    validationErrors.postalCode = 'Debe tener entre 3 y 10 caracteres alfanuméricos.';
    isValid = false;
  }
  
  if (supplierFormData.phone && !isValidPhone(supplierFormData.phone)) {
     validationErrors.phone = 'Debe ser un teléfono de 10 dígitos (puede incluir formato).';
     isValid = false;
  }
  
  if (supplierFormData.homePage && !isValidUrl(supplierFormData.homePage)) {
     validationErrors.homePage = 'Debe ser una URL válida (ej: http://www.ejemplo.com).';
     isValid = false;
  }
  
  return isValid;
}
// --- Fin Validación ---

async function loadSuppliers() {
  isLoading.value = true;
  generalErrorMessage.value = '';
  try {
    const response = await apiService.getSuppliers(
      searchTerm.value, 
      pagination.pageNumber, 
      pagination.pageSize
    );
    suppliers.value = response.data.items;
    pagination.totalCount = response.data.totalCount;
    pagination.totalPages = response.data.totalPages;
  } catch (error) {
    generalErrorMessage.value = 'No se pudo cargar la lista de proveedores.';
  } finally {
    isLoading.value = false;
  }
}

function handleSearch() {
  pagination.pageNumber = 1;
  loadSuppliers();
}

function changePage(newPage) {
  if (newPage >= 1 && newPage <= pagination.totalPages) {
    pagination.pageNumber = newPage;
    loadSuppliers();
  }
}

function resetForm() {
  Object.assign(supplierFormData, {
    supplierID: 0, companyName: '', contactName: '', contactTitle: '',
    address: '', city: '', region: '', postalCode: '', country: '',
    phone: '', fax: '', homePage: '',
  });
}

function openCreateModal() {
  isEditMode.value = false;
  selectedSupplier.value = null;
  resetForm();
  showModal.value = true;
}

async function openEditModal(supplier) {
  isEditMode.value = true;
  selectedSupplier.value = supplier;
  
  try {
    const response = await apiService.getSupplier(supplier.supplierID);
    Object.assign(supplierFormData, response.data);
    showModal.value = true;
  } catch(error) {
    alert("Error al cargar los detalles del proveedor.");
  }
}

async function handleSubmit() {
  modalErrorMessage.value = '';
  
  if (!validateForm()) {
    return;
  }

  const payload = { ...supplierFormData };

  try {
    if (isEditMode.value) {
      await apiService.updateSupplier(payload.supplierID, payload);
    } else {
      await apiService.createSupplier(payload);
    }
    showModal.value = false;
    await loadSuppliers();
  } catch (error) {
     modalErrorMessage.value = error.response?.data?.message || 'Error al guardar el proveedor.';
  }
}

async function handleDelete(id) {
  if (!confirm(`¿Está seguro de que desea ELIMINAR el proveedor ID ${id}? (Puede fallar si está en uso por productos)`)) return;

  try {
    await apiService.deleteSupplier(id);
    await loadSuppliers();
  } catch (error) {
    alert('Error al eliminar el proveedor. Asegúrese de que no esté siendo usado por ningún producto.');
  }
}

// --- Handlers de Input ---
function onContactNameInput(event) {
  supplierFormData.contactName = formatOnlyLetters(event, 50);
}
function onContactTitleInput(event) {
  supplierFormData.contactTitle = formatOnlyLetters(event, 50);
}
function onCityInput(event) {
  supplierFormData.city = formatOnlyLetters(event, 50);
}
function onRegionInput(event) {
  supplierFormData.region = formatOnlyLetters(event, 50);
}
function onCountryInput(event) {
  supplierFormData.country = formatOnlyLetters(event, 50);
}
function onPostalCodeInput(event) {
  supplierFormData.postalCode = formatPostalCode(event);
}

onMounted(loadSuppliers);
</script>

<template>
  <div class="admin-crud-container">
    <div class="admin-crud-header">
      <h2>Gestión de Proveedores</h2>
      <input 
        type="text" 
        v-model="searchTerm" 
        @keyup.enter="handleSearch"
        placeholder="Buscar proveedor..." 
        class="form-control" />
      <button @click="openCreateModal" class="btn btn-primary">
        <font-awesome-icon :icon="['fas', 'fa-plus']" />
        Crear Proveedor
      </button>
    </div>

    <div v-if="isLoading" class="loading-indicator">Cargando proveedores...</div>
    <div v-else-if="generalErrorMessage && !showModal" class="alert-error">{{ generalErrorMessage }}</div>
    
    <table v-else class="order-items-table">
      <thead>
        <tr>
          <!-- <th>ID</th> -->
          <th>Compañía</th>
          <th>Contacto</th>
          <th>Teléfono</th>
          <th>País</th>
          <th class="text-center">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="supplier in suppliers" :key="supplier.supplierID">
          <!-- <td>{{ supplier.supplierID }}</td> -->
          <td>{{ supplier.companyName }}</td>
          <td>{{ supplier.contactName }}</td>
          <td>{{ supplier.phone }}</td>
          <td>{{ supplier.country }}</td>
          <td class="text-center">
            <div class="action-button-group">
              <button @click="openEditModal(supplier)" class="btn" title="Editar">
                <font-awesome-icon :icon="['fas', 'fa-pencil-alt']" />
              </button>
              <button @click="handleDelete(supplier.supplierID)" class="btn btn-danger" title="Eliminar">
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

    <!-- Modal para Crear/Editar Proveedor -->
    <div v-if="showModal" class="modal-overlay" @mousedown.self="showModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ isEditMode ? 'Editar Proveedor' : 'Crear Proveedor' }}</h3>
          <button @click="showModal = false" class="modal-close-button" title="Cerrar">&times;</button>
        </div>
        
        <form @submit.prevent="handleSubmit">
          <div class="modal-body">
            <div v-if="modalErrorMessage" class="alert-error">{{ modalErrorMessage }}</div>
            
            <div class="modal-form">
              <div class="form-group form-group-full">
                <label for="companyName" class="form-label">Nombre Compañía</label>
                <input 
                  type="text" 
                  id="companyName" 
                  class="form-control" 
                  :class="{'is-invalid': validationErrors.companyName}"
                  v-model.trim="supplierFormData.companyName" 
                  maxlength="50" 
                  required />
                <small v-if="validationErrors.companyName" class="form-error-message">{{ validationErrors.companyName }}</small>
              </div>
              <div class="form-group">
                <label for="contactName" class="form-label">Nombre Contacto</label>
                <input 
                  type="text" 
                  id="contactName" 
                  class="form-control" 
                  :value="supplierFormData.contactName"
                  @input="onContactNameInput"
                  maxlength="50" />
              </div>
              <div class="form-group">
                <label for="contactTitle" class="form-label">Título Contacto</label>
                <input 
                  type="text" 
                  id="contactTitle" 
                  class="form-control" 
                  :value="supplierFormData.contactTitle"
                  @input="onContactTitleInput"
                  maxlength="50" />
              </div>

              <div class="form-group form-group-full">
                <label for="address" class="form-label">Dirección</label>
                <input type="text" id="address" class="form-control" v-model.trim="supplierFormData.address" maxlength="50" />
              </div>

              <div class="form-group">
                <label for="city" class="form-label">Ciudad</label>
                <input 
                  type="text" 
                  id="city" 
                  class="form-control" 
                  :value="supplierFormData.city"
                  @input="onCityInput"
                  maxlength="50" />
              </div>
              <div class="form-group">
                <label for="region" class="form-label">Región</label>
                <input 
                  type="text" 
                  id="region" 
                  class="form-control" 
                  :value="supplierFormData.region"
                  @input="onRegionInput"
                  maxlength="50" />
              </div>
              <div class="form-group">
                <label for="postalCode" class="form-label">Cód. Postal (3-10)</label>
                <input 
                  type="text" 
                  id="postalCode" 
                  class="form-control" 
                  :class="{'is-invalid': validationErrors.postalCode}"
                  :value="supplierFormData.postalCode"
                  @input="onPostalCodeInput"
                  maxlength="10" />
                <small v-if="validationErrors.postalCode" class="form-error-message">{{ validationErrors.postalCode }}</small>
              </div>
              <div class="form-group">
                <label for="country" class="form-label">País</label>
                <input 
                  type="text" 
                  id="country" 
                  class="form-control" 
                  :value="supplierFormData.country"
                  @input="onCountryInput"
                  maxlength="50" />
              </div>

              <div class="form-group">
                <label for="phone" class="form-label">Teléfono (10 dígitos)</label>
                <input 
                  type="text" 
                  id="phone" 
                  class="form-control" 
                  :class="{'is-invalid': validationErrors.phone}"
                  v-model.trim="supplierFormData.phone" 
                  maxlength="15" />
                <small v-if="validationErrors.phone" class="form-error-message">{{ validationErrors.phone }}</small>
              </div>
              <div class="form-group">
                <label for="fax" class="form-label">Fax (máx 15)</label>
                <input 
                  type="text" 
                  id="fax" 
                  class="form-control" 
                  :value="supplierFormData.fax"
                  @input="supplierFormData.fax = formatFax($event)"
                  maxlength="15" />
              </div>

              <div class="form-group form-group-full">
                <label for="homePage" class="form-label">Página Web (Homepage)</label>
                <input 
                  type="text" 
                  id="homePage" 
                  class="form-control" 
                  :class="{'is-invalid': validationErrors.homePage}"
                  v-model.trim="supplierFormData.homePage" />
                <small v-if="validationErrors.homePage" class="form-error-message">{{ validationErrors.homePage }}</small>
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
