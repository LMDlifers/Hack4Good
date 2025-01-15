<template>
	<div class="form-page">
		<h2>Sign Up</h2>
		<form @submit.prevent="signup">
		<div>
			<label for="name">Name:</label>
			<input v-model="name" type="text" id="name" placeholder="Enter your name" required />
		</div>
		<div>
			<label for="email">Email:</label>
			<input v-model="email" type="email" id="email" placeholder="Enter your email" required />
		</div>
		<div>
			<label for="password">Password:</label>
			<input v-model="password" type="password" id="password" placeholder="Enter your password" required />
		</div>
		<div>
			<label for="phone">Phone Number:</label>
			<input v-model="phoneNumber" type="text" id="phone" placeholder="Enter your phone number" required />
		</div>
		<button type="submit" class="wmax">Sign Up</button>
		<p v-if="errorMessage" class="error">{{ errorMessage }}</p>
		</form>
	</div>
</template>
<script>
import { auth } from "@/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { getDatabase, ref, set, push } from "firebase/database"; 

export default {
	name: "SignupPage",
	data() {
		return {
			name: "", // User's name
			email: "", // User's email
			password: "", // User's password
			phoneNumber: "", // User's phone number
			errorMessage: "", // Error message
		};
	},
	methods: {
		async signup() {
			try {
				// Step 1: Create user with email and password
				const userCredential = await createUserWithEmailAndPassword(auth, this.email, this.password);
				const user = userCredential.user;

				console.log("Signup successful!", user);

				// Step 2: Update the user's display name
				await updateProfile(user, { displayName: this.name });

				// Step 3: Save user data to Firebase Realtime Database
				const db = getDatabase();
				const userRef = ref(db, `users/${user.uid}`);

				const userData = {
					username: this.name,
					email: this.email,
					phoneNumber: this.phoneNumber,
					voucherPoints: 100,
					role: "user", // Default role
					transactions: [],
					cart: {}, // Empty cart
					suspended: false
				};
				await set(userRef, userData);
				console.log("User data saved to database successfully.");
				// Step 4: Update the state manually to avoid requiring a page refresh
				this.$root.isLoggedIn = true; // Update global state for login
				this.$root.role = "user"; // Set role manually

				const transactionsRef = ref(db, `users/${user.uid}/transactions`);
				await push(transactionsRef, {
					type: "Welcome Bonus",
					productId: "-",
					details: `Welcome Bonus`,
					quantity: "-",
					totalPoints: 100,
					timestamp: new Date().toISOString()
				});
				console.log("Welcome bonus transaction added!");

				// Step 5: Redirect to the user dashboard
				this.$router.push({ name: "Dashboard" });
			} catch (error) {
				console.error("Error during signup:", error);
				this.errorMessage = error.message;
			}
		}
	},
};
</script>
  
  