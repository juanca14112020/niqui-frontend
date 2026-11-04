import axios from 'axios'
import { useAuthStore } from '../stores/auth'

// URL del backend:
// - Si existe VITE_API_URL (variable de entorno en Vercel o .env), se usa esa.
// - En produccion (build de Vercel) usa el backend de Render.
// - En local ("npm run dev") usa el backend de "dotnet run".
const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD
    ? 'https://niquibackend.onrender.com/api'
    : 'http://localhost:5214/api')

const api = axios.create({
  baseURL: API_URL
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
