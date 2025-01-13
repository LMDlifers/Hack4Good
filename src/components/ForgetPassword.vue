<template>
    <div class="container">
      
      <form @submit.prevent="requestPasswordReset" class="form-page">
        <h2>Reset Password</h2>
        <p>Enter your email address, and we will send you a link to reset your password.</p>
        <div class="margin-t-s">
          <label for="email">Email:</label>
          <input
            id="email"
            type="email"
            v-model="email"
            placeholder="Enter your email"
            required
          />
        </div>
        <button type="submit" class="btn-green">Send Reset Link</button>
        <p v-if="message" class="success-message">{{ message }}</p>
        <p v-if="error" class="error-message">{{ error }}</p>
      </form>
    </div>
  </template>
  
  <script>
  import { getAuth, sendPasswordResetEmail } from "firebase/auth";
  
  export default {
    name: "ForgetPassword",
    data() {
      return {
        email: "", // User's email address
        message: "", // Success message
        error: "", // Error message
      };
    },
    methods: {
      async requestPasswordReset() {
        const auth = getAuth();
        this.message = ""; // Reset success message
        this.error = ""; // Reset error message
  
        try {
          await sendPasswordResetEmail(auth, this.email);
          this.message = `A password reset link has been sent to ${this.email}.`;
        } catch (error) {
          console.error("Error sending password reset email:", error);
          this.error = "Failed to send reset email. Please check the email address.";
        }
      },
    },
  };
  </script>
  
  