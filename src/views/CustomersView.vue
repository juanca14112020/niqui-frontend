<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '../services/api'
import ConfirmDeleteAllModal from '../components/ConfirmDeleteAllModal.vue'

// Interfaces
interface Customer {
  customerId: string
  fullName: string
  convenio: string
  phoneNumber: string
  isCalled: boolean
  isApproved: boolean
  createdByName: string
  createdAt: string
}

interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalCount: number
}

// Estado reactivo
const customers = ref<Customer[]>([])
const convenios = ref<string[]>([])
const loading = ref(false)

const filters = ref({
  page: 1,
  pageSize: 20,
  search: '',
  convenio: '',
  isCalled: '',
  isApproved: ''
})

const pagination = ref<PaginationInfo>({
  currentPage: 1,
  totalPages: 1,
  totalCount: 0
})

// Estado del modal de borrar todo
const showDeleteAllModal = ref(false)
const isDeletingAll = ref(false)

// Estado de exportacion a Excel
const isExporting = ref(false)

// Cargar Convenios para el Dropdown
const fetchConvenios = async () => {
  try {
    const { data } = await api.get('/customers/convenios')
    convenios.value = data
  } catch (error) {
    console.error('Error fetching convenios:', error)
  }
}

// Cargar Customers paginados y filtrados
const fetchCustomers = async () => {
  loading.value = true
  try {
    const params: Record<string, any> = {
      page: filters.value.page,
      pageSize: filters.value.pageSize,
    }
    if (filters.value.search) params.search = filters.value.search
    if (filters.value.convenio) params.convenio = filters.value.convenio
    if (filters.value.isCalled !== '') params.isCalled = filters.value.isCalled === 'true'
    if (filters.value.isApproved !== '') params.isApproved = filters.value.isApproved === 'true'

    const { data } = await api.get('/customers', { params })
    customers.value = data.items
    pagination.value = {
      currentPage: data.currentPage,
      totalPages: data.totalPages,
      totalCount: data.totalCount
    }
  } catch (error) {
    console.error('Error fetching customers:', error)
  } finally {
    loading.value = false
  }
}

// Función para cambiar el estado con el Switch y guardar en el backend
const toggleStatus = async (customer: Customer, field: 'isCalled' | 'isApproved') => {
  // Guardamos el estado original completo por si falla la API (Optimistic UI Update)
  const originalIsCalled = customer.isCalled;
  const originalIsApproved = customer.isApproved;

  // Hacemos el toggle de lo que el usuario clickeó
  customer[field] = !customer[field];

  // --- REGLAS DE NEGOCIO ---
  // 1. Si lo aprueban, SÍ O SÍ debió ser llamado
  if (field === 'isApproved' && customer.isApproved === true) {
    customer.isCalled = true;
  }
  
  // 2. Si le quitan el "Llamado", NO puede estar aprobado
  if (field === 'isCalled' && customer.isCalled === false) {
    customer.isApproved = false;
  }
  // -------------------------

  try {
    const payload = {
      fullName: customer.fullName,
      convenio: customer.convenio,
      phoneNumber: customer.phoneNumber,
      isCalled: customer.isCalled,
      isApproved: customer.isApproved
    }
    
    await api.put(`/customers/${customer.customerId}`, payload)
  } catch (error) {
    console.error(`Error actualizando estados:`, error)
    // Revertimos ambos campos a su estado original si la API falla
    customer.isCalled = originalIsCalled;
    customer.isApproved = originalIsApproved;
    alert('Hubo un error al actualizar el estado en el servidor.');
  }
}

// Borrar TODOS los customers (Developer/SuperAdmin, con confirmacion en el modal)
const handleDeleteAll = async () => {
  isDeletingAll.value = true
  try {
    await api.delete('/customers/delete-all')
    showDeleteAllModal.value = false
    filters.value.page = 1
    await fetchCustomers()
  } catch (error) {
    console.error('Error al borrar todos los clientes:', error)
    alert('Hubo un error al borrar los clientes.')
  } finally {
    isDeletingAll.value = false
  }
}

// Exportar a Excel TODOS los resultados que matcheen los filtros actuales (sin paginar)
const handleExport = async () => {
  isExporting.value = true
  try {
    const params: Record<string, any> = {}
    if (filters.value.search) params.search = filters.value.search
    if (filters.value.convenio) params.convenio = filters.value.convenio
    if (filters.value.isCalled !== '') params.isCalled = filters.value.isCalled === 'true'
    if (filters.value.isApproved !== '') params.isApproved = filters.value.isApproved === 'true'

    const response = await api.get('/customers/export', {
      params,
      responseType: 'blob'
    })

    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    const today = new Date().toISOString().slice(0, 10)
    link.setAttribute('download', `clientes_${today}.xlsx`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error exportando clientes:', error)
    alert('Hubo un error al generar el archivo Excel.')
  } finally {
    isExporting.value = false
  }
}

// Acciones de filtrado y paginación
const applyFilters = () => {
  filters.value.page = 1 
  fetchCustomers()
}

const clearFilters = () => {
  filters.value = { page: 1, pageSize: 20, search: '', convenio: '', isCalled: '', isApproved: '' }
  fetchCustomers()
}

const prevPage = () => {
  if (filters.value.page > 1) {
    filters.value.page--
    fetchCustomers()
  }
}

const nextPage = () => {
  if (filters.value.page < pagination.value.totalPages) {
    filters.value.page++
    fetchCustomers()
  }
}

// Inicialización
onMounted(() => {
  fetchConvenios()
  fetchCustomers()
})
</script>

<template>
  <div class="min-h-screen bg-brand-bg text-brand-text p-6 sm:p-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Gestión de Clientes</h1>
      <div class="flex gap-2">
        <button
          type="button"
          @click="handleExport"
          :disabled="isExporting"
          class="text-sm text-brand-green border border-brand-green/30 hover:bg-brand-green/10 rounded-xl px-4 py-2 transition-colors disabled:opacity-50"
        >
          {{ isExporting ? 'Generando...' : 'Exportar a Excel' }}
        </button>
        <button
          type="button"
          @click="showDeleteAllModal = true"
          class="text-sm text-red-400 border border-red-500/30 hover:bg-red-500/10 rounded-xl px-4 py-2 transition-colors"
        >
          Borrar toda la base de datos
        </button>
      </div>
    </div>

    <!-- SECCIÓN DE FILTROS -->
    <div class="bg-brand-card border border-brand-border rounded-lg p-4 mb-6 grid grid-cols-1 md:grid-cols-5 gap-4 shadow-sm">
      <div>
        <label class="block text-xs font-semibold text-brand-muted mb-1">Buscar (Nombre/Apellido)</label>
        <input 
          v-model="filters.search" 
          type="text" 
          placeholder="Ej. Juan Pérez" 
          class="w-full bg-brand-bg border border-brand-border rounded px-3 py-2 text-sm focus:outline-none focus:border-brand-green transition-colors"
          @keyup.enter="applyFilters"
        />
      </div>

      <div>
        <label class="block text-xs font-semibold text-brand-muted mb-1">Convenio</label>
        <select v-model="filters.convenio" class="w-full bg-brand-bg border border-brand-border rounded px-3 py-2 text-sm focus:outline-none focus:border-brand-green transition-colors">
          <option value="">Todos los convenios</option>
          <option v-for="c in convenios" :key="c" :value="c">{{ c }}</option>
        </select>
      </div>

      <div>
        <label class="block text-xs font-semibold text-brand-muted mb-1">¿Llamado?</label>
        <select v-model="filters.isCalled" class="w-full bg-brand-bg border border-brand-border rounded px-3 py-2 text-sm focus:outline-none focus:border-brand-green transition-colors">
          <option value="">Todos</option>
          <option value="true">Sí</option>
          <option value="false">No</option>
        </select>
      </div>

      <div>
        <label class="block text-xs font-semibold text-brand-muted mb-1">¿Aceptó?</label>
        <select v-model="filters.isApproved" class="w-full bg-brand-bg border border-brand-border rounded px-3 py-2 text-sm focus:outline-none focus:border-brand-green transition-colors">
          <option value="">Todos</option>
          <option value="true">Sí</option>
          <option value="false">No</option>
        </select>
      </div>

      <div class="flex items-end gap-2">
        <button @click="applyFilters" class="bg-brand-green hover:bg-brand-green-hover text-white px-4 py-2 rounded text-sm font-medium transition-colors w-full">
          Filtrar
        </button>
        <button @click="clearFilters" class="bg-brand-bg border border-brand-border hover:bg-brand-border text-brand-text px-4 py-2 rounded text-sm font-medium transition-colors w-full">
          Limpiar
        </button>
      </div>
    </div>

    <!-- TABLA DE RESULTADOS -->
    <div class="overflow-x-auto bg-brand-card border border-brand-border rounded-lg shadow-sm">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-brand-bg border-b border-brand-border text-sm">
            <th class="p-4 font-semibold text-brand-muted">Nombre</th>
            <th class="p-4 font-semibold text-brand-muted">Teléfono</th>
            <th class="p-4 font-semibold text-brand-muted">Convenio</th>
            <th class="p-4 font-semibold text-brand-muted text-center">Llamado</th>
            <th class="p-4 font-semibold text-brand-muted text-center">Aceptó</th>
            <th class="p-4 font-semibold text-brand-muted">Creado Por</th>
            <th class="p-4 font-semibold text-brand-muted">Fecha</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading" class="border-b border-brand-border">
            <td colspan="7" class="p-8 text-center text-brand-muted">Cargando clientes...</td>
          </tr>
          <tr v-else-if="customers.length === 0" class="border-b border-brand-border">
            <td colspan="7" class="p-8 text-center text-brand-muted">No se encontraron clientes con estos filtros.</td>
          </tr>
          <tr v-else v-for="c in customers" :key="c.customerId" class="border-b border-brand-border hover:bg-white/5 transition-colors">
            <td class="p-4 text-sm">{{ c.fullName }} </td>
            <td class="p-4 text-sm">{{ c.phoneNumber }}</td>
            <td class="p-4 text-sm"><span class="bg-brand-bg border border-brand-border px-2 py-1 rounded text-xs text-brand-muted">{{ c.convenio }}</span></td>
            
            <!-- Switch Llamado -->
            <td class="p-4 text-sm text-center">
              <button
                @click="toggleStatus(c, 'isCalled')"
                :class="c.isCalled ? 'bg-brand-green' : 'bg-brand-border'"
                class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none"
              >
                <span
                  :class="c.isCalled ? 'translate-x-5' : 'translate-x-1'"
                  class="inline-block h-3 w-3 transform rounded-full bg-white transition-transform"
                />
              </button>
            </td>

            <!-- Switch Aceptó -->
            <td class="p-4 text-sm text-center">
              <button
                @click="toggleStatus(c, 'isApproved')"
                :class="c.isApproved ? 'bg-brand-green' : 'bg-brand-border'"
                class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none"
              >
                <span
                  :class="c.isApproved ? 'translate-x-5' : 'translate-x-1'"
                  class="inline-block h-3 w-3 transform rounded-full bg-white transition-transform"
                />
              </button>
            </td>

            <td class="p-4 text-sm">{{ c.createdByName }}</td>
            <td class="p-4 text-sm">{{ new Date(c.createdAt).toLocaleDateString() }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- PAGINACIÓN -->
    <div class="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
      <span class="text-sm text-brand-muted">
        Mostrando {{ customers.length }} de {{ pagination.totalCount }} resultados
      </span>
      
      <div class="flex items-center gap-2">
        <button 
          @click="prevPage" 
          :disabled="filters.page === 1"
          class="px-3 py-1 bg-brand-card hover:bg-brand-border disabled:opacity-50 border border-brand-border rounded text-sm transition-colors text-brand-text">
          Anterior
        </button>
        <span class="text-sm px-3 py-1 text-brand-text">
          Página {{ pagination.currentPage }} de {{ pagination.totalPages }}
        </span>
        <button 
          @click="nextPage" 
          :disabled="filters.page === pagination.totalPages || pagination.totalPages === 0"
          class="px-3 py-1 bg-brand-card hover:bg-brand-border disabled:opacity-50 border border-brand-border rounded text-sm transition-colors text-brand-text">
          Siguiente
        </button>
      </div>
    </div>

    <ConfirmDeleteAllModal
      v-model="showDeleteAllModal"
      :is-deleting="isDeletingAll"
      @confirm="handleDeleteAll"
    />

  </div>
</template>