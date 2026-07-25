<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api'
import ConfirmDeleteAllModal from '../components/ConfirmDeleteAllModal.vue'
import CreateCustomerModal from '../components/CreateCustomerModal.vue'
import TestCallModal from '../components/TestCallModal.vue'

const router = useRouter()

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

// Estado reactivo principal
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

// Estados de modales originales
const showCreateModal = ref(false)
const isSavingCustomer = ref(false)

const showTestCallModal = ref(false)
const isCalling = ref(false)

const showDeleteAllModal = ref(false)
const isDeletingAll = ref(false)

const isExporting = ref(false)

// --- ESTADO PARA LLAMADAS MASIVAS ---
const showMassCallModal = ref(false)
const isBulkCalling = ref(false)
const massCallConfig = ref({
  convenio: '',
  targetCalls: null as number | null,
  timeSlot: ''
})

// --- FUNCIONES ---

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

// Handler para crear cliente
const handleCreateCustomer = async (payload: { fullName: string; convenio: string; phoneNumber: string }) => {
  isSavingCustomer.value = true
  try {
    await api.post('/customers', payload)
    showCreateModal.value = false
    await fetchConvenios()
    await fetchCustomers()
  } catch (error) {
    console.error('Error creando cliente:', error)
    alert('Hubo un error al crear el cliente.')
  } finally {
    isSavingCustomer.value = false
  }
}

// Handler para la prueba de llamada
const handleTestCall = async (phoneNumber: string) => {
  isCalling.value = true
  try {
    const { data } = await api.post('/calls/test-call', { phoneNumber })
    alert(`Llamada iniciada con éxito. SID: ${data.callSid}`)
    showTestCallModal.value = false
  } catch (error) {
    console.error('Error al realizar la llamada de prueba:', error)
    alert('Hubo un error al intentar realizar la llamada de prueba.')
  } finally {
    isCalling.value = false
  }
}

// Handler para iniciar llamadas masivas
const handleMassCalls = async () => {
  isBulkCalling.value = true
  try {
    const timeLimitMap: Record<string, number> = {
      morning: 180,
      afternoon: 180,
      all_day: 360
    }
    await api.post('/mass-calls/start', {
      convenio: massCallConfig.value.convenio,
      targetCalls: massCallConfig.value.targetCalls,
      timeLimitMinutes: timeLimitMap[massCallConfig.value.timeSlot]
    })
    alert('Ejecución de llamadas masivas iniciada con éxito.')
    showMassCallModal.value = false
    massCallConfig.value = { convenio: '', targetCalls: null, timeSlot: '' }
  } catch (error) {
    console.error('Error al iniciar llamadas masivas:', error)
    alert('Hubo un error al iniciar la ejecución masiva.')
  } finally {
    isBulkCalling.value = false
  }
}

const goToHistory = () => {
  router.push('/mass-calls-history')
}

// Función para cambiar el estado con el Switch y guardar en el backend
const toggleStatus = async (customer: Customer, field: 'isCalled' | 'isApproved') => {
  const originalIsCalled = customer.isCalled;
  const originalIsApproved = customer.isApproved;

  customer[field] = !customer[field];

  if (field === 'isApproved' && customer.isApproved === true) {
    customer.isCalled = true;
  }
  
  if (field === 'isCalled' && customer.isCalled === false) {
    customer.isApproved = false;
  }

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
    customer.isCalled = originalIsCalled;
    customer.isApproved = originalIsApproved;
    alert('Hubo un error al actualizar el estado en el servidor.');
  }
}

// Borrar TODOS los customers
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

// Exportar a Excel
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

onMounted(() => {
  fetchConvenios()
  fetchCustomers()
})
</script>

<template>
  <div class="min-h-screen bg-brand-bg text-brand-text p-6 sm:p-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Gestión de Clientes</h1>
      
      <!-- CONTENEDOR DE BOTONES -->
      <div class="flex gap-2">
        <button
          type="button"
          @click="goToHistory"
          class="text-sm text-gray-500 border border-gray-500/30 hover:bg-gray-500/10 rounded-xl px-4 py-2 transition-colors"
        >
          Historial
        </button>
        <button
          type="button"
          @click="showMassCallModal = true"
          class="text-sm text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500/10 rounded-xl px-4 py-2 transition-colors"
        >
          Llamadas masivas
        </button>
        <button
          type="button"
          @click="showTestCallModal = true"
          class="text-sm text-sky-400 border border-sky-500/30 hover:bg-sky-500/10 rounded-xl px-4 py-2 transition-colors"
        >
          Probar llamada
        </button>
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
        <button
          type="button"
          @click="showCreateModal = true"
          class="text-sm text-white bg-brand-green hover:bg-brand-green-hover rounded-xl px-4 py-2 transition-colors"
        >
          Agregar cliente
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

    <!-- MODAL DE CONFIGURACIÓN DE LLAMADAS MASIVAS -->
    <div v-if="showMassCallModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-brand-card border border-brand-border rounded-xl shadow-xl w-full max-w-md p-6">
        <h2 class="text-xl font-bold mb-2 text-brand-text">Configurar Llamadas Masivas</h2>
        <p class="text-xs text-brand-muted mb-6">Las llamadas se detendrán si se alcanza la meta o finaliza la franja horaria.</p>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-semibold text-brand-text mb-1">Convenio a llamar</label>
            <select v-model="massCallConfig.convenio" class="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-green transition-colors">
              <option value="" disabled>Seleccione un convenio</option>
              <option value="Cualquiera">Cualquiera (Todos los convenios)</option>
              <option v-for="c in convenios" :key="c" :value="c">{{ c }}</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-semibold text-brand-text mb-1">Cantidad de llamadas (Meta)</label>
            <input 
              v-model="massCallConfig.targetCalls" 
              type="number" 
              min="1" 
              placeholder="Ej. 100" 
              class="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-green transition-colors"
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-brand-text mb-1">Franja horaria (Hora Colombia)</label>
            <select v-model="massCallConfig.timeSlot" class="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-green transition-colors">
              <option value="" disabled>Seleccione una franja</option>
              <option value="all_day">Todo el día (9:00 AM - 12:00 PM y 2:00 PM - 5:00 PM)</option>
              <option value="morning">Mañana (9:00 AM - 12:00 PM)</option>
              <option value="afternoon">Tarde (2:00 PM - 5:00 PM)</option>
            </select>
          </div>
        </div>

        <div class="mt-6 flex justify-end gap-3">
          <button 
            @click="showMassCallModal = false" 
            class="px-4 py-2 text-sm border border-brand-border text-brand-text rounded-xl hover:bg-brand-border/50 transition-colors"
          >
            Cancelar
          </button>
          <button 
            @click="handleMassCalls" 
            :disabled="!massCallConfig.convenio || !massCallConfig.targetCalls || !massCallConfig.timeSlot || isBulkCalling"
            class="px-4 py-2 text-sm bg-brand-green text-white rounded-xl hover:bg-brand-green-hover transition-colors disabled:opacity-50"
          >
            {{ isBulkCalling ? 'Iniciando...' : 'Iniciar Ejecución' }}
          </button>
        </div>
      </div>
    </div>

    <!-- TUS OTROS MODALES ORIGINALES -->
    <ConfirmDeleteAllModal
      v-model="showDeleteAllModal"
      :is-deleting="isDeletingAll"
      @confirm="handleDeleteAll"
    />

    <CreateCustomerModal
      v-model="showCreateModal"
      :is-saving="isSavingCustomer"
      @save="handleCreateCustomer"
    />

    <TestCallModal
      v-model="showTestCallModal"
      :is-calling="isCalling"
      @call="handleTestCall"
    />
  </div>
</template>