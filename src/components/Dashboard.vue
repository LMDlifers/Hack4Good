<template>
	<div class="container">
		<div class="home-container">
			<div style="display: flex; text-align: center; gap: 5px;">
				<h3>Welcome, {{ userData.username }}! You have </h3>
				<h3 style="color: #bf4a2a;"> {{ userData.voucherPoints }} points</h3>
			</div>
			<div class="tabs">
				<router-link to="/preorder">View Pre Orders</router-link>
				<router-link to="/history">View Transaction History</router-link>
			</div>
		</div>
		<input class="search-bar" v-model="searchQuery" placeholder="Search for products..." />
		<div class="products-container">
			<div class="product bg-white" v-for="product in filteredProducts" :key="product.id">
				<div class="space-between">
					<div>
						<h3>{{ product.name }}</h3>
						<img
						v-if="product.imageUrl"
						:src="product.imageUrl"
						alt="Product Image"
						class="product-image"
						/>
						<p v-else>No Image</p>
						
					</div>
				</div>

				<div class="margin-t-s">
					<p>Points Required: {{ product.pointsRequired }}</p>
					<p>Stock: {{ product.stock }}</p>
					<button class="wmax" v-if="product.stock !== 0" @click="handleAddToCart(product)">Add to Cart</button>
					<button class="wmax" v-else @click="openPreorderModal(product)">Pre-order</button>
				</div>
			</div>
		</div>
	</div>
	<!-- Pre-order Modal -->
	<div v-if="showModal" class="modal-wrapper">
		<div class="modal-backdrop" @click="closeModal"></div>
		<div class="modal padding-20">
			<h2>Confirm Pre-order</h2>
			<p><strong>Product:</strong> {{ selectedProduct?.name }}</p>
			<img
				v-if="selectedProduct?.imageUrl"
				:src="selectedProduct?.imageUrl"
				alt="Product Image"
				class="product-image"
				/>
			<p><strong>Points Required per Item:</strong> {{ selectedProduct?.pointsRequired }}</p>
			<div style="display: flex; align-items: baseline;">
				<p><strong>Quantity:</strong></p>
				<button @click="decreaseQuantity" class="btn-grey btn-round" style="width: 30px;">-</button>
				<div class="margin-l-s margin-r-s">{{ quantity }}</div>
				<button @click="increaseQuantity" class="btn-grey btn-round" style="width: 30px;">+</button>
			</div>
			<p><strong>Total Points Required:</strong> {{ totalPoints }}</p>
			<p><strong>Current Points:</strong> {{ userData.voucherPoints }}</p>
			<p><strong>Points Left After Preorder:</strong> {{ pointsLeft }}</p>
			<p v-if="userData.voucherPoints - totalPoints < 0" style="color: red;">
				Insufficient points! You need more points to preorder.
			</p>
			<p v-else>
			<strong>Remaining Points after Pre-order:</strong> {{ userData.voucherPoints - totalPoints }}
			</p>
			<div class="modal-actions space-between">
			<button class="btn-green" :disabled="userData.voucherPoints < totalPoints" @click="confirmPreorder">
				Confirm
			</button>
			<button class="btn-grey" @click="closeModal">Cancel</button>
			</div>
		</div>
	</div>
</template>

<script>
import { fetchProducts, addToCart, getCurrentUser, getCurrentUserData } from "@/methods";
import { getAuth } from "firebase/auth";
import { getDatabase, ref, push, set } from "firebase/database";

export default {
	name: "UserDashboard",
	data() {
		return {
			userData: {},
			userKey: null,
			products: {},
			searchQuery: "",
			showModal: false, // Controls the visibility of the pre-order modal
			selectedProduct: null, // Stores the product selected for pre-order
			quantity: 1, // Stores the quantity to be pre-ordered
		};
	},

	computed: {
		filteredProducts() {
			const query = this.searchQuery.toLowerCase();
			const transformedProducts = Object.entries(this.products).map(([key, value]) => ({
				id: key, // Include the key as `id`
				...value, // Spread the rest of the product's properties
			}));

			// Apply filtering logic
			return transformedProducts
				.filter((product) => product && !product.hidden) // Exclude hidden products
				.filter((product) => product.name.toLowerCase().includes(query));
		},
		totalPoints() {
			return this.quantity * (this.selectedProduct?.pointsRequired || 0);
		},
		pointsLeft() {
			return this.userData.voucherPoints - this.totalPoints;
		}
	},
	methods: {
		async fetchProducts() {
			try {
				this.products = await fetchProducts();
			} catch (error) {
				alert(error.message);
			}
		},
		openPreorderModal(product) {
			this.selectedProduct = product;
			this.showModal = true;
		},
		closeModal() {
			this.showModal = false;
			this.selectedProduct = null;
			this.quantity = 1;
		},
		decreaseQuantity() {
			if (this.quantity > 1) this.quantity--;
		},
		increaseQuantity() {
			this.quantity++;
		},
		async confirmPreorder() {
			if (this.quantity < 1) {
				alert("Please select a valid quantity.");
				return;
			}

			try {
				const totalPointsRequired = this.selectedProduct.pointsRequired * this.quantity;

				// Check if the user has enough points
				if (this.userData.voucherPoints < totalPointsRequired) {
				alert("You do not have enough points to preorder this item.");
				return;
				}

				const preorderItem = {
				productId: this.selectedProduct.id,
				productName: this.selectedProduct.name,
				quantity: this.quantity,
				timestamp: new Date().toISOString(),
				};

				const transaction = {
				productId: this.selectedProduct.id,
				productName: this.selectedProduct.name,
				quantity: this.quantity,
				totalPoints: totalPointsRequired, // Ensure this is positive
				type: "Preorder",
				timestamp: new Date().toISOString(),
				};

				const auth = getAuth();
				const userId = auth.currentUser.uid;

				const db = getDatabase();

				// Add preorder to user's preorder list
				const preordersRef = ref(db, `preorders/${userId}`);
				const newPreorderRef = push(preordersRef);
				await set(newPreorderRef, preorderItem);

				// Deduct points from user's voucher balance
				const userRef = ref(db, `users/${userId}`);
				const updatedPoints = this.userData.voucherPoints - totalPointsRequired;
				await set(userRef, { ...this.userData, voucherPoints: updatedPoints });

				// Add transaction under users -> userId -> transactions
				const transactionsRef = ref(db, `users/${userId}/transactions`);
				const newTransactionRef = push(transactionsRef);
				await set(newTransactionRef, transaction);

				// Update local state
				this.userData.voucherPoints = updatedPoints;

				// Provide feedback to the user
				alert("Pre-order added successfully and transaction recorded!");

				// Close the modal and reset the state
				this.closeModal();
			} catch (error) {
				console.error("Error adding pre-order:", error);
				alert("Failed to add pre-order. Please try again.");
			}
			},


		async preorderProduct(product) {
			try {
				// Redirect to the Pre-order page with the selected product details
				this.$router.push({
				name: "PreOrder",
				query: {
					id: product.id,
					name: product.name,
					pointsRequired: product.pointsRequired,
					stock: product.stock,
				},
				});
			} catch (error) {
				console.error("Error during pre-order navigation:", error);
				alert(error.message);
			}
			},

		async handleAddToCart(product) {
			try {
				const message = await addToCart(product.id, product, this.userKey);
				alert(message);
			} catch (error) {
				alert(error.message);
			}
		},
		async loadProducts() {
			try {
				this.products = await fetchProducts();
			} catch (error) {
				alert(error.message);
			}
		},
		async loadUserData() {
			try {
				const userKey = await getCurrentUser();
				const userData = await getCurrentUserData();
				this.userKey = userKey;
				this.userData = userData;
			} catch (error) {
				alert(error.message);
			}
		},
	},
	async mounted() {
		await this.loadUserData();
		await this.loadProducts();
		await this.fetchProducts();
	},
};


</script>

<style>
</style>
