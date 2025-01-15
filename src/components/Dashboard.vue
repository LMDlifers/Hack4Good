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
</template>

<script>
import { fetchProducts, addToCart, getCurrentUser, getCurrentUserData } from "@/methods";


export default {
	name: "UserDashboard",
	data() {
		return {
			userData: {},
			userKey: null,
			products: {},
			searchQuery: "",
			showModal: false,
			selectedProduct: null,
			quantity: 1,
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
		onfirmPreorder() {
			if (this.quantity < 1) {
				alert("Please select a valid quantity.");
				return;
			}
			this.$router.push({
				name: "PreOrder",
				query: {
					id: this.selectedProduct.id,
					name: this.selectedProduct.name,
					pointsRequired: this.selectedProduct.pointsRequired,
					quantity: this.quantity,
				},
			});
			this.closeModal();
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
