<script setup lang="ts">
import { ref } from 'vue'
import api from '../services/api'

interface BulkImportResult {
  totalRows: number
  inserted: number
  rejected: number
  errors: string[]
}

const selectedFile = ref<File | null>(null)
const isDragging = ref(false)
const isUploading = ref(false)
const result = ref<BulkImportResult | null>(null)
const errorMessage = ref<string | null>(null)

const fileInput = ref<HTMLInputElement | null>(null)

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    setFile(target.files[0])
  }
}

function handleDrop(event: DragEvent) {
  isDragging.value = false
  const file = event.dataTransfer?.files?.[0]
  if (file) setFile(file)
}

function setFile(file: File) {
  const validExtensions = ['.xlsx', '.xls']
  const isValid = validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext))

  if (!isValid) {
    errorMessage.value = 'El archivo debe ser un Excel (.xlsx o .xls).'
    selectedFile.value = null
    return
  }

  errorMessage.value = null
  result.value = null
  selectedFile.value = file
}

function removeFile() {
  selectedFile.value = null
  result.value = null
  errorMessage.value = null
  if (fileInput.value) fileInput.value.value = ''
}

async function handleUpload() {
  if (!selectedFile.value) return

  isUploading.value = true
  errorMessage.value = null
  result.value = null

  const formData = new FormData()
  formData.append('file', selectedFile.value)

  try {
    const { data } = await api.post<BulkImportResult>('/customers/bulk-import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    result.value = data
  } catch (err: any) {
    errorMessage.value =
      err.response?.data?.message ?? 'No se pudo procesar el archivo. Verificá el formato e intentá de nuevo.'
  } finally {
    isUploading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-brand-bg text-brand-text p-6 sm:p-8">
    <div class="max-w-2xl mx-auto">
      <h1 class="text-2xl font-bold mb-1">Carga masiva de clientes</h1>
      <p class="text-brand-muted text-sm mb-8">
        Subí un archivo Excel con los clientes a importar. Las columnas se detectan automáticamente
        (Nombre/Apellido o Nombre completo, Convenio, Teléfono).
      </p>

      <!-- Dropzone -->
      <div
        v-if="!selectedFile"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="handleDrop"
        @click="fileInput?.click()"
        class="border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-colors"
        :class="isDragging ? 'border-brand-green bg-brand-green/5' : 'border-brand-border bg-brand-card hover:border-brand-green/40'"
      >
        <input
          ref="fileInput"
          type="file"
          accept=".xlsx,.xls"
          class="hidden"
          @change="handleFileChange"
        />

        <div class="flex flex-col items-center gap-3">
          <div class="h-12 w-12 rounded-xl bg-brand-green/10 flex items-center justify-center text-brand-green">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 16V4m0 0L7 9m5-5l5 5M4 16v3a2 2 0 002 2h12a2 2 0 002-2v-3" />
            </svg>
          </div>
          <p class="text-sm text-brand-text">
            Arrastrá el archivo acá o <span class="text-brand-green font-medium">hacé clic para elegirlo</span>
          </p>
          <p class="text-xs text-brand-muted">Formatos aceptados: .xlsx, .xls</p>
        </div>
      </div>

      <!-- Archivo seleccionado -->
      <div
        v-else
        class="border border-brand-border bg-brand-card rounded-2xl p-5 flex items-center justify-between gap-4"
      >
        <div class="flex items-center gap-3 min-w-0">
          <div class="h-10 w-10 rounded-xl bg-brand-green/10 flex items-center justify-center text-brand-green shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6M9 8h1M5 21h14a2 2 0 002-2V7l-5-5H5a2 2 0 00-2 2v15a2 2 0 002 2z" />
            </svg>
          </div>
          <div class="min-w-0">
            <p class="text-sm text-brand-text truncate">{{ selectedFile.name }}</p>
            <p class="text-xs text-brand-muted">{{ (selectedFile.size / 1024).toFixed(0) }} KB</p>
          </div>
        </div>

        <button
          type="button"
          @click="removeFile"
          :disabled="isUploading"
          class="text-brand-muted hover:text-red-400 transition-colors disabled:opacity-40 shrink-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Error general (archivo invalido, error de red, etc.) -->
      <p v-if="errorMessage" class="text-sm text-red-400 mt-4">{{ errorMessage }}</p>

      <!-- Boton subir -->
      <button
        v-if="selectedFile"
        type="button"
        @click="handleUpload"
        :disabled="isUploading"
        class="w-full mt-4 bg-brand-green hover:bg-brand-green-hover disabled:opacity-60 transition-colors text-white font-semibold rounded-xl py-3 text-sm"
      >
        {{ isUploading ? 'Procesando archivo...' : 'Subir e importar clientes' }}
      </button>

      <!-- Resultado -->
      <div v-if="result" class="mt-8 border border-brand-border bg-brand-card rounded-2xl p-6">
        <h2 class="text-base font-bold mb-4">Resultado de la importación</h2>

        <div class="grid grid-cols-3 gap-3 mb-5">
          <div class="rounded-xl border border-brand-border p-4 text-center">
            <p class="text-2xl font-bold text-brand-text">{{ result.totalRows }}</p>
            <p class="text-xs text-brand-muted mt-1">Filas leídas</p>
          </div>
          <div class="rounded-xl border border-brand-green/30 bg-brand-green/5 p-4 text-center">
            <p class="text-2xl font-bold text-brand-green">{{ result.inserted }}</p>
            <p class="text-xs text-brand-muted mt-1">Insertados</p>
          </div>
          <div class="rounded-xl border border-red-500/30 bg-red-500/5 p-4 text-center">
            <p class="text-2xl font-bold text-red-400">{{ result.rejected }}</p>
            <p class="text-xs text-brand-muted mt-1">Rechazados</p>
          </div>
        </div>

        <div v-if="result.errors.length > 0">
          <p class="text-xs font-semibold text-brand-muted mb-2">
            Detalle de filas rechazadas ({{ result.errors.length }}):
          </p>
          <div class="max-h-56 overflow-y-auto rounded-xl border border-brand-border bg-brand-bg/40 p-3 space-y-1.5">
            <p v-for="(err, idx) in result.errors" :key="idx" class="text-xs text-brand-muted">
              {{ err }}
            </p>
          </div>
        </div>

        <button
          type="button"
          @click="removeFile"
          class="mt-5 text-sm text-brand-green hover:underline"
        >
          Subir otro archivo
        </button>
      </div>
    </div>
  </div>
</template>