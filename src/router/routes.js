const routes = [
  {
    path: '/',
    redirect: '/Index',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: false },
    children: [
      {
        path: '/index',
        name: 'index',
        component: () => import('pages/Index'),
        meta: { title: '主页', requiresAuth: false }
      },
      {
        path: '/user',
        name: 'user',
        component: () => import('pages/User'),
        meta: { title: '用户管理', requiresAuth: true, auth: 3 }
      },
      {
        path: '/role',
        name: 'role',
        component: () => import('pages/Role'),
        meta: { title: '角色管理', requiresAuth: true, auth: 4 }
      },
      {
        path: '/shop',
        name: 'shop',
        component: () => import('pages/Shop'),
        meta: { title: '门店管理', requiresAuth: true, auth: 9 }
      },
      {
        path: '/activity',
        name: 'activity',
        component: () => import('pages/Activity'),
        meta: { title: '活动管理', requiresAuth: true, auth: 5 }
      },
      {
        path: '/appointment',
        name: 'appointment',
        component: () => import('pages/Appointment'),
        meta: { title: '预约信息管理', requiresAuth: true, auth: 10 }
      },
      {
        path: '/custom',
        name: 'custom',
        component: () => import('pages/Custom'),
        meta: { title: '客户管理', requiresAuth: true, auth: 6 }
      },
      {
        path: '/music',
        name: 'music',
        component: () => import('pages/Music'),
        meta: { title: '音乐管理', requiresAuth: true, auth: 7 }
      },
      {
        path: '/sysConfig',
        name: 'sysConfig',
        component: () => import('pages/SysConfig'),
        meta: { title: '系统设置', requiresAuth: true, auth: 8 }
      }
    ]
  },
  {
    path: '/auth',
    redirect: '/auth/login',
    meta: { requiresAuth: false },
    component: () => import('layouts/AuthLayout'),
    children: [
      {
        path: 'login',
        name: 'login',
        component: () => import('pages/Login'),
        meta: { requiresAuth: false }
      },
      {
        path: 'register',
        name: 'register',
        component: () => import('pages/Register'),
        meta: { requiresAuth: false }
      }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/Error404.vue')
  }
]

export default routes
