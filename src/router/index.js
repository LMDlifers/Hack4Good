import { createRouter, createWebHistory } from 'vue-router';
import AdminPanel from '@/components/AdminPanel.vue';
import Dashboard from '@/components/Dashboard.vue';

const routes = [
  { path: '/admin', component: AdminPanel },
  { path: '/dashboard', component: Dashboard },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
