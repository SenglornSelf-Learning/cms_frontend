import { createRouter, createWebHistory } from 'vue-router'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import { getStoredCredentials } from '@/services/auth-credentials'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      redirect: { name: 'login' },
    },
    {
      path: '/account/login',
      name: 'login',
      component: () => import('@/views/auth/LoginView.vue'),
      meta: { public: true },
    },
    {
      path: '/',
      component: AdminLayout,
      children: [
        {
          path: '',
          name: 'dashboard',
          component: () => import('@/views/dashboard/DashboardView.vue'),
        },

        // category 
        {
          path: 'categories',
          name: 'categories',
          component: () => import('@/views/category/CategoryList.vue'),
        },
        {
          path: 'categories/create',
          name: 'categoryCreate',
          component: () => import('@/views/category/CategoryForm.vue'),
        },
        {
          path: 'categories/detail/:id',
          name: 'categoryDetail',
          component: () => import('@/views/category/CategoryDetail.vue'),
          props: true,
        },
        {
          path: 'categories/:id/edit',
          name: 'categoryEdit',
          component: () => import('@/views/category/CategoryForm.vue'),
        },

        // Content Management
        {
          path: 'contents',
          name: 'contents',
          component: () => import('@/views/content/ContentList.vue'),
        },
        {
          path: 'contents/create',
          name: 'contentCreate',
          component: () => import('@/views/content/ContentForm.vue'),
        },
        {
          path: 'contents/detail/:id',
          name: 'contentDetail',
          component: () => import('@/views/content/ContentDetail.vue'),
          props: (route) => ({ id: Number(route.params.id) }),
        },
        {
          path: 'contents/:id/edit',
          name: 'contentEdit',
          component: () => import('@/views/content/ContentForm.vue'),
        },

        // User Management
        {
          path: 'users',
          name: 'users',
          component: () => import('@/views/user/UserList.vue'),
        },
        {
          path: 'users/create',
          name: 'userCreate',
          component: () => import('@/views/user/UserForm.vue'),
        },
        {
          path: 'users/detail/:id',
          name: 'userDetail',
          component: () => import('@/views/user/UserDetail.vue'),
          props: true,
        },
        {
          path: 'users/:id/edit',
          name: 'userEdit',
          component: () => import('@/views/user/UserForm.vue'),
        },
        {
          path: 'account/profile',
          name: 'userProfile',
          component: () => import('@/views/user/UserProfile.vue'),
        },
      ],
    },
  ],
})

router.beforeEach(async (to) => {
  window.NProgress?.start()

  const auth = useAuthStore()
  
  if (!auth.currentUser && getStoredCredentials()) {
    await auth.restoreSession()
  }

  const isPublic = to.matched.some((record) => record.meta.public === true)
  if (isPublic) {
    if (auth.currentUser && to.name === 'login') {
      return { name: 'dashboard' }
    }
    return true
  }

  if (!auth.currentUser) {
    return {
      name: 'login',
      query: to.fullPath !== '/' ? { redirect: to.fullPath } : undefined,
    }
  }

  return true
})

router.afterEach(() => {
  window.NProgress?.done()
})

export default router
