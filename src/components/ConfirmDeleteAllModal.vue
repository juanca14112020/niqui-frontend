<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  modelValue: boolean
  isDeleting: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm'): void
}>()

const confirmText = ref('')
const CONFIRM_WORD = 'ELIMINAR'

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) confirmText.value = ''
  }
)

function close() {
  emit('update:modelValue', false)
}

function handleConfirm() {
  if (confirmText.value.trim().toUpperCase() !== CONFIRM_WORD) return
  emit('confirm')
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      @click.self="close"
    >
      <div class="w-full max-w-sm bg-brand-card border border-brand-border rounded-2xl p-6 shadow-2xl">
        <div class="flex items-center gap-3 mb-4">
          <div class="h-10 w-10 rounded-xl bg-red-500/15 flex items-center justify-center text-red-400 shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v4m0 4h.01M10.29 3.86l-8.18 14.18A1.5 1.5 0 003.36 20.5h17.28a1.5 1.5 0 001.25-2.46L13.71 3.86a1.5 1.5 0 00-2.42 0z" />
            </svg>
          </div>
          <h2 class="text-base font-bold text-brand-text">Borrar todos los clientes</h2>
        </div>

        <p class="text-sm text-brand-muted mb-4">
          Esta acción es <span class="text-red-400 font-semibold">irreversible</span> y va a eliminar
          <span class="text-brand-text">todos</span> los registros de clientes de la base de datos.
        </p>

        <label class="block text-xs text-brand-muted mb-2">
          Escribí <span class="font-semibold text-brand-text">ELIMINAR</span> para confirmar:
        </label>
        <input
          v-model="confirmText"
          type="text"
          placeholder="ELIMINAR"
          class="w-full bg-brand-bg/40 border border-brand-border rounded-xl px-4 py-2.5 text-sm text-brand-text placeholder-brand-muted outline-none focus:border-red-400 transition-colors mb-5"
          @keyup.enter="handleConfirm"
        />

        <div class="flex gap-3">
          <button
            type="button"
            @click="close"
            :disabled="isDeleting"
            class="flex-1 rounded-xl border border-brand-border text-brand-text text-sm py-2.5 hover:bg-brand-border/30 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            @click="handleConfirm"
            :disabled="confirmText.trim().toUpperCase() !== 'ELIMINAR' || isDeleting"
            class="flex-1 rounded-xl bg-red-500 hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold py-2.5 transition-colors"
          >
            {{ isDeleting ? 'Borrando...' : 'Borrar todo' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>