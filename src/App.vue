<template>
  <div id="app">
    <nav>
      <div>Home</div>
      <div class="nav-links">
        <router-link to="/dashboard">Dashboard</router-link>
        <router-link to="/admin">Admin Panel</router-link>
        <router-link v-if="!isLoggedIn" to="/login">Login</router-link>
        <router-link v-if="!isLoggedIn" to="/signup">Sign Up</router-link>
        <button v-if="isLoggedIn" @click="logout">Log Out</button>
      </div>
    </nav>
    <router-view></router-view>
  </div>
</template>

<script>
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";

export default {
  name: "App",
  data() {
    return {
      isLoggedIn: false, // Tracks the login state
    };
  },
  methods: {
    // Log out the user
    async logout() {
      const auth = getAuth();
      try {
        await signOut(auth);
        console.log("User logged out.");
        this.$router.push({ name: "Login" }); // Redirect to login page
      } catch (error) {
        console.error("Error logging out:", error);
      }
    }

  },
  created() {
    // Listen for authentication state changes
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      this.isLoggedIn = !!user; // Update `isLoggedIn` based on user state
    });
  },
};
</script>

