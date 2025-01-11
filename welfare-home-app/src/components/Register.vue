<template>
  <v-container class="register-container">
    <v-card class="register-card">
      <v-card-title class="title">Register</v-card-title>
      <v-card-text>
        <v-form ref="form" @submit.prevent="handleRegister">
          <v-text-field
            v-model="formData.name"
            label="Name"
            type="text"
            required
          ></v-text-field>

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

          <v-select
            v-model="formData.role"
            :items="roles"
            label="Role"
            required
          ></v-select>

          <v-btn
            type="submit"
            block
            color="primary"
          >
            Register
          </v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
export default {
  name: "RegisterComponent",
  data() {
    return {
      formData: {
        name: "",
        email: "",
        password: "",
        role: null,
      },
      roles: ["Admin", "User"],
    };
  },
  methods: {
    handleRegister() {
      alert("Registration successful! Redirecting to Login...");
      this.$router.push("/");
    },
  },
};
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.register-card {
  width: 400px;
  padding: 20px;
  background-color: white;
}
</style>
