import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const routes = [
  { path: '/login', name: 'login', component: () => import('../views/Login.vue'), meta: { public: true } },
  {
    path: '/',
    component: () => import('../layout/Layout.vue'),
    redirect: '/dashboard',
    children: [
      { path: 'dashboard', name: 'dashboard', component: () => import('../views/Dashboard.vue'), meta: { title: '概览' } },
      { path: 'users', name: 'users', component: () => import('../views/Users.vue'), meta: { title: '用户管理' } },
      { path: 'categories', name: 'categories', component: () => import('../views/Categories.vue'), meta: { title: '菜品分类' } },
      { path: 'dishes', name: 'dishes', component: () => import('../views/Dishes.vue'), meta: { title: '菜品管理' } },
      { path: 'orders', name: 'orders', component: () => import('../views/Orders.vue'), meta: { title: '订单查看' } },
    ],
  },
  { path: '/:pathMatch(.*)*', redirect: '/' },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 路由守卫:未登录跳登录页
router.beforeEach((to) => {
  const auth = useAuthStore();
  if (!to.meta.public && !auth.isLoggedIn) {
    return { name: 'login', query: { redirect: to.fullPath } };
  }
  if (to.name === 'login' && auth.isLoggedIn) {
    return { name: 'dashboard' };
  }
  return true;
});

export default router;
