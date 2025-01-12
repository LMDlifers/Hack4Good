import { createRouter, createWebHistory } from "vue-router";
import { getAuth } from "firebase/auth";
import Dashboard from "@/components/Dashboard.vue";
import Login from "@/components/LoginPage.vue";
import SignUp from "@/components/SignUp.vue";
import AdminPanel from '@/components/AdminPanel.vue';
import PreOrder from '@/components/PreOrder.vue';
import PreOrderAdmin from '@/components/PreOrderAdmin.vue';
import History from '@/components/History.vue';
import AddProduct from '@/components/AddProduct.vue';
import ManageUser from '@/components/ManageUser.vue';
import ShoppingCart from '@/components/ShoppingCart.vue';
import AuditPage from '@/components/AuditPage.vue';
import AdminAuction from "@/components/AdminAuction.vue";
import AuctionHome from "@/components/AuctionHomePage.vue";

const routes = [
  { path: "/signup", name: "Signup", component: SignUp },
  { path: "/login", name: "Login", component: Login },
  { path: '/admin', name: "AdminPanel", component: AdminPanel },
  { path: "/dashboard", name: "Dashboard", component: Dashboard, meta: { requiresAuth: true }},
  { path: "/preorder", name: "PreOrder", component: PreOrder, meta: { requiresAuth: true }},
  { path: "/preorderadmin", name: "PreOrderAdmin", component: PreOrderAdmin, meta: { requiresAuth: true }},
  { path: "/history", name: "History", component: History, meta: { requiresAuth: true }},
  { path: "/addproduct", name: "AddProduct", component: AddProduct, meta: { requiresAuth: true }},
  { path: "/manageuser", name: "ManageUser", component: ManageUser, meta: { requiresAuth: true }},
  { path: "/shoppingcart", name: "ShoppingCart", component: ShoppingCart, meta: { requiresAuth: true }},
  { path: "/auditpage", name: "AuditPage", component: AuditPage, meta: { requiresAuth: true }},
  { path: "/adminauction", name: "AdminAuction", component: AdminAuction },
  { path: "/auctionhome", name: "AuctionHome", component: AuctionHome },
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
