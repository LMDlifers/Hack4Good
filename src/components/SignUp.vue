<template>
    <div class="signup-page">
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
        <button type="submit">Sign Up</button>
        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
      </form>
    </div>
  </template>
  
  <script>
  import { auth } from "@/firebase";
  import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
  import { getDatabase, ref, set } from "firebase/database"; 

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
  
          // Step 2: Update user's display name
          await updateProfile(user, { displayName: this.name });
  
          // Step 3: Add user data to Firebase Realtime Database
          const db = getDatabase(); // Initialize database
          const userRef = ref(db, `users/${user.uid}`); // Reference user path
  
          await set(userRef, {
          username: this.name,
          email: this.email,
          phoneNumber: this.phoneNumber, // Save phone number
          voucherPoints: 0,
          role: "user", // Default role
        });
  
          // Step 4: Redirect to dashboard
          this.$router.push({ name: "Dashboard"});
        } catch (error) {
          console.error("Error during signup:", error);
          this.errorMessage = error.message;
        }
      },
    },
  };
  </script>
  
  