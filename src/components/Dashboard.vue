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
  <div class="product box-shadow" v-for="([id, product]) in Object.entries(filteredProducts)" :key="id">
    <h3>{{ product.name }}</h3>
    <div class="product-details">
      <div>
        <p>Points Required: {{ product.pointsRequired }}</p>
        <p>Stock: {{ product.stock }}</p>
      </div> 
      <button v-if="product.stock != 0" @click="addToCart(product.id, product)">Add to Cart</button>
      <button v-else @click="redeemProduct(product.id, product)">Pre-order</button>
    </div>
  </div>
</div>

  </div>
</template>

<script>
import { getDatabase, ref, get, update, push } from "firebase/database";
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
    const query = this.searchQuery.toLowerCase();

    // Transform `this.products` to include keys as part of each product object
    const transformedProducts = Object.entries(this.products).map(([key, value]) => ({
      id: key, // Include the key as `id`
      ...value, // Spread the rest of the product's properties
    }));

    // Apply filtering logic
    return transformedProducts
      .filter((product) => product && !product.hidden) // Exclude hidden products
      .filter((product) =>
        product.name.toLowerCase().includes(query)
      );
  },
},


methods: {
  async redeemProduct(productKey, product) {
    const db = getDatabase();
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      alert("Please log in to redeem products.");
      return;
    }

    // Check if the user has enough points
    if (this.userData.voucherPoints < product.pointsRequired) {
      alert("You do not have enough points to redeem this product.");
      return;
    }

    // Check if the product is in stock
    if (product.stock <= 0) {
      alert("This product is out of stock.");
      return;
    }

    // Deduct points and reduce stock
    this.userData.voucherPoints -= product.pointsRequired;
    product.stock -= 1;

    // Prepare updates for Firebase
    const updates = {
      [`/users/${user.uid}/voucherPoints`]: this.userData.voucherPoints, // Deduct points
      [`/products/${productKey}/stock`]: product.stock, // Update product stock
    };

    try {
      // Update user points and product stock
      await update(ref(db), updates);

      // Add transaction history
      const transactionRef = ref(db, `users/${user.uid}/transactions`);
      await push(transactionRef, {
        type: "Purchased " + product.name,
        points: -product.pointsRequired,
        timestamp: new Date().toISOString(),
      });

      alert(`Successfully redeemed ${product.name}!`);
    } catch (error) {
      console.error("Error redeeming product:", error);
      alert("An error occurred while processing your request. Please try again.");
    }
  },

  
  
  async addToCart(productId, product) {
    const db = getDatabase();
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      alert("Please log in to add items to your cart.");
      return;
    }

    // Reference to the user's cart in Firebase
    const cartRef = ref(db, `users/${user.uid}/cart/${productId}`);

    try {
      // Fetch existing cart item
      const snapshot = await get(cartRef);
      if (snapshot.exists()) {
        const currentCartItem = snapshot.val();
        
        // Check if stock is sufficient
        if (currentCartItem.quantity < product.stock) {
          const updatedQuantity = currentCartItem.quantity + 1;
          await update(cartRef, { quantity: updatedQuantity });
          alert(`Added another ${product.name} to your cart.`);
        } else {
          alert(`No more stock available for ${product.name}.`);
        }
      } else {
        // Add new item to the cart
        await update(cartRef, { quantity: 1 });
        alert(`${product.name} has been added to your cart.`);
      }
    } catch (error) {
      console.error("Error adding product to cart:", error);
      alert("An error occurred. Please try again.");
    }
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

    // Fetch user data
    const userRef = ref(db, `users/${user.uid}`);
    try {
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        this.userData = snapshot.val(); // Update user data with fetched data
      } else {
        console.error("No data available for the user.");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }

    // Fetch products
    const productsRef = ref(db, "products");
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
