<template>
    <div class="container">
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
import { fetchCartData, updateCartItemQuantity, removeCartItem, processCheckout } from "@/methods";
import { auth } from "@/firebase";

export default {
	name: "CartPage",
	data() {
		return {
			cartItems: [],
			userData: {},
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
			const { cartItems, userData } = await fetchCartData();
			this.cartItems = cartItems;
			this.userData = userData;
		},
		async increaseQuantity(item) {
			if (item.quantity < item.stock) {
				await updateCartItemQuantity(auth.currentUser.uid, item.id, item.quantity + 1);
				item.quantity++;
			} else {
				alert(`No more stock available for ${item.name}.`);
			}
		},
		async decreaseQuantity(item) {
			const userId = auth.currentUser.uid;
			if (item.quantity > 1) {
				await updateCartItemQuantity(userId, item.id, item.quantity - 1);
				item.quantity--;
			} else {
				await removeCartItem(userId, item.id);
				this.cartItems = this.cartItems.filter((cartItem) => cartItem.id !== item.id);
			}
		},
		async removeFromCart(item) {
			await removeCartItem(auth.currentUser.uid, item.id);
			this.cartItems = this.cartItems.filter((cartItem) => cartItem.id !== item.id);
		},
		async checkout() {
			try {
				await processCheckout(auth.currentUser.uid, this.cartItems, this.totalPoints, this.userData.voucherPoints);
				this.cartItems = [];
				alert("Checkout successful!");
			} catch (error) {
				alert(error.message);
			}
		},
	},
	async mounted() {
		await this.fetchCart();
	},
};
</script>
  