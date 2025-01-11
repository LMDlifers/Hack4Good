<template>
  <div id="app">
    <nav>
      <img src="@/assets/logo.png" class="clickable-logo" @click="goToDashboard">
      <div class="nav-links">
        <router-link v-if="isLoggedIn" to="/dashboard">Dashboard</router-link>
        <router-link v-if="isLoggedIn" to="/requestproduct">Request Product</router-link>
        <!-- <router-link v-if="isLoggedIn" to="/products">Products</router-link> -->
        <router-link v-if="isLoggedIn && role === 'admin'" to="/admin">Admin Panel</router-link>
        <router-link v-if="!isLoggedIn" to="/login">Login</router-link>
        <router-link v-if="!isLoggedIn" to="/signup">Sign Up</router-link>
        <button class="logout-button" v-if="isLoggedIn" @click="logout">Log Out</button>
      </div>
    </nav>
    <router-view></router-view>
  </div>
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
          this.role = snapshot.val().role; // Set the user's role
          console.log("User role:", this.role);
        } else {
          console.log("No role found for this user.");
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
      }
    },
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
