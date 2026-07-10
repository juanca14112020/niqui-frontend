<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import RoleBadge from '../components/RoleBadge.vue'
import MenuCard from '../components/MenuCard.vue'

const auth = useAuthStore()

interface MenuItem {
  title: string
  description: string
  to: string
  icon: 'developers' | 'superadmins' | 'admins' | 'customers' | 'upload' | 'profile'
}

// Un solo lugar donde se define que ve cada rol. Para agregar/quitar accesos,
// se edita unicamente este objeto.
const menuByRole: Record<string, MenuItem[]> = {
  Developer: [
    { title: 'Developers', description: 'Gestionar desarrolladores del sistema', to: '/developers', icon: 'developers' },
    { title: 'Super Admins', description: 'Crear, editar y eliminar super admins', to: '/superadmins', icon: 'superadmins' },
    { title: 'Administradores', description: 'Crear, editar y eliminar administradores', to: '/admins', icon: 'admins' },
    { title: 'Clientes', description: 'Ver, crear y editar clientes', to: '/customers', icon: 'customers' },
  ],
  SuperAdmin: [
    { title: 'Administradores', description: 'Editar y eliminar administradores', to: '/admins', icon: 'admins' },
    { title: 'Clientes', description: 'Ver, crear y editar clientes', to: '/customers', icon: 'customers' },
    { title: 'Carga masiva', description: 'Subir clientes desde un Excel', to: '/customers/bulk-import', icon: 'upload' },
    { title: 'Mi perfil', description: 'Editar tu información personal', to: '/profile', icon: 'profile' },
  ],
  Admin: [
    { title: 'Clientes', description: 'Ver, crear y editar clientes', to: '/customers', icon: 'customers' },
    { title: 'Carga masiva', description: 'Subir clientes desde un Excel', to: '/customers/bulk-import', icon: 'upload' },
    { title: 'Mi perfil', description: 'Editar tu información personal', to: '/profile', icon: 'profile' },
  ]
}

const menuItems = computed(() => menuByRole[auth.role ?? ''] ?? [])
</script>

<template>
  <div class="min-h-screen bg-brand-bg">
    <!-- Header -->
    <header class="border-b border-brand-border">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <h1 class="text-sm sm:text-base font-bold tracking-wide text-brand-text">
          BC CONSULTORES
        </h1>

        <div class="flex items-center gap-3">
          <div class="hidden sm:flex flex-col items-end">
            <span class="text-sm text-brand-text leading-tight">{{ auth.fullName }}</span>
            <RoleBadge :role="auth.role ?? ''" class="mt-1" />
          </div>
          <RoleBadge :role="auth.role ?? ''" class="sm:hidden" />

          <button
            @click="auth.logout()"
            class="text-xs sm:text-sm text-brand-muted hover:text-red-400 transition-colors border border-brand-border rounded-lg px-3 py-1.5"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </header>

    <!-- Contenido -->
    <main class="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div class="mb-8">
        <h2 class="text-xl sm:text-2xl font-bold text-brand-text">
          Bienvenido, {{ auth.fullName?.split(' ')[0] }}
        </h2>
        <p class="text-brand-muted text-sm mt-1">
          Este es tu panel como <span class="text-brand-green">{{ auth.role }}</span>.
        </p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <MenuCard
          v-for="item in menuItems"
          :key="item.to"
          :title="item.title"
          :description="item.description"
          :to="item.to"
        >
          <template #icon>
            <!-- Developers -->
            <svg v-if="item.icon === 'developers'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8 9l-4 3 4 3M16 9l4 3-4 3M13 6l-2 12" />
            </svg>
            <!-- SuperAdmins -->
            <svg v-else-if="item.icon === 'superadmins'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" />
            </svg>
            <!-- Admins -->
            <svg v-else-if="item.icon === 'admins'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <circle cx="12" cy="8" r="3.2" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M5.5 20a6.5 6.5 0 0113 0" />
            </svg>
            <!-- Customers -->
            <svg v-else-if="item.icon === 'customers'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <circle cx="9" cy="8" r="3" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.5 19a5.5 5.5 0 0111 0M16 9.5a2.5 2.5 0 100-5M17.5 19a4.5 4.5 0 00-3.3-6.9" />
            </svg>
            <!-- Upload -->
            <svg v-else-if="item.icon === 'upload'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 16V4m0 0L7 9m5-5l5 5M4 16v3a2 2 0 002 2h12a2 2 0 002-2v-3" />
            </svg>
            <!-- Profile -->
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <circle cx="12" cy="8" r="3.2" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M5.5 20a6.5 6.5 0 0113 0" />
            </svg>
          </template>
        </MenuCard>
      </div>
    </main>
  </div>
</template>
