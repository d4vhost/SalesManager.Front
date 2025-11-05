<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue';
import apiService from '@/services/apiService';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
// Importa las funciones de validación
import {
  useEcuadorianCedulaValidation,
  usePasswordStrength, // AHORA ES CRÍTICO
  formatOnlyLetters,
  formatOnlyInteger
} from '@/composables/useValidation.js';

// Estado de la lista
const employees = ref([]);
const isLoading = ref(true);
const generalErrorMessage = ref(''); // Para errores de carga de lista
const modalErrorMessage = ref(''); // Para errores dentro del modal
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
const selectedEmployee = ref(null);
const employeeFormData = reactive({
  // Campos del Employee
  firstName: '',
  lastName: '',
  title: '',
  phone: '',
  address: '',
  city: '',
  country: '',
  // Campos del ApplicationUser
  cedula: '',
  email: '',
  password: '',
  confirmPassword: '',
});

// --- Lógica de Validación ---
const validationErrors = reactive({
  email: '',
  firstName: '',
  lastName: '',
  cedula: '',
  password: '',
  confirmPassword: '',
});

// Validadores reactivos
const isCedulaValid = useEcuadorianCedulaValidation(computed(() => employeeFormData.cedula));
const passwordStrength = usePasswordStrength(computed(() => employeeFormData.password));

// Limpia los errores cuando se escribe
watch(employeeFormData, () => {
  Object.keys(validationErrors).forEach(key => validationErrors[key] = '');
  modalErrorMessage.value = '';
}, { deep: true });


// --- INICIO DE MODIFICACIÓN: validateForm ---
function validateForm() {
  let isValid = true;
  // Limpiar errores previos
  Object.keys(validationErrors).forEach(key => validationErrors[key] = '');
  
  // Campos que se validan siempre (Crear y Editar)
  if (!employeeFormData.firstName) {
    validationErrors.firstName = 'El nombre es obligatorio.';
    isValid = false;
  }
  
  if (!employeeFormData.lastName) {
    validationErrors.lastName = 'El apellido es obligatorio.';
    isValid = false;
  }
  
  // Cédula
  if (employeeFormData.cedula.length !== 10) {
    validationErrors.cedula = 'La cédula debe tener 10 dígitos.';
    isValid = false;
  } else if (!isCedulaValid.isValid.value) {
    validationErrors.cedula = 'La cédula no es válida.';
    isValid = false;
  }

  // Validaciones solo en modo creación
  if (!isEditMode.value) {
    
    // Validación de Email (solo que no esté vacío)
    if (!employeeFormData.email) {
      validationErrors.email = 'El correo electrónico es obligatorio.';
      isValid = false;
    }
    
    // --- Validación de Contraseña (Req 18) ---
    if (!passwordStrength.value.isSecure) {
        
        validationErrors.password = 'La clave no cumple los requisitos.';
        isValid = false;

        // Mensajes de ayuda (basados en los 'checks' que añadimos)
        const checks = passwordStrength.value.strength.checks; // <--- CORREGIDO AQUÍ
        let errorDetails = [];
        if (!checks.lengthMin) errorDetails.push('Mínimo 4 caracteres.');
        if (!checks.lengthMax) errorDetails.push('Máximo 10 caracteres.');
        if (!checks.lowercase) errorDetails.push('Una minúscula.');
        if (!checks.uppercase) errorDetails.push('Una mayúscula.');
        if (!checks.number) errorDetails.push('Un número.');
        if (!checks.special) errorDetails.push('Un caracter especial.');

        // Sobrescribir el mensaje con detalles
        validationErrors.password = `La clave debe cumplir: ${errorDetails.join(' ')}`;

    } else if (employeeFormData.password !== employeeFormData.confirmPassword) {
      validationErrors.confirmPassword = 'Las contraseñas no coinciden.';
      isValid = false;
    }
  }
  
  return isValid;
}
// --- FIN DE MODIFICACIÓN ---


async function loadEmployees() {
  isLoading.value = true;
  generalErrorMessage.value = '';
  try {
    const response = await apiService.getEmployees(
      searchTerm.value,
      pagination.pageNumber,
      pagination.pageSize
    );
    employees.value = response.data.items;
    pagination.totalCount = response.data.totalCount;
    pagination.totalPages = response.data.totalPages;
  } catch (error) {
    console.error("Error al cargar empleados:", error);
    generalErrorMessage.value = 'No se pudo cargar la lista de empleados.';
  } finally {
    isLoading.value = false;
  }
}

function handleSearch() {
  pagination.pageNumber = 1;
  loadEmployees();
}

function changePage(newPage) {
  if (newPage >= 1 && newPage <= pagination.totalPages) {
    pagination.pageNumber = newPage;
    loadEmployees();
  }
}

function resetForm() {
  Object.assign(employeeFormData, {
    firstName: '', lastName: '', title: '', phone: '', address: '',
    city: '', country: '', cedula: '', email: '', password: '', confirmPassword: ''
  });
  Object.keys(validationErrors).forEach(key => validationErrors[key] = '');
}

function openCreateModal() {
  isEditMode.value = false;
  selectedEmployee.value = null;
  modalErrorMessage.value = '';
  resetForm();
  showModal.value = true;
}

async function openEditModal(employee) {
  isEditMode.value = true;
  selectedEmployee.value = employee;
  modalErrorMessage.value = '';
  
  try {
    const empResponse = await apiService.getEmployee(employee.employeeID);
    
    const userResponse = await apiService.getUsers(); 
    const userInfo = userResponse.data.find(u => u.email === employee.email);

    Object.assign(employeeFormData, {
      firstName: empResponse.data.firstName,
      lastName: empResponse.data.lastName,
      title: empResponse.data.title,
      phone: empResponse.data.homePhone,
      address: empResponse.data.address,
      city: empResponse.data.city,
      country: empResponse.data.country,
      cedula: userInfo ? userInfo.cedula : '', // Cédula del usuario
      email: employee.email, // Email (no editable)
      password: '',
      confirmPassword: ''
    });
    
    Object.keys(validationErrors).forEach(key => validationErrors[key] = '');
    showModal.value = true;
  } catch (error) {
    alert("Error al cargar datos para edición.");
  }
}

async function handleSubmit() {
  modalErrorMessage.value = '';
  
  // 1. Validar el formulario
  if (!validateForm()) {
    modalErrorMessage.value = "Por favor, corrija los errores en el formulario.";
    return; // Detiene si la validación del frontend falla
  }

  try {
    if (isEditMode.value) {
      // --- Lógica de Actualización ---
      const updateDto = {
        firstName: employeeFormData.firstName,
        lastName: employeeFormData.lastName,
        title: employeeFormData.title,
        phone: employeeFormData.phone,
        address: employeeFormData.address,
        city: employeeFormData.city,
        country: employeeFormData.country,
      };
      // 1. Actualiza el Empleado
      await apiService.updateEmployee(selectedEmployee.value.employeeID, updateDto);
      
      // 2. Actualiza la cédula (y nombre/apellido) en el ApplicationUser
      await apiService.updateUser(employeeFormData.email, {
        nombre: employeeFormData.firstName,
        apellido: employeeFormData.lastName,
        cedula: employeeFormData.cedula
      });

    } else {
      // --- Lógica de Creación ---
      // El DTO debe coincidir con CreateEmployeeRequestDto.cs del backend
      const createDto = {
        firstName: employeeFormData.firstName,
        lastName: employeeFormData.lastName,
        cedula: employeeFormData.cedula,
        title: employeeFormData.title,
        phone: employeeFormData.phone,
        address: employeeFormData.address,
        city: employeeFormData.city,
        country: employeeFormData.country,
        email: employeeFormData.email,
        password: employeeFormData.password,
        // No enviamos confirmPassword, el backend no lo espera
      };
      
      await apiService.createEmployee(createDto);
    }
    
    showModal.value = false;
    await loadEmployees(); // Recargar la lista
    
  } catch (error) {
    // Captura el error de la API (ej: "Email ya existe")
    modalErrorMessage.value = error.response?.data?.message || 'Error al guardar el empleado. Verifique los datos.';
    console.error("Error en handleSubmit:", error.response?.data || error.message);
  }
}

async function handleUnlock(email) {
  if (!confirm(`¿Está seguro de que desea desbloquear al usuario ${email}?`)) return;
  
  try {
    await apiService.unlockUser(email);
    await loadEmployees(); // Recarga la lista para mostrar el estado actualizado
  } catch (error) {
    alert('Error al desbloquear el empleado.');
  }
}

async function handleDelete(employeeId, email) {
  if (!confirm(`¿Está seguro de que desea ELIMINAR al empleado ${email}? Esta acción también eliminará su login.`)) return;

  try {
    await apiService.deleteEmployee(employeeId);
    await loadEmployees();
  } catch (error) {
    alert(error.response?.data?.message || 'Error al eliminar el empleado.');
  }
}

// --- Handlers de Input para formato ---
function onCedulaInput(event) {
  employeeFormData.cedula = formatOnlyInteger(event, 10);
}
function onFirstNameInput(event) {
  employeeFormData.firstName = formatOnlyLetters(event, 25);
}
function onLastNameInput(event) {
  employeeFormData.lastName = formatOnlyLetters(event, 25);
}


onMounted(loadEmployees);
</script>

<template>
  <div class="admin-crud-container">
    <div class="admin-crud-header">
      <h2>Gestión de Empleados (Ventas)</h2>
      <input 
        type="text" 
        v-model="searchTerm" 
        @keyup.enter="handleSearch"
        placeholder="Buscar por nombre, email, título..." 
        class="form-control" />
      <button @click="openCreateModal" class="btn btn-primary">
        <font-awesome-icon :icon="['fas', 'fa-plus']" />
        Crear Empleado
      </button>
    </div>

    <div v-if="isLoading" class="loading-indicator">Cargando empleados...</div>
    <div v-else-if="generalErrorMessage && !showModal" class="alert-error">{{ generalErrorMessage }}</div>
    
    <table v-else class="order-items-table">
      <thead>
        <tr>
          <th>Nombre Completo</th>
          <th>Cargo</th>
          <th>Email (Login)</th>
          <th>Teléfono</th>
          <th class="text-center">Estado (Login)</th>
          <th class="text-center">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="emp in employees" :key="emp.employeeID">
          <td>{{ emp.fullName }}</td>
          <td>{{ emp.title || 'N/A' }}</td>
          <td>{{ emp.email || 'Sin Login' }}</td>
          <td>{{ emp.phone || 'N/A' }}</td>
          <td class="text-center">
            <span v-if="emp.isLockedOut" class="badge badge-danger">Bloqueado</span>
            <span v-else class="badge badge-success">Activo</span>
          </td>
          <td class="text-center">
            <div class="action-button-group">
              <button 
                v-if="emp.isLockedOut" 
                @click="handleUnlock(emp.email)" 
                class="btn btn-warning" 
                title="Desbloquear">
                <font-awesome-icon :icon="['fas', 'fa-key']" />
              </button>
              <button @click="openEditModal(emp)" class="btn" title="Editar">
                <font-awesome-icon :icon="['fas', 'fa-pencil-alt']" />
              </button>
              <button @click="handleDelete(emp.employeeID, emp.email)" class="btn btn-danger" title="Eliminar">
                <font-awesome-icon :icon="['fas', 'fa-trash-alt']" />
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
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


    <div v-if="showModal" class="modal-overlay" @mousedown.self="showModal = false">
      
      <div class="modal-content" style="max-width: 1000px;">
      <div class="modal-header">
          <h3>{{ isEditMode ? 'Editar Empleado' : 'Crear Empleado' }}</h3>
          <button @click="showModal = false" class="modal-close-button" title="Cerrar">&times;</button>
        </div>
        
        <form @submit.prevent="handleSubmit">
          <div class="modal-body">
            <div v-if="modalErrorMessage" class="alert-error">{{ modalErrorMessage }}</div>
            
            <div class="modal-form">
              <div class="form-group form-group-full">
                <h5 style="color: var(--color-primary); border-bottom: 1px solid var(--color-border); padding-bottom: 0.5rem; margin-bottom: 1rem;">Datos de Acceso (Login)</h5>
              </div>

              <div class="form-group">
                <label for="email" class="form-label">Correo Electrónico (Login)</label>
                <input 
                  type="email" 
                  id="email" 
                  class="form-control"
                  :class="{'is-invalid': validationErrors.email}"
                  v-model.trim="employeeFormData.email"
                  :disabled="isEditMode"
                  required />
                <small v-if="validationErrors.email" class="form-error-message">{{ validationErrors.email }}</small>
              </div>
              <div class="form-group">
                <label for="cedula" class="form-label">Cédula</label>
                <input 
                  type="text" 
                  id="cedula" 
                  class="form-control" 
                  :class="{'is-invalid': validationErrors.cedula}"
                  :value="employeeFormData.cedula"
                  @input="onCedulaInput"
                  maxlength="10"
                  required />
                <small v-if="validationErrors.cedula" class="form-error-message">{{ validationErrors.cedula }}</small>
              </div>


              <template v-if="!isEditMode">
                <div class="form-group">
                  <label for="password" class="form-label">Contraseña (Mín 4, Max 10)</label>
                  <input 
                    type="password" 
                    id="password" 
                    class="form-control" 
                    :class="{'is-invalid': validationErrors.password}"
                    v-model="employeeFormData.password"
                    maxlength="10" 
                    required />
                  <div class="password-strength-meter">
                    <div 
                      class="strength-bar"
                      :class="`strength-${passwordStrength.strength.color}`"
                      :style="{ width: (passwordStrength.strength.score * 20) + '%' }">
                    </div>
                  </div>
                  <div class="strength-label" :class="`label-${passwordStrength.strength.color}`">
                    {{ passwordStrength.strength.label }}
                  </div>
                  
                  <div class="password-requirements">
                    <span :class="{'completed': passwordStrength.strength.checks.lengthMin && passwordStrength.strength.checks.lengthMax}">4-10 Caracteres</span>
                    <span :class="{'completed': passwordStrength.strength.checks.uppercase}">1 Mayúscula</span>
                    <span :class="{'completed': passwordStrength.strength.checks.lowercase}">1 Minúscula</span>
                    <span :class="{'completed': passwordStrength.strength.checks.number}">1 Número</span>
                    <span :class="{'completed': passwordStrength.strength.checks.special}">1 Especial</span>
                  </div>
                  
                  <small v-if="validationErrors.password" class="form-error-message">{{ validationErrors.password }}</small>
                </div>
                <div class="form-group">
                  <label for="confirmPassword" class="form-label">Confirmar Contraseña</label>
                  <input 
                    type="password" 
                    id="confirmPassword" 
                    class="form-control" 
                    :class="{'is-invalid': validationErrors.confirmPassword}"
                    v-model="employeeFormData.confirmPassword"
                    maxlength="10" 
                    required />
                  <small v-if="validationErrors.confirmPassword" class="form-error-message">{{ validationErrors.confirmPassword }}</small>
                </div>
              </template>
              
              <hr class="form-group-full" style="border: 0; border-top: 1px solid var(--color-border); margin: 0.5rem 0;">
              <div class="form-group form-group-full">
                <h5 style="color: var(--color-primary); border-bottom: 1px solid var(--color-border); padding-bottom: 0.5rem; margin-bottom: 1rem;">Datos Personales (Empleado)</h5>
              </div>
              <div class="form-group">
                <label for="firstName" class="form-label">Nombre</label>
                <input 
                  type="text" 
                  id="firstName" 
                  class="form-control" 
                  :class="{'is-invalid': validationErrors.firstName}"
                  :value="employeeFormData.firstName"
                  @input="onFirstNameInput"
                  maxlength="25"
                  required />
                <small v-if="validationErrors.firstName" class="form-error-message">{{ validationErrors.firstName }}</small>
              </div>
              <div class="form-group">
                <label for="lastName" class="form-label">Apellido</label>
                <input 
                  type="text" 
                  id="lastName" 
                  class="form-control" 
                  :class="{'is-invalid': validationErrors.lastName}"
                  :value="employeeFormData.lastName"
                  @input="onLastNameInput"
                  maxlength="25"
                  required />
                <small v-if="validationErrors.lastName" class="form-error-message">{{ validationErrors.lastName }}</small>
              </div>
              <div class="form-group">
                <label for="title" class="form-label">Cargo (Ej: Vendedor)</label>
                <input type="text" id="title" class="form-control" v-model.trim="employeeFormData.title" maxlength="50" />
              </div>
              <div class="form-group">
                <label for="phone" class="form-label">Teléfono</label>
                <input type="text" id="phone" class="form-control" v-model.trim="employeeFormData.phone" />
              </div>
              <div class="form-group form-group-full">
                <label for="address" class="form-label">Dirección</label>
                <input type="text" id="address" class="form-control" v-model.trim="employeeFormData.address" />
              </div>
              <div class="form-group">
                <label for="city" class="form-label">Ciudad</label>
                <input type="text" id="city" class="form-control" v-model.trim="employeeFormData.city" />
              </div>
              <div class="form-group">
                <label for="country" class="form-label">País</label>
                <input type="text" id="country" class="form-control" v-model.trim="employeeFormData.country" />
              </div>

            </div>
          </div>

          <div class="modal-footer">
            <div class="modal-pagination">
              <span class="pagination-info"></span>
              <div class="pagination-controls">
                <button type="button" class="btn" @click="showModal = false">Cancelar</button>
                
                <button 
                  type="submit" 
                  class="btn btn-primary"
                  :disabled="!isEditMode && !passwordStrength.strength.isSecure"
                  >
                  <font-awesome-icon :icon="['fas', 'fa-save']" />
                  {{ isEditMode ? 'Guardar Cambios' : 'Crear Empleado' }}
                </button>
                </div>
            </div>
          </div>
        </form>
      </div>
    </div>
    </div>
</template>