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
      name: 'dashboard',
      component: () => import('../views/DashboardView.vue'),
      meta: { requiresAuth : true}
    },
    {
      path: '/developers',
      name: 'developers',
      component: () => import('../views/DevelopersView.vue'),
      meta: { requiresAuth : true },
    },
    {
      path: '/superadmins',
      name: 'superadmins',
      component: () => import('../views/SuperAdminsView.vue'),
      meta: { requiresAuth: true, roles: ['Developer'] }
    },
    {
      path: '/admins',
      name: 'admins',
      component: () => import('../views/AdminsView.vue'),
      meta: { requiresAuth: true, roles: ['Developer', 'SuperAdmin'] }
    },
    {
      path:'/customers',
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
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/ProfileView.vue'),
      meta: { requiresAuth: true, roles: ['SuperAdmin', 'Admin'] }
    }
  ]
})

router.beforeEach((to) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.token) {
    return { name: 'login'}
  }
  if (to.meta.publicOnly && auth.token) {
    return { name: 'dashboard' }
  }

  // Si la ruta exige ciertos roles y el rol actual no esta en la lista, se manda al home
  const allowedRoles = to.meta.roles as string[] | undefined
  if (allowedRoles && auth.role && !allowedRoles.includes(auth.role)) {
    return { name:  'dashboard' }
  }
})

export default router