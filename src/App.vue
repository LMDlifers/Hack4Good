<template>
	<body id="app" class="main bg-lightgrey">
		<!-- Desktop Navigation -->
		<nav id="desktop-nav">
			<img src="@/assets/logo.png" class="logo">
			<div class="nav-links">
				<router-link v-if="isLoggedIn && role === 'user'" to="/dashboard">Dashboard</router-link>
				<router-link v-if="isLoggedIn && role === 'user'" to="/preorder">Pre-Orders</router-link>
				<router-link v-if="isLoggedIn && role === 'user'" to="/shoppingcart">Cart</router-link>
				<router-link v-if="isLoggedIn && role === 'admin'" to="/admin">Admin Panel</router-link>
				<router-link v-if="isLoggedIn && role === 'admin'" to="/auditpage">Audit</router-link>
				<router-link v-if="isLoggedIn && role === 'admin'" to="/addproduct">Products</router-link>
				<router-link v-if="isLoggedIn && role === 'admin'" to="/preorderadmin">Pre-Orders</router-link>
				<router-link v-if="isLoggedIn && role === 'admin'" to="/manageuser">Manage Users</router-link>
				<router-link v-if="isLoggedIn && role === 'admin'" to="/auctionhome">Auction</router-link>
				<router-link v-if="!isLoggedIn" to="/login">Login</router-link>
				<router-link v-if="!isLoggedIn" to="/signup">Sign Up</router-link>
				<button class="logout-button" v-if="isLoggedIn" @click="logout">Log Out</button>
			</div>
		</nav>

		<!-- Hamburger Navigation -->
		<nav id="hamburger-nav">
			<img src="@/assets/logo.png" class="logo">
			<div class="hamburger-menu">
				<div class="hamburger-icon" @click="toggleMenu">
					<span></span>
					<span></span>
					<span></span>
				</div>
				<div :class="['menu-links', { open: openMenu }]">
					<router-link v-if="isLoggedIn && role === 'user'" to="/dashboard" @click="closeMenu">Dashboard</router-link>
					<router-link v-if="isLoggedIn && role === 'user'" to="/preorder" @click="closeMenu">Pre-Orders</router-link>
					<router-link v-if="isLoggedIn && role === 'user'" to="/shoppingcart" @click="closeMenu">Cart</router-link>
					<router-link v-if="isLoggedIn && role === 'admin'" to="/admin" @click="closeMenu">Admin Panel</router-link>
					<router-link v-if="isLoggedIn && role === 'admin'" to="/auditpage" @click="closeMenu">Audit</router-link>
					<router-link v-if="isLoggedIn && role === 'admin'" to="/addproduct" @click="closeMenu">Products</router-link>
					<router-link v-if="isLoggedIn && role === 'admin'" to="/preorderadmin" @click="closeMenu">Pre-Orders</router-link>
					<router-link v-if="isLoggedIn && role === 'admin'" to="/manageuser" @click="closeMenu">Manage Users</router-link>
					<router-link v-if="isLoggedIn && role === 'admin'" to="/auctionhome" @click="closeMenu">Auction</router-link>
					<router-link v-if="!isLoggedIn" to="/login" @click="closeMenu">Login</router-link>
					<router-link v-if="!isLoggedIn" to="/signup" @click="closeMenu">Sign Up</router-link>
					<button class="logout-button" v-if="isLoggedIn" @click="logout">Log Out</button>
				</div>
			</div>
		</nav>

		<router-view></router-view>
	</body>
</template>

<script>
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { getDatabase, ref, get } from "firebase/database";

export default {
	name: "App",
	data() {
		return {
			isLoggedIn: false,
			role: "",
			openMenu: false, // Manage the menu toggle state
		};
	},
	methods: {
		toggleMenu() {
			this.openMenu = !this.openMenu;
		},
		closeMenu() {
			this.openMenu = false; // Close menu when clicking a link
		},
		async logout() {
			const auth = getAuth();
			try {
				await signOut(auth);
				this.isLoggedIn = false;
				this.role = "";
				this.openMenu = false; // Close the menu on logout
				this.$router.push({ name: "Login" });
			} catch (error) {
				console.error("Error logging out:", error);
			}
		},
		async fetchUserRole(uid) {
			const db = getDatabase();
			const userRef = ref(db, `users/${uid}`);
			try {
				const snapshot = await get(userRef);
				if (snapshot.exists()) {
					this.role = snapshot.val().role;
				}
			} catch (error) {
				console.error("Error fetching user role:", error);
			}
		},
	},
	created() {
		const auth = getAuth();
		onAuthStateChanged(auth, (user) => {
			if (user) {
				this.isLoggedIn = true;
				this.fetchUserRole(user.uid);
			} else {
				this.isLoggedIn = false;
				this.role = "";
				this.openMenu = false; // Close the menu on logout
			}
		});
	},
};
</script>
