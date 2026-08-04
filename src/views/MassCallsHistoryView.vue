<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api'

const router = useRouter()

interface MassCallRecord {
  id: string
  convenio: string
  targetCalls: number
  callsMade: number
  skippedUnverified: number
  timeLimitMinutes: number
  status: 'Running' | 'Completed' | 'Timeout' | 'Stopped'
  createdAt: string
}

const history = ref<MassCallRecord[]>([])
let pollInterval: number | undefined

const fetchHistory = async () => {
  try {
    const { data } = await api.get('/mass-calls/history')
    history.value = data
  } catch (error) {
    console.error('Error al cargar historial:', error)
  }
}

onMounted(() => {
  fetchHistory()
  pollInterval = window.setInterval(fetchHistory, 5000)
})

onUnmounted(() => {
  if (pollInterval) clearInterval(pollInterval)
})

const goBack = () => {
  router.push({ name: 'customers' })
}

const getStatusStyles = (status: string) => {
  switch (status) {
    case 'Completed': return 'bg-brand-green/20 text-brand-green border border-brand-green/50'
    case 'Running': return 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
    case 'Timeout': return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50'
    case 'Stopped': return 'bg-red-500/20 text-red-400 border border-red-500/50'
    default: return 'bg-brand-border text-brand-muted'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'Completed': return 'Completado (Meta Alcanzada)'
    case 'Running': return 'En Ejecución...'
    case 'Timeout': return 'Tiempo Finalizado'
    case 'Stopped': return 'Detenido Manualmente'
    default: return status
  }
}
</script>

<template>
  <div class="min-h-screen bg-brand-bg text-brand-text p-6 sm:p-8">
    
    <!-- BOTÓN VOLVER -->
    <button
      type="button"
      @click="goBack"
      class="inline-flex items-center gap-2 text-sm text-brand-muted hover:text-brand-text transition-colors mb-6 group cursor-pointer"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 transform group-hover:-translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
      Volver
    </button>

    <h1 class="text-2xl font-bold mb-6">Historial de Llamadas Masivas</h1>

    <div class="overflow-x-auto bg-brand-card border border-brand-border rounded-lg shadow-sm">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-brand-bg border-b border-brand-border text-sm">
            <th class="p-4 font-semibold text-brand-muted">Fecha</th>
            <th class="p-4 font-semibold text-brand-muted">Convenio</th>
            <th class="p-4 font-semibold text-brand-muted">Progreso (Llamadas)</th>
            <th class="p-4 font-semibold text-brand-muted text-center">Saltados (no verificados)</th>
            <th class="p-4 font-semibold text-brand-muted text-center">Límite de Tiempo</th>
            <th class="p-4 font-semibold text-brand-muted text-center">Estado</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="history.length === 0" class="border-b border-brand-border">
            <td colspan="6" class="p-8 text-center text-brand-muted">No hay registros de llamadas masivas.</td>
          </tr>
          <tr v-else v-for="record in history" :key="record.id" class="border-b border-brand-border hover:bg-white/5 transition-colors">
            <td class="p-4 text-sm">{{ new Date(record.createdAt).toLocaleString() }}</td>
            <td class="p-4 text-sm">
              <span class="bg-brand-bg border border-brand-border px-2 py-1 rounded text-xs text-brand-muted">{{ record.convenio }}</span>
            </td>

            <td class="p-4 text-sm min-w-[200px]">
              <div class="flex justify-between text-xs mb-1">
                <span>{{ record.callsMade }} realizadas</span>
                <span class="text-brand-muted">Meta: {{ record.targetCalls }}</span>
              </div>
              <div class="w-full bg-brand-bg rounded-full h-2 border border-brand-border overflow-hidden">
                <div
                  class="bg-brand-green h-2 rounded-full transition-all duration-500"
                  :style="{ width: `${Math.min((record.callsMade / record.targetCalls) * 100, 100)}%` }">
                </div>
              </div>
            </td>

            <td class="p-4 text-sm text-center text-yellow-400">{{ record.skippedUnverified }}</td>
            <td class="p-4 text-sm text-center">{{ record.timeLimitMinutes }} min</td>

            <td class="p-4 text-sm text-center">
              <span :class="getStatusStyles(record.status)" class="px-2 py-1 rounded text-xs font-medium inline-block w-max">
                {{ getStatusText(record.status) }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>