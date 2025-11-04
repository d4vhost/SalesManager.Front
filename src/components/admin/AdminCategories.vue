<script setup>
import { ref, reactive, onMounted } from 'vue';
import apiService from '@/services/apiService';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

// Estado de la lista
const categories = ref([]);
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
const selectedCategory = ref(null);
const categoryFormData = reactive({
  categoryID: 0,
  categoryName: '',
  description: '',
});

async function loadCategories() {
  isLoading.value = true;
  errorMessage.value = '';
  try {
    const response = await apiService.getCategories(
      searchTerm.value, 
      pagination.pageNumber, 
      pagination.pageSize
    );
    categories.value = response.data.items;
    pagination.totalCount = response.data.totalCount;
    pagination.totalPages = response.data.totalPages;
  } catch (error) {
    errorMessage.value = 'No se pudo cargar la lista de categorías.';
  } finally {
    isLoading.value = false;
  }
}

function handleSearch() {
  pagination.pageNumber = 1;
  loadCategories();
}

function changePage(newPage) {
  if (newPage >= 1 && newPage <= pagination.totalPages) {
    pagination.pageNumber = newPage;
    loadCategories();
  }
}

function resetForm() {
  Object.assign(categoryFormData, {
    categoryID: 0,
    categoryName: '',
    description: '',
  });
}

function openCreateModal() {
  isEditMode.value = false;
  selectedCategory.value = null;
  resetForm();
  showModal.value = true;
}

async function openEditModal(category) {
  isEditMode.value = true;
  selectedCategory.value = category;
  
  try {
    const response = await apiService.getCategory(category.categoryID);
    Object.assign(categoryFormData, response.data);
    showModal.value = true;
  } catch(error) {
    alert("Error al cargar los detalles de la categoría.");
  }
}

async function handleSubmit() {
  errorMessage.value = '';
  const payload = { ...categoryFormData };

  try {
    if (isEditMode.value) {
      await apiService.updateCategory(payload.categoryID, payload);
    } else {
      await apiService.createCategory(payload);
    }
    showModal.value = false;
    await loadCategories();
  } catch (error) {
     errorMessage.value = error.response?.data?.message || 'Error al guardar la categoría.';
  }
}

async function handleDelete(id) {
  if (!confirm(`¿Está seguro de que desea ELIMINAR la categoría ID ${id}? (Puede fallar si está en uso por productos)`)) return;

  try {
    await apiService.deleteCategory(id);
    await loadCategories();
  } catch (error) {
    alert('Error al eliminar la categoría. Asegúrese de que no esté siendo usada por ningún producto.');
  }
}

onMounted(loadCategories);
</script>

<template>
  <div class="admin-crud-container">
    <div class="admin-crud-header">
      <h2>Gestión de Categorías</h2>
      <input 
        type="text" 
        v-model="searchTerm" 
        @keyup.enter="handleSearch"
        placeholder="Buscar por nombre..." 
        class="form-control" />
      <button @click="openCreateModal" class="btn btn-primary">
        <font-awesome-icon :icon="['fas', 'fa-plus']" />
        Crear Categoría
      </button>
    </div>

    <div v-if="isLoading" class="loading-indicator">Cargando categorías...</div>
    <div v-else-if="errorMessage && !showModal" class="alert-error">{{ errorMessage }}</div>
    
    <table v-else class="order-items-table">
      <thead>
        <tr>
          <!-- <th>ID</th> -->
          <th>Nombre de Categoría</th>
          <th>Descripción</th>
          <th class="text-center">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="cat in categories" :key="cat.categoryID">
          <!-- <td>{{ cat.categoryID }}</td> -->
          <td>{{ cat.categoryName }}</td>
          <td>{{ cat.description }}</td>
          <td class="text-center">
            <div class="action-button-group">
              <button @click="openEditModal(cat)" class="btn" title="Editar">
                <font-awesome-icon :icon="['fas', 'fa-pencil-alt']" />
              </button>
              <button @click="handleDelete(cat.categoryID)" class="btn btn-danger" title="Eliminar">
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

    <!-- Modal para Crear/Editar Categoría -->
    <div v-if="showModal" class="modal-overlay" @mousedown.self="showModal = false">
      <div class="modal-content" style="max-width: 700px;">
        <div class="modal-header">
          <h3>{{ isEditMode ? 'Editar Categoría' : 'Crear Categoría' }}</h3>
          <button @click="showModal = false" class="modal-close-button" title="Cerrar">&times;</button>
        </div>
        
        <form @submit.prevent="handleSubmit">
          <div class="modal-body">
            <div v-if="errorMessage" class="alert-error">{{ errorMessage }}</div>
            
            <div class="modal-form" style="grid-template-columns: 1fr;">
              <div class="form-group form-group-full">
                <label for="categoryName" class="form-label">Nombre de Categoría</label>
                <input 
                  type="text" 
                  id="categoryName" 
                  class="form-control" 
                  v-model="categoryFormData.categoryName" 
                  maxlength="50"
                  required />
              </div>

              <div class="form-group form-group-full">
                <label for="description" class="form-label">Descripción</label>
                <textarea 
                  id="description" 
                  class="form-control" 
                  v-model="categoryFormData.description" 
                  rows="3"
                  maxlength="50"
                  ></textarea>
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
