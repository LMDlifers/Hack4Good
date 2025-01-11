<template>
  <v-container class="login-container">
    <header class="header">
      <img src="@/assets/logo.png" alt="Logo" class="logo" />
      <div class="nav-links">
        <a href="#" class="nav-link">Register</a>
        <a href="#" class="nav-link">Login</a>
      </div>
    </header>

    <v-card class="login-card">
      <v-card-title class="card-title">Login</v-card-title>
      <v-card-text>
        <v-form ref="form" @submit.prevent="handleLogin">
          <v-text-field
            v-model="formData.email"
            label="Username"
            color="primary"
            outlined
            hide-details
            required
          ></v-text-field>

          <v-text-field
            v-model="formData.password"
            label="Password"
            color="primary"
            outlined
            type="password"
            hide-details
            required
          ></v-text-field>

          <a href="#" class="forgot-password">Forgot Password?</a>

          <v-btn
            :loading="loading"
            type="submit"
            block
            class="login-btn"
            @click="handleLogin"
          >
            Login
          </v-btn>
        </v-form>

        <p class="sign-up-text">
          Don’t have an account? <a href="#" class="sign-up-link">Sign up</a>
        </p>
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
    };
  },
  methods: {
    handleLogin() {
      this.loading = true;

      setTimeout(() => {
        if (this.formData.email === "123" && this.formData.password === "123") {
          this.successMessage = "Login Successful!";
          this.errorMessage = "";
        } else {
          this.errorMessage = "Invalid Username or Password.";
          this.successMessage = "";
        }

        this.loading = false;
      }, 1000);
    },
  },
};
</script>

<style scoped>
/* General Styles */
body {
  font-family: 'Roboto', sans-serif;
  margin: 0;
  padding: 0;
}

.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f7e8d5; /* Light beige background */
}

/* Header with Logo and Links */
.header {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #b3d9f7; /* Light blue */
  padding: 10px 20px;
  box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
}

.logo {
  width: 120px;
  height: auto;
}

.nav-links {
  display: flex;
  gap: 20px;
}

.nav-link {
  color: #363769; /* Dark blue */
  text-decoration: none;
  font-weight: bold;
}

.nav-link:hover {
  text-decoration: underline;
}

/* Card Styling */
.login-card {
  width: 300px;
  padding: 20px;
  background-color: #ffffff; /* White */
  border-radius: 8px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
}

.card-title {
  text-align: center;
  font-size: 20px;
  font-weight: bold;
  color: #363769; /* Dark blue */
  margin-bottom: 20px;
}

/* Form Fields */
.v-text-field {
  margin-bottom: 15px;
}

.v-text-field input {
  color: #363769; /* Dark blue */
}

.forgot-password {
  display: block;
  text-align: right;
  color: #51597a; /* Medium grayish-blue */
  font-size: 12px;
  text-decoration: none;
  margin-bottom: 20px;
}

.forgot-password:hover {
  text-decoration: underline;
}

/* Buttons */
.login-btn {
  background-color: #bf4a2a; /* Reddish-orange */
  color: #ffffff !important;
  font-weight: bold;
  text-transform: none;
  border-radius: 8px;
}

.login-btn:hover {
  background-color: #a83e24 !important;
}

/* Sign-Up Text */
.sign-up-text {
  text-align: center;
  color: #51597a; /* Medium grayish-blue */
  margin-top: 20px;
}

.sign-up-link {
  color: #bf4a2a; /* Reddish-orange */
  text-decoration: none;
  font-weight: bold;
}

.sign-up-link:hover {
  text-decoration: underline;
}
</style>
