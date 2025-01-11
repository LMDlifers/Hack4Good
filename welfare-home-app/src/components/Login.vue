<template>
    <v-container class="login-container">
      <v-card class="login-card">
        <v-card-title class="title">User Login</v-card-title>
        <v-card-text>
          <v-form ref="form" @submit.prevent="handleLogin">
            <v-text-field
              v-model="formData.email"
              label="Email"
              type="email"
              required
            ></v-text-field>
  
            <v-text-field
              v-model="formData.password"
              label="Password"
              type="password"
              required
            ></v-text-field>
  
            <v-btn
              :loading="loading"
              type="submit"
              block
              color="primary"
              @click="handleLogin"
            >
              Login
            </v-btn>
  
            <v-divider class="my-4"></v-divider>
  
            <v-btn outlined color="secondary" block @click="goToRegister">
              Register
            </v-btn>
          </v-form>
  
          <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
          <p v-if="successMessage" class="success-message">{{ successMessage }}</p>
        </v-card-text>
      </v-card>
    </v-container>
  </template>
  
  <script>
  export default {
    name: "LoginPage",
    data() {
      return {
        formData: {
          email: "",
          password: "",
        },
        loading: false,
        errorMessage: "",
        successMessage: "",
        // Mock user data for demo purposes
        mockUsers: [
          { email: "user@example.com", password: "password123" },
          { email: "admin@example.com", password: "adminpass" },
        ],
      };
    },
    methods: {
      handleLogin() {
        this.loading = true;
  
        // Simulate API call delay
        setTimeout(() => {
          const user = this.mockUsers.find(
            (u) =>
              u.email === this.formData.email &&
              u.password === this.formData.password
          );
  
          if (user) {
            this.successMessage = "Login Successful!";
            this.errorMessage = "";
          } else {
            this.errorMessage = "Invalid email or password.";
            this.successMessage = "";
          }
  
          this.loading = false;
        }, 1000); // Simulates a 1-second delay
      },
      goToRegister() {
        alert("Navigate to Register Page (Demo only)");
      },
    },
  };
  </script>
  
  <style scoped>
  .login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-color: #f5f5f5;
  }
  
  .login-card {
    width: 400px;
    padding: 20px;
    background-color: white;
  }
  
  .error-message {
    color: red;
    margin-top: 10px;
  }
  
  .success-message {
    color: green;
    margin-top: 10px;
  }
  </style>
  