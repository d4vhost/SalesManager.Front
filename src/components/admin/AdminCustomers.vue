<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue';
import apiService from '@/services/apiService';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { 
  formatOnlyLetters, 
  formatPostalCode,
  isValidPhone
} from '@/composables/useValidation.js';

// Estado de la lista
const customers = ref([]);
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
const selectedCustomer = ref(null);
const customerFormData = reactive({
  customerID: '',
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
});

// --- Validación ---
const validationErrors = reactive({
  customerID: '',
  companyName: '',
  contactName: '',
  postalCode: '',
  phone: ''
});

watch(customerFormData, () => {
  Object.keys(validationErrors).forEach(key => validationErrors[key] = '');
  modalErrorMessage.value = '';
}, { deep: true });

function validateForm() {
  let isValid = true;
  
  if (!customerFormData.companyName) {
    validationErrors.companyName = 'El nombre de compañía es obligatorio.';
    isValid = false;
  }
  
  if (!customerFormData.contactName) {
    validationErrors.contactName = 'El nombre de contacto es obligatorio.';
    isValid = false;
  }
  
  const postalCode = customerFormData.postalCode || '';
  if (postalCode && (postalCode.length < 3 || postalCode.length > 10)) {
    validationErrors.postalCode = 'Debe tener entre 3 y 10 caracteres alfanuméricos.';
    isValid = false;
  }
  
  if (customerFormData.phone && !isValidPhone(customerFormData.phone)) {
     validationErrors.phone = 'Debe ser un teléfono de 10 dígitos (puede incluir formato).';
     isValid = false;
  }
  
  // Validación de ID solo en creación
  if (!isEditMode.value && !customerFormData.customerID) {
    validationErrors.customerID = 'El ID no se pudo generar (se requiere Nombre Contacto).';
    isValid = false;
  }

  return isValid;
}
// --- Fin Validación ---

/**
 * Genera un CustomerID aleatorio basado en el nombre de contacto.
 * Ej: "David Cruz" -> "DCRUZ123"
 */
function generateCustomerId() {
  const name = customerFormData.contactName;
  if (!name) {
    validationErrors.contactName = 'El Nombre de Contacto es necesario para generar el ID.';
    return;
  }
  
  const parts = name.split(' ').map(part => part.toUpperCase());
  let idBase = '';
  
  if (parts.length > 1) {
    // Toma la primera letra del nombre y el apellido
    idBase = parts[0][0] + parts[parts.length - 1].substring(0, 4);
  } else {
    // Toma los primeros 5 caracteres del nombre
    idBase = parts[0].substring(0, 5);
  }
  
  // Asegura que tenga 5 letras y añade 3 números random
  idBase = idBase.padEnd(5, 'X').substring(0, 5);
  const randomDigits = Math.floor(100 + Math.random() * 900); // 100-999
  
  // Asigna el ID (el backend lo truncará a 5 si es necesario, pero el estándar es 5)
  // Lo generamos de 8 para asegurar unicidad
  customerFormData.customerID = idBase.substring(0, 5); // ID de 5 letras como Northwind
}


async function loadCustomers() {
  isLoading.value = true;
  generalErrorMessage.value = '';
  try {
    const response = await apiService.getCustomers(
      searchTerm.value, 
      pagination.pageNumber, 
      pagination.pageSize
    );
    customers.value = response.data.items;
    pagination.totalCount = response.data.totalCount;
    pagination.totalPages = response.data.totalPages;
  } catch (error) {
    generalErrorMessage.value = 'No se pudo cargar la lista de clientes.';
  } finally {
    isLoading.value = false;
  }
}

function handleSearch() {
  pagination.pageNumber = 1;
  loadCustomers();
}

function changePage(newPage) {
  if (newPage >= 1 && newPage <= pagination.totalPages) {
    pagination.pageNumber = newPage;
    loadCustomers();
  }
}

function resetForm() {
  Object.assign(customerFormData, {
    customerID: '', companyName: '', contactName: '', contactTitle: '',
    address: '', city: '', region: '', postalCode: '', country: '',
    phone: '', fax: '',
  });
}

function openCreateModal() {
  isEditMode.value = false;
  selectedCustomer.value = null;
  resetForm();
  showModal.value = true;
}

async function openEditModal(customer) {
  isEditMode.value = true;
  selectedCustomer.value = customer;
  
  try {
    const response = await apiService.getCustomer(customer.customerID);
    Object.assign(customerFormData, response.data);
    showModal.value = true;
  } catch(error) {
    alert("Error al cargar los detalles del cliente.");
  }
}

async function handleSubmit() {
  modalErrorMessage.value = '';
  
  // Generar ID si es modo creación
  if (!isEditMode.value) {
    generateCustomerId();
  }

  if (!validateForm()) {
    return; // Detiene si la validación falla
  }

  const payload = { ...customerFormData };

  try {
    if (isEditMode.value) {
      await apiService.updateCustomer(payload.customerID, payload);
    } else {
      await apiService.createCustomer(payload);
    }
    showModal.value = false;
    await loadCustomers();
  } catch (error) {
     modalErrorMessage.value = error.response?.data?.message || 'Error al guardar el cliente. Verifique que el ID no esté duplicado.';
  }
}

async function handleDelete(id) {
  if (!confirm(`¿Está seguro de que desea ELIMINAR el cliente ID ${id}? (Puede fallar si tiene órdenes asociadas)`)) return;

  try {
    await apiService.deleteCustomer(id);
    await loadCustomers();
  } catch (error) {
    alert('Error al eliminar el cliente. Asegúrese de que no tenga órdenes asociadas.');
  }
}

// --- Handlers de Input ---
function onContactNameInput(event) {
  customerFormData.contactName = formatOnlyLetters(event, 50);
}
function onContactTitleInput(event) {
  customerFormData.contactTitle = formatOnlyLetters(event, 50);
}
function onCityInput(event) {
  customerFormData.city = formatOnlyLetters(event, 50);
}
function onRegionInput(event) {
  customerFormData.region = formatOnlyLetters(event, 50);
}
function onCountryInput(event) {
  customerFormData.country = formatOnlyLetters(event, 50);
}
function onPostalCodeInput(event) {
  customerFormData.postalCode = formatPostalCode(event);
}

onMounted(loadCustomers);
</script>

<template>
  <div class="admin-crud-container">
    <div class="admin-crud-header">
      <h2>Gestión de Clientes</h2>
      <input 
        type="text" 
        v-model="searchTerm" 
        @keyup.enter="handleSearch"
        placeholder="Buscar cliente..." 
        class="form-control" />
      <button @click="openCreateModal" class="btn btn-primary">
        <font-awesome-icon :icon="['fas', 'fa-plus']" />
        Crear Cliente
      </button>
    </div>

    <div v-if="isLoading" class="loading-indicator">Cargando clientes...</div>
    <div v-else-if="generalErrorMessage && !showModal" class="alert-error">{{ generalErrorMessage }}</div>
    
    <table v-else class="order-items-table">
      <thead>
        <tr>
          <!-- <th>ID</th> -->
          <th>Compañía</th>
          <th>Contacto</th>
          <th>Ciudad</th>
          <th>País</th>
          <th class="text-center">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="customer in customers" :key="customer.customerID">
          <!-- <td>{{ customer.customerID }}</td> -->
          <td>{{ customer.companyName }}</td>
          <td>{{ customer.contactName }}</td>
          <td>{{ customer.city }}</td>
          <td>{{ customer.country }}</td>
          <td class="text-center">
            <div class="action-button-group">
              <button @click="openEditModal(customer)" class="btn" title="Editar">
                <font-awesome-icon :icon="['fas', 'fa-pencil-alt']" />
              </button>
              <button @click="handleDelete(customer.customerID)" class="btn btn-danger" title="Eliminar">
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

    <!-- Modal para Crear/Editar Cliente -->
    <div v-if="showModal" class="modal-overlay" @mousedown.self="showModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ isEditMode ? 'Editar Cliente' : 'Crear Cliente' }}</h3>
          <button @click="showModal = false" class="modal-close-button" title="Cerrar">&times;</button>
        </div>
        
        <form @submit.prevent="handleSubmit">
          <div class="modal-body">
            <div v-if="modalErrorMessage" class="alert-error">{{ modalErrorMessage }}</div>
            
            <div class="modal-form">
              <!-- ID Oculto en Creación -->
              <input v-if="isEditMode" type="hidden" v-model="customerFormData.customerID" />

              <div class="form-group" :class="isEditMode ? 'form-group-full' : ''">
                <label for="contactName" class="form-label">Nombre Contacto</label>
                <input 
                  type="text" 
                  id="contactName" 
                  class="form-control" 
                  :class="{'is-invalid': validationErrors.contactName}"
                  :value="customerFormData.contactName"
                  @input="onContactNameInput"
                  maxlength="50"
                  required />
                <small v-if="validationErrors.contactName" class="form-error-message">{{ validationErrors.contactName }}</small>
              </div>

              <div class="form-group" :class="isEditMode ? 'form-group-full' : ''">
                <label for="companyName" class="form-label">Nombre Compañía</label>
                <input 
                  type="text" 
                  id="companyName" 
                  class="form-control" 
                  :class="{'is-invalid': validationErrors.companyName}"
                  v-model.trim="customerFormData.companyName" 
                  maxlength="50"
                  required />
                <small v-if="validationErrors.companyName" class="form-error-message">{{ validationErrors.companyName }}</small>
              </div>

              <div class="form-group">
                <label for="contactTitle" class="form-label">Título Contacto</label>
                <input 
                  type="text" 
                  id="contactTitle" 
                  class="form-control" 
                  :value="customerFormData.contactTitle"
                  @input="onContactTitleInput"
                  maxlength="50" />
              </div>
              
              <div class="form-group">
                <label for="phone" class="form-label">Teléfono (10 dígitos)</label>
                <input 
                  type="text" 
                  id="phone" 
                  class="form-control" 
                  :class="{'is-invalid': validationErrors.phone}"
                  v-model.trim="customerFormData.phone" 
                  maxlength="15" />
                <small v-if="validationErrors.phone" class="form-error-message">{{ validationErrors.phone }}</small>
              </div>

              <div class="form-group form-group-full">
                <label for="address" class="form-label">Dirección</label>
                <input type="text" id="address" class="form-control" v-model.trim="customerFormData.address" maxlength="50" />
              </div>

              <div class="form-group">
                <label for="city" class="form-label">Ciudad</label>
                <input 
                  type="text" 
                  id="city" 
                  class="form-control" 
                  :value="customerFormData.city"
                  @input="onCityInput" 
                  maxlength="50" />
              </div>
              <div class="form-group">
                <label for="region" class="form-label">Región</label>
                <input 
                  type="text" 
                  id="region" 
                  class="form-control" 
                  :value="customerFormData.region"
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
                  :value="customerFormData.postalCode"
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
                  :value="customerFormData.country"
                  @input="onCountryInput"
                  maxlength="50" />
              </div>

              <div class="form-group">
                <label for="fax" class="form-label">Fax</label>
                <input type="text" id="fax" class="form-control" v-model.trim="customerFormData.fax" maxlength="15" />
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
