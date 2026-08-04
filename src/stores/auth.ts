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

  // 1. Si ya existe un token en localStorage al recargar la página, se asigna a Axios
  if (token.value) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
  }

  async function login(email: string, password: string) {
    errorMessage.value = null
    isLoading.value = true

    try {
      const { data } = await api.post<LoginResponse>('/auth/login', { email, password })

      // Guardar estados
      token.value = data.token
      role.value = data.role
      fullName.value = data.fullName

      // Persistir en LocalStorage
      localStorage.setItem('niqui_token', data.token)
      localStorage.setItem('niqui_role', data.role)
      localStorage.setItem('niqui_fullname', data.fullName)

      // 2. IMPORTANTE: Asignar el token a las cabeceras de Axios inmediatamente
      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`

    } catch (err: any) {
      // 3. Mejoramos la clasificación del error
      if (err.response) {
        if (err.response.status === 401) {
          errorMessage.value = 'Correo o contraseña incorrectos.'
        } else {
          errorMessage.value = err.response.data?.message || 'Error en el servidor.'
        }
      } else {
        errorMessage.value = 'No se pudo conectar con el servidor. Intenta de nuevo.'
      }
      return // Si falla la API, cortamos la ejecución y NO navegamos
    } finally {
      isLoading.value = false
    }

    // 4. La navegación se hace FUERA del try/catch de la API
    try {
      await router.push({ name: 'customers' })
    } catch (routerErr) {
      console.error('Error al redirigir a clientes:', routerErr)
    }
  }

  function logout() {
    token.value = null
    role.value = null
    fullName.value = null

    localStorage.removeItem('niqui_token')
    localStorage.removeItem('niqui_role')
    localStorage.removeItem('niqui_fullname')

    // Limpiar cabecera de Axios al salir
    delete api.defaults.headers.common['Authorization']

    router.push({ name: 'login' })
  }

  return { token, role, fullName, errorMessage, isLoading, login, logout }
})