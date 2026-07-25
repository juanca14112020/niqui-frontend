<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  modelValue: boolean
  isCalling: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'call', phoneNumber: string): void
}>()

const phone = ref('')
const errorMessage = ref('')

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      phone.value = ''
      errorMessage.value = ''
    }
  }
)

function close() {
  emit('update:modelValue', false)
}

function handleSubmit() {
  errorMessage.value = ''

  const digits = phone.value.replace(/\D/g, '')
  if (!/^3\d{9}$/.test(digits)) {
    errorMessage.value = 'El número debe tener 10 dígitos y empezar por 3.'
    return
  }

  emit('call', '+57' + digits)
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      @click.self="close"
    >
      <div class="w-full max-w-sm bg-brand-card border border-brand-border rounded-2xl p-6 shadow-xl">
        <h2 class="text-base font-bold text-brand-text mb-5">Prueba de llamada</h2>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-brand-muted mb-1">Número de teléfono</label>
            <div class="flex items-center border border-brand-border rounded bg-brand-bg focus-within:border-brand-green transition-colors">
              <span class="px-3 text-sm text-brand-muted border-r border-brand-border">+57</span>
              <input
                v-model="phone"
                type="text"
                maxlength="10"
                placeholder="3XXXXXXXXX"
                class="w-full bg-transparent px-3 py-2 text-sm text-brand-text outline-none"
              />
            </div>
          </div>

          <p v-if="errorMessage" class="text-sm text-red-500">{{ errorMessage }}</p>

          <div class="flex gap-3 pt-2">
            <button
              type="button"
              @click="close"
              :disabled="isCalling"
              class="flex-1 rounded border border-brand-border text-brand-text text-sm py-2.5 hover:bg-brand-bg transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="isCalling"
              class="flex-1 rounded bg-brand-green hover:bg-brand-green-hover disabled:opacity-60 text-white text-sm font-semibold py-2.5 transition-colors"
            >
              {{ isCalling ? 'Llamando...' : 'Iniciar llamada' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>