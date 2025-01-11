import { createRouter, createWebHistory } from "vue-router";
import { getAuth } from "firebase/auth";
import Dashboard from "@/components/Dashboard.vue";
import Login from "@/components/Login.vue";
import SignUp from "@/components/SignUp.vue";
import AdminPanel from '@/components/AdminPanel.vue';

const routes = [
  { path: "/signup", name: "Signup", component: SignUp },
  { path: "/login", name: "Login", component: Login },
  { path: '/admin', component: AdminPanel },
  { 
    path: "/dashboard", 
    name: "Dashboard", 
    component: Dashboard, 
    meta: { requiresAuth: true } // Protect this route
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guard to check authentication
router.beforeEach((to, from, next) => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (to.matched.some(record => record.meta.requiresAuth) && !user) {
    next({ name: "Login" }); // Redirect to login if not authenticated
  } else {
    next(); // Allow navigation
  }
});

export default router;
