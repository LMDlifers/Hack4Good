<template>
    <div class="form-page box-shadow">
      <h2>Login</h2>
      <form @submit.prevent="login">
        <label for="email">Email:</label>
        <input v-model="email" type="email" id="email" placeholder="Enter your email" required />
        <label for="password">Password:</label>
        <input v-model="password" type="password" id="password" placeholder="Enter your password" required />
        <button type="submit" class="w100">Login</button>
        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
      </form>
    </div>
</template>
  
<script>
import { auth } from "@/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { getDatabase, ref, get } from "firebase/database";

export default {
  name: "LoginPage",
  data() {
    return {
      email: "",
      password: "",
      errorMessage: "",
    };
  },
  methods: {
    async login() {
      try {
        // Log the user in
        const userCredential = await signInWithEmailAndPassword(auth, this.email, this.password);
        const user = userCredential.user;

        console.log("Login successful!", user);

        // Fetch user role from Firebase
        const db = getDatabase();
        const userRef = ref(db, `users/${user.uid}`);
        const snapshot = await get(userRef);

        if (snapshot.exists()) {
          const userData = snapshot.val();

          // Check the role and redirect accordingly
          if (userData.role === "admin") {
            this.$router.push({ name: "AdminPanel" }); // Redirect to admin panel
          } else if (userData.role === "user") {
            this.$router.push({ name: "Dashboard" }); // Redirect to user dashboard
          } else {
            console.error("Unknown role:", userData.role);
            this.errorMessage = "Invalid role. Please contact support.";
          }
        } else {
          console.error("User data not found in database.");
          this.errorMessage = "User data not found. Please contact support.";
        }
      } catch (error) {
        console.error("Error during login:", error);
        this.errorMessage = error.message;
      }
    },
  },
};

    </script>
  