import { createRouter, createWebHistory } from 'vue-router';
import Login from '../components/Login.vue';
import Home from '../components/Home.vue';
import Register from '../components/Register.vue'; // Import the Register component

const routes = [
  {
    path: '/',
    name: 'LoginPage',
    component: Login, // Default route to Login
  },
  {
    path: '/home',
    name: 'HomePage',
    component: Home, // Route to Home page
  },
  {
    path: '/register',
    name: "RegisterComponent",
    component: Register, // Route to Register page
    // component: () => import('../components/Register.vue'), // Lazy-loaded register page
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
