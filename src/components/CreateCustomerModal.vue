<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  modelValue: boolean
  isSaving: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'save', payload: { fullName: string; convenio: string; phoneNumber: string }): void
}>()

const fullName = ref('')
const convenio = ref('')
const phone = ref('')
const errorMessage = ref('')

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      fullName.value = ''
      convenio.value = ''
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

  if (!fullName.value.trim() || !convenio.value.trim()) {
    errorMessage.value = 'Completá nombre y convenio.'
    return
  }

  const digits = phone.value.replace(/\D/g, '')
  if (!/^3\d{9}$/.test(digits)) {
    errorMessage.value = 'El número debe tener 10 dígitos y empezar por 3.'
    return
  }

  emit('save', {
    fullName: fullName.value.trim(),
    convenio: convenio.value.trim(),
    phoneNumber: '+57' + digits
  })
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
        <h2 class="text-base font-bold text-brand-text mb-5">Agregar cliente</h2>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-brand-muted mb-1">Nombre completo</label>
            <input
              v-model="fullName"
              type="text"
              placeholder="Ej. Juan Pérez"
              class="w-full bg-brand-bg border border-brand-border rounded px-3 py-2 text-sm text-brand-text outline-none focus:border-brand-green transition-colors"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-brand-muted mb-1">Convenio</label>
            <input
              v-model="convenio"
              type="text"
              placeholder="Ej. Convenio Sena"
              class="w-full bg-brand-bg border border-brand-border rounded px-3 py-2 text-sm text-brand-text outline-none focus:border-brand-green transition-colors"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-brand-muted mb-1">Teléfono</label>
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
              :disabled="isSaving"
              class="flex-1 rounded border border-brand-border text-brand-text text-sm py-2.5 hover:bg-brand-bg transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="isSaving"
              class="flex-1 rounded bg-brand-green hover:bg-brand-green-hover disabled:opacity-60 text-white text-sm font-semibold py-2.5 transition-colors"
            >
              {{ isSaving ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>