<template>
  <div class="form-page box-shadow">
    <h2>Request a Product</h2>
    <form @submit.prevent="requestProduct">
      <label for="productName">Product Name:</label>
      <input
        id="productName"
        v-model="productName"
        type="text"
        placeholder="Enter the product name"
        required
      />
      <button type="submit" class="w100">Request Product</button>
    </form>
  </div>
  <div class="container">
    <h2>List of Requested Products</h2>
    <!-- Display list of requested products -->
    <table v-if="requests.length > 0">
      <colgroup>
        <col style="width: 30%;" /> <!-- Adjust width of the first column -->
        <col style="width: 40%;" /> <!-- Adjust width of the second column -->
        <col style="width: 10%;" /> <!-- Adjust width of the third column -->
        <col style="width: 20%;" /> <!-- Adjust width of the third column -->
      </colgroup>
      <thead>
        <tr>
          <th>Requester</th>
          <th>Product Name</th>
          <th>Status</th>
          <th>Requested Date</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(request, index) in requests" :key="index">
          <td>{{ request.username  }}</td>
          <td>{{ request.productName }}</td>
          <td>{{ request.status }}</td>
          <td>{{ new Date(request.timestamp).toLocaleString()}}</td>
        </tr>
      </tbody>
    </table>
    <p v-else>No product requests found.</p>
  </div>
    
  
</template>


<script>
import { getDatabase, ref, get, push } from "firebase/database";
import { getAuth } from "firebase/auth";

export default {
  name: "RequestProductPage",
  data() {
    return {
      productName: "", // Store the requested product name
      requests: [], // Store the list of requests with user details
    };
  },
  methods: {
    async requestProduct() {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        console.error("No user is logged in.");
        alert("Please log in to request a product.");
        return;
      }

      const db = getDatabase();
      const requestsRef = ref(db, "requests"); // Reference to the "requests" node

      const request = {
        requesterId: user.uid, // User's ID
        productName: this.productName, // Requested product name
        status: "Pending", // Default status
        timestamp: new Date().toISOString(), // Optional: Add a timestamp
      };

      try {
        await push(requestsRef, request); // Push the request to Firebase
        alert(`Product request for "${this.productName}" has been submitted.`);
        this.productName = ""; // Clear the input field
        this.fetchRequests(); // Refresh the request list
      } catch (error) {
        console.error("Error submitting product request:", error);
        alert("There was an error submitting your request. Please try again.");
      }
    },
    async fetchRequests() {
      const db = getDatabase();
      const requestsRef = ref(db, "requests");

      try {
        const snapshot = await get(requestsRef);
        if (snapshot.exists()) {
          const requests = Object.entries(snapshot.val()).map(([key, request]) => ({
            id: key,
            ...request,
          }));

          // Fetch usernames for each request
          const usersRef = ref(db, "users");
          const usersSnapshot = await get(usersRef);
          const users = usersSnapshot.exists() ? usersSnapshot.val() : {};

          // Map requesterId to username
          this.requests = requests.map((request) => ({
            ...request,
            username: users[request.requesterId]?.username || "Unknown User",
          }));
        } else {
          this.requests = []; // No requests found
        }
      } catch (error) {
        console.error("Error fetching requests:", error);
        alert("There was an error fetching the requests. Please try again.");
      }
    },
  },
  async mounted() {
    // Fetch requests when the component is mounted
    await this.fetchRequests();
  },
};

</script>