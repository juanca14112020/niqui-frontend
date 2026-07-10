<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()

const email = ref('')
const password = ref('')
const showPassword = ref(false)

function handleSubmit() {
  auth.login(email.value, password.value)
}
</script>

<template>
  <div class="min-h-screen w-full flex items-center justify-center bg-brand-bg px-4">
    <div
      class="w-full max-w-sm bg-brand-card border border-brand-border rounded-2xl p-8 shadow-2xl"
    >
      <!-- Titulo (sin logo, tal como se pidio) -->
      <h1 class="text-center text-xl font-bold tracking-wide text-brand-text mb-8">
        BC CONSULTORES
      </h1>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- Email -->
        <div
          class="flex items-center gap-3 rounded-xl border border-brand-border bg-brand-bg/40 px-4 py-3 focus-within:border-brand-green transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-brand-muted shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <input
            v-model="email"
            type="email"
            placeholder="Email"
            required
            class="w-full bg-transparent text-brand-text placeholder-brand-muted outline-none text-sm"
          />
        </div>

        <!-- Password -->
        <div
          class="flex items-center gap-3 rounded-xl border border-brand-border bg-brand-bg/40 px-4 py-3 focus-within:border-brand-green transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-brand-muted shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <rect x="4" y="10" width="16" height="10" rx="2" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M8 10V7a4 4 0 118 0v3" />
          </svg>
          <input
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Password"
            required
            class="w-full bg-transparent text-brand-text placeholder-brand-muted outline-none text-sm"
          />
          <button type="button" @click="showPassword = !showPassword" class="text-brand-muted shrink-0">
            <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 3l18 18M10.58 10.58a2 2 0 002.83 2.83M9.88 4.24A9.9 9.9 0 0112 4c4.478 0 8.268 2.943 9.542 7a10.05 10.05 0 01-4.132 5.411M6.1 6.1C4.244 7.32 2.9 9.14 2.458 12c1.274 4.057 5.065 7 9.542 7 1.27 0 2.478-.24 3.578-.68" />
            </svg>
          </button>
        </div>

        <!-- Mensaje de error -->
        <p v-if="auth.errorMessage" class="text-sm text-red-400 text-center">
          {{ auth.errorMessage }}
        </p>

        <!-- Boton Sign in -->
        <button
          type="submit"
          :disabled="auth.isLoading"
          class="w-full bg-brand-green hover:bg-brand-green-hover disabled:opacity-60 transition-colors text-white font-semibold rounded-xl py-3 text-sm"
        >
          {{ auth.isLoading ? 'Ingresando...' : 'Sign in' }}
        </button>
      </form>

      <!-- Divisor -->
      <div class="flex items-center gap-3 my-6">
        <div class="h-px flex-1 bg-brand-border"></div>
        <span class="text-xs text-brand-muted">or</span>
        <div class="h-px flex-1 bg-brand-border"></div>
      </div>

      <!-- Contacto -->
      <p class="text-center text-sm text-brand-muted">
        Don't have an account?
        <a href="#" class="text-brand-green hover:underline">Contact us</a>
      </p>
    </div>
  </div>
</template>
