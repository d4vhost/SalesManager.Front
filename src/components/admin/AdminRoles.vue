<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue';
import apiService from '@/services/apiService';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
// Importa las funciones de validación (Req 18)
import { usePasswordStrength } from '@/composables/useValidation.js';

// State for User List
const users = ref([]);
const isLoading = ref(true);
const generalErrorMessage = ref('');
const generalSuccessMessage = ref('');

// State for Create Role Section
const newRoleName = ref('');
const allRoles = ref([]); // For modals

// State for Modals
const showModal = ref(false);
const modalMode = ref(''); // 'changeRole', 'changePassword', 'changeEmail'
const selectedUser = ref(null);
const modalErrorMessage = ref('');

// Modal Form Data
const roleModalData = reactive({
  selectedRoles: []
});
const passwordModalData = reactive({
  newPassword: '',
  confirmPassword: ''
});
const emailModalData = reactive({
  newEmail: ''
});

// --- Password Validation (Req 18) ---
const passwordStrength = usePasswordStrength(computed(() => passwordModalData.newPassword));
const validationErrors = reactive({
  newPassword: '',
  confirmPassword: '',
  newEmail: ''
});

// --- Main Data Loading ---
async function loadAllData() {
  isLoading.value = true;
  generalErrorMessage.value = '';
  try {
    const [usersResponse, rolesResponse] = await Promise.all([
      apiService.getUsers(),
      apiService.getRoles()
    ]);
    users.value = usersResponse.data;
    allRoles.value = rolesResponse.data;
  } catch (error) {
    generalErrorMessage.value = 'Failed to load user or role data.';
  } finally {
    isLoading.value = false;
  }
}

// --- Create Role Logic ---
async function handleCreateRole() {
  generalErrorMessage.value = '';
  generalSuccessMessage.value = '';
  if (!newRoleName.value) {
    generalErrorMessage.value = 'Role name cannot be empty.';
    return;
  }
  try {
    await apiService.createRole(newRoleName.value);
    generalSuccessMessage.value = `Role '${newRoleName.value}' created successfully.`;
    newRoleName.value = '';
    await loadAllData(); // Refresh roles list
  } catch (error) {
    generalErrorMessage.value = error.response?.data?.message || 'Failed to create role.';
  }
}

// --- Modal Handling ---
function openModal(mode, user) {
  showModal.value = true;
  modalMode.value = mode;
  selectedUser.value = user;
  modalErrorMessage.value = '';
  
  // Reset validation
  Object.keys(validationErrors).forEach(key => validationErrors[key] = '');

  // Initialize modal data
  if (mode === 'changeRole') {
    // Pre-select the user's current roles
    roleModalData.selectedRoles = [...user.roles];
  } else if (mode === 'changePassword') {
    passwordModalData.newPassword = '';
    passwordModalData.confirmPassword = '';
  } else if (mode === 'changeEmail') {
    emailModalData.newEmail = user.email; // Pre-fill with current email
  }
}

function closeModal() {
  showModal.value = false;
  selectedUser.value = null;
  modalMode.value = '';
}

// --- Form Submission Logic ---
async function handleSubmit() {
  modalErrorMessage.value = '';
  
  try {
    if (modalMode.value === 'changeRole') {
      const dto = { roles: roleModalData.selectedRoles };
      await apiService.setUserRoles(selectedUser.value.email, dto);
    } 
    else if (modalMode.value === 'changePassword') {
      // Validate password (Req 18)
      if (!passwordStrength.value.strength.value.isSecure) {
        validationErrors.newPassword = 'Password does not meet requirements.';
        return;
      }
      if (passwordModalData.newPassword !== passwordModalData.confirmPassword) {
        validationErrors.confirmPassword = 'Passwords do not match.';
        return;
      }
      const dto = { newPassword: passwordModalData.newPassword };
      await apiService.adminChangePassword(selectedUser.value.email, dto);
    } 
    else if (modalMode.value === 'changeEmail') {
      // Validate email format
      const reEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailModalData.newEmail || !reEmail.test(emailModalData.newEmail)) {
        validationErrors.newEmail = 'Must be a valid email address.';
        return;
      }
      const dto = { newEmail: emailModalData.newEmail };
      await apiService.adminChangeEmail(selectedUser.value.email, dto);
    }
    
    closeModal();
    await loadAllData(); // Refresh user list
    generalSuccessMessage.value = "User account updated successfully!";

  } catch (error) {
    modalErrorMessage.value = error.response?.data?.message || 'An error occurred during the update.';
  }
}

// --- User List Actions ---
async function handleUnlock(email) {
  generalErrorMessage.value = '';
  generalSuccessMessage.value = '';
  if (!confirm(`Are you sure you want to unlock user ${email}?`)) return;
  try {
    await apiService.unlockUser(email);
    await loadAllData(); // Refresh list
    generalSuccessMessage.value = `User ${email} unlocked.`;
  } catch (error) {
    generalErrorMessage.value = 'Error unlocking user.';
  }
}

function formatRoles(roles) {
  if (!roles || roles.length === 0) return 'N/A';
  return roles.map(r => r.charAt(0).toUpperCase() + r.slice(1)).join(', ');
}

onMounted(loadAllData);

</script>

<template>
  <div class="admin-crud-container">
    
    <div v-if="generalSuccessMessage" class="success-message">{{ generalSuccessMessage }}</div>
    <div v-if="generalErrorMessage" class="alert-error">{{ generalErrorMessage }}</div>

    <section class="pos-section" style="margin-bottom: 1.5rem;">
      <h2>Create New Role</h2>
      <form @submit.prevent="handleCreateRole" class="modal-form" style="grid-template-columns: 1fr auto; gap: 1rem; align-items: flex-end;">
        <div class="form-group" style="margin-bottom: 0;">
          <label for="new-role" class="form-label">Role Name</label>
          <input 
            type="text" 
            id="new-role" 
            class="form-control" 
            v-model.trim="newRoleName"
            placeholder="NewRoleName (e.g., Manager, Auditor)"
            required />
        </div>
        <button type="submit" class="btn btn-primary" style="margin-bottom: 0;">
          <font-awesome-icon :icon="['fas', 'fa-plus']" />
          Create Role
        </button>
      </form>
    </section>

    <section class="pos-section">
      <div class="admin-crud-header" style="margin-bottom: 0;">
        <h2>Manage User Accounts</h2>
      </div>

      <div v-if="isLoading" class="loading-indicator">Loading users...</div>
      
      <table v-else class="order-items-table" style="margin-top: 1.5rem;">
        <thead>
          <tr>
            <th>Email (Username)</th>
            <th>Full Name</th>
            <th>Roles</th>
            <th class="text-center">Status</th>
            <th class="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td style="font-weight: 600;">{{ user.email }}</td>
            <td>{{ user.nombre }} {{ user.apellido }}</td>
            <td>
              <span v-for="role in user.roles" :key="role" class="badge" :class="role === 'Admin' ? 'badge-danger' : 'badge-secondary'">
                {{ role }}
              </span>
            </td>
            <td class="text-center">
              <span v-if="user.isLockedOut" class="badge badge-danger">Locked</span>
              <span v-else class="badge badge-success">Active</span>
            </td>
            <td class="text-center">
              <div class="action-button-group">
                <button @click="openModal('changeRole', user)" class="btn" title="Change Roles">
                  <font-awesome-icon :icon="['fas', 'fa-user-tag']" />
                </button>
                <button @click="openModal('changePassword', user)" class="btn" title="Change Password">
                  <font-awesome-icon :icon="['fas', 'fa-key']" />
                </button>
                <button @click="openModal('changeEmail', user)" class="btn" title="Change Email">
                  <font-awesome-icon :icon="['fas', 'fa-envelope']" />
                </button>
                <button 
                  v-if="user.isLockedOut" 
                  @click="handleUnlock(user.email)" 
                  class="btn btn-warning" 
                  title="Unlock">
                  <font-awesome-icon :icon="['fas', 'fa-key']" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <div v-if="showModal" class="modal-overlay" @mousedown.self="closeModal">
      <div class="modal-content" style="max-width: 600px;">
        <div class="modal-header">
          <h3 v-if="modalMode === 'changeRole'">Change Roles for: {{ selectedUser.email }}</h3>
          <h3 v-if="modalMode === 'changePassword'">Change Password for: {{ selectedUser.email }}</h3>
          <h3 v-if="modalMode === 'changeEmail'">Change Email for: {{ selectedUser.email }}</h3>
          <button @click="closeModal" class="modal-close-button" title="Close">&times;</button>
        </div>
        
        <form @submit.prevent="handleSubmit">
          <div class="modal-body">
            <div v-if="modalErrorMessage" class="alert-error">{{ modalErrorMessage }}</div>

            <div v-if="modalMode === 'changeRole'" class="form-group">
              <label class="form-label">Select roles:</label>
              <div class="role-checkbox-group">
                <div v-for="role in allRoles" :key="role" class="checkbox-item">
                  <input 
                    type="checkbox" 
                    :id="`role-${role}`" 
                    :value="role" 
                    v-model="roleModalData.selectedRoles" />
                  <label :for="`role-${role}`">{{ role }}</label>
                </div>
              </div>
            </div>
            
            <div v-if="modalMode === 'changePassword'">
              <div class="form-group">
                <label for="newPassword" class="form-label">New Password (Min 4, Max 10)</label>
                <input 
                  type="password" 
                  id="newPassword" 
                  class="form-control" 
                  :class="{
                    'is-invalid': validationErrors.newPassword || (passwordModalData.newPassword && !passwordStrength.strength.value.isSecure),
                    'is-valid': passwordModalData.newPassword && passwordStrength.strength.value.isSecure
                  }"
                  v-model="passwordModalData.newPassword"
                  maxlength="10" 
                  required />
                
                <div class="password-requirements-compact">
                  <span :class="{'completed': passwordStrength.strength.value.checks.lengthMin && passwordStrength.strength.value.checks.lengthMax}">4-10 Chars</span>
                  <span :class="{'completed': passwordStrength.strength.value.checks.uppercase}">1 Uppercase</span>
                  <span :class="{'completed': passwordStrength.strength.value.checks.lowercase}">1 Lowercase</span>
                  <span :class="{'completed': passwordStrength.strength.value.checks.number}">1 Number</span>
                  <span :class="{'completed': passwordStrength.strength.value.checks.special}">1 Special</span>
                </div>
                <small v-if="validationErrors.newPassword" class="form-error-message">{{ validationErrors.newPassword }}</small>
              </div>
              <div class="form-group">
                <label for="confirmPassword" class="form-label">Confirm New Password</label>
                <input 
                  type="password" 
                  id="confirmPassword" 
                  class="form-control" 
                  :class="{
                    'is-invalid': validationErrors.confirmPassword || (passwordModalData.confirmPassword && passwordModalData.newPassword !== passwordModalData.confirmPassword),
                    'is-valid': passwordModalData.confirmPassword && passwordModalData.newPassword === passwordModalData.confirmPassword && passwordStrength.strength.value.isSecure
                  }"
                  v-model="passwordModalData.confirmPassword"
                  maxlength="10" 
                  required />
                <small v-if="validationErrors.confirmPassword" class="form-error-message">{{ validationErrors.confirmPassword }}</small>
              </div>
            </div>

            <div v-if="modalMode === 'changeEmail'" class="form-group">
              <label for="newEmail" class="form-label">New Email Address</label>
              <input 
                type="email" 
                id="newEmail" 
                class="form-control"
                :class="{'is-invalid': validationErrors.newEmail}"
                v-model.trim="emailModalData.newEmail" 
                required />
              <small v-if="validationErrors.newEmail" class="form-error-message">{{ validationErrors.newEmail }}</small>
            </div>

          </div>

          <div class="modal-footer">
            <div class="modal-pagination">
              <span class="pagination-info"></span>
              <div class="pagination-controls">
                <button type="button" class="btn" @click="closeModal">Cancel</button>
                <button 
                  type="submit" 
                  class="btn btn-primary"
                  :disabled="modalMode === 'changePassword' && !passwordStrength.strength.value.isSecure">
                  <font-awesome-icon :icon="['fas', 'fa-save']" />
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>

<style scoped>
/* Scoped styles for this component */
.pos-section {
  background-color: var(--color-surface);
  padding: 1.5rem;
  border: 1px solid var(--color-border-light);
  box-shadow: var(--shadow-sm);
}
.pos-section h2 {
  margin-top: 0;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--color-border);
}
.success-message {
    padding: 1rem;
    background-color: var(--color-primary-light);
    border: 1px solid var(--color-primary);
    color: var(--color-primary-dark);
    font-weight: 500;
    margin-bottom: 1.5rem;
}
.badge {
    margin-right: 0.25rem;
}
.badge.badge-secondary {
    color: #333;
    background-color: #e9ecef;
}
.role-checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}
.checkbox-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.checkbox-item input[type="checkbox"] {
  width: auto;
  height: auto;
}
.checkbox-item label {
  font-weight: 500;
  margin: 0;
}
</style>