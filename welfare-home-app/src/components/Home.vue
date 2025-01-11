<template>
  <v-container class="home-container">
    <h1>Welcome to the Home Page</h1>
    <p>This is the main dashboard for all users.</p>
    <v-btn color="primary" @click="goToLogin">Log Out</v-btn>
  </v-container>
</template>

<script>
export default {
  name: "HomePage",
  methods: {
    goToLogin() {
      this.$router.push("/");
    },
  },
};
</script>

<style scoped>
.home-container {
  text-align: center;
  margin-top: 50px;
}
</style>
