<template>
  <div class="container">
    <div class="home-container">
      <h3>Welcome, {{ userData.username }}! You have {{ userData.voucherPoints }} points</h3>
      <div class="tabs">
        <router-link to="/requestproduct">View Requested Products</router-link>
        <router-link to="/history">View Transaction History</router-link>
      </div>
      
    </div>
    <input class="search-bar" v-model="searchQuery" placeholder="Search for products..." />
    <div class="products-container">
      <div class="product" v-for="(product, id) in filteredProducts" :key="id">
        <h3>{{ product.name }}</h3>
        <div class="product-details">
          <div>
          <p>Points Required: {{ product.pointsRequired }}</p>
          <p>Stock: {{ product.stock }}</p>
        </div>
        <button @click="redeemProduct(id, product)">Redeem</button>
        </div>
      </div>
    </div>
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
      products: {}, // Store all products
      searchQuery: "",
    };
  },
  computed: {
    filteredProducts() {
      // Filter products based on search query
      const query = this.searchQuery.toLowerCase();
      return Object.values(this.products).filter((product) =>
        product.name.toLowerCase().includes(query)
      );
    },
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

    const productsRef = ref(db, "products"); // Reference the "products" node

    try {
      const snapshot = await get(productsRef);
      if (snapshot.exists()) {
        this.products = snapshot.val(); // Store fetched products in `products`
        console.log("Products fetched successfully:", this.products);
      } else {
        console.error("No products found.");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  },
};
</script>
