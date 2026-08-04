import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { publicOnly: true }
    },
    {
      path: '/',
      name: 'customers',
      component: () => import('../views/CustomersView.vue'),
      meta: { requiresAuth: true, roles: ['Developer', 'SuperAdmin', 'Admin'] }
    },
    
    
    {
      path: '/customers/bulk-import',
      name: 'customers-bulk-import',
      component: () => import('../views/CustomerBulkImportView.vue'),
      meta: { requiresAuth: true, roles: ['SuperAdmin', 'Admin'] }
    },
    {
      path: '/mass-calls-history',
      name: 'mass-calls-history',
      component: () => import('../views/MassCallsHistoryView.vue'),
      meta: { requiresAuth: true, roles: ['Developer', 'SuperAdmin', 'Admin'] }
    }
  ]
})

router.beforeEach((to) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.token) {
    return { name: 'login'}
  }
  if (to.meta.publicOnly && auth.token) {
    return { name: 'customers' }
  }

  const allowedRoles = to.meta.roles as string[] | undefined
  if (allowedRoles && auth.role && !allowedRoles.includes(auth.role)) {
    return { name: 'customers' }
  }
})

export default router