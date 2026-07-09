<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
</script>

<template>
  <div class="min-h-screen bg-brand-bg text-brand-text p-8">
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-bold">Bienvenido, {{ auth.fullName }}</h1>
      <button
        @click="auth.logout()"
        class="text-sm text-brand-muted hover:text-brand-green transition-colors"
      >
        Cerrar sesión
      </button>
    </div>
    <p class="text-brand-muted mt-2">Rol: {{ auth.role }}</p>
  </div>
</template>
