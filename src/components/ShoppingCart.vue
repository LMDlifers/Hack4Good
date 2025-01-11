<template>
    <div class="cart-page">
      <h2>Shopping Cart</h2>
      <table v-if="cartItems.length > 0">
        <thead>
          <tr>
            <th>Product</th>
            <th>Quantity</th>
            <th>Points Required</th>
            <th>Total Points</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in cartItems" :key="item.id">
            <td>{{ item.name }}</td>
            <td>{{ item.quantity }}</td>
            <td>{{ item.pointsRequired }}</td>
            <td>{{ item.quantity * item.pointsRequired }}</td>
            <td>
              <button @click="increaseQuantity(item)">+</button>
              <button @click="decreaseQuantity(item)">-</button>
              <button @click="removeFromCart(item)">Remove</button>
            </td>
          </tr>
        </tbody>
      </table>
  
      <p v-else>Your cart is empty.</p>
  
      <!-- Display total points and checkout button -->
      <div v-if="cartItems.length > 0" class="checkout-section">
        <p>Total Points: {{ totalPoints }}</p>
        <button @click="checkout">Checkout</button>
      </div>
    </div>
  </template>
  
  
  <script>
import { getDatabase, ref, get, update, remove, push } from "firebase/database";
import { getAuth } from "firebase/auth";

export default {
  name: "CartPage",
  data() {
    return {
      cartItems: [], // Array to hold cart items with details
      userData: {}, // User data including voucher points
    };
  },
  computed: {
    totalPoints() {
      return this.cartItems.reduce(
        (total, item) => total + item.quantity * item.pointsRequired,
        0
      );
    },
  },
  methods: {
    async fetchCart() {
      const db = getDatabase();
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        console.error("No user is logged in.");
        return;
      }

      const cartRef = ref(db, `users/${user.uid}/cart`);
      const productsRef = ref(db, "products");
      const userRef = ref(db, `users/${user.uid}`);

      try {
        const [cartSnapshot, productsSnapshot, userSnapshot] = await Promise.all([
          get(cartRef),
          get(productsRef),
          get(userRef),
        ]);

        if (cartSnapshot.exists() && productsSnapshot.exists()) {
          const cart = cartSnapshot.val();
          const products = productsSnapshot.val();

          // Combine cart data with product details
          this.cartItems = Object.entries(cart).map(([productId, cartData]) => {
            return {
              id: productId,
              ...products[productId], // Get product details
              quantity: cartData.quantity,
            };
          });
        } else {
          console.log("Cart or products not found.");
        }

        if (userSnapshot.exists()) {
          this.userData = userSnapshot.val(); // Store user data (e.g., voucher points)
        } else {
          console.log("User data not found.");
        }
      } catch (error) {
        console.error("Error fetching cart items:", error);
      }
    },

    async increaseQuantity(item) {
      const db = getDatabase();
      const auth = getAuth();
      const user = auth.currentUser;

      if (item.quantity < item.stock) {
        const cartRef = ref(db, `users/${user.uid}/cart/${item.id}`);
        await update(cartRef, { quantity: item.quantity + 1 });
        item.quantity++;
      } else {
        alert(`No more stock available for ${item.name}.`);
      }
    },

    async decreaseQuantity(item) {
      const db = getDatabase();
      const auth = getAuth();
      const user = auth.currentUser;

      const cartRef = ref(db, `users/${user.uid}/cart/${item.id}`);
      if (item.quantity > 1) {
        await update(cartRef, { quantity: item.quantity - 1 });
        item.quantity--;
      } else {
        await remove(cartRef); // Remove the item if quantity is 1
        this.cartItems = this.cartItems.filter((cartItem) => cartItem.id !== item.id);
      }
    },

    async removeFromCart(item) {
      const db = getDatabase();
      const auth = getAuth();
      const user = auth.currentUser;

      const cartRef = ref(db, `users/${user.uid}/cart/${item.id}`);
      await remove(cartRef);
      this.cartItems = this.cartItems.filter((cartItem) => cartItem.id !== item.id);
    },

    async checkout() {
  const db = getDatabase();
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    alert("Please log in to proceed with checkout.");
    return;
  }

  // Check if the user has enough points
  if (this.userData.voucherPoints < this.totalPoints) {
    alert("You do not have enough points to complete this purchase.");
    return;
  }

  try {
    // Deduct total points from the user's balance
    const userRef = ref(db, `users/${user.uid}`);
    const cartRef = ref(db, `users/${user.uid}/cart`);
    const transactionsRef = ref(db, `users/${user.uid}/transactions`);

    // Update user points
    await update(userRef, {
      voucherPoints: this.userData.voucherPoints - this.totalPoints, // Deduct points
    });

    // Add each cart item to transaction history and update stock
    const transactionPromises = this.cartItems.map(async (item) => {
      // Add to transaction history
      await push(transactionsRef, {
        productId: item.id,
        productName: item.name,
        quantity: item.quantity,
        totalPoints: item.quantity * item.pointsRequired,
        timestamp: new Date().toISOString(),
      });

      // Deduct stock count
      const productRef = ref(db, `products/${item.id}`);
      const newStock = item.stock - item.quantity;

      if (newStock < 0) {
        throw new Error(`Not enough stock available for ${item.name}.`);
      }

      await update(productRef, { stock: newStock });
    });

    // Wait for all transactions and stock updates to complete
    await Promise.all(transactionPromises);

    // Clear the cart after successful checkout
    await remove(cartRef);
    this.cartItems = []; // Reset local cart

    alert("Checkout successful! Your transaction has been recorded.");
  } catch (error) {
    console.error("Error during checkout:", error);
    alert("An error occurred during checkout. Please try again.");
  }
},
  },
  async mounted() {
    await this.fetchCart(); // Fetch cart items and user data on component load
  },
};
</script>
