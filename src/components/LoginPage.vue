<template>
    <div class="login-page">
      <h2>Login</h2>
      <form @submit.prevent="login">
        <label for="email">Email:</label>
        <input v-model="email" type="email" id="email" placeholder="Enter your email" required />
        <label for="password">Password:</label>
        <input v-model="password" type="password" id="password" placeholder="Enter your password" required />
        <button type="submit">Login</button>
        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
      </form>
    </div>
</template>
  
<script>
  import { auth } from "@/firebase";
  import { signInWithEmailAndPassword } from "firebase/auth";
  
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
          const userCredential = await signInWithEmailAndPassword(auth, this.email, this.password);
          console.log("Login successful!", userCredential.user);
  
          // Redirect to dashboard or another page
          this.$router.push({ name: "Dashboard" });
        } catch (error) {
          console.error("Error during login:", error);
          this.errorMessage = error.message;
        }
      },
    },
  };
    </script>
  