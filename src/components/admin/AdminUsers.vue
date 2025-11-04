<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue';
import apiService from '@/services/apiService';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
// Importa las funciones de validación
import {
  useEcuadorianCedulaValidation,
  usePasswordStrength,
  formatOnlyLetters,
  formatOnlyInteger
} from '@/composables/useValidation.js';

const users = ref([]);
const isLoading = ref(true);
const generalErrorMessage = ref(''); // Para errores de carga de lista
const modalErrorMessage = ref(''); // Para errores dentro del modal

const showModal = ref(false);
const isEditMode = ref(false);
const selectedUser = ref(null);
const userFormData = reactive({
  email: '',
  nombre: '',
  apellido: '',
  cedula: '',
  password: '',
  confirmPassword: '',
});

// --- Lógica de Validación ---
const validationErrors = reactive({
  email: '',
  nombre: '',
  apellido: '',
  cedula: '',
  password: '',
  confirmPassword: '',
});

// Validadores reactivos
const isCedulaValid = useEcuadorianCedulaValidation(computed(() => userFormData.cedula));
const passwordStrength = usePasswordStrength(computed(() => userFormData.password));

// Limpia los errores cuando se escribe
watch(userFormData, () => {
  validationErrors.email = '';
  validationErrors.nombre = '';
  validationErrors.apellido = '';
  validationErrors.cedula = '';
  validationErrors.password = '';
  validationErrors.confirmPassword = '';
  modalErrorMessage.value = '';
}, { deep: true });


function validateForm() {
  let isValid = true;
  
  // Email
  const reEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!userFormData.email || !reEmail.test(userFormData.email)) {
    validationErrors.email = 'Debe ser un correo electrónico válido.';
    isValid = false;
  }

  // Nombre
  if (!userFormData.nombre) {
    validationErrors.nombre = 'El nombre es obligatorio.';
    isValid = false;
  }
  
  // Apellido
  if (!userFormData.apellido) {
    validationErrors.apellido = 'El apellido es obligatorio.';
    isValid = false;
  }
  
  // Cédula
  if (userFormData.cedula.length !== 10) {
    validationErrors.cedula = 'La cédula debe tener 10 dígitos.';
    isValid = false;
  } else if (!isCedulaValid.isValid.value) {
    validationErrors.cedula = 'La cédula no es válida.';
    isValid = false;
  }

  // Contraseña (solo en modo creación)
  if (!isEditMode.value) {
    if (!passwordStrength.value.isSecure) {
      validationErrors.password = 'La contraseña debe tener 6-8 caracteres y ser segura (mayús, minús, núm, especial).';
      isValid = false;
    }
    if (userFormData.password !== userFormData.confirmPassword) {
      validationErrors.confirmPassword = 'Las contraseñas no coinciden.';
      isValid = false;
    }
  }
  
  return isValid;
}
// --- Fin Lógica de Validación ---


async function loadUsers() {
  isLoading.value = true;
  generalErrorMessage.value = '';
  try {
    const response = await apiService.getUsers();
    users.value = response.data;
  } catch (error) {
    console.error("Error al cargar usuarios:", error);
    generalErrorMessage.value = 'No se pudo cargar la lista de usuarios.';
  } finally {
    isLoading.value = false;
  }
}

function openCreateModal() {
  isEditMode.value = false;
  selectedUser.value = null;
  modalErrorMessage.value = '';
  Object.assign(userFormData, {
    email: '', nombre: '', apellido: '', cedula: '', password: '', confirmPassword: ''
  });
  // Limpia errores de validación
  Object.keys(validationErrors).forEach(key => validationErrors[key] = '');
  showModal.value = true;
}

function openEditModal(user) {
  isEditMode.value = true;
  selectedUser.value = user;
  modalErrorMessage.value = '';
  Object.assign(userFormData, {
    email: user.email,
    nombre: user.nombre,
    apellido: user.apellido,
    cedula: user.cedula,
    password: '',
    confirmPassword: ''
  });
  Object.keys(validationErrors).forEach(key => validationErrors[key] = '');
  showModal.value = true;
}

async function handleSubmit() {
  modalErrorMessage.value = '';
  
  if (!validateForm()) {
    return; // Detiene si la validación del frontend falla
  }

  if (isEditMode.value) {
    // --- Lógica de Actualización ---
    try {
      const updateDto = {
        nombre: userFormData.nombre,
        apellido: userFormData.apellido,
        cedula: userFormData.cedula,
      };
      await apiService.updateUser(selectedUser.value.email, updateDto);
      showModal.value = false;
      await loadUsers(); // Recargar la lista
    } catch (error) {
      modalErrorMessage.value = error.response?.data?.message || 'Error al actualizar el usuario.';
    }
  } else {
    // --- Lógica de Creación ---
    try {
      const registerDto = { ...userFormData };
      await apiService.register(registerDto); // Usa el endpoint de registro
      showModal.value = false;
      await loadUsers(); // Recargar la lista
    } catch (error) {
      modalErrorMessage.value = error.response?.data?.message || 'Error al crear el usuario. Verifique si el email o cédula ya existen.';
    }
  }
}

async function handleUnlock(email) {
  if (!confirm(`¿Está seguro de que desea desbloquear al usuario ${email}?`)) return;
  
  try {
    await apiService.unlockUser(email);
    await loadUsers();
  } catch (error) {
    alert('Error al desbloquear el usuario.');
  }
}

async function handleDelete(email) {
  if (!confirm(`¿Está seguro de que desea ELIMINAR al usuario ${email}? Esta acción no se puede deshacer.`)) return;

  try {
    await apiService.deleteUser(email);
    await loadUsers();
  } catch (error) {
    alert('Error al eliminar el usuario.');
  }
}

function formatRoles(roles) {
  if (!roles || roles.length === 0) return 'N/A';
  return roles.join(', ');
}

// --- Handlers de Input para formato ---
function onCedulaInput(event) {
  userFormData.cedula = formatOnlyInteger(event, 10);
}
function onNameInput(event) {
  userFormData.nombre = formatOnlyLetters(event, 25);
}
function onApellidoInput(event) {
  userFormData.apellido = formatOnlyLetters(event, 25);
}


onMounted(loadUsers);
</script>

<template>
  <div class="admin-crud-container">
    <div class="admin-crud-header">
      <h2>Gestión de Usuarios</h2>
      <button @click="openCreateModal" class="btn btn-primary">
        <font-awesome-icon :icon="['fas', 'fa-plus']" />
        Crear Usuario
      </button>
    </div>

    <div v-if="isLoading" class="loading-indicator">Cargando usuarios...</div>
    <div v-else-if="generalErrorMessage && !showModal" class="alert-error">{{ generalErrorMessage }}</div>
    
    <table v-else class="order-items-table">
      <thead>
        <tr>
          <th>Email (Usuario)</th>
          <th>Nombre Completo</th>
          <th>Cédula</th>
          <th>Roles</th>
          <th class="text-center">Estado</th>
          <th class="text-center">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user.id">
          <td>{{ user.email }}</td>
          <td>{{ user.nombre }} {{ user.apellido }}</td>
          <td>{{ user.cedula }}</td>
          <td>{{ formatRoles(user.roles) }}</td>
          <td class="text-center">
            <span v-if="user.isLockedOut" class="badge badge-danger">Bloqueado</span>
            <span v-else class="badge badge-success">Activo</span>
          </td>
          <td class="text-center">
            <div class="action-button-group">
              <button 
                v-if="user.isLockedOut" 
                @click="handleUnlock(user.email)" 
                class="btn btn-warning" 
                title="Desbloquear">
                <font-awesome-icon :icon="['fas', 'fa-key']" />
              </button>
              <button @click="openEditModal(user)" class="btn" title="Editar">
                <font-awesome-icon :icon="['fas', 'fa-pencil-alt']" />
              </button>
              <button @click="handleDelete(user.email)" class="btn btn-danger" title="Eliminar">
                <font-awesome-icon :icon="['fas', 'fa-trash-alt']" />
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Modal para Crear/Editar Usuario -->
    <div v-if="showModal" class="modal-overlay" @mousedown.self="showModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ isEditMode ? 'Editar Usuario' : 'Crear Usuario' }}</h3>
          <button @click="showModal = false" class="modal-close-button" title="Cerrar">&times;</button>
        </div>
        
        <form @submit.prevent="handleSubmit">
          <div class="modal-body">
            <div v-if="modalErrorMessage" class="alert-error">{{ modalErrorMessage }}</div>
            
            <div class="modal-form">
              <div class="form-group">
                <label for="email" class="form-label">Correo Electrónico</label>
                <input 
                  type="email" 
                  id="email" 
                  class="form-control"
                  :class="{'is-invalid': validationErrors.email}"
                  v-model.trim="userFormData.email"
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
                  :value="userFormData.cedula"
                  @input="onCedulaInput"
                  maxlength="10"
                  required />
                <small v-if="validationErrors.cedula" class="form-error-message">{{ validationErrors.cedula }}</small>
              </div>
              <div class="form-group">
                <label for="nombre" class="form-label">Nombre</label>
                <input 
                  type="text" 
                  id="nombre" 
                  class="form-control" 
                  :class="{'is-invalid': validationErrors.nombre}"
                  :value="userFormData.nombre"
                  @input="onNameInput"
                  maxlength="25"
                  required />
                <small v-if="validationErrors.nombre" class="form-error-message">{{ validationErrors.nombre }}</small>
              </div>
              <div class="form-group">
                <label for="apellido" class="form-label">Apellido</label>
                <input 
                  type="text" 
                  id="apellido" 
                  class="form-control" 
                  :class="{'is-invalid': validationErrors.apellido}"
                  :value="userFormData.apellido"
                  @input="onApellidoInput"
                  maxlength="25"
                  required />
                <small v-if="validationErrors.apellido" class="form-error-message">{{ validationErrors.apellido }}</small>
              </div>

              <!-- Campos de contraseña (solo para creación) -->
              <template v-if="!isEditMode">
                <div class="form-group">
                  <label for="password" class="form-label">Contraseña</label>
                  <input 
                    type="password" 
                    id="password" 
                    class="form-control" 
                    :class="{'is-invalid': validationErrors.password}"
                    v-model="userFormData.password"
                    maxlength="8"
                    required />
                  <div class="password-strength-meter">
                    <div 
                      class="strength-bar"
                      :class="`strength-${passwordStrength.color}`"
                      :style="{ width: (passwordStrength.score * 20) + '%' }">
                    </div>
                  </div>
                  <div class="strength-label" :class="`label-${passwordStrength.color}`">
                    {{ passwordStrength.label }}
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
                    v-model="userFormData.confirmPassword"
                    maxlength="8"
                    required />
                  <small v-if="validationErrors.confirmPassword" class="form-error-message">{{ validationErrors.confirmPassword }}</small>
                </div>
              </template>
            </div>
          </div>

          <div class="modal-footer">
            <div class="modal-pagination"> <!-- Reutilizamos la clase para alinear -->
              <span class="pagination-info"></span> <!-- Espaciador -->
              <div class="pagination-controls">
                <button type="button" class="btn" @click="showModal = false">Cancelar</button>
                <button 
                  type="submit" 
                  class="btn btn-primary"
                  :disabled="!isEditMode && !passwordStrength.isSecure">
                  <font-awesome-icon :icon="['fas', 'fa-save']" />
                  {{ isEditMode ? 'Guardar Cambios' : 'Crear Usuario' }}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
