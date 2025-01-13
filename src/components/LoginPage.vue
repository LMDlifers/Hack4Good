<template>
	<div class="form-page">
		<h2>Login</h2>
		<form @submit.prevent="login">
		<div>
			<label for="email">Email:</label>
			<input v-model="email" type="email" id="email" placeholder="Enter your email" required />
		</div>
		<div>
			<label for="password">Password:</label>
			<input v-model="password" type="password" id="password" placeholder="Enter your password" required />
		</div>
		<button type="submit" class="wmax">Login</button>
		<p v-if="errorMessage" class="error">{{ errorMessage }}</p>
		</form>
		<p>
		<router-link to="/forgetpassword">Forgot your password?</router-link>
		</p>
	</div>
</template>

<script>
import { loginUser } from "@/methods";
export default {
	name: "LoginPage",
	data() {
		return {
		email: "",
		password: "",
		errorMessage: "", // Error message for display
		};
	},
	methods: {
		async login() {
		try {
			await loginUser(this.email, this.password, this.$root, this.$router);
		} catch (error) {
			this.errorMessage = error.message; // Set the error message for UI display
		}
		},
	},
};
</script>