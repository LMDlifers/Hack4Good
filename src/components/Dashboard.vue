<template>
  <div>
    <h2>Welcome, {{ userData.username }}!</h2>
    <p>Your Voucher Points: {{ userData.voucherPoints }}</p>
    <p>Email: {{ userData.email }}</p>
  </div>
</template>

<script>
import { getDatabase, ref, get } from "firebase/database";
import { getAuth } from "firebase/auth";

export default {
  name: "UserDashboard",
  data() {
    return {
      userData: {
        username: "Guest",
        email: "guest@example.com",
        voucherPoints: 0,
      },
    };
  },
  async mounted() {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      console.error("No user is logged in.");
      return;
    }

    const db = getDatabase();
    const userRef = ref(db, `users/${user.uid}`);

    try {
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        this.userData = snapshot.val(); // Update userData with fetched data
      } else {
        console.error("No data available for the user.");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  },
};
</script>
