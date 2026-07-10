import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../services/api'
import router from '../router'

interface LoginResponse {
  token: string
  role: string
  userId: string
  fullName: string
  email: string
  expiresAt: string
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('niqui_token'))
  const role = ref<string | null>(localStorage.getItem('niqui_role'))
  const fullName = ref<string | null>(localStorage.getItem('niqui_fullname'))
  const errorMessage = ref<string | null>(null)
  const isLoading = ref(false)

  async function login(email: string, password: string) {
    errorMessage.value = null
    isLoading.value = true

    try {
      const { data } = await api.post<LoginResponse>('/auth/login', { email, password })

      token.value = data.token
      role.value = data.role
      fullName.value = data.fullName

      localStorage.setItem('niqui_token', data.token)
      localStorage.setItem('niqui_role', data.role)
      localStorage.setItem('niqui_fullname', data.fullName)

      router.push({ name: 'dashboard' })
    } catch (err: any) {
      if (err.response?.status === 401) {
        errorMessage.value = 'Correo o contraseña incorrectos.'
      } else {
        errorMessage.value = 'No se pudo conectar con el servidor. Intenta de nuevo.'
      }
    } finally {
      isLoading.value = false
    }
  }

  function logout() {
    token.value = null
    role.value = null
    fullName.value = null

    localStorage.removeItem('niqui_token')
    localStorage.removeItem('niqui_role')
    localStorage.removeItem('niqui_fullname')

    router.push({ name: 'login' })
  }

  return { token, role, fullName, errorMessage, isLoading, login, logout }
})
