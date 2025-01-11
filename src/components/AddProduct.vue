<template>
    <div class="form-page box-shadow">
      <h1>Add New Product</h1>
      <form @submit.prevent="addProduct">
        <div>
          <label for="productName">Product Name:</label>
          <input
            id="productName"
            v-model="productName"
            type="text"
            placeholder="Enter product name"
            required
          />
        </div>
        <div>
            <label for="pointsRequired">Points Required:</label>
            <input
                id="pointsRequired"
                v-model.number="pointsRequired"
                type="number"
                placeholder="Enter points required"
                min="1"
                required
            />
        </div>
        <div>
            <label for="stock">Stock:</label>
            <input
                id="stock"
                v-model.number="stock"
                type="number"
                placeholder="Enter stock quantity"
                min="0"
                required
            />
        </div>
        <button type="submit" class="w100">Add Product</button>
      </form>
    </div>
    <div class="container">
        <h2>Available Products</h2>
            <table v-if="Object.keys(products).length > 0">
            <thead>
                <tr>
                <th>Name</th>
                <th>Points Required</th>
                <th>Stock</th>
                <th>Hidden</th>
                <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(product, id) in products" :key="id">
                <td>{{ product.name }}</td>
                <td>{{ product.pointsRequired }}</td>
                <td>{{ product.stock }}</td>
                <td>{{ product.hidden ? "Yes" : "No" }}</td>
                <td>
                    <button @click="toggleVisibility(id, product)">
                    {{ product.hidden ? "Unhide" : "Hide" }}
                    </button>
                </td>
                </tr>
            </tbody>
            </table>
            <p v-else>No products available.</p>
    </div>
  </template>
  
<script>
import { getDatabase, ref, get, push, update } from "firebase/database";
import { getAuth } from "firebase/auth";

export default {
  name: "AddProductPage",
  data() {
    return {
      productName: "",
      pointsRequired: null,
      stock: null,
      isAdmin: false, // To verify if the user is an admin
      products: {}, // Store available products
    };
  },
  methods: {
    async addProduct() {
      if (!this.isAdmin) {
        alert("You do not have permission to add products.");
        return;
      }

      const db = getDatabase();
      const productsRef = ref(db, "products");

      const newProduct = {
        name: this.productName,
        pointsRequired: this.pointsRequired,
        stock: this.stock,
        hidden: false,
      };

      try {
        await push(productsRef, newProduct);
        alert(`Product "${this.productName}" has been added successfully.`);
        this.productName = "";
        this.pointsRequired = null;
        this.stock = null;
        await this.fetchProducts(); // Ensure this is called after product addition
      } catch (error) {
        console.error("Error adding product:", error);
        alert("An error occurred while adding the product. Please try again.");
      }
    },
    async fetchProducts() {
      const db = getDatabase();
      const productsRef = ref(db, "products");

      try {
        const snapshot = await get(productsRef);
        console.log(snapshot);
        if (snapshot.exists()) {
            snapshot.forEach(child => ({[child.key]: child.val()})); // Store available products
            this.products = snapshot.val();
        } else {
          this.products = {}; // No products available
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        alert("An error occurred while fetching the products. Please try again.");
      }
    },
    async toggleVisibility(productId, product) {
      const db = getDatabase();
      const productRef = ref(db, `products/${productId}`);

      try {
        // Toggle the `hidden` flag
        await update(productRef, { hidden: !product.hidden });
        alert(`Product "${product.name}" visibility updated.`);
        await this.fetchProducts(); // Refresh the product list
      } catch (error) {
        console.error("Error updating product visibility:", error);
        alert("An error occurred while updating product visibility. Please try again.");
      }
    },
},


  
  async mounted() {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      alert("You are not logged in.");
      this.$router.push("/login"); // Redirect to login page
      return;
    }

    // Check if the user is an admin
    const db = getDatabase();
    const userRef = ref(db, `users/${user.uid}`);
    try {
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        const userData = snapshot.val();
        this.isAdmin = userData.role === "admin"; // Verify admin role
      } else {
        alert("User data not found.");
        this.$router.push("/"); // Redirect to home page
      }

      // Fetch existing products
      await this.fetchProducts(); // Ensure the method is properly called
    } catch (error) {
      console.error("Error verifying admin or fetching products:", error);
    }
  },
};

</script>