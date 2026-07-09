import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

// Ajusta el puerto al que te muestre "dotnet run" en tu backend
const api = axios.create({
  baseURL: 'http://localhost:5214/api'
})

// Agrega automaticamente el token JWT a cada request, si existe
api.interceptors.request.use((config) => {
  const auth = useAuthStore()
  if (auth.token) {
    config.headers.Authorization = `Bearer ${auth.token}`
  }
  return config
})

// Si el backend responde 401, cierra la sesion local y manda al login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const auth = useAuthStore()
      auth.logout()
    }
    return Promise.reject(error)
  }
)

export default api
