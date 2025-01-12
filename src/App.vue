<template>
    <body id="app" class="main bg-lightgrey">
      <nav>
        <img src="@/assets/logo.png">
        <div class="nav-links">
			<router-link v-if="isLoggedIn && role === 'user'" to="/dashboard">Dashboard</router-link>
			<router-link v-if="isLoggedIn && role === 'user'" to="/preorder">Pre-Orders</router-link>
			<router-link v-if="isLoggedIn && role === 'user'" to="/shoppingcart">Cart</router-link>
			<router-link v-if="isLoggedIn && role === 'admin'" to="/admin">Admin Panel</router-link>
			<router-link v-if="isLoggedIn && role === 'admin'" to="/auditpage">Audit</router-link>
			<router-link v-if="isLoggedIn && role === 'admin'" to="/addproduct">Products</router-link>
			<router-link v-if="isLoggedIn && role === 'admin'" to="/preorderadmin">Pre-Orders</router-link>
			<router-link v-if="isLoggedIn && role === 'admin'" to="/manageuser">Manage Users</router-link>
			<router-link v-if="!isLoggedIn" to="/login">Login</router-link>
			<router-link v-if="!isLoggedIn" to="/signup">Sign Up</router-link>
			
			<router-link v-if="isLoggedIn && role === 'admin'" to="/auctionhome">Auction</router-link>

			<button class="logout-button" v-if="isLoggedIn" @click="logout">Log Out</button>
        </div>
      </nav>
      <router-view></router-view>
  </body>
	<footer>
      <p>&copy; 2025 MUHAMMADIYAH WELFARE HOME. All Rights Reserved.</p>
	</footer>

</template>

<script>
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { getDatabase, ref, get } from "firebase/database";

export default {
	name: "App",
	data() {
		return {
			isLoggedIn: false, // Tracks the login state
			role: "", // Tracks the user's role (e.g., 'admin', 'user')
		};
	},
	methods: {

	goToDashboard() {
		this.$router.push("/Dashboard"); // Redirect to the home page
	},

	// Log out the user
	async logout() {
		const auth = getAuth();
		try {
		await signOut(auth);
		console.log("User logged out.");
		this.isLoggedIn = false;
		this.role = ""; // Reset role
		this.$router.push({ name: "Login" }); // Redirect to login page
		} catch (error) {
		console.error("Error logging out:", error);
		}
	},
	// Fetch the user's role from Firebase
	async fetchUserRole(uid) {
	const db = getDatabase();
	const userRef = ref(db, `users/${uid}`);
	try {
	const snapshot = await get(userRef);
	if (snapshot.exists()) {
		const userData = snapshot.val();
		console.log("Fetched user data:", userData); // Log the fetched user data
		this.role = userData.role; // Assign the role
		console.log("User role set to:", this.role);
	} else {
		console.log("No data found for this user.");
	}
	} catch (error) {
	console.error("Error fetching user role:", error);
	}
	}

	},
	created() {
	// Listen for authentication state changes
	const auth = getAuth();
	onAuthStateChanged(auth, (user) => {
		if (user) {
		this.isLoggedIn = true; // Update login state
		this.fetchUserRole(user.uid); // Fetch the user's role
		} else {
		this.isLoggedIn = false;
		this.role = ""; // Reset role when logged out
		}
	});
	},
};
</script>
