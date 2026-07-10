<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import api from '../services/api'

// Interfaces
interface Customer {
  customerId: string
  firstName: string
  lastName: string
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
    // Construimos los query parameters limpiando los vacíos
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

// Acciones
const applyFilters = () => {
  filters.value.page = 1 // Al filtrar, volvemos a la página 1
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
    </div>

    <!-- SECCIÓN DE FILTROS -->
    <div class="bg-white/5 border border-gray-700 rounded-lg p-4 mb-6 grid grid-cols-1 md:grid-cols-5 gap-4">
      <div>
        <label class="block text-xs font-semibold text-brand-muted mb-1">Buscar (Nombre/Apellido)</label>
        <input 
          v-model="filters.search" 
          type="text" 
          placeholder="Ej. Juan Pérez" 
          class="w-full bg-transparent border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
          @keyup.enter="applyFilters"
        />
      </div>

      <div>
        <label class="block text-xs font-semibold text-brand-muted mb-1">Convenio</label>
        <select v-model="filters.convenio" class="w-full bg-brand-bg border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
          <option value="">Todos los convenios</option>
          <option v-for="c in convenios" :key="c" :value="c">{{ c }}</option>
        </select>
      </div>

      <div>
        <label class="block text-xs font-semibold text-brand-muted mb-1">¿Llamado?</label>
        <select v-model="filters.isCalled" class="w-full bg-brand-bg border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
          <option value="">Todos</option>
          <option value="true">Sí</option>
          <option value="false">No</option>
        </select>
      </div>

      <div>
        <label class="block text-xs font-semibold text-brand-muted mb-1">¿Aceptó?</label>
        <select v-model="filters.isApproved" class="w-full bg-brand-bg border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
          <option value="">Todos</option>
          <option value="true">Sí</option>
          <option value="false">No</option>
        </select>
      </div>

      <div class="flex items-end gap-2">
        <button @click="applyFilters" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors w-full">
          Filtrar
        </button>
        <button @click="clearFilters" class="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm font-medium transition-colors w-full">
          Limpiar
        </button>
      </div>
    </div>

    <!-- TABLA DE RESULTADOS -->
    <div class="overflow-x-auto bg-white/5 border border-gray-700 rounded-lg">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-gray-800 border-b border-gray-700 text-sm">
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
          <tr v-if="loading" class="border-b border-gray-700">
            <td colspan="7" class="p-8 text-center text-brand-muted">Cargando clientes...</td>
          </tr>
          <tr v-else-if="customers.length === 0" class="border-b border-gray-700">
            <td colspan="7" class="p-8 text-center text-brand-muted">No se encontraron clientes con estos filtros.</td>
          </tr>
          <tr v-else v-for="c in customers" :key="c.customerId" class="border-b border-gray-700 hover:bg-white/5 transition-colors">
            <td class="p-4 text-sm">{{ c.firstName }} {{ c.lastName }}</td>
            <td class="p-4 text-sm">{{ c.phoneNumber }}</td>
            <td class="p-4 text-sm"><span class="bg-gray-700 px-2 py-1 rounded text-xs">{{ c.convenio }}</span></td>
            <td class="p-4 text-sm text-center">
              <span v-if="c.isCalled" class="text-green-400 font-bold">✓</span>
              <span v-else class="text-red-400 font-bold">✗</span>
            </td>
            <td class="p-4 text-sm text-center">
              <span v-if="c.isApproved" class="text-green-400 font-bold">✓</span>
              <span v-else class="text-red-400 font-bold">✗</span>
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
          class="px-3 py-1 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 border border-gray-700 rounded text-sm transition-colors">
          Anterior
        </button>
        <span class="text-sm px-3 py-1">
          Página {{ pagination.currentPage }} de {{ pagination.totalPages }}
        </span>
        <button 
          @click="nextPage" 
          :disabled="filters.page === pagination.totalPages || pagination.totalPages === 0"
          class="px-3 py-1 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 border border-gray-700 rounded text-sm transition-colors">
          Siguiente
        </button>
      </div>
    </div>

  </div>
</template>